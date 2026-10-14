import { getBlockAttributeLabel, getItemDef } from '../world/BlockRegistry';
import { WorldManager } from '../world/WorldManager';
import { PlayerController } from '../player/PlayerController';
import { SkyAndLighting } from '../world/SkyAndLighting';
import { EntityManager } from '../entities/EntityManager';
import { CHUNK_SIZE } from '../world/TerrainGenerator';
import { getBiomeLabel, getItemName, t } from '../i18n/I18nManager';

export class HUDAndMinimap {
  private modeBadgeEl: HTMLElement;
  private survivalBarsEl: HTMLElement;
  private heartsBarEl: HTMLElement;
  private oxygenBarEl: HTMLElement;
  private hungerBarEl: HTMLElement;
  private miningContainerEl: HTMLElement;
  private miningBarEl: HTMLElement;
  private miningLabelEl: HTMLElement;

  private debugPanelEl: HTMLElement;
  private dbgFpsEl: HTMLElement;
  private dbgTimeEl: HTMLElement;
  private dbgXyzEl: HTMLElement;
  private dbgChunkEl: HTMLElement;
  private dbgBiomeEl: HTMLElement;
  private dbgTargetEl: HTMLElement;
  private dbgEntitiesEl: HTMLElement;
  private dbgModifiedEl: HTMLElement;

  private minimapCanvas: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;
  private minimapBiomeEl: HTMLElement;

  private toastEl: HTMLElement;
  private toastTimeout: number | null = null;

  private minimapTimer = 0;
  public showDebug = true;

