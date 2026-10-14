import * as THREE from 'three';
import { BlockId, getItemDef } from './BlockRegistry';
import { ChunkMeshBuilder } from './ChunkMeshBuilder';
import { TextureAtlas } from './TextureAtlas';
import { BiomeName, CHUNK_HEIGHT, CHUNK_SIZE, TerrainGenerator } from './TerrainGenerator';

export interface ChunkEntry {
  cx: number;
  cz: number;
  data: Uint8Array;
  opaqueMesh?: THREE.Mesh;
  waterMesh?: THREE.Mesh;
  dirty: boolean;
}

export interface RaycastHit {
  hit: boolean;
  blockPos: THREE.Vector3;
  placePos: THREE.Vector3;
  normal: THREE.Vector3;
  blockId: BlockId;
  distance: number;
}

export class WorldManager {
  public readonly chunkGroup = new THREE.Group();
  public terrain: TerrainGenerator;
  public chunks = new Map<string, ChunkEntry>();
  public modifiedBlocks = new Map<string, BlockId>();
  public renderDistance = 4; // 半徑 4 Chunks (9x9 = 81 區塊)

  private meshBuilder: ChunkMeshBuilder;
  private opaqueMaterial: THREE.MeshLambertMaterial;
  private waterMaterial: THREE.MeshLambertMaterial;
  private glowstoneLights = new Map<string, THREE.PointLight>();

  constructor(private scene: THREE.Scene, private atlas: TextureAtlas, seed = 20261010) {
    this.terrain = new TerrainGenerator(seed);
    this.scene.add(this.chunkGroup);

    this.opaqueMaterial = new THREE.MeshLambertMaterial({
      map: this.atlas.texture,
      vertexColors: true,
      alphaTest: 0.15,
    });
    this.applyBlockLightShader(this.opaqueMaterial);

    this.waterMaterial = new THREE.MeshLambertMaterial({
      map: this.atlas.texture,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      alphaTest: 0.04,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.applyBlockLightShader(this.waterMaterial);

    this.meshBuilder = new ChunkMeshBuilder(
      this.atlas,
      this.opaqueMaterial,
      this.waterMaterial
    );
  }

  private applyBlockLightShader(material: THREE.MeshLambertMaterial): void {
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          attribute float aBlockLight;
          varying float vBlockLight;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vBlockLight = aBlockLight;`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          varying float vBlockLight;`
        )
        .replace(
          'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',
          `vec3 warmBlockLight = diffuseColor.rgb * vec3(1.12, 1.02, 0.82) * (vBlockLight * 1.18);
          vec3 emissiveSelf = vBlockLight > 0.96 ? diffuseColor.rgb * 0.42 : vec3(0.0);
          vec3 outgoingLight = max(reflectedLight.directDiffuse + reflectedLight.indirectDiffuse, warmBlockLight) + totalEmissiveRadiance + emissiveSelf;`
        );
    };
  }

  private updateGlowstonePointLight(ix: number, iy: number, iz: number, id: BlockId): void {
    const key = this.blockKey(ix, iy, iz);
    const existing = this.glowstoneLights.get(key);
    if (id === BlockId.Glowstone) {
      if (!existing && this.glowstoneLights.size < 20) {
        const light = new THREE.PointLight(0xffdd77, 3.2, 12, 1.3);
        light.position.set(ix + 0.5, iy + 0.5, iz + 0.5);
        this.scene.add(light);
        this.glowstoneLights.set(key, light);
      }
    } else if (existing) {
      this.scene.remove(existing);
      existing.dispose();
      this.glowstoneLights.delete(key);
    }
  }

  private chunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  private blockKey(wx: number, wy: number, wz: number): string {
    return `${wx},${wy},${wz}`;
  }

  public worldToChunkCoord(wx: number, wz: number): { cx: number; cz: number; lx: number; lz: number } {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { cx, cz, lx, lz };
  }

