import * as THREE from 'three';
import { BlockId, getItemDef } from './BlockRegistry';
import { TextureAtlas } from './TextureAtlas';
import { CHUNK_HEIGHT, CHUNK_SIZE } from './TerrainGenerator';

interface FaceDef {
  dir: [number, number, number];
  faceKey: 'top' | 'bottom' | 'side';
  shade: number;
  corners: Array<{
    pos: [number, number, number];
    uv: [number, number];
    aoOffsets: [[number, number, number], [number, number, number], [number, number, number]];
  }>;
}

const FACES: FaceDef[] = [
  // +Y 頂面
  {
    dir: [0, 1, 0],
    faceKey: 'top',
    shade: 1.0,
    corners: [
      { pos: [0, 1, 1], uv: [0, 0], aoOffsets: [[-1, 1, 0], [0, 1, 1], [-1, 1, 1]] },
      { pos: [1, 1, 1], uv: [1, 0], aoOffsets: [[1, 1, 0], [0, 1, 1], [1, 1, 1]] },
      { pos: [1, 1, 0], uv: [1, 1], aoOffsets: [[1, 1, 0], [0, 1, -1], [1, 1, -1]] },
      { pos: [0, 1, 0], uv: [0, 1], aoOffsets: [[-1, 1, 0], [0, 1, -1], [-1, 1, -1]] },
    ],
  },
  // -Y 底面
  {
    dir: [0, -1, 0],
    faceKey: 'bottom',
    shade: 0.55,
    corners: [
      { pos: [0, 0, 0], uv: [0, 0], aoOffsets: [[-1, -1, 0], [0, -1, -1], [-1, -1, -1]] },
      { pos: [1, 0, 0], uv: [1, 0], aoOffsets: [[1, -1, 0], [0, -1, -1], [1, -1, -1]] },
      { pos: [1, 0, 1], uv: [1, 1], aoOffsets: [[1, -1, 0], [0, -1, 1], [1, -1, 1]] },
      { pos: [0, 0, 1], uv: [0, 1], aoOffsets: [[-1, -1, 0], [0, -1, 1], [-1, -1, 1]] },
    ],
  },
  // +Z 正面 (南)
  {
    dir: [0, 0, 1],
    faceKey: 'side',
    shade: 0.86,
    corners: [
      { pos: [0, 0, 1], uv: [0, 0], aoOffsets: [[-1, 0, 1], [0, -1, 1], [-1, -1, 1]] },
      { pos: [1, 0, 1], uv: [1, 0], aoOffsets: [[1, 0, 1], [0, -1, 1], [1, -1, 1]] },
      { pos: [1, 1, 1], uv: [1, 1], aoOffsets: [[1, 0, 1], [0, 1, 1], [1, 1, 1]] },
      { pos: [0, 1, 1], uv: [0, 1], aoOffsets: [[-1, 0, 1], [0, 1, 1], [-1, 1, 1]] },
    ],
  },
  // -Z 背面 (北)
  {
    dir: [0, 0, -1],
    faceKey: 'side',
    shade: 0.82,
    corners: [
      { pos: [1, 0, 0], uv: [0, 0], aoOffsets: [[1, 0, -1], [0, -1, -1], [1, -1, -1]] },
      { pos: [0, 0, 0], uv: [1, 0], aoOffsets: [[-1, 0, -1], [0, -1, -1], [-1, -1, -1]] },
      { pos: [0, 1, 0], uv: [1, 1], aoOffsets: [[-1, 0, -1], [0, 1, -1], [-1, 1, -1]] },
      { pos: [1, 1, 0], uv: [0, 1], aoOffsets: [[1, 0, -1], [0, 1, -1], [1, 1, -1]] },
    ],
  },
  // +X 右面 (東)
  {
    dir: [1, 0, 0],
    faceKey: 'side',
    shade: 0.74,
    corners: [
      { pos: [1, 0, 1], uv: [0, 0], aoOffsets: [[1, 0, 1], [1, -1, 0], [1, -1, 1]] },
      { pos: [1, 0, 0], uv: [1, 0], aoOffsets: [[1, 0, -1], [1, -1, 0], [1, -1, -1]] },
      { pos: [1, 1, 0], uv: [1, 1], aoOffsets: [[1, 0, -1], [1, 1, 0], [1, 1, -1]] },
      { pos: [1, 1, 1], uv: [0, 1], aoOffsets: [[1, 0, 1], [1, 1, 0], [1, 1, 1]] },
    ],
  },
  // -X 左面 (西)
  {
    dir: [-1, 0, 0],
    faceKey: 'side',
    shade: 0.72,
    corners: [
      { pos: [0, 0, 0], uv: [0, 0], aoOffsets: [[-1, 0, -1], [-1, -1, 0], [-1, -1, -1]] },
      { pos: [0, 0, 1], uv: [1, 0], aoOffsets: [[-1, 0, 1], [-1, -1, 0], [-1, -1, 1]] },
      { pos: [0, 1, 1], uv: [1, 1], aoOffsets: [[-1, 0, 1], [-1, 1, 0], [-1, 1, 1]] },
      { pos: [0, 1, 0], uv: [0, 1], aoOffsets: [[-1, 0, -1], [-1, 1, 0], [-1, 1, -1]] },
    ],
  },
];