  constructor(
    private world: WorldManager,
    private player: PlayerController,
    private sky: SkyAndLighting,
    private entities: EntityManager
  ) {
    this.modeBadgeEl = document.getElementById('mode-badge')!;
    this.survivalBarsEl = document.getElementById('survival-bars')!;
    this.heartsBarEl = document.getElementById('hearts-bar')!;
    this.oxygenBarEl = document.getElementById('oxygen-bar')!;
    this.hungerBarEl = document.getElementById('hunger-bar')!;
    this.miningContainerEl = document.getElementById('mining-progress-container')!;
    this.miningBarEl = document.getElementById('mining-progress-bar')!;
    this.miningLabelEl = document.getElementById('mining-progress-label')!;

    this.debugPanelEl = document.getElementById('debug-panel')!;
    this.dbgFpsEl = document.getElementById('dbg-fps')!;
    this.dbgTimeEl = document.getElementById('dbg-time')!;
    this.dbgXyzEl = document.getElementById('dbg-xyz')!;
    this.dbgChunkEl = document.getElementById('dbg-chunk')!;
    this.dbgBiomeEl = document.getElementById('dbg-biome')!;
    this.dbgTargetEl = document.getElementById('dbg-target')!;
    this.dbgEntitiesEl = document.getElementById('dbg-entities')!;
    this.dbgModifiedEl = document.getElementById('dbg-modified')!;

    this.minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    this.minimapCtx = this.minimapCanvas.getContext('2d')!;
    this.minimapBiomeEl = document.getElementById('minimap-biome-label')!;
    this.toastEl = document.getElementById('toast-message')!;

    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.showDebug = !this.showDebug;
        this.debugPanelEl.classList.toggle('hidden', !this.showDebug);
      }
    });

    this.refreshStatusBars();
  }

  public showToast(msg: string, durationMs = 2600): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove('hidden');
    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, durationMs);
  }

  public refreshStatusBars(): void {
    const isSurvival = this.player.gameMode === 'survival';
    const flyTag = this.player.isFlying ? t('flyingSuffix') : '';
    this.modeBadgeEl.textContent = isSurvival
      ? t('modeSurvival')
      : `${t('modeCreative')}${flyTag}`;
    this.modeBadgeEl.classList.toggle('survival', isSurvival);

    // 創造模式下不用顯示血條與狀態列；僅在生存模式下顯示
    this.survivalBarsEl.classList.toggle('hidden', !isSurvival);

    if (isSurvival) {
      const fullHearts = Math.ceil(this.player.health / 2);
      let heartsHtml = '';
      for (let i = 0; i < 10; i++) {
        heartsHtml += `<span>${i < fullHearts ? '❤️' : '🖤'}</span>`;
      }
      this.heartsBarEl.innerHTML = heartsHtml;

      // 氧氣條顯示在血條正上方：當頭部潛入水面下 (isUnderwater) 或氧氣恢復中時顯示
      const showOxygen = this.player.isUnderwater || this.player.oxygen < this.player.maxOxygen;
      this.oxygenBarEl.classList.toggle('hidden', !showOxygen);
      if (showOxygen) {
        const fullBubbles = Math.ceil(this.player.oxygen);
        let oxyHtml = '';
        for (let i = 0; i < 10; i++) {
          oxyHtml += `<span style="opacity:${i < fullBubbles ? '1' : '0.2'}">🫧</span>`;
        }
        this.oxygenBarEl.innerHTML = oxyHtml;
      }

      this.hungerBarEl.classList.remove('hidden');
      const fullHunger = Math.ceil(this.player.hunger / 2);
      let hungerHtml = '';
      for (let i = 0; i < 10; i++) {
        hungerHtml += `<span style="opacity:${i < fullHunger ? '1' : '0.28'}">🍗</span>`;
      }
      this.hungerBarEl.innerHTML = hungerHtml;
    }
  }

  public update(dt: number, fps: number): void {
    // 更新方塊屬性與打擊/挖掘進度條（創造與生存模式皆顯示方塊屬性與破壞進度）
    if (this.player.miningProgress > 0 && this.player.currentHit?.hit) {
      this.miningContainerEl.classList.remove('hidden');
      const pct = Math.min(100, Math.round(this.player.miningProgress * 100));
      this.miningBarEl.style.width = `${pct}%`;
      const targetDef = getItemDef(this.player.currentHit.blockId);
      const attrLabel = getBlockAttributeLabel(targetDef);
      const itemName = getItemName(targetDef.id) || targetDef.name;
      this.miningLabelEl.textContent = `⛏️ ${itemName} ${attrLabel} (${pct}%)`;
    } else {
      this.miningContainerEl.classList.add('hidden');
    }

    // 更新 Debug 資訊
    const px = this.player.position.x;
    const py = this.player.position.y;
    const pz = this.player.position.z;
    const biome = this.world.getBiomeAt(px, pz);
    const biomeText = getBiomeLabel(biome);

    this.dbgFpsEl.textContent = String(fps);
    this.dbgTimeEl.textContent = this.sky.getTimeLabel();
    this.dbgXyzEl.textContent = `${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)}`;
    this.dbgChunkEl.textContent = `${Math.floor(px / CHUNK_SIZE)}, ${Math.floor(pz / CHUNK_SIZE)}`;
    this.dbgBiomeEl.textContent = biomeText;
    this.minimapBiomeEl.textContent = `🧭 ${biomeText}`;

    if (this.player.currentHit && this.player.currentHit.hit) {
      const bDef = getItemDef(this.player.currentHit.blockId);
      const bp = this.player.currentHit.blockPos;
      const itemName = getItemName(bDef.id) || bDef.name;
      this.dbgTargetEl.textContent = `${itemName} ${getBlockAttributeLabel(bDef)} (${bp.x}, ${bp.y}, ${bp.z})`;
    } else {
      this.dbgTargetEl.textContent = t('dbgNone');
    }

    this.dbgEntitiesEl.textContent = String(this.entities.getTotalEntityCount());
    this.dbgModifiedEl.textContent = String(this.world.modifiedBlocks.size);

    // 每 0.15 秒重繪一次小地圖
    this.minimapTimer += dt;
    if (this.minimapTimer >= 0.15) {
      this.minimapTimer = 0;
      this.renderMinimap();
    }
  }

  private renderMinimap(): void {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const radius = 22; // 顯示周圍 45x45 格
    const cellSize = w / (radius * 2 + 1);

    const centerWx = Math.floor(this.player.position.x);
    const centerWz = Math.floor(this.player.position.z);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const wx = centerWx + dx;
        const wz = centerWz + dz;
        const top = this.world.getTopBlockAt(wx, wz);
        const def = getItemDef(top.id);

        ctx.fillStyle = def.mapColor;
        const sx = (dx + radius) * cellSize;
        const sy = (dz + radius) * cellSize;
        ctx.fillRect(sx, sy, Math.ceil(cellSize), Math.ceil(cellSize));

        // 依高度微調明暗增加地形立體感
        if (top.y > 26) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(0.28, (top.y - 26) * 0.015)})`;
          ctx.fillRect(sx, sy, Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }

    // 繪製附近的生物點位
    for (const mob of this.entities.mobs) {
      const dx = mob.pos.x - centerWx;
      const dz = mob.pos.z - centerWz;
      if (Math.abs(dx) <= radius && Math.abs(dz) <= radius) {
        const mx = (dx + radius) * cellSize;
        const my = (dz + radius) * cellSize;
        ctx.fillStyle = mob.hostile ? '#ef4444' : '#f472b6';
        ctx.fillRect(mx - 2, my - 2, 4, 4);
      }
    }

    // 繪製中央玩家位置與視角方向箭頭
    const cx = w / 2;
    const cy = h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.player.yaw);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