  public ensureChunkData(cx: number, cz: number): ChunkEntry {
    const key = this.chunkKey(cx, cz);
    let entry = this.chunks.get(key);
    if (!entry) {
      const data = this.terrain.generateChunkData(cx, cz);
      entry = { cx, cz, data, dirty: true };
      // 套用玩家曾經修改過的方塊紀錄
      const baseWx = cx * CHUNK_SIZE;
      const baseWz = cz * CHUNK_SIZE;
      for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            const bKey = this.blockKey(baseWx + lx, ly, baseWz + lz);
            const modId = this.modifiedBlocks.get(bKey);
            if (modId !== undefined) {
              data[ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx] = modId;
              if (modId === BlockId.Glowstone) {
                this.updateGlowstonePointLight(baseWx + lx, ly, baseWz + lz, modId);
              }
            }
          }
        }
      }
      this.chunks.set(key, entry);
    }
    return entry;
  }

  public getBlock(wx: number, wy: number, wz: number): BlockId {
    const ix = Math.floor(wx);
    const iy = Math.floor(wy);
    const iz = Math.floor(wz);
    if (iy < 0 || iy >= CHUNK_HEIGHT) return BlockId.Air;

    const mod = this.modifiedBlocks.get(this.blockKey(ix, iy, iz));
    if (mod !== undefined) return mod;

    const { cx, cz, lx, lz } = this.worldToChunkCoord(ix, iz);
    const entry = this.chunks.get(this.chunkKey(cx, cz));
    if (!entry) return BlockId.Air;
    return entry.data[iy * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx] as BlockId;
  }

  public setBlock(wx: number, wy: number, wz: number, id: BlockId, recordMod = true): void {
    const ix = Math.floor(wx);
    const iy = Math.floor(wy);
    const iz = Math.floor(wz);
    if (iy < 0 || iy >= CHUNK_HEIGHT) return;

    const prevId = this.getBlock(ix, iy, iz);

    if (recordMod) {
      this.modifiedBlocks.set(this.blockKey(ix, iy, iz), id);
    }

    this.updateGlowstonePointLight(ix, iy, iz, id);

    const { cx, cz, lx, lz } = this.worldToChunkCoord(ix, iz);
    const entry = this.ensureChunkData(cx, cz);
    entry.data[iy * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx] = id;
    entry.dirty = true;

    const isLightChange = prevId === BlockId.Glowstone || id === BlockId.Glowstone;
    if (isLightChange) {
      // 發光石影響半徑 7 格，更新九宮格相鄰區塊以確保跨區塊光暈無接縫
      for (let dcx = -1; dcx <= 1; dcx++) {
        for (let dcz = -1; dcz <= 1; dcz++) {
          this.markChunkDirty(cx + dcx, cz + dcz);
        }
      }
    } else {
      // 若位於區塊邊緣，標記相鄰區塊也需要重建網格
      if (lx === 0) this.markChunkDirty(cx - 1, cz);
      if (lx === CHUNK_SIZE - 1) this.markChunkDirty(cx + 1, cz);
      if (lz === 0) this.markChunkDirty(cx, cz - 1);
      if (lz === CHUNK_SIZE - 1) this.markChunkDirty(cx, cz + 1);
    }
  }

  private markChunkDirty(cx: number, cz: number): void {
    const entry = this.chunks.get(this.chunkKey(cx, cz));
    if (entry) entry.dirty = true;
  }

  public rebuildChunkMesh(entry: ChunkEntry): void {
    if (entry.opaqueMesh) {
      this.chunkGroup.remove(entry.opaqueMesh);
      entry.opaqueMesh.geometry.dispose();
    }
    if (entry.waterMesh) {
      this.chunkGroup.remove(entry.waterMesh);
      entry.waterMesh.geometry.dispose();
    }

    const { opaqueMesh, waterMesh } = this.meshBuilder.buildChunkMeshes(
      entry.cx,
      entry.cz,
      (wx, wy, wz) => this.getBlock(wx, wy, wz)
    );

    entry.opaqueMesh = opaqueMesh;
    entry.waterMesh = waterMesh;
    entry.dirty = false;

    this.chunkGroup.add(opaqueMesh);
    this.chunkGroup.add(waterMesh);
  }

  public updateChunksAroundPlayer(px: number, pz: number, buildAllImmediate = false): void {
    const centerCx = Math.floor(px / CHUNK_SIZE);
    const centerCz = Math.floor(pz / CHUNK_SIZE);

    // 確保範圍內所有 Chunk Data 存在（以便邊界剔除查詢正確）
    const neededCoords: Array<{ cx: number; cz: number; distSq: number }> = [];
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const cx = centerCx + dx;
        const cz = centerCz + dz;
        this.ensureChunkData(cx, cz);
        neededCoords.push({ cx, cz, distSq: dx * dx + dz * dz });
      }
    }

    // 由近到遠排序建構網格
    neededCoords.sort((a, b) => a.distSq - b.distSq);

    let builtCount = 0;
    const maxBuildsPerFrame = buildAllImmediate ? 999 : 3;

    for (const item of neededCoords) {
      const entry = this.chunks.get(this.chunkKey(item.cx, item.cz));
      if (entry && entry.dirty) {
        this.rebuildChunkMesh(entry);
        builtCount++;
        if (builtCount >= maxBuildsPerFrame) break;
      }
    }

    // 卸載過遠的區塊網格以節省顯示記憶體
    const unloadLimit = this.renderDistance + 2;
    for (const [key, entry] of this.chunks.entries()) {
      const dx = Math.abs(entry.cx - centerCx);
      const dz = Math.abs(entry.cz - centerCz);
      if (dx > unloadLimit || dz > unloadLimit) {
        if (entry.opaqueMesh) {
          this.chunkGroup.remove(entry.opaqueMesh);
          entry.opaqueMesh.geometry.dispose();
        }
        if (entry.waterMesh) {
          this.chunkGroup.remove(entry.waterMesh);
          entry.waterMesh.geometry.dispose();
        }
        this.chunks.delete(key);
      }
    }
  }

  public getSpawnHeight(wx: number, wz: number): number {
    const ix = Math.floor(wx);
    const iz = Math.floor(wz);
    const { cx, cz } = this.worldToChunkCoord(ix, iz);
    this.ensureChunkData(cx, cz);
    for (let y = CHUNK_HEIGHT - 1; y >= 1; y--) {
      const id = this.getBlock(ix, y, iz);
      if (id !== BlockId.Air && id !== BlockId.OakLeaves) {
        return y + 1.5;
      }
    }
    return 30;
  }

  public getTopBlockAt(wx: number, wz: number): { y: number; id: BlockId } {
    const ix = Math.floor(wx);
    const iz = Math.floor(wz);
    for (let y = CHUNK_HEIGHT - 1; y >= 1; y--) {
      const id = this.getBlock(ix, y, iz);
      if (id !== BlockId.Air) {
        return { y, id };
      }
    }
    return { y: 0, id: BlockId.Bedrock };
  }

  public getBiomeAt(wx: number, wz: number): BiomeName {
    return this.terrain.getBiomeAt(Math.floor(wx), Math.floor(wz));
  }

  // 高精度 3D DDA 體素光線投射 (Voxel Raycast)
  public raycast(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance = 6.5): RaycastHit {
    const dir = direction.clone().normalize();
    let x = Math.floor(origin.x);
    let y = Math.floor(origin.y);
    let z = Math.floor(origin.z);

    const stepX = dir.x > 0 ? 1 : dir.x < 0 ? -1 : 0;
    const stepY = dir.y > 0 ? 1 : dir.y < 0 ? -1 : 0;
    const stepZ = dir.z > 0 ? 1 : dir.z < 0 ? -1 : 0;

    const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

    let tMaxX = stepX > 0 ? (x + 1 - origin.x) * tDeltaX : stepX < 0 ? (origin.x - x) * tDeltaX : Infinity;
    let tMaxY = stepY > 0 ? (y + 1 - origin.y) * tDeltaY : stepY < 0 ? (origin.y - y) * tDeltaY : Infinity;
    let tMaxZ = stepZ > 0 ? (z + 1 - origin.z) * tDeltaZ : stepZ < 0 ? (origin.z - z) * tDeltaZ : Infinity;

    const normal = new THREE.Vector3();
    let dist = 0;

    while (dist <= maxDistance) {
      const id = this.getBlock(x, y, z);
      if (id !== BlockId.Air && !getItemDef(id).fluid) {
        return {
          hit: true,
          blockPos: new THREE.Vector3(x, y, z),
          placePos: new THREE.Vector3(x + normal.x, y + normal.y, z + normal.z),
          normal,
          blockId: id,
          distance: dist,
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          x += stepX;
          dist = tMaxX;
          tMaxX += tDeltaX;
          normal.set(-stepX, 0, 0);
        } else {
          z += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normal.set(0, 0, -stepZ);
        }
      } else {
        if (tMaxY < tMaxZ) {
          y += stepY;
          dist = tMaxY;
          tMaxY += tDeltaY;
          normal.set(0, -stepY, 0);
        } else {
          z += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normal.set(0, 0, -stepZ);
        }
      }
    }

    return {
      hit: false,
      blockPos: new THREE.Vector3(),
      placePos: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      blockId: BlockId.Air,
      distance: maxDistance,
    };
  }

  public resetWorld(newSeed: number, modifications?: Array<[string, BlockId]>): void {
    for (const entry of this.chunks.values()) {
      if (entry.opaqueMesh) {
        this.chunkGroup.remove(entry.opaqueMesh);
        entry.opaqueMesh.geometry.dispose();
      }
      if (entry.waterMesh) {
        this.chunkGroup.remove(entry.waterMesh);
        entry.waterMesh.geometry.dispose();
      }
    }
    for (const light of this.glowstoneLights.values()) {
      this.scene.remove(light);
      light.dispose();
    }
    this.glowstoneLights.clear();
    this.chunks.clear();
    this.modifiedBlocks.clear();
    if (modifications) {
      for (const [k, v] of modifications) {
        this.modifiedBlocks.set(k, v);
      }
    }
    this.terrain = new TerrainGenerator(newSeed);
  }
}
