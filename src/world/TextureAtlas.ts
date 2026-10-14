import * as THREE from 'three';
import { BlockId, getItemDef, TileIndex } from './BlockRegistry';

export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 8;
export const TILE_SIZE = 16;

// 固定虛擬亂數產生器，確保每次材質紋理一致
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function shadeHex(hex: string, delta: number): string {
  const clean = hex.replace('#', '');
  const r = clampChannel(parseInt(clean.substring(0, 2), 16) + delta);
  const g = clampChannel(parseInt(clean.substring(2, 4), 16) + delta);
  const b = clampChannel(parseInt(clean.substring(4, 6), 16) + delta);
  return `rgb(${r},${g},${b})`;
}

export class TextureAtlas {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  public readonly crackTextures: THREE.CanvasTexture[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = ATLAS_COLS * TILE_SIZE;
    this.canvas.height = ATLAS_ROWS * TILE_SIZE;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('無法建立 2D Canvas Context');
    this.ctx = ctx;

    this.generateAllTiles();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.needsUpdate = true;

    this.crackTextures = this.generateCrackStages();
  }

  private getTileOrigin(tile: number): { ox: number; oy: number } {
    const col = tile % ATLAS_COLS;
    const row = Math.floor(tile / ATLAS_COLS);
    return { ox: col * TILE_SIZE, oy: row * TILE_SIZE };
  }