export interface ChunkMeshes {
  opaqueMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
}

export class ChunkMeshBuilder {
  constructor(
    private atlas: TextureAtlas,
    private opaqueMaterial: THREE.MeshLambertMaterial,
    private waterMaterial: THREE.MeshLambertMaterial
  ) {}

  private computeVertexAO(s1: boolean, s2: boolean, corner: boolean): number {
    if (s1 && s2) return 0.52;
    const count = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (corner ? 1 : 0);
    if (count === 0) return 1.0;
    if (count === 1) return 0.84;
    if (count === 2) return 0.68;
    return 0.52;
  }

  public buildChunkMeshes(
    cx: number,
    cz: number,
    getBlockWorld: (wx: number, wy: number, wz: number) => BlockId
  ): ChunkMeshes {
    const opPositions: number[] = [];
    const opNormals: number[] = [];
    const opUvs: number[] = [];
    const opColors: number[] = [];
    const opBlockLights: number[] = [];
    const opIndices: number[] = [];

    const waPositions: number[] = [];
    const waNormals: number[] = [];
    const waUvs: number[] = [];
    const waColors: number[] = [];
    const waBlockLights: number[] = [];
    const waIndices: number[] = [];

    const baseWx = cx * CHUNK_SIZE;
    const baseWz = cz * CHUNK_SIZE;

    // 收集此區塊與周圍 7 格內的所有發光方塊 (Glowstone) 座標
    const lightRadius = 7;
    const lightSources: Array<[number, number, number]> = [];
    for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
      for (let lz = -lightRadius; lz < CHUNK_SIZE + lightRadius; lz++) {
        for (let lx = -lightRadius; lx < CHUNK_SIZE + lightRadius; lx++) {
          const id = getBlockWorld(baseWx + lx, ly, baseWz + lz);
          if (id === BlockId.Glowstone) {
            lightSources.push([baseWx + lx + 0.5, ly + 0.5, baseWz + lz + 0.5]);
          }
        }
      }
    }

    const isOccluder = (wx: number, wy: number, wz: number): boolean => {
      const id = getBlockWorld(wx, wy, wz);
      if (id === BlockId.Air) return false;
      const def = getItemDef(id);
      return Boolean(def.solid && !def.transparent);
    };

    for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          const wx = baseWx + lx;
          const wz = baseWz + lz;
          const blockId = getBlockWorld(wx, ly, wz);
          if (blockId === BlockId.Air) continue;

          const def = getItemDef(blockId);
          const isFluid = Boolean(def.fluid);
          const isGlass = blockId === BlockId.Glass;
          const isDoor = Boolean(def.isDoor);
          const isTranslucentPass = isFluid || isGlass;

          // 門板採 3/16 (0.1875) 格薄板幾何：
          // 1. 自動判斷左右開門絞鏈 (isRightHinge)：若右側有相鄰門則此門為左扇門(左開)，若左側有相鄰門則此門為右扇門(右開)；單扇門則自動依兩側牆壁吸附
          // 2. 對齊放在方塊最外側 (z = 0.8125 ~ 1.0)，而非中間 (0.4 ~ 0.6)；開啟時貼齊左右最外側 (0.0 ~ 0.1875 或 0.8125 ~ 1.0)
          const doorThickness = 0.1875;
          let isRightHinge = false;
          if (isDoor) {
            const baseDoorY = def.isDoorTop ? ly - 1 : ly;
            const hasDoorLeft = getItemDef(getBlockWorld(wx - 1, baseDoorY, wz)).isDoor;
            const hasDoorRight = getItemDef(getBlockWorld(wx + 1, baseDoorY, wz)).isDoor;
            if (hasDoorLeft && !hasDoorRight) {
              isRightHinge = true;
            } else if (!hasDoorLeft && hasDoorRight) {
              isRightHinge = false;
            } else {
              const solidLeft = isOccluder(wx - 1, baseDoorY, wz) || isOccluder(wx - 1, baseDoorY + 1, wz);
              const solidRight = isOccluder(wx + 1, baseDoorY, wz) || isOccluder(wx + 1, baseDoorY + 1, wz);
              if (solidRight && !solidLeft) {
                isRightHinge = true;
              }
            }
          }

