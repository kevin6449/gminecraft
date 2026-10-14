import * as THREE from 'three';
import { BlockId, getItemDef } from '../world/BlockRegistry';
import { RaycastHit, WorldManager } from '../world/WorldManager';
import { SoundManager } from '../audio/SoundManager';
import { InventoryManager } from '../ui/InventoryManager';
import { EntityManager } from '../entities/EntityManager';
import { TextureAtlas } from '../world/TextureAtlas';

export type GameMode = 'creative' | 'survival';

export class PlayerController {
  public position = new THREE.Vector3(8, 36, 8);
  public velocity = new THREE.Vector3();
  public yaw = 0;
  public pitch = -0.15;

  public gameMode: GameMode = 'creative';
  public isFlying = false;
  public onGround = false;
  public isUnderwater = false;
  public inWater = false;

  // 生存與水中氧氣狀態 (滿血 20 = 10 顆心，滿氧氣 10 = 10 顆氣泡)
  public health = 20;
  public maxHealth = 20;
  public hunger = 20;
  public maxHunger = 20;
  public oxygen = 10;
  public maxOxygen = 10;
  private drownTimer = 0;

  private readonly playerRadius = 0.32;
  private readonly playerHeight = 1.74;
  private readonly eyeHeight = 1.58;

  private keys = new Set<string>();
  private spaceDownTime = 0;
  private lastSpaceShortTapTime = 0;
  private playerKnockbackTimer = 0;
  private stepAccumulator = 0;
  private highestAirY = 0;

  // 挖掘與打擊方塊狀態
  public currentHit: RaycastHit | null = null;
  private isMouseDownLeft = false;
  private miningBlockKey = '';
  public miningProgress = 0; // 0 ~ 1
  private miningDecayTimer = 0;
  private digSoundTimer = 0;

  // 選取框與裂痕疊加方塊
  private highlightBox: THREE.LineSegments;
  private crackMesh: THREE.Mesh;
  private crackMaterial: THREE.MeshBasicMaterial;

  // 第一人稱手持模型與手持發光石點光源
  private handGroup = new THREE.Group();
  private heldMesh: THREE.Object3D | null = null;
  private handPointLight: THREE.PointLight;
  private swingPhase = 0;
  private isSwinging = false;

