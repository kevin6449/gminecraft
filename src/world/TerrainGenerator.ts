import { createNoise2D, createNoise3D, NoiseFunction2D, NoiseFunction3D } from 'simplex-noise';
import { BlockId } from './BlockRegistry';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;
export const SEA_LEVEL = 18;

export type BiomeName = '翠綠平原' | '橡木森林' | '黃金沙漠' | '冰封雪原' | '高山岩峰';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TerrainGenerator {
  public seed: number;
  private noiseElevation: NoiseFunction2D;
  private noiseDetail: NoiseFunction2D;
  private noiseTemperature: NoiseFunction2D;
  private noiseMoisture: NoiseFunction2D;
  private noiseCave: NoiseFunction3D;

  constructor(seed = 20261010) {
    this.seed = seed;
    const rng1 = mulberry32(seed);
    const rng2 = mulberry32(seed + 101);
    const rng3 = mulberry32(seed + 202);
    const rng4 = mulberry32(seed + 303);
    const rng5 = mulberry32(seed + 404);

    this.noiseElevation = createNoise2D(rng1);
    this.noiseDetail = createNoise2D(rng2);
    this.noiseTemperature = createNoise2D(rng3);
    this.noiseMoisture = createNoise2D(rng4);
    this.noiseCave = createNoise3D(rng5);
  }

  public getBiomeAt(wx: number, wz: number): BiomeName {
    const temp = this.noiseTemperature(wx * 0.0045, wz * 0.0045);
    const moist = this.noiseMoisture(wx * 0.0045, wz * 0.0045);
    const elev = this.getSurfaceHeight(wx, wz);

    if (elev >= 36) return '高山岩峰';
    if (temp > 0.32 && moist < 0.05) return '黃金沙漠';
    if (temp < -0.3) return '冰封雪原';
    if (moist > 0.15) return '橡木森林';
    return '翠綠平原';
  }

  public getSurfaceHeight(wx: number, wz: number): number {
    const base = this.noiseElevation(wx * 0.008, wz * 0.008);
    const medium = this.noiseElevation(wx * 0.022, wz * 0.022) * 0.45;
    const detail = this.noiseDetail(wx * 0.06, wz * 0.06) * 0.18;

    // 高山隆起
    const mountainFactor = Math.max(0, this.noiseElevation(wx * 0.005 + 50, wz * 0.005 + 50));
    const mountainBoost = Math.pow(mountainFactor, 2.2) * 20;

    const combined = base + medium + detail;
    let rawHeight = Math.floor(21 + combined * 9 + mountainBoost);
    if (rawHeight <= SEA_LEVEL) {
      rawHeight = Math.max(5, rawHeight - 2);
    }
    return Math.max(5, Math.min(CHUNK_HEIGHT - 8, rawHeight));
  }

  private coordHash(wx: number, wy: number, wz: number): number {
    let h = (wx * 374761393 + wy * 668265263 + wz * 2147483647 + this.seed) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  public generateChunkData(cx: number, cz: number): Uint8Array {
    const data = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    const setLocal = (lx: number, ly: number, lz: number, id: BlockId) => {
      if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) return;
      data[ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx] = id;
    };
    const getLocal = (lx: number, ly: number, lz: number): BlockId => {
      if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) return BlockId.Air;
      return data[ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx] as BlockId;
    };

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        const surfaceY = this.getSurfaceHeight(wx, wz);
        const biome = this.getBiomeAt(wx, wz);

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          if (y === 0) {
            setLocal(lx, y, lz, BlockId.Bedrock);
            continue;
          }

          if (y > surfaceY) {
            if (y <= SEA_LEVEL) {
              setLocal(lx, y, lz, biome === '冰封雪原' && y === SEA_LEVEL ? BlockId.Snow : BlockId.Water);
            }
            continue;
          }

          // 地下洞穴 (保留地表與海平面下方安全層)
          if (y > 2 && y < surfaceY - 3) {
            const caveVal = this.noiseCave(wx * 0.055, y * 0.075, wz * 0.055);
            if (caveVal > 0.62) {
              continue;
            }
          }

          // 表層方塊
          if (y === surfaceY) {
            if (surfaceY <= SEA_LEVEL + 1) {
              setLocal(lx, y, lz, BlockId.Sand);
            } else if (biome === '黃金沙漠') {
              setLocal(lx, y, lz, BlockId.Sand);
            } else if (biome === '冰封雪原') {
              setLocal(lx, y, lz, BlockId.SnowGrass);
            } else if (biome === '高山岩峰') {
              setLocal(lx, y, lz, surfaceY > 41 ? BlockId.Snow : BlockId.Stone);
            } else {
              setLocal(lx, y, lz, BlockId.Grass);
            }
          } else if (y >= surfaceY - 3) {
            if (biome === '黃金沙漠' || surfaceY <= SEA_LEVEL + 1) {
              setLocal(lx, y, lz, BlockId.Sand);
            } else if (biome === '高山岩峰') {
              setLocal(lx, y, lz, BlockId.Stone);
            } else {
              setLocal(lx, y, lz, BlockId.Dirt);
            }
          } else {
            // 岩石層與地下礦脈生成
            const oreRoll = this.coordHash(wx, y, wz);
            if (y <= 10 && oreRoll < 0.012) {
              setLocal(lx, y, lz, BlockId.DiamondOre);
            } else if (y <= 18 && oreRoll < 0.02) {
              setLocal(lx, y, lz, BlockId.GoldOre);
            } else if (y <= 28 && oreRoll < 0.042) {
              setLocal(lx, y, lz, BlockId.IronOre);
            } else if (oreRoll < 0.068) {
              setLocal(lx, y, lz, BlockId.CoalOre);
            } else {
              setLocal(lx, y, lz, BlockId.Stone);
            }
          }
        }
      }
    }

    // 第二階段：種植樹木與仙人掌 (留出邊界 2 格避免跨區塊切斷樹冠)
    for (let lx = 2; lx < CHUNK_SIZE - 2; lx++) {
      for (let lz = 2; lz < CHUNK_SIZE - 2; lz++) {
        const wx = cx * CHUNK_SIZE + lx;
        const wz = cz * CHUNK_SIZE + lz;
        const surfaceY = this.getSurfaceHeight(wx, wz);
        if (surfaceY <= SEA_LEVEL + 1 || surfaceY >= CHUNK_HEIGHT - 10) continue;

        const biome = this.getBiomeAt(wx, wz);
        const treeRoll = this.coordHash(wx, surfaceY + 99, wz);

        if (biome === '黃金沙漠') {
          if (treeRoll < 0.014 && getLocal(lx, surfaceY, lz) === BlockId.Sand) {
            const cactusHeight = 2 + Math.floor(treeRoll * 200) % 2;
            for (let cy = 1; cy <= cactusHeight; cy++) {
              setLocal(lx, surfaceY + cy, lz, BlockId.Cactus);
            }
          }
        } else if (biome === '橡木森林' || biome === '翠綠平原' || biome === '冰封雪原') {
          const threshold = biome === '橡木森林' ? 0.032 : biome === '翠綠平原' ? 0.008 : 0.006;
          if (treeRoll < threshold) {
            // 檢查周圍 2 格內是否已有樹幹
            let tooClose = false;
            for (let dx = -2; dx <= 2; dx++) {
              for (let dz = -2; dz <= 2; dz++) {
                const b = getLocal(lx + dx, surfaceY + 1, lz + dz);
                if (b === BlockId.OakLog || b === BlockId.BirchLog) {
                  tooClose = true;
                }
              }
            }
            if (tooClose) continue;

            const isBirch = biome === '橡木森林' && (Math.floor(treeRoll * 1000) % 3 === 0);
            const logBlock = isBirch ? BlockId.BirchLog : BlockId.OakLog;
            const trunkHeight = 4 + (Math.floor(treeRoll * 10000) % 2);

            // 樹葉冠
            for (let ly = surfaceY + trunkHeight - 1; ly <= surfaceY + trunkHeight + 1; ly++) {
              const radius = ly === surfaceY + trunkHeight + 1 ? 1 : 2;
              for (let dx = -radius; dx <= radius; dx++) {
                for (let dz = -radius; dz <= radius; dz++) {
                  if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && ly === surfaceY + trunkHeight) continue;
                  if (getLocal(lx + dx, ly, lz + dz) === BlockId.Air) {
                    setLocal(lx + dx, ly, lz + dz, BlockId.OakLeaves);
                  }
                }
              }
            }
            // 樹幹
            for (let ty = 1; ty <= trunkHeight; ty++) {
              setLocal(lx, surfaceY + ty, lz, logBlock);
            }
          }
        }
      }
    }

    return data;
  }
}