          let xMin = 0.0;
          let xMax = 1.0;
          let zMin = 0.0;
          let zMax = 1.0;
          if (isDoor) {
            if (!def.isDoorOpen) {
              // 關閉時對齊方塊最外側 (+Z 外緣)
              xMin = 0.0;
              xMax = 1.0;
              zMin = 1.0 - doorThickness;
              zMax = 1.0;
            } else if (isRightHinge) {
              // 右開門：開啟時貼齊右側最外緣 (+X 外緣)
              xMin = 1.0 - doorThickness;
              xMax = 1.0;
              zMin = 0.0;
              zMax = 1.0;
            } else {
              // 左開門：開啟時貼齊左側最外緣 (-X 外緣)
              xMin = 0.0;
              xMax = doorThickness;
              zMin = 0.0;
              zMax = 1.0;
            }
          }

          for (const face of FACES) {
            const nx = wx + face.dir[0];
            const ny = ly + face.dir[1];
            const nz = wz + face.dir[2];

            const neighborId = getBlockWorld(nx, ny, nz);
            const neighborDef = getItemDef(neighborId);

            // 隱藏面剔除判斷
            if (isDoor) {
              // 雙層門的上下接縫面剔除，其餘面皆完整繪製薄門板
              if (face.dir[1] !== 0 && neighborDef.isDoor) continue;
            } else if (isFluid) {
              if (neighborId === blockId || (neighborDef.solid && !neighborDef.transparent)) {
                continue;
              }
            } else if (isGlass) {
              // 透明玻璃：只有當鄰居也是玻璃時剔除內部接縫面，其餘面皆繪製以呈現立體透明玻璃窗感
              if (neighborId === BlockId.Glass) continue;
              if (neighborDef.solid && !neighborDef.transparent) continue;
            } else if (def.transparent) {
              // 樹葉：若鄰居是完全不透明方塊則剔除
              if (neighborDef.solid && !neighborDef.transparent) continue;
            } else {
              // 一般不透明方塊：只有鄰居是空氣或透明/流體時才繪製該面
              if (neighborId !== BlockId.Air && !neighborDef.transparent && !neighborDef.fluid) {
                continue;
              }
            }

            const tileIdx = def.textures[face.faceKey];
            const { u0, v0, u1, v1 } = this.atlas.getTileUVs(tileIdx);

            const targetPos = isTranslucentPass ? waPositions : opPositions;
            const targetNorm = isTranslucentPass ? waNormals : opNormals;
            const targetUv = isTranslucentPass ? waUvs : opUvs;
            const targetCol = isTranslucentPass ? waColors : opColors;
            const targetBL = isTranslucentPass ? waBlockLights : opBlockLights;
            const targetIdx = isTranslucentPass ? waIndices : opIndices;

            const vertOffset = targetPos.length / 3;
            const isEmissive = Boolean(def.lightEmission && def.lightEmission > 0);

            for (const corner of face.corners) {
              let py = ly + corner.pos[1];
              // 水方塊頂面稍微降低 0.12 格，營造自然水面感
              if (isFluid && corner.pos[1] === 1 && getBlockWorld(wx, ly + 1, wz) !== BlockId.Water) {
                py -= 0.12;
              }

              const cxPos = corner.pos[0] === 0 ? xMin : xMax;
              const czPos = corner.pos[2] === 0 ? zMin : zMax;
              const vwx = wx + cxPos;
              const vwz = wz + czPos;

              targetPos.push(lx + cxPos, py, lz + czPos);
              targetNorm.push(face.dir[0], face.dir[1], face.dir[2]);

              let u = corner.uv[0] === 0 ? u0 : u1;
              if (isDoor) {
                // 3. 確保門把圖示在正反兩面 (+Z 與 -Z、或開啟時的 +X 與 -X) 空間位置完全一致，且窄邊使用實木邊條
                if (!def.isDoorOpen) {
                  if (face.dir[2] !== 0) {
                    const isHingeSide = isRightHinge ? corner.pos[0] === 1 : corner.pos[0] === 0;
                    u = isHingeSide ? u0 : u1;
                  } else {
                    u = corner.uv[0] === 0 ? u0 : u0 + (u1 - u0) * doorThickness;
                  }
                } else {
                  if (face.dir[0] !== 0) {
                    const isHingeSide = corner.pos[2] === 1;
                    u = isHingeSide ? u0 : u1;
                  } else {
                    u = corner.uv[0] === 0 ? u0 : u0 + (u1 - u0) * doorThickness;
                  }
                }
              }
              const v = corner.uv[1] === 0 ? v0 : v1;
              targetUv.push(u, v);

              let light = isEmissive ? 1.0 : face.shade;
              if (!isTranslucentPass && !isEmissive) {
                const [o1, o2, oc] = corner.aoOffsets;
                const s1 = isOccluder(wx + o1[0], ly + o1[1], wz + o1[2]);
                const s2 = isOccluder(wx + o2[0], ly + o2[1], wz + o2[2]);
                const sc = isOccluder(wx + oc[0], ly + oc[1], wz + oc[2]);
                const ao = this.computeVertexAO(s1, s2, sc);
                light *= ao;
              }

              // 計算發光方塊 (Glowstone) 對頂點的照明強度 (0.0 ~ 1.0)
              let blockLight = isEmissive ? 1.0 : 0.0;
              if (!isEmissive && lightSources.length > 0) {
                const sampleX = vwx + face.dir[0] * 0.25;
                const sampleY = py + face.dir[1] * 0.25;
                const sampleZ = vwz + face.dir[2] * 0.25;
                for (let i = 0; i < lightSources.length; i++) {
                  const [sx, sy, sz] = lightSources[i];
                  const dist = Math.hypot(sampleX - sx, sampleY - sy, sampleZ - sz);
                  if (dist < lightRadius) {
                    const intensity = Math.pow(1 - dist / lightRadius, 1.25);
                    if (intensity > blockLight) blockLight = intensity;
                  }
                }
              }

              // 受到發光石照射時帶入溫暖金黃色光暈
              const rCol = Math.min(1.15, light + blockLight * 0.35);
              const gCol = Math.min(1.12, light + blockLight * 0.30);
              const bCol = Math.min(1.05, light + blockLight * 0.18);

              targetCol.push(rCol, gCol, bCol);
              targetBL.push(blockLight);
            }

            targetIdx.push(
              vertOffset,
              vertOffset + 1,
              vertOffset + 2,
              vertOffset,
              vertOffset + 2,
              vertOffset + 3
            );
          }
        }
      }
    }

    const opaqueGeo = new THREE.BufferGeometry();
    opaqueGeo.setAttribute('position', new THREE.Float32BufferAttribute(opPositions, 3));
    opaqueGeo.setAttribute('normal', new THREE.Float32BufferAttribute(opNormals, 3));
    opaqueGeo.setAttribute('uv', new THREE.Float32BufferAttribute(opUvs, 2));
    opaqueGeo.setAttribute('color', new THREE.Float32BufferAttribute(opColors, 3));
    opaqueGeo.setAttribute('aBlockLight', new THREE.Float32BufferAttribute(opBlockLights, 1));
    opaqueGeo.setIndex(opIndices);
    opaqueGeo.computeBoundingSphere();

    const waterGeo = new THREE.BufferGeometry();
    waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waPositions, 3));
    waterGeo.setAttribute('normal', new THREE.Float32BufferAttribute(waNormals, 3));
    waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(waUvs, 2));
    waterGeo.setAttribute('color', new THREE.Float32BufferAttribute(waColors, 3));
    waterGeo.setAttribute('aBlockLight', new THREE.Float32BufferAttribute(waBlockLights, 1));
    waterGeo.setIndex(waIndices);
    waterGeo.computeBoundingSphere();

    const opaqueMesh = new THREE.Mesh(opaqueGeo, this.opaqueMaterial);
    opaqueMesh.position.set(baseWx, 0, baseWz);

    const waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    waterMesh.position.set(baseWx, 0, baseWz);
    waterMesh.renderOrder = 1;

    return { opaqueMesh, waterMesh };
  }
}