  constructor(
    public camera: THREE.PerspectiveCamera,
    private scene: THREE.Scene,
    private world: WorldManager,
    private atlas: TextureAtlas,
    private sound: SoundManager,
    private inventory: InventoryManager,
    private entities: EntityManager,
    private onToast: (msg: string) => void,
    private onModeOrStatChange: () => void
  ) {
    // 準星目標方塊外框
    const boxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006, 1.006, 1.006));
    const boxMat = new THREE.LineBasicMaterial({ color: 0x111827 });
    this.highlightBox = new THREE.LineSegments(boxGeo, boxMat);
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // 挖掘裂痕立方體
    const crackGeo = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    this.crackMaterial = new THREE.MeshBasicMaterial({
      map: this.atlas.crackTextures[0],
      transparent: true,
      depthWrite: false,
    });
    this.crackMesh = new THREE.Mesh(crackGeo, this.crackMaterial);
    this.crackMesh.visible = false;
    this.scene.add(this.crackMesh);

    // 手持發光石動態點光源
    this.handPointLight = new THREE.PointLight(0xffdd77, 0, 11, 1.3);
    this.handGroup.add(this.handPointLight);

    // 將手臂掛載於攝影機下
    this.scene.add(this.camera);
    this.camera.add(this.handGroup);
    this.rebuildHeldItemMesh();

    this.bindInputEvents();
  }

  private disposeHeldObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).geometry?.dispose();
      }
    });
  }

  // 建立精緻 3D 體素長劍模型（劍首配重球、皮革握柄、寬翼護手劍鍔、雙刃血槽劍身、三段式尖銳劍鋒）
  private create3DSwordGroup(mainColorHex: string): THREE.Group {
    const group = new THREE.Group();
    const baseColor = new THREE.Color(mainColorHex);
    const edgeColor = baseColor.clone().lerp(new THREE.Color(0xffffff), 0.45);
    const coreColor = baseColor.clone().lerp(new THREE.Color(0x0f172a), 0.22);

    const bladeMat = new THREE.MeshLambertMaterial({ color: baseColor });
    const edgeMat = new THREE.MeshLambertMaterial({
      color: edgeColor,
      emissive: baseColor,
      emissiveIntensity: 0.12,
    });
    const fullerMat = new THREE.MeshLambertMaterial({ color: coreColor });
    const gripMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21 });
    const gripRingMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const guardMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const guardDarkMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });

    // 1. 劍首配重球 (Pommel)
    const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.065, 0.095), guardMat);
    pommel.position.set(0, -0.26, 0);
    const pommelGem = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.04, 0.055), edgeMat);
    pommelGem.position.set(0, -0.26, 0);
    group.add(pommel, pommelGem);

    // 2. 皮革劍柄 (Grip / Hilt)
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.16, 0.068), gripMat);
    grip.position.set(0, -0.15, 0);
    const gripRing1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.076), gripRingMat);
    gripRing1.position.set(0, -0.18, 0);
    const gripRing2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.076), gripRingMat);
    gripRing2.position.set(0, -0.12, 0);
    group.add(grip, gripRing1, gripRing2);

    // 3. 寬翼護手 / 劍鍔 (Wide Crossguard)
    const guardCenter = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.052, 0.30), guardMat);
    guardCenter.position.set(0, -0.055, 0);
    const guardTrim = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.03, 0.22), guardDarkMat);
    guardTrim.position.set(0, -0.055, 0);
    const guardWingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.075, 0.055), guardMat);
    guardWingLeft.position.set(0, -0.04, 0.16);
    const guardWingRight = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.075, 0.055), guardMat);
    guardWingRight.position.set(0, -0.04, -0.16);
    const guardGem = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.056, 0.065), edgeMat);
    guardGem.position.set(0, -0.055, 0);
    group.add(guardCenter, guardTrim, guardWingLeft, guardWingRight, guardGem);

    // 4. 雙刃寬劍身與中央血槽 (Broad Double-Edged Blade & Fuller)
    const bladeMain = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.46, 0.125), bladeMat);
    bladeMain.position.set(0, 0.20, 0);
    const bladeSharpEdges = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.45, 0.158), edgeMat);
    bladeSharpEdges.position.set(0, 0.20, 0);
    const bladeFuller = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.35, 0.042), fullerMat);
    bladeFuller.position.set(0, 0.17, 0);
    group.add(bladeMain, bladeSharpEdges, bladeFuller);

    // 5. 三段式階梯收尖劍鋒 (Stepped Pointed Sword Tip)
    const tipStep1 = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.06, 0.115), edgeMat);
    tipStep1.position.set(0, 0.455, 0);
    const tipStep2 = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.055, 0.075), edgeMat);
    tipStep2.position.set(0, 0.505, 0);
    const tipApex = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.05, 0.038), edgeMat);
    tipApex.position.set(0, 0.55, 0);
    group.add(tipStep1, tipStep2, tipApex);

    return group;
  }

  // 建立 3D 十字鎬、戰斧與鏟子模型
  private create3DToolGroup(toolType: 'pickaxe' | 'axe' | 'shovel', mainColorHex: string): THREE.Group {
    const group = new THREE.Group();
    const headMat = new THREE.MeshLambertMaterial({ color: mainColorHex });
    const edgeColor = new THREE.Color(mainColorHex).lerp(new THREE.Color(0xffffff), 0.35);
    const edgeMat = new THREE.MeshLambertMaterial({ color: edgeColor });
    const stickMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

    // 木柄
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.54, 0.052), stickMat);
    handle.position.set(0, 0.02, 0);
    group.add(handle);

    if (toolType === 'pickaxe') {
      // 十字鎬雙尖弧形鎬頭
      const centerHead = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.085, 0.22), headMat);
      centerHead.position.set(0, 0.23, 0);
      const frontTip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.065, 0.11), edgeMat);
      frontTip.position.set(0, 0.19, 0.14);
      const backTip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.065, 0.11), edgeMat);
      backTip.position.set(0, 0.19, -0.14);
      group.add(centerHead, frontTip, backTip);
    } else if (toolType === 'axe') {
      // 戰斧寬刃斧頭
      const axeSocket = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.12, 0.14), headMat);
      axeSocket.position.set(0, 0.21, 0.02);
      const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.21, 0.12), edgeMat);
      axeBlade.position.set(0, 0.19, 0.12);
      group.add(axeSocket, axeBlade);
    } else {
      // 鏟子弧面鏟頭與削尖前緣
      const shovelNeck = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.06, 0.075), headMat);
      shovelNeck.position.set(0, 0.27, 0);
      const shovelBlade = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.16, 0.15), headMat);
      shovelBlade.position.set(0, 0.36, 0);
      const shovelTip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.045, 0.11), edgeMat);
      shovelTip.position.set(0, 0.455, 0);
      group.add(shovelNeck, shovelBlade, shovelTip);
    }
    return group;
  }

  public rebuildHeldItemMesh(): void {
    if (this.heldMesh) {
      this.handGroup.remove(this.heldMesh);
      this.disposeHeldObject(this.heldMesh);
      this.heldMesh = null;
    }

    const itemId = this.inventory.getSelectedItemId();
    const def = getItemDef(itemId);

    // 若手持發光螢光石，開啟手持隨身照明點光源
    this.handPointLight.intensity = itemId === BlockId.Glowstone ? 2.6 : 0;

    if (itemId === BlockId.Air) {
      // 空手：顯示玩家像素手臂
      const geo = new THREE.BoxGeometry(0.16, 0.45, 0.16);
      const mat = new THREE.MeshLambertMaterial({ color: 0xfdba74 });
      this.heldMesh = new THREE.Mesh(geo, mat);
      this.heldMesh.position.set(0.38, -0.34, -0.52);
      this.heldMesh.rotation.set(0.5, -0.3, -0.2);
    } else if (def.toolType === 'sword') {
      // 手持 3D 立體長劍（護手、握柄、雙刃劍身與劍尖）
      this.heldMesh = this.create3DSwordGroup(def.mapColor);
      this.heldMesh.position.set(0.42, -0.32, -0.54);
      this.heldMesh.rotation.set(0.38, -0.35, -0.12);
    } else if (def.toolType === 'pickaxe' || def.toolType === 'axe' || def.toolType === 'shovel') {
      // 手持 3D 十字鎬、戰斧或鏟子
      this.heldMesh = this.create3DToolGroup(def.toolType, def.mapColor);
      this.heldMesh.position.set(0.42, -0.32, -0.52);
      this.heldMesh.rotation.set(0.35, -0.25, -0.1);
    } else if (itemId === BlockId.OakDoor) {
      // 手持 3D 橡木門板模型
      const doorGroup = new THREE.Group();
      const woodMat = new THREE.MeshLambertMaterial({ color: 0xa46b39 });
      const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x6b4222 });
      const knobMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });

      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.24), woodMat);
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.16, 0.18), darkWoodMat);
      doorFrame.position.set(0, -0.09, 0);
      const doorKnob = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.04, 0.04), knobMat);
      doorKnob.position.set(0, -0.01, 0.07);
      doorGroup.add(doorPanel, doorFrame, doorKnob);

      this.heldMesh = doorGroup;
      this.heldMesh.position.set(0.42, -0.28, -0.54);
      this.heldMesh.rotation.set(0.18, -0.55, 0.08);
    } else if (def.isBlock) {
      // 手持 3D 迷你方塊
      const geo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
      const uvAttr = geo.getAttribute('uv') as THREE.BufferAttribute;
      const faceTiles = [
        def.textures.side,
        def.textures.side,
        def.textures.top,
        def.textures.bottom,
        def.textures.side,
        def.textures.side,
      ];
      for (let f = 0; f < 6; f++) {
        const { u0, v0, u1, v1 } = this.atlas.getTileUVs(faceTiles[f]);
        const base = f * 4;
        uvAttr.setXY(base + 0, u0, v1);
        uvAttr.setXY(base + 1, u1, v1);
        uvAttr.setXY(base + 2, u0, v0);
        uvAttr.setXY(base + 3, u1, v0);
      }
      uvAttr.needsUpdate = true;

      const isTranslucentBlock = itemId === BlockId.Glass || itemId === BlockId.Water;
      const isGlowBlock = itemId === BlockId.Glowstone;
      const mat = new THREE.MeshLambertMaterial({
        map: this.atlas.texture,
        transparent: isTranslucentBlock,
        emissive: isGlowBlock ? new THREE.Color(0xfacc15) : new THREE.Color(0x000000),
        emissiveIntensity: isGlowBlock ? 0.55 : 0,
      });
      this.heldMesh = new THREE.Mesh(geo, mat);
      this.heldMesh.position.set(0.42, -0.3, -0.55);
      this.heldMesh.rotation.set(0.25, -0.65, 0.1);
    } else {
      // 手持其他物品（蘋果、烤豬排、礦錠）
      const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const mat = new THREE.MeshLambertMaterial({ color: def.mapColor });
      this.heldMesh = new THREE.Mesh(geo, mat);
      this.heldMesh.position.set(0.4, -0.3, -0.52);
      this.heldMesh.rotation.set(0.25, -0.45, 0.15);
    }

    this.handGroup.add(this.heldMesh);
  }

  private bindInputEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (this.inventory.isModalOpen && e.code !== 'KeyE' && e.code !== 'Escape') {
        if (e.code.startsWith('Digit')) {
          const d = parseInt(e.code.replace('Digit', ''), 10);
          if (d >= 1 && d <= 9) this.inventory.selectSlot(d - 1);
        }
        return;
      }

      this.keys.add(e.code);

      // 忽略長按產生的系統自動連發事件 (e.repeat)，避免長按 Space 被誤判為雙擊
      if (e.repeat) return;

      if (e.code.startsWith('Digit')) {
        const d = parseInt(e.code.replace('Digit', ''), 10);
        if (d >= 1 && d <= 9) {
          this.inventory.selectSlot(d - 1);
        }
      }

      if (e.code === 'KeyE') {
        e.preventDefault();
        this.inventory.toggleModal();
      } else if (e.code === 'KeyM') {
        this.toggleGameMode();
      } else if (e.code === 'KeyF') {
        this.toggleFlying();
      } else if (e.code === 'Space') {
        const now = performance.now();
        this.spaceDownTime = now;
        // 必須前一次是「短按放開」且兩次間隔小於 260ms，才判定為雙擊切換飛行
        if (this.lastSpaceShortTapTime > 0 && now - this.lastSpaceShortTapTime < 260) {
          this.toggleFlying();
          this.lastSpaceShortTapTime = 0;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (e.code === 'Space') {
        const now = performance.now();
        const holdDuration = now - this.spaceDownTime;
        // 只有按住時間小於 190ms 的「短按」才記錄為雙擊的第一下；長按跳躍/上升不計入雙擊
        if (holdDuration > 0 && holdDuration < 190) {
          this.lastSpaceShortTapTime = now;
        } else {
          this.lastSpaceShortTapTime = 0;
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== document.body) return;
      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      const maxPitch = Math.PI / 2 - 0.04;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    });

    window.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement !== document.body) return;
      if (e.button === 0) {
        this.isMouseDownLeft = true;
        this.triggerSwing();
        this.handleLeftClickStart();
      } else if (e.button === 2) {
        this.triggerSwing();
        this.handleRightClick();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDownLeft = false;
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public triggerSwing(): void {
    this.isSwinging = true;
    this.swingPhase = 0;
  }

  public toggleGameMode(): void {
    this.gameMode = this.gameMode === 'creative' ? 'survival' : 'creative';
    if (this.gameMode === 'survival' && this.isFlying) {
      this.isFlying = false;
      this.highestAirY = this.position.y;
    }
    if (this.gameMode === 'creative') {
      this.health = this.maxHealth;
      this.hunger = this.maxHunger;
      this.oxygen = this.maxOxygen;
      this.drownTimer = 0;
      this.resetMining();
    }
    this.inventory.renderHotbar();
    this.onModeOrStatChange();
    this.onToast(
      this.gameMode === 'creative'
        ? '🛠️ 已切換為「創造模式」：無限方塊、方塊一擊即破、支援自由飛行'
        : '⚔️ 已切換為「生存模式」：方塊具材質耐久屬性、資源收集與生命值挑戰'
    );
  }

  public toggleFlying(): void {
    if (this.gameMode === 'survival') {
      this.onToast('💡 生存模式無法飛行（按 M 切換至創造模式即可飛行）');
      return;
    }
    this.isFlying = !this.isFlying;
    this.velocity.y = 0;
    this.highestAirY = this.position.y;
    this.onModeOrStatChange();
    this.onToast(
      this.isFlying
        ? '🕊️ 已開啟自由飛行 (Space 上升 / Shift 下降 / 按住 Ctrl 加速飛行)'
        : '🚶 已關閉飛行模式'
    );
  }

  public applyDamage(amount: number, knockback?: THREE.Vector3, isDrowning = false): void {
    if (this.gameMode === 'creative') return;
    this.health = Math.max(0, this.health - amount);
    this.sound.playHurt();
    if (knockback) {
      this.velocity.copy(knockback);
      this.onGround = false;
      this.playerKnockbackTimer = 0.32;
    }

    const dmgOverlay = document.getElementById('damage-overlay');
    if (dmgOverlay) {
      dmgOverlay.classList.remove('hidden');
      setTimeout(() => dmgOverlay.classList.add('hidden'), 220);
    }

    if (this.health <= 0) {
      this.health = this.maxHealth;
      this.hunger = this.maxHunger;
      this.oxygen = this.maxOxygen;
      this.drownTimer = 0;
      const spawnY = this.world.getSpawnHeight(0, 0);
      this.position.set(0.5, spawnY, 0.5);
      this.velocity.set(0, 0, 0);
      this.onToast(
        isDrowning
          ? '💀 你在水面下待太久溺水身亡！已於出生點復活'
          : '💀 你已重傷復活於出生點！'
      );
    }
    this.onModeOrStatChange();
  }

  private getEyePosition(): THREE.Vector3 {
    const sneakOffset = this.keys.has('ShiftLeft') && !this.isFlying && !this.inWater ? -0.2 : 0;
    return new THREE.Vector3(this.position.x, this.position.y + this.eyeHeight + sneakOffset, this.position.z);
  }

  private getLookDirection(): THREE.Vector3 {
    const dir = new THREE.Vector3(0, 0, -1);
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    dir.applyEuler(euler);
    return dir;
  }

  // 根據方塊材質硬度與手持對應工具計算破壞所需時間（生存模式下不會一下就破）
  public getBlockBreakTime(blockId: BlockId): number {
    const def = getItemDef(blockId);
    if (def.hardness < 0) return Infinity;

    const heldDef = getItemDef(this.inventory.getSelectedItemId());
    let speedMult = 1.0;
    if (heldDef.toolType && heldDef.toolType === def.preferredTool) {
      speedMult = heldDef.toolMultiplier ?? 2.0;
    } else if (heldDef.toolType === 'sword' && (def.soundType === 'grass' || def.soundType === 'wood')) {
      speedMult = 1.35;
    }
    return Math.max(0.45, def.hardness / speedMult);
  }

  private handleLeftClickStart(): void {
    const eye = this.getEyePosition();
    const dir = this.getLookDirection();
    const heldDef = getItemDef(this.inventory.getSelectedItemId());
    const attackDamage = heldDef.attackDamage ?? 2;

    // 1. 優先檢查是否攻擊到生物（擊退與傷害）
    if (this.entities.tryAttackMob(eye, dir, attackDamage)) {
      this.isMouseDownLeft = false;
      this.resetMining();
      return;
    }

    // 2. 檢查目標方塊（左鍵打破 TNT 只會拆除不會引爆；只有右鍵才會點燃 TNT）
    if (!this.currentHit || !this.currentHit.hit) return;
    const { blockPos, blockId } = this.currentHit;

    // 創造模式下：方塊一擊即破
    if (this.gameMode === 'creative') {
      this.breakBlockAt(blockPos.x, blockPos.y, blockPos.z, blockId, false);
      return;
    }

    // 3. 生存模式下：每個方塊皆具備材質與耐久屬性，打擊時累積破壞進度與裂痕
    this.applyMiningStrike(blockPos, blockId);
  }

  private applyMiningStrike(blockPos: THREE.Vector3, blockId: BlockId): void {
    const def = getItemDef(blockId);
    if (def.hardness < 0) return;

    const key = `${blockPos.x},${blockPos.y},${blockPos.z}`;
    if (key !== this.miningBlockKey) {
      this.miningBlockKey = key;
      this.miningProgress = 0;
    }

    const totalTime = this.getBlockBreakTime(blockId);
    // 每次左鍵敲擊給予推進衝量（上限 0.32，確保至少需多次敲擊或持續挖掘才會破）
    const strikeImpulse = Math.min(0.32, 0.22 / totalTime);
    this.miningProgress += strikeImpulse;
    this.miningDecayTimer = 1.5;

    this.sound.playDig(def.soundType);
    this.entities.spawnBreakParticles(blockPos, blockId, 4);

    if (this.miningProgress >= 1.0) {
      this.breakBlockAt(blockPos.x, blockPos.y, blockPos.z, blockId, true);
    } else {
      this.updateCrackVisual(blockPos);
    }
  }

  private updateCrackVisual(blockPos: THREE.Vector3): void {
    const stage = Math.min(9, Math.floor(this.miningProgress * 10));
    this.crackMaterial.map = this.atlas.crackTextures[stage];
    this.crackMaterial.needsUpdate = true;
    this.crackMesh.position.set(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
    this.crackMesh.visible = true;
  }

  private setSingleDoorState(bx: number, bottomY: number, bz: number, open: boolean): void {
    const topY = bottomY + 1;
    const nextBottom = open ? BlockId.OakDoorOpen : BlockId.OakDoor;
    const nextTop = open ? BlockId.OakDoorTopOpen : BlockId.OakDoorTop;

    this.world.setBlock(bx, bottomY, bz, nextBottom);
    const upperId = this.world.getBlock(bx, topY, bz);
    if (getItemDef(upperId).isDoor) {
      this.world.setBlock(bx, topY, bz, nextTop);
    }
  }

  private toggleDoorAt(bx: number, by: number, bz: number, blockId: BlockId): void {
    const def = getItemDef(blockId);
    const bottomY = def.isDoorTop ? by - 1 : by;
    const nextOpen = !Boolean(def.isDoorOpen);

    this.setSingleDoorState(bx, bottomY, bz, nextOpen);

    // 若左右相鄰有並列雙扇門，同步對開 / 對關！
    for (const dx of [-1, 1]) {
      const adjId = this.world.getBlock(bx + dx, bottomY, bz);
      const adjDef = getItemDef(adjId);
      if (adjDef.isDoor && !adjDef.isDoorTop) {
        this.setSingleDoorState(bx + dx, bottomY, bz, nextOpen);
      }
    }

    this.sound.playDoorToggle(nextOpen);
    this.onToast(nextOpen ? '🚪 已打開橡木門（可自由通行）' : '🚪 已關上橡木門');
  }

  private handleRightClick(): void {
    const heldId = this.inventory.getSelectedItemId();
    const heldDef = getItemDef(heldId);

    // 1. 檢查目標方塊互動（開關門、點燃 TNT、開啟工作台）
    if (this.currentHit && this.currentHit.hit) {
      const targetId = this.currentHit.blockId;
      const targetDef = getItemDef(targetId);
      const bp = this.currentHit.blockPos;

      // 右鍵點擊橡木門：開門 / 關門切換
      if (targetDef.isDoor) {
        this.toggleDoorAt(bp.x, bp.y, bp.z, targetId);
        return;
      }

      if (targetId === BlockId.TNT) {
        this.entities.igniteTNT(bp.x, bp.y, bp.z);
        this.onToast('🧨 TNT 已點燃！快退後！');
        return;
      }

      // 右鍵點擊工作台直接開啟合成視窗
      if (targetId === BlockId.CraftingTable && !this.keys.has('ShiftLeft')) {
        this.inventory.toggleModal(true);
        this.inventory.switchTab('crafting');
        return;
      }
    }

    // 2. 若手持食物（烤豬排或蘋果），右鍵食用回復生命與飽食度
    if (heldDef.foodRestore) {
      if (this.gameMode === 'survival' && this.health >= this.maxHealth && this.hunger >= this.maxHunger) {
        this.onToast('❤️ 生命值與飽食度已滿！');
        return;
      }
      if (this.inventory.consumeSelected(1)) {
        this.health = Math.min(this.maxHealth, this.health + heldDef.foodRestore);
        this.hunger = Math.min(this.maxHunger, this.hunger + heldDef.foodRestore);
        this.sound.playPop();
        this.onModeOrStatChange();
        this.onToast(`🍖 食用了 ${heldDef.name}，回復生命與體力！`);
      }
      return;
    }

    // 3. 放置方塊
    if (!heldDef.isBlock || heldId === BlockId.Air) return;
    if (!this.currentHit || !this.currentHit.hit) return;

    const place = this.currentHit.placePos;
    if (place.y < 0 || place.y >= 64) return;

    // 放置 2 格高橡木門
    if (heldId === BlockId.OakDoor) {
      if (place.y + 1 >= 64) return;
      const aboveId = this.world.getBlock(place.x, place.y + 1, place.z);
      if (aboveId !== BlockId.Air && !getItemDef(aboveId).fluid) {
        this.onToast('⚠️ 門需要上下 2 格高度空間才能放置！');
        return;
      }
      if (
        this.intersectsPlayerBox(place.x, place.y, place.z) ||
        this.intersectsPlayerBox(place.x, place.y + 1, place.z)
      ) {
        return;
      }
      if (this.inventory.consumeSelected(1)) {
        this.world.setBlock(place.x, place.y, place.z, BlockId.OakDoor);
        this.world.setBlock(place.x, place.y + 1, place.z, BlockId.OakDoorTop);
        this.sound.playPlace('wood');
        this.onToast('🚪 已放置橡木門（對門按右鍵即可開門/關門）');
      }
      return;
    }

    // 檢查放置位置是否與玩家自身碰撞盒重疊
    if (heldDef.solid && this.intersectsPlayerBox(place.x, place.y, place.z)) {
      return;
    }

    if (this.inventory.consumeSelected(1)) {
      this.world.setBlock(place.x, place.y, place.z, heldId);
      this.sound.playPlace(heldDef.soundType);
    }
  }

  private breakBlockAt(bx: number, by: number, bz: number, blockId: BlockId, dropItem: boolean): void {
    const def = getItemDef(blockId);
    if (def.hardness < 0) return;

    // 若破壞的是雙格高的橡木門，連同上下門板一併移除
    if (def.isDoor) {
      const otherY = def.isDoorTop ? by - 1 : by + 1;
      const otherId = this.world.getBlock(bx, otherY, bz);
      if (getItemDef(otherId).isDoor) {
        this.world.setBlock(bx, otherY, bz, BlockId.Air);
      }
    }

    this.world.setBlock(bx, by, bz, BlockId.Air);
    this.sound.playBreak(def.soundType);
    this.entities.spawnBreakParticles(new THREE.Vector3(bx, by, bz), blockId, 18);

    if (dropItem) {
      const dropId = def.dropId ?? blockId;
      this.entities.spawnDrop(new THREE.Vector3(bx, by, bz), dropId, 1);
      // 橡木樹葉額外有 25% 機率掉落紅蘋果
      if (blockId === BlockId.OakLeaves && Math.random() < 0.25) {
        this.entities.spawnDrop(new THREE.Vector3(bx, by, bz), BlockId.Apple, 1);
      }
    }
    this.resetMining();
  }

  private resetMining(): void {
    this.miningProgress = 0;
    this.miningBlockKey = '';
    this.miningDecayTimer = 0;
    this.crackMesh.visible = false;
  }

  private intersectsPlayerBox(bx: number, by: number, bz: number): boolean {
    const minX = this.position.x - this.playerRadius;
    const maxX = this.position.x + this.playerRadius;
    const minY = this.position.y;
    const maxY = this.position.y + this.playerHeight;
    const minZ = this.position.z - this.playerRadius;
    const maxZ = this.position.z + this.playerRadius;

    return (
      maxX > bx &&
      minX < bx + 1 &&
      maxY > by &&
      minY < by + 1 &&
      maxZ > bz &&
      minZ < bz + 1
    );
  }

  private collidesWithWorld(px: number, py: number, pz: number): boolean {
    const minX = Math.floor(px - this.playerRadius);
    const maxX = Math.floor(px + this.playerRadius);
    const minY = Math.floor(py);
    const maxY = Math.floor(py + this.playerHeight - 0.01);
    const minZ = Math.floor(pz - this.playerRadius);
    const maxZ = Math.floor(pz + this.playerRadius);

    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        for (let x = minX; x <= maxX; x++) {
          const id = this.world.getBlock(x, y, z);
          if (id !== BlockId.Air && getItemDef(id).solid) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public update(dt: number): void {
    // 檢查眼睛、腰部與腳部是否在水中
    const eyePos = this.getEyePosition();
    const eyeBlock = this.world.getBlock(eyePos.x, eyePos.y, eyePos.z);
    const waistBlock = this.world.getBlock(this.position.x, this.position.y + 0.85, this.position.z);
    const footBlock = this.world.getBlock(this.position.x, this.position.y + 0.18, this.position.z);

    const prevUnderwater = this.isUnderwater;
    this.isUnderwater = eyeBlock === BlockId.Water;
    const prevInWater = this.inWater;
    this.inWater = footBlock === BlockId.Water || waistBlock === BlockId.Water || this.isUnderwater;
    const inWater = this.inWater;

    if (prevInWater !== this.inWater || prevUnderwater !== this.isUnderwater) {
      this.onModeOrStatChange();
    }

    const underwaterEl = document.getElementById('underwater-overlay');
    underwaterEl?.classList.toggle('hidden', !this.isUnderwater);

    // 水中氧氣消耗與溺水機制：只有「頭部潛入水面下 (isUnderwater)」且在生存模式時才會耗氧；浮在水面上頭沒在水面下不會耗氧並會恢復氧氣
    if (this.isUnderwater && this.gameMode === 'survival') {
      const drainRate = 1.35;
      const prevBubbles = Math.ceil(this.oxygen);
      this.oxygen = Math.max(0, this.oxygen - drainRate * dt);
      if (Math.ceil(this.oxygen) !== prevBubbles) {
        this.onModeOrStatChange();
      }

      if (this.oxygen <= 0) {
        this.drownTimer += dt;
        if (this.drownTimer >= 0.85) {
          this.drownTimer = 0;
          this.onToast('🫧 氧氣耗盡！頭在水面下待太久正在溺水！');
          this.applyDamage(3, undefined, true);
        }
      }
    } else {
      this.drownTimer = 0;
      if (this.oxygen < this.maxOxygen) {
        const prevBubbles = Math.ceil(this.oxygen);
        this.oxygen = Math.min(this.maxOxygen, this.oxygen + 3.5 * dt);
        if (Math.ceil(this.oxygen) !== prevBubbles || this.oxygen === this.maxOxygen) {
          this.onModeOrStatChange();
        }
      }
    }

    // 計算移動方向
    let forward = 0;
    let strafe = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) strafe += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) strafe -= 1;

    const len = Math.hypot(forward, strafe);
    if (len > 0) {
      forward /= len;
      strafe /= len;
    }

    // 按住 Ctrl (ControlLeft / ControlRight / KeyQ) 支援地面衝刺與飛行加速
    const isSprinting =
      this.keys.has('ControlLeft') || this.keys.has('ControlRight') || this.keys.has('KeyQ');
    const baseSpeed = this.isFlying
      ? isSprinting
        ? 21.5
        : 11.5
      : inWater
      ? isSprinting
        ? 5.0
        : 3.7
      : isSprinting
      ? 6.8
      : 4.7;

    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    const moveX = (-sinY * forward + cosY * strafe) * baseSpeed;
    const moveZ = (-cosY * forward - sinY * strafe) * baseSpeed;

    if (this.playerKnockbackTimer > 0) {
      this.playerKnockbackTimer -= dt;
      const damp = Math.exp(-3.5 * dt);
      this.velocity.x = this.velocity.x * damp + moveX * (1 - damp) * 0.35;
      this.velocity.z = this.velocity.z * damp + moveZ * (1 - damp) * 0.35;
    } else {
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, moveX, Math.min(1, dt * 14));
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, moveZ, Math.min(1, dt * 14));
    }

    if (this.isFlying) {
      const flyVertSpeed = isSprinting ? 13.5 : 8.5;
      let vertical = 0;
      if (this.keys.has('Space')) vertical += flyVertSpeed;
      if (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) vertical -= flyVertSpeed;
      this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, vertical, Math.min(1, dt * 12));
    } else if (inWater) {
      // 水中自然浮力與划水控制：
      // Space 向上游出水面、Shift 向下潛水、不按時由水浮力托住身體使頭部浮在水面上（不耗氧）
      const deepSubmerged = waistBlock === BlockId.Water || this.isUnderwater;
      const waveBob = Math.sin(performance.now() * 0.0045) * 0.45;

      if (this.keys.has('Space')) {
        this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, 4.6, Math.min(1, dt * 10));
      } else if (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) {
        this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, -3.6, Math.min(1, dt * 10));
      } else if (this.velocity.y < -1.4) {
        // 跳入水中時浮力緩衝減速並往上托起
        this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, 2.2, Math.min(1, dt * 8));
      } else if (deepSubmerged) {
        // 深水處浮力自然將玩家往上托浮至水面，使頭部露出水面呼吸
        this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, 2.1 + waveBob, Math.min(1, dt * 6.5));
      } else {
        // 水面平衡漂浮晃動（頭部維持在水面上方）
        this.velocity.y = THREE.MathUtils.lerp(this.velocity.y, 0.16 + waveBob, Math.min(1, dt * 7));
      }
      this.highestAirY = this.position.y;
    } else {
      this.velocity.y -= 24.5 * dt;
      this.velocity.y = Math.max(this.velocity.y, -38);
      if (this.keys.has('Space') && this.onGround) {
        this.velocity.y = 8.4;
        this.onGround = false;
      }
    }

    // 分軸 AABB 碰撞移動
    // X 軸
    const nextX = this.position.x + this.velocity.x * dt;
    if (!this.collidesWithWorld(nextX, this.position.y, this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    // Z 軸
    const nextZ = this.position.z + this.velocity.z * dt;
    if (!this.collidesWithWorld(this.position.x, this.position.y, nextZ)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // Y 軸
    const nextY = this.position.y + this.velocity.y * dt;
    if (!this.collidesWithWorld(this.position.x, nextY, this.position.z)) {
      this.position.y = nextY;
      this.onGround = false;
      if (this.position.y > this.highestAirY) {
        this.highestAirY = this.position.y;
      }
    } else {
      if (this.velocity.y < 0) {
        // 落地：檢查生存模式高處墜落傷害
        const fallDist = this.highestAirY - this.position.y;
        if (!this.isFlying && !inWater && this.gameMode === 'survival' && fallDist > 4.2) {
          const dmg = Math.floor(fallDist - 3.2);
          if (dmg > 0) this.applyDamage(dmg);
        }
        this.onGround = true;
      }
      this.highestAirY = this.position.y;
      this.velocity.y = 0;
    }

    // 防止掉出世界底部
    if (this.position.y < -10) {
      this.position.y = 45;
      this.velocity.y = 0;
    }

    // 腳步聲觸發
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if ((this.onGround || inWater) && horizSpeed > 0.8 && !this.isFlying) {
      this.stepAccumulator += horizSpeed * dt;
      if (this.stepAccumulator > 2.1) {
        this.stepAccumulator = 0;
        const groundBlock = this.world.getBlock(this.position.x, this.position.y - 0.2, this.position.z);
        const sType = inWater ? 'water' : getItemDef(groundBlock).soundType;
        this.sound.playStep(sType);
      }
    }

    // 更新攝影機位置與視角
    const finalEye = this.getEyePosition();
    this.camera.position.copy(finalEye);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // 更新準星光線投射與目標外框
    this.currentHit = this.world.raycast(finalEye, this.getLookDirection(), 6.2);
    if (this.currentHit.hit) {
      this.highlightBox.visible = true;
      this.highlightBox.position.set(
        this.currentHit.blockPos.x + 0.5,
        this.currentHit.blockPos.y + 0.5,
        this.currentHit.blockPos.z + 0.5
      );
    } else {
      this.highlightBox.visible = false;
    }

    // 更新方塊打擊/挖掘進度與裂痕動畫（生存模式依方塊屬性逐步破壞；創造模式一擊破）
    this.updateBlockMining(dt);

    // 更新右下角手臂擺動動畫
    this.updateHandAnimation(dt, horizSpeed);
  }

  private updateBlockMining(dt: number): void {
    if (this.gameMode === 'creative') {
      if (this.miningProgress > 0) this.resetMining();
      return;
    }

    if (!this.currentHit || !this.currentHit.hit) {
      if (this.miningProgress > 0) this.resetMining();
      return;
    }

    const { blockPos, blockId } = this.currentHit;
    const def = getItemDef(blockId);
    if (def.hardness < 0) {
      this.resetMining();
      return;
    }

    const key = `${blockPos.x},${blockPos.y},${blockPos.z}`;
    if (key !== this.miningBlockKey) {
      if (this.isMouseDownLeft) {
        this.miningBlockKey = key;
        this.miningProgress = 0;
      } else {
        if (this.miningProgress > 0) this.resetMining();
        return;
      }
    }

    if (this.isMouseDownLeft) {
      const totalTime = this.getBlockBreakTime(blockId);
      this.miningProgress += dt / totalTime;
      this.miningDecayTimer = 1.5;
      this.triggerSwing();

      this.digSoundTimer += dt;
      if (this.digSoundTimer > 0.22) {
        this.digSoundTimer = 0;
        this.sound.playDig(def.soundType);
        this.entities.spawnBreakParticles(blockPos, blockId, 2);
      }

      if (this.miningProgress >= 1.0) {
        this.breakBlockAt(blockPos.x, blockPos.y, blockPos.z, blockId, true);
        return;
      }
      this.updateCrackVisual(blockPos);
    } else if (this.miningProgress > 0) {
      // 放開滑鼠左鍵後保留短暫裂痕進度，支援玩家連點打擊方塊；超時未繼續打擊才消退
      this.miningDecayTimer -= dt;
      if (this.miningDecayTimer <= 0) {
        this.resetMining();
      } else {
        this.updateCrackVisual(blockPos);
      }
    }
  }

  private updateHandAnimation(dt: number, horizSpeed: number): void {
    const bob = this.onGround ? Math.sin(performance.now() * 0.01) * Math.min(1, horizSpeed * 0.15) * 0.03 : 0;

    if (this.isSwinging) {
      this.swingPhase += dt * 14;
      if (this.swingPhase >= Math.PI) {
        this.swingPhase = 0;
        this.isSwinging = false;
      }
    }

    const swingOffset = Math.sin(this.swingPhase);
    this.handGroup.position.set(
      -swingOffset * 0.12,
      bob - swingOffset * 0.08,
      -swingOffset * 0.14
    );
    this.handGroup.rotation.set(-swingOffset * 0.55, swingOffset * 0.35, 0);
  }
}