  private fillNoisyTile(tile: number, baseHex: string, variance = 16, seed = 100): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const rng = seededRandom(seed + tile * 97);
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        const delta = (rng() - 0.5) * 2 * variance;
        this.ctx.fillStyle = shadeHex(baseHex, delta);
        this.ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }

  private drawOreSpots(tile: number, oreColor: string, highlightColor: string, seed: number): void {
    this.fillNoisyTile(tile, '#7a7a7a', 18, seed);
    const { ox, oy } = this.getTileOrigin(tile);
    const spots = [
      [3, 4], [4, 4], [4, 5],
      [10, 3], [11, 3], [10, 4],
      [6, 10], [7, 10], [7, 11], [8, 10],
      [12, 11], [13, 12],
      [3, 12], [4, 12],
    ];
    for (let i = 0; i < spots.length; i++) {
      const [sx, sy] = spots[i];
      this.ctx.fillStyle = i % 3 === 0 ? highlightColor : oreColor;
      this.ctx.fillRect(ox + sx, oy + sy, 1, 1);
    }
  }

  private generateAllTiles(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 0: GrassTop
    this.fillNoisyTile(TileIndex.GrassTop, '#5ca038', 18, 11);

    // 1: GrassSide
    this.fillNoisyTile(TileIndex.GrassSide, '#866043', 18, 22);
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.GrassSide);
      const rng = seededRandom(33);
      for (let x = 0; x < TILE_SIZE; x++) {
        const grassDepth = 2 + Math.floor(rng() * 3);
        for (let y = 0; y < grassDepth; y++) {
          ctx.fillStyle = shadeHex('#5ca038', (rng() - 0.5) * 22);
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }

    // 2: Dirt
    this.fillNoisyTile(TileIndex.Dirt, '#866043', 20, 44);

    // 3: Stone
    this.fillNoisyTile(TileIndex.Stone, '#7d7d7d', 18, 55);
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.Stone);
      ctx.fillStyle = '#656565';
      ctx.fillRect(ox + 2, oy + 5, 5, 1);
      ctx.fillRect(ox + 9, oy + 11, 5, 1);
      ctx.fillRect(ox + 5, oy + 14, 4, 1);
    }

    // 4: Cobblestone
    this.fillNoisyTile(TileIndex.Cobblestone, '#6e6e6e', 28, 66);
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.Cobblestone);
      ctx.fillStyle = '#474747';
      for (let i = 0; i < 16; i += 4) {
        ctx.fillRect(ox + i, oy, 1, 16);
        ctx.fillRect(ox, oy + i, 16, 1);
      }
    }

    // 5: Sand
    this.fillNoisyTile(TileIndex.Sand, '#dfd596', 14, 77);

    // 6: Water (內建 0.68 半透明 Alpha，讓共用透明材質的水與玻璃各自擁有獨立透明度)
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.Water);
      ctx.clearRect(ox, oy, 16, 16);
      for (let y = 0; y < TILE_SIZE; y++) {
        for (let x = 0; x < TILE_SIZE; x++) {
          const wave = Math.round(Math.sin((x + y) * 0.6) * 16);
          const r = clampChannel(37 + wave);
          const g = clampChannel(99 + wave);
          const b = clampChannel(235 + wave);
          ctx.fillStyle = `rgba(${r},${g},${b},0.68)`;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }

    // 7: OakLogTop
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.OakLogTop);
      this.fillNoisyTile(TileIndex.OakLogTop, '#b4905a', 10, 88);
      ctx.strokeStyle = '#654b27';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 1, oy + 1, 14, 14);
      ctx.strokeStyle = '#8f6f3e';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox + 4, oy + 4, 8, 8);
    }

    // 8: OakLogSide
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.OakLogSide);
      const rng = seededRandom(99);
      for (let x = 0; x < TILE_SIZE; x++) {
        const stripe = x % 4 === 0 ? -16 : x % 2 === 0 ? 6 : -4;
        for (let y = 0; y < TILE_SIZE; y++) {
          ctx.fillStyle = shadeHex('#69502f', stripe + (rng() - 0.5) * 14);
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }

    // 9: OakLeaves
    this.fillNoisyTile(TileIndex.OakLeaves, '#387623', 26, 105);

    // 10: OakPlanks
    {
      this.fillNoisyTile(TileIndex.OakPlanks, '#a6824b', 12, 115);
      const { ox, oy } = this.getTileOrigin(TileIndex.OakPlanks);
      ctx.fillStyle = '#785a2e';
      for (let y = 3; y < 16; y += 4) {
        ctx.fillRect(ox, oy + y, 16, 1);
      }
      ctx.fillRect(ox + 7, oy, 1, 4);
      ctx.fillRect(ox + 12, oy + 4, 1, 4);
      ctx.fillRect(ox + 4, oy + 8, 1, 4);
      ctx.fillRect(ox + 10, oy + 12, 1, 4);
    }

    // 11: SnowSide
    this.fillNoisyTile(TileIndex.SnowSide, '#866043', 18, 125);
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.SnowSide);
      const rng = seededRandom(126);
      for (let x = 0; x < TILE_SIZE; x++) {
        const depth = 3 + Math.floor(rng() * 3);
        for (let y = 0; y < depth; y++) {
          ctx.fillStyle = shadeHex('#f4f9fc', (rng() - 0.5) * 10);
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }
      }
    }

    // 12: Snow
    this.fillNoisyTile(TileIndex.Snow, '#f4f9fc', 8, 135);

    // 13: Glass (真正清澈透明玻璃 + 經典像素邊框與白亮反光斜紋)
    {
      const { ox, oy } = this.getTileOrigin(TileIndex.Glass);
      ctx.clearRect(ox, oy, 16, 16);
      // 玻璃中心極淡冰藍微透光澤 (Alpha 0.12)
      ctx.fillStyle = 'rgba(186, 230, 253, 0.12)';
      ctx.fillRect(ox + 1, oy + 1, 14, 14);
      // 外框
      ctx.fillStyle = 'rgba(186, 230, 253, 0.92)';
      ctx.fillRect(ox, oy, 16, 1);
      ctx.fillRect(ox, oy + 15, 16, 1);
      ctx.fillRect(ox, oy, 1, 16);
      ctx.fillRect(ox + 15, oy, 1, 16);
      // 內角點綴與高光反光斜線
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(ox + 2, oy + 3, 1, 1);
      ctx.fillRect(ox + 3, oy + 2, 1, 1);
      ctx.fillRect(ox + 3, oy + 4, 1, 1);
      ctx.fillRect(ox + 4, oy + 3, 1, 1);
      ctx.fillRect(ox + 5, oy + 2, 1, 1);
      ctx.fillRect(ox + 11, oy + 12, 1, 1);
      ctx.fillRect(ox + 12, oy + 11, 1, 1);
      ctx.fillRect(ox + 12, oy + 13, 1, 1);
      ctx.fillRect(ox + 13, oy + 12, 1, 1);
    }

    // 14: Bricks
    {
      this.fillNoisyTile(TileIndex.Bricks, '#9c4234', 14, 145);
      const { ox, oy } = this.getTileOrigin(TileIndex.Bricks);
      ctx.fillStyle = '#cbd5e1';
      for (let y = 3; y < 16; y += 4) {
        ctx.fillRect(ox, oy + y, 16, 1);
      }
      for (let row = 0; row < 4; row++) {
        const offset = (row % 2) * 4;
        ctx.fillRect(ox + offset + 3, oy + row * 4, 1, 3);
        ctx.fillRect(ox + offset + 11, oy + row * 4, 1, 3);
      }
    }

    // 15~18: Ores
    this.drawOreSpots(TileIndex.CoalOre, '#1f2937', '#374151', 151);
    this.drawOreSpots(TileIndex.IronOre, '#d8b499', '#f5ebe0', 152);
    this.drawOreSpots(TileIndex.GoldOre, '#eab308', '#fef08a', 153);
    this.drawOreSpots(TileIndex.DiamondOre, '#06b6d4', '#a5f3fc', 154);

    // 19: CraftingTop
    {
      this.fillNoisyTile(TileIndex.CraftingTop, '#9c6b3b', 10, 160);
      const { ox, oy } = this.getTileOrigin(TileIndex.CraftingTop);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(ox + 1, oy + 1, 14, 1);
      ctx.fillRect(ox + 1, oy + 14, 14, 1);
      ctx.fillRect(ox + 1, oy + 1, 1, 14);
      ctx.fillRect(ox + 14, oy + 1, 1, 14);
      // 九宮格線
      ctx.fillStyle = '#5c2d0c';
      for (let i = 3; i <= 12; i += 3) {
        ctx.fillRect(ox + i, oy + 3, 1, 10);
        ctx.fillRect(ox + 3, oy + i, 10, 1);
      }
    }

    // 20: CraftingSide
    {
      this.fillNoisyTile(TileIndex.CraftingSide, '#a6824b', 12, 162);
      const { ox, oy } = this.getTileOrigin(TileIndex.CraftingSide);
      ctx.fillStyle = '#5c2d0c';
      ctx.fillRect(ox, oy, 16, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(ox + 3, oy + 6, 3, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(ox + 10, oy + 5, 4, 7);
    }

    // 21: Bookshelf
    {
      this.fillNoisyTile(TileIndex.Bookshelf, '#a6824b', 10, 165);
      const { ox, oy } = this.getTileOrigin(TileIndex.Bookshelf);
      ctx.fillStyle = '#271709';
      ctx.fillRect(ox + 1, oy + 2, 14, 5);
      ctx.fillRect(ox + 1, oy + 9, 14, 5);
      const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
      for (let row = 0; row < 2; row++) {
        const by = oy + (row === 0 ? 3 : 10);
        for (let bx = 2; bx < 14; bx += 2) {
          ctx.fillStyle = bookColors[(bx + row * 3) % bookColors.length];
          ctx.fillRect(ox + bx, by, 2, 4);
        }
      }
    }

    // 22: Glowstone
    {
      this.fillNoisyTile(TileIndex.Glowstone, '#ca8a04', 25, 170);
      const { ox, oy } = this.getTileOrigin(TileIndex.Glowstone);
      const rng = seededRandom(171);
      for (let i = 0; i < 45; i++) {
        const gx = Math.floor(rng() * 16);
        const gy = Math.floor(rng() * 16);
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#ffffff';
        ctx.fillRect(ox + gx, oy + gy, 1, 1);
      }
    }

    // 23: TNTTop
    {
      this.fillNoisyTile(TileIndex.TNTTop, '#dc2626', 14, 180);
      const { ox, oy } = this.getTileOrigin(TileIndex.TNTTop);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(ox + 6, oy + 6, 4, 4);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(ox + 7, oy + 7, 2, 2);
    }

    // 24: TNTSide
    {
      this.fillNoisyTile(TileIndex.TNTSide, '#dc2626', 14, 181);
      const { ox, oy } = this.getTileOrigin(TileIndex.TNTSide);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(ox, oy + 5, 16, 6);
      // TNT 字樣像素
      ctx.fillStyle = '#111827';
      // T
      ctx.fillRect(ox + 2, oy + 6, 3, 1);
      ctx.fillRect(ox + 3, oy + 6, 1, 4);
      // N
      ctx.fillRect(ox + 6, oy + 6, 1, 4);
      ctx.fillRect(ox + 7, oy + 7, 1, 1);
      ctx.fillRect(ox + 8, oy + 8, 1, 1);
      ctx.fillRect(ox + 9, oy + 6, 1, 4);
      // T
      ctx.fillRect(ox + 11, oy + 6, 3, 1);
      ctx.fillRect(ox + 12, oy + 6, 1, 4);
    }

    // 25: TNTBottom
    this.fillNoisyTile(TileIndex.TNTBottom, '#b91c1c', 14, 182);

    // 26: CactusTop & 27: CactusSide
    this.fillNoisyTile(TileIndex.CactusTop, '#16a34a', 14, 190);
    {
      this.fillNoisyTile(TileIndex.CactusSide, '#15803d', 14, 191);
      const { ox, oy } = this.getTileOrigin(TileIndex.CactusSide);
      ctx.fillStyle = '#052e16';
      for (let y = 2; y < 16; y += 4) {
        ctx.fillRect(ox + 2, oy + y, 1, 1);
        ctx.fillRect(ox + 8, oy + y + 1, 1, 1);
        ctx.fillRect(ox + 13, oy + y, 1, 1);
      }
    }

    // 28: BirchLogSide
    {
      this.fillNoisyTile(TileIndex.BirchLogSide, '#e2e8f0', 10, 195);
      const { ox, oy } = this.getTileOrigin(TileIndex.BirchLogSide);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox + 2, oy + 3, 4, 1);
      ctx.fillRect(ox + 10, oy + 6, 4, 2);
      ctx.fillRect(ox + 4, oy + 11, 5, 1);
      ctx.fillRect(ox + 11, oy + 14, 3, 1);
    }

    // 29: Bedrock
    this.fillNoisyTile(TileIndex.Bedrock, '#1f2937', 42, 199);

    // 30: DoorBottom (橡木門下半部：木質鑲板 + 門鎖下緣)
    {
      this.fillNoisyTile(TileIndex.DoorBottom, '#9c6b3b', 10, 205);
      const { ox, oy } = this.getTileOrigin(TileIndex.DoorBottom);
      ctx.fillStyle = '#5c3818';
      ctx.fillRect(ox, oy, 16, 2);
      ctx.fillRect(ox, oy + 14, 16, 2);
      ctx.fillRect(ox, oy, 2, 16);
      ctx.fillRect(ox + 14, oy, 2, 16);
      // 內部凹槽木板紋
      ctx.fillStyle = '#7c5128';
      ctx.fillRect(ox + 3, oy + 3, 4, 10);
      ctx.fillRect(ox + 9, oy + 3, 4, 10);
      // 金色門把底座下緣 (與上半部對齊於 x=12..13)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(ox + 12, oy, 2, 2);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 12, oy, 2, 1);
    }

    // 31: DoorTop (橡木門上半部：四格透光玻璃窗 + 金色門把)
    {
      this.fillNoisyTile(TileIndex.DoorTop, '#9c6b3b', 10, 206);
      const { ox, oy } = this.getTileOrigin(TileIndex.DoorTop);
      ctx.fillStyle = '#5c3818';
      ctx.fillRect(ox, oy, 16, 2);
      ctx.fillRect(ox, oy + 14, 16, 2);
      ctx.fillRect(ox, oy, 2, 16);
      ctx.fillRect(ox + 14, oy, 2, 16);
      // 四格窗戶鏤空
      ctx.clearRect(ox + 3, oy + 3, 4, 4);
      ctx.clearRect(ox + 9, oy + 3, 4, 4);
      ctx.clearRect(ox + 3, oy + 9, 4, 4);
      ctx.clearRect(ox + 9, oy + 9, 4, 4);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.fillRect(ox + 3, oy + 3, 4, 4);
      ctx.fillRect(ox + 9, oy + 3, 4, 4);
      ctx.fillRect(ox + 3, oy + 9, 4, 4);
      ctx.fillRect(ox + 9, oy + 9, 4, 4);
      // 金色門把與鎖孔底板 (位於門扇非門軸側 x=12..13)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 11, oy + 12, 3, 4);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox + 12, oy + 13, 2, 3);
    }

    // === 繪製工具、材料與食物 16x16 像素圖示 ===
    this.drawStickIcon(TileIndex.Stick);
    this.drawGemIcon(TileIndex.Coal, '#1e293b', '#475569');
    this.drawIngotIcon(TileIndex.IronIngot, '#cbd5e1', '#f8fafc');
    this.drawGemIcon(TileIndex.Diamond, '#06b6d4', '#a5f3fc');
    this.drawGemIcon(TileIndex.Gunpowder, '#64748b', '#94a3b8');

    // 十字鎬 (木、石、鐵、鑽石)
    this.drawPickaxeIcon(TileIndex.WoodenPickaxe, '#a16207');
    this.drawPickaxeIcon(TileIndex.StonePickaxe, '#64748b');
    this.drawPickaxeIcon(TileIndex.IronPickaxe, '#e2e8f0');
    this.drawPickaxeIcon(TileIndex.DiamondPickaxe, '#38bdf8');

    // 斧頭 (木、石、鐵、鑽石)
    this.drawAxeIcon(TileIndex.WoodenAxe, '#a16207');
    this.drawAxeIcon(TileIndex.StoneAxe, '#64748b');
    this.drawAxeIcon(TileIndex.IronAxe, '#e2e8f0');
    this.drawAxeIcon(TileIndex.DiamondAxe, '#38bdf8');

    // 鏟子 (木、石、鐵、鑽石)
    this.drawShovelIcon(TileIndex.WoodenShovel, '#a16207');
    this.drawShovelIcon(TileIndex.StoneShovel, '#64748b');
    this.drawShovelIcon(TileIndex.IronShovel, '#e2e8f0');
    this.drawShovelIcon(TileIndex.DiamondShovel, '#38bdf8');

    // 長劍 (木、石、鐵、鑽石)
    this.drawSwordIcon(TileIndex.WoodenSword, '#a16207');
    this.drawSwordIcon(TileIndex.StoneSword, '#64748b');
    this.drawSwordIcon(TileIndex.IronSword, '#e2e8f0');
    this.drawSwordIcon(TileIndex.DiamondSword, '#38bdf8');

    this.drawFoodIcon(TileIndex.CookedPork, '#ea580c', '#fed7aa');
    this.drawFoodIcon(TileIndex.Apple, '#dc2626', '#fca5a5');
  }

  private drawStickIcon(tile: number): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    for (let i = 3; i < 13; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#854d0e' : '#a16207';
      ctx.fillRect(ox + i, oy + (15 - i), 2, 2);
    }
  }

  private drawGemIcon(tile: number, color: string, hi: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.fillRect(ox + 5, oy + 3, 6, 10);
    ctx.fillRect(ox + 3, oy + 5, 10, 6);
    ctx.fillStyle = hi;
    ctx.fillRect(ox + 5, oy + 5, 3, 3);
  }

  private drawIngotIcon(tile: number, color: string, hi: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    ctx.fillStyle = '#475569';
    ctx.fillRect(ox + 2, oy + 5, 12, 7);
    ctx.fillStyle = color;
    ctx.fillRect(ox + 3, oy + 6, 10, 5);
    ctx.fillStyle = hi;
    ctx.fillRect(ox + 4, oy + 6, 6, 2);
  }

  private drawPickaxeIcon(tile: number, headColor: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    // 握柄
    ctx.fillStyle = '#854d0e';
    for (let i = 2; i < 12; i++) {
      ctx.fillRect(ox + i, oy + (15 - i), 2, 2);
    }
    // 鎬頭
    ctx.fillStyle = headColor;
    ctx.fillRect(ox + 8, oy + 2, 6, 2);
    ctx.fillRect(ox + 12, oy + 4, 2, 4);
    ctx.fillRect(ox + 6, oy + 3, 3, 2);
  }

  private drawAxeIcon(tile: number, headColor: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    ctx.fillStyle = '#854d0e';
    for (let i = 2; i < 12; i++) {
      ctx.fillRect(ox + i, oy + (15 - i), 2, 2);
    }
    ctx.fillStyle = headColor;
    ctx.fillRect(ox + 8, oy + 2, 5, 5);
    ctx.fillRect(ox + 6, oy + 3, 3, 5);
  }

  private drawShovelIcon(tile: number, headColor: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    // 木質長柄
    ctx.fillStyle = '#854d0e';
    for (let i = 2; i < 11; i++) {
      ctx.fillRect(ox + i, oy + (15 - i), 2, 2);
    }
    // 圓弧鏟頭外框與金屬鏟面
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(ox + 9, oy + 2, 5, 5);
    ctx.fillStyle = headColor;
    ctx.fillRect(ox + 10, oy + 2, 4, 4);
    ctx.fillRect(ox + 9, oy + 3, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 11, oy + 2, 2, 1);
  }

  private drawSwordIcon(tile: number, bladeColor: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    // 劍首 (Pommel)
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(ox + 1, oy + 13, 2, 2);
    // 劍柄 (Grip)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(ox + 3, oy + 11, 2, 2);
    ctx.fillRect(ox + 4, oy + 10, 2, 2);
    // 寬大十字護手 (Crossguard)
    ctx.fillStyle = '#eab308';
    ctx.fillRect(ox + 2, oy + 8, 2, 2);
    ctx.fillRect(ox + 4, oy + 9, 3, 2);
    ctx.fillRect(ox + 6, oy + 11, 2, 2);
    // 寬刃劍身與高光劍鋒 (Blade)
    for (let i = 5; i <= 12; i++) {
      const bx = ox + i;
      const by = oy + (15 - i);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 1, by - 1, 4, 4);
    }
    for (let i = 5; i <= 13; i++) {
      const bx = ox + i;
      const by = oy + (15 - i);
      ctx.fillStyle = bladeColor;
      ctx.fillRect(bx, by - 1, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by - 1, 1, 1);
    }
  }

  private drawFoodIcon(tile: number, mainColor: string, hiColor: string): void {
    const { ox, oy } = this.getTileOrigin(tile);
    const ctx = this.ctx;
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(ox + 7, oy + 2, 2, 2);
    ctx.fillStyle = mainColor;
    ctx.fillRect(ox + 4, oy + 4, 8, 9);
    ctx.fillRect(ox + 3, oy + 5, 10, 7);
    ctx.fillStyle = hiColor;
    ctx.fillRect(ox + 5, oy + 5, 2, 3);
  }

  public getTileUVs(tile: number): { u0: number; v0: number; u1: number; v1: number } {
    const col = tile % ATLAS_COLS;
    const row = Math.floor(tile / ATLAS_COLS);
    // 微縮 0.0015 防止相鄰 Tile 邊緣滲色 (Texture Bleeding)
    const pad = 0.0015;
    const u0 = col / ATLAS_COLS + pad;
    const u1 = (col + 1) / ATLAS_COLS - pad;
    // Three.js UV 原點在左下角，Canvas 原點在左上角
    const v1 = 1 - (row / ATLAS_ROWS + pad);
    const v0 = 1 - ((row + 1) / ATLAS_ROWS - pad);
    return { u0, v0, u1, v1 };
  }

  public renderItemIconToCanvas(itemId: BlockId, targetCanvas: HTMLCanvasElement): void {
    const def = getItemDef(itemId);
    targetCanvas.width = 32;
    targetCanvas.height = 32;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 32, 32);

    if (def.isDoor) {
      const topOrigin = this.getTileOrigin(TileIndex.DoorTop);
      const botOrigin = this.getTileOrigin(TileIndex.DoorBottom);
      ctx.drawImage(this.canvas, topOrigin.ox, topOrigin.oy, 16, 16, 7, 1, 18, 15);
      ctx.drawImage(this.canvas, botOrigin.ox, botOrigin.oy, 16, 16, 7, 16, 18, 15);
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeRect(7, 1, 18, 30);
      return;
    }

    const tile = def.isBlock ? def.textures.side : def.textures.top;
    const { ox, oy } = this.getTileOrigin(tile);

    if (def.isBlock) {
      // 上半部畫頂面縮圖，下半部畫側面縮圖，營造立體感
      const topOrigin = this.getTileOrigin(def.textures.top);
      ctx.drawImage(this.canvas, topOrigin.ox, topOrigin.oy, 16, 16, 4, 1, 24, 9);
      ctx.drawImage(this.canvas, ox, oy, 16, 16, 4, 8, 24, 22);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 1, 24, 29);
    } else {
      ctx.drawImage(this.canvas, ox, oy, 16, 16, 2, 2, 28, 28);
    }
  }

  private generateCrackStages(): THREE.CanvasTexture[] {
    const stages: THREE.CanvasTexture[] = [];
    for (let s = 0; s < 10; s++) {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 16;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';

      const count = (s + 1) * 3;
      const rng = seededRandom(500);
      let cx = 8;
      let cy = 8;
      for (let i = 0; i < count; i++) {
        ctx.fillRect(cx, cy, 1, 1);
        cx = Math.max(1, Math.min(14, cx + Math.floor(rng() * 3) - 1));
        cy = Math.max(1, Math.min(14, cy + Math.floor(rng() * 3) - 1));
        if (i % 4 === 0) {
          cx = 4 + Math.floor(rng() * 8);
          cy = 4 + Math.floor(rng() * 8);
        }
      }

      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      stages.push(tex);
    }
    return stages;
  }
}
