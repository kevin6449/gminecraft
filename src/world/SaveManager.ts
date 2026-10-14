import { BlockId } from './BlockRegistry';
import { WorldManager } from './WorldManager';
import { PlayerController, GameMode } from '../player/PlayerController';
import { InventoryManager, InventorySlot } from '../ui/InventoryManager';
import { SkyAndLighting } from './SkyAndLighting';
import { t } from '../i18n/I18nManager';

const STORAGE_KEY = 'gminecraft_save_v1';

export interface WorldSaveData {
  version: number;
  seed: number;
  playerPos: [number, number, number];
  yaw: number;
  pitch: number;
  gameMode: GameMode;
  health: number;
  hunger: number;
  timeOfDay: number;
  hotbar: InventorySlot[];
  bag: InventorySlot[];
  modifiedBlocks: Array<[string, BlockId]>;
}

export class SaveManager {
  constructor(
    private world: WorldManager,
    private player: PlayerController,
    private inventory: InventoryManager,
    private sky: SkyAndLighting,
    private onToast: (msg: string) => void,
    private onStateRestored: () => void
  ) {
    this.bindButtons();
  }

  private bindButtons(): void {
    document.getElementById('btn-save-world')?.addEventListener('click', () => {
      this.saveToLocal(true);
    });

    document.getElementById('btn-export-world')?.addEventListener('click', () => {
      this.exportJSON();
    });

    const fileInput = document.getElementById('import-file-input') as HTMLInputElement | null;
    document.getElementById('btn-import-world')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) {
        this.importJSON(file);
        fileInput.value = '';
      }
    });

    document.getElementById('btn-reset-world')?.addEventListener('click', () => {
      const newSeed = Math.floor(100000 + Math.random() * 900000);
      localStorage.removeItem(STORAGE_KEY);
      this.world.resetWorld(newSeed);
      this.world.updateChunksAroundPlayer(0, 0, true);
      const spawnY = this.world.getSpawnHeight(0, 0);
      this.player.position.set(0.5, spawnY, 0.5);
      this.player.velocity.set(0, 0, 0);
      this.inventory.initDefaultInventory();
      this.inventory.renderHotbar();
      this.onStateRestored();
      this.onToast(t('toastNewWorld', { seed: newSeed }));
    });
  }

  public serialize(): WorldSaveData {
    return {
      version: 1,
      seed: this.world.terrain.seed,
      playerPos: [this.player.position.x, this.player.position.y, this.player.position.z],
      yaw: this.player.yaw,
      pitch: this.player.pitch,
      gameMode: this.player.gameMode,
      health: this.player.health,
      hunger: this.player.hunger,
      timeOfDay: this.sky.timeOfDay,
      hotbar: this.inventory.hotbar,
      bag: this.inventory.bag,
      modifiedBlocks: Array.from(this.world.modifiedBlocks.entries()),
    };
  }

  public saveToLocal(notify = true): void {
    try {
      const data = this.serialize();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (notify) {
        this.onToast(t('toastWorldSaved', { count: data.modifiedBlocks.length }));
      }
    } catch (err) {
      console.error('儲存失敗:', err);
    }
  }

  public loadFromLocal(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as WorldSaveData;
      this.applySaveData(data);
      return true;
    } catch {
      return false;
    }
  }

  public applySaveData(data: WorldSaveData): void {
    this.world.resetWorld(data.seed, data.modifiedBlocks || []);
    const [px, py, pz] = data.playerPos || [0.5, 34, 0.5];
    this.world.updateChunksAroundPlayer(px, pz, true);

    this.player.position.set(px, py, pz);
    this.player.yaw = data.yaw ?? 0;
    this.player.pitch = data.pitch ?? -0.15;
    this.player.gameMode = data.gameMode ?? 'creative';
    this.player.health = data.health ?? 20;
    this.player.hunger = data.hunger ?? 20;
    this.sky.timeOfDay = data.timeOfDay ?? 0.23;

    if (Array.isArray(data.hotbar) && data.hotbar.length === 9) {
      this.inventory.hotbar = data.hotbar;
    }
    if (Array.isArray(data.bag) && data.bag.length === 18) {
      this.inventory.bag = data.bag;
    }
    // 若舊存檔尚未包含新加入的「橡木門」，自動放入快捷欄第 4 格並將原物品移至背包
    if (this.inventory.getItemTotalCount(BlockId.OakDoor) === 0) {
      const prevSlot = this.inventory.hotbar[3];
      this.inventory.hotbar[3] = { itemId: BlockId.OakDoor, count: 16 };
      if (prevSlot && prevSlot.itemId !== BlockId.Air && prevSlot.count > 0) {
        this.inventory.addItem(prevSlot.itemId, prevSlot.count);
      }
    }
    this.inventory.renderHotbar();
    this.onStateRestored();
  }

  public exportJSON(): void {
    const data = this.serialize();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gminecraft-world-${data.seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.onToast(t('toastWorldExported'));
  }

  public importJSON(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as WorldSaveData;
        this.applySaveData(data);
        this.saveToLocal(false);
        this.onToast(t('toastWorldImported', { seed: data.seed }));
      } catch {
        this.onToast(t('toastImportFailed'));
      }
    };
    reader.readAsText(file);
  }
}
