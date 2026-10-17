import * as THREE from 'three';
import { BlockId } from './world/BlockRegistry';
import { TextureAtlas } from './world/TextureAtlas';
import { WorldManager } from './world/WorldManager';
import { SkyAndLighting } from './world/SkyAndLighting';
import { SoundManager } from './audio/SoundManager';
import { InventoryManager } from './ui/InventoryManager';
import { EntityManager } from './entities/EntityManager';
import { PlayerController } from './player/PlayerController';
import { HUDAndMinimap } from './ui/HUDAndMinimap';
import { SaveManager } from './world/SaveManager';
import {
  applyStaticDOMTranslations,
  Locale,
  onLocaleChange,
  setLocale,
  syncLanguageSelectors,
  t,
} from './i18n/I18nManager';

class GMinecraftGame {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private atlas: TextureAtlas;
  private sound: SoundManager;
  private world: WorldManager;
  private sky: SkyAndLighting;
  private inventory: InventoryManager;
  private entities: EntityManager;
  private player: PlayerController;
  private hud: HUDAndMinimap;
  private saveManager: SaveManager;

  private lastTime = performance.now();
  private frameCount = 0;
  private fpsAccum = 0;
  private currentFps = 60;
  private autoSaveTimer = 0;

  constructor() {
    applyStaticDOMTranslations();
    syncLanguageSelectors();

    const container = document.getElementById('game-container')!;
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 220);

    this.atlas = new TextureAtlas();
    this.sound = new SoundManager();
    this.world = new WorldManager(this.scene, this.atlas, 20261010);
    this.sky = new SkyAndLighting(this.scene);

    let hudRef: HUDAndMinimap | null = null;
    const showToast = (msg: string) => hudRef?.showToast(msg);

    this.inventory = new InventoryManager(
      this.atlas,
      this.sound,
      () => this.player ? this.player.gameMode === 'creative' : true,
      showToast,
      () => this.player?.rebuildHeldItemMesh()
    );

    this.entities = new EntityManager(
      this.scene,
      this.world,
      this.sound,
      this.inventory,
      showToast
    );

    this.player = new PlayerController(
      this.camera,
      this.scene,
      this.world,
      this.atlas,
      this.sound,
      this.inventory,
      this.entities,
      showToast,
      () => hudRef?.refreshStatusBars()
    );

    this.hud = new HUDAndMinimap(this.world, this.player, this.sky, this.entities);
    hudRef = this.hud;

    onLocaleChange(() => {
      this.hud.refreshStatusBars();
      this.inventory.renderHotbar();
      this.inventory.renderModalContent();
    });

    this.saveManager = new SaveManager(
      this.world,
      this.player,
      this.inventory,
      this.sky,
      showToast,
      () => {
        this.player.rebuildHeldItemMesh();
        this.hud.refreshStatusBars();
      }
    );

    // 載入本地存檔或初始化新世界
    const loaded = this.saveManager.loadFromLocal();
    if (!loaded) {
      this.world.updateChunksAroundPlayer(0, 0, true);
      const spawnY = this.world.getSpawnHeight(0, 0);
      this.player.position.set(0.5, spawnY, 0.5);
    }

    // 初始生成可愛方塊動物與彈跳史萊姆
    for (let i = 0; i < 4; i++) {
      this.entities.spawnMobNearPlayer(this.player.position, false);
    }
    for (let i = 0; i < 2; i++) {
      this.entities.spawnMobNearPlayer(this.player.position, false, false, 'slime');
    }

    this.bindGlobalEvents();
    this.animate();
  }

  private bindGlobalEvents(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const pauseOverlay = document.getElementById('pause-overlay')!;
    const resumeBtn = document.getElementById('btn-resume-game')!;

    resumeBtn.addEventListener('click', () => {
      this.inventory.toggleModal(false);
      pauseOverlay.classList.add('hidden');
      try {
        Promise.resolve(document.body.requestPointerLock?.()).catch(() => {});
      } catch {
        // ignore pointer lock restriction
      }
    });

    // 點擊畫面畫布時也能直接鎖定滑鼠游標進入遊戲
    this.renderer.domElement.addEventListener('click', () => {
      if (!this.inventory.isModalOpen && pauseOverlay.classList.contains('hidden')) {
        try {
          Promise.resolve(document.body.requestPointerLock?.()).catch(() => {});
        } catch {
          // ignore pointer lock restriction
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === document.body;
      if (!locked && !this.inventory.isModalOpen) {
        pauseOverlay.classList.remove('hidden');
      } else if (locked) {
        pauseOverlay.classList.add('hidden');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyT' && !this.inventory.isModalOpen) {
        const msg = this.sky.toggleDayNight();
        this.hud.showToast(msg);
      } else if (e.code === 'Escape' && this.inventory.isModalOpen) {
        this.inventory.toggleModal(false);
      }
    });

    // 暫停選單快捷按鈕
    document.getElementById('btn-toggle-mode-menu')?.addEventListener('click', () => {
      this.player.toggleGameMode();
    });

    document.getElementById('btn-toggle-time-menu')?.addEventListener('click', () => {
      const msg = this.sky.toggleDayNight();
      this.hud.showToast(msg);
    });

    document.getElementById('btn-spawn-tnt-menu')?.addEventListener('click', () => {
      this.inventory.addItem(BlockId.TNT, 16);
      this.hud.showToast(t('toastGiveTnt'));
    });

    // 多國語言切換選單（右上角 HUD 與暫停選單同步）
    document.querySelectorAll<HTMLSelectElement>('.lang-select').forEach((sel) => {
      sel.addEventListener('change', () => {
        setLocale(sel.value as Locale);
      });
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.frameCount++;
    this.fpsAccum += dt;
    if (this.fpsAccum >= 0.5) {
      this.currentFps = Math.round(this.frameCount / this.fpsAccum);
      this.frameCount = 0;
      this.fpsAccum = 0;
    }

    const isPaused =
      !document.getElementById('pause-overlay')?.classList.contains('hidden') ||
      this.inventory.isModalOpen;

    if (!isPaused) {
      this.player.update(dt);
    } else {
      // 暫停時仍保持攝影機位置同步
      this.camera.position.set(
        this.player.position.x,
        this.player.position.y + 1.58,
        this.player.position.z
      );
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.player.yaw;
      this.camera.rotation.x = this.player.pitch;
    }

    // 動態載入玩家周圍區塊
    this.world.updateChunksAroundPlayer(this.player.position.x, this.player.position.z, false);

    // 更新天空光照與日夜循環
    this.sky.update(dt, this.player.position, this.player.isUnderwater);

    // 更新粒子、掉落物、TNT 與生物 AI
    this.entities.update(
      dt,
      this.player.position,
      this.sky.isNight(),
      this.player.gameMode === 'survival',
      (dmg, kb) => this.player.applyDamage(dmg, kb)
    );

    // 更新 HUD 與右上角小地圖
    this.hud.update(dt, this.currentFps);

    // 每 25 秒自動存檔一次
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 25) {
      this.autoSaveTimer = 0;
      this.saveManager.saveToLocal(false);
    }

    this.renderer.render(this.scene, this.camera);
  };
}

window.addEventListener('DOMContentLoaded', () => {
  new GMinecraftGame();
});
