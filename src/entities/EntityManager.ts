import * as THREE from 'three';
import { BlockId, getItemDef } from '../world/BlockRegistry';
import { WorldManager } from '../world/WorldManager';
import { SoundManager } from '../audio/SoundManager';
import { InventoryManager } from '../ui/InventoryManager';
import { SEA_LEVEL } from '../world/TerrainGenerator';
import { getMobName, t } from '../i18n/I18nManager';

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
}

interface DroppedItem {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  itemId: BlockId;
  count: number;
  age: number;
}

interface PrimedTNT {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  fuse: number;
}

export interface MobEntity {
  id: number;
  type: 'pig' | 'sheep' | 'zombie' | 'slime';
  name: string;
  hostile: boolean;
  group: THREE.Group;
  headGroup: THREE.Group;
  flameGroup?: THREE.Group;
  legs: THREE.Mesh[];
  materials: Array<{ mat: THREE.MeshLambertMaterial; origHex: number }>;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  yaw: number;
  onGround: boolean;
  hp: number;
  maxHp: number;
  hurtTimer: number;
  knockbackTimer: number;
  aiTimer: number;
  lookTimer: number;
  targetHeadYaw: number;
  targetHeadPitch: number;
  moveSpeed: number;
  attackCooldown: number;
  jumpCooldown: number;
  burnTimer: number;
}

export class EntityManager {
  public readonly entityGroup = new THREE.Group();
  private particles: Particle[] = [];
  private drops: DroppedItem[] = [];
  private tnts: PrimedTNT[] = [];
  public mobs: MobEntity[] = [];
  private nextMobId = 1;
  private spawnTimer = 0;

  private particleGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  private dropGeo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
  private tntGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);

  constructor(
    private scene: THREE.Scene,
    private world: WorldManager,
    private sound: SoundManager,
    private inventory: InventoryManager,
    private onToast: (msg: string) => void
  ) {
    this.scene.add(this.entityGroup);
  }

  public getTotalEntityCount(): number {
    return this.mobs.length + this.drops.length + this.tnts.length;
  }

  // 產生方塊破壞粒子
  public spawnBreakParticles(pos: THREE.Vector3, blockId: BlockId, count = 18): void {
    const def = getItemDef(blockId);
    const mat = new THREE.MeshLambertMaterial({ color: def.mapColor });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        pos.x + 0.2 + Math.random() * 0.6,
        pos.y + 0.2 + Math.random() * 0.6,
        pos.z + 0.2 + Math.random() * 0.6
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        1.5 + Math.random() * 3.5,
        (Math.random() - 0.5) * 4.5
      );
      this.entityGroup.add(mesh);
      this.particles.push({ mesh, vel, life: 0.45 + Math.random() * 0.45 });
    }
  }

  // 產生火焰燃燒粒子（供天亮殭屍自燃使用）
  public spawnFireParticles(pos: THREE.Vector3, count = 8): void {
    for (let i = 0; i < count; i++) {
      const isYellow = Math.random() < 0.45;
      const mat = new THREE.MeshBasicMaterial({
        color: isYellow ? 0xfacc15 : 0xff5500,
      });
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.65,
        pos.y + 0.4 + Math.random() * 1.2,
        pos.z + (Math.random() - 0.5) * 0.65
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        2.2 + Math.random() * 2.6,
        (Math.random() - 0.5) * 1.6
      );
      this.entityGroup.add(mesh);
      this.particles.push({ mesh, vel, life: 0.28 + Math.random() * 0.28 });
    }
  }

  // 產生可拾取的 3D 掉落物
  public spawnDrop(pos: THREE.Vector3, itemId: BlockId, count = 1): void {
    if (itemId === BlockId.Air) return;
    const def = getItemDef(itemId);
    const mat = new THREE.MeshLambertMaterial({ color: def.mapColor });
    const mesh = new THREE.Mesh(this.dropGeo, mat);
    const startPos = pos.clone().add(new THREE.Vector3(0.5, 0.45, 0.5));
    mesh.position.copy(startPos);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 2.4,
      3.2,
      (Math.random() - 0.5) * 2.4
    );

    this.entityGroup.add(mesh);
    this.drops.push({
      mesh,
      pos: startPos,
      vel,
      itemId,
      count,
      age: 0,
    });
  }

  // 點燃 TNT 實體
  public igniteTNT(wx: number, wy: number, wz: number, initialFuse = 2.6): void {
    this.world.setBlock(wx, wy, wz, BlockId.Air);
    this.sound.playFuse();

    const mat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const mesh = new THREE.Mesh(this.tntGeo, mat);
    const pos = new THREE.Vector3(wx + 0.5, wy + 0.5, wz + 0.5);
    mesh.position.copy(pos);

    const vel = new THREE.Vector3((Math.random() - 0.5) * 1.5, 3.8, (Math.random() - 0.5) * 1.5);
    this.entityGroup.add(mesh);
    this.tnts.push({ mesh, pos, vel, fuse: initialFuse });
  }

  // 執行 TNT 大爆炸
  private explodeTNT(center: THREE.Vector3, playerPos: THREE.Vector3, onPlayerDamage: (dmg: number, kb: THREE.Vector3) => void): void {
    this.sound.playExplosion();
    this.spawnBreakParticles(center.clone().subScalar(0.5), BlockId.TNT, 42);

    const radius = 3.6;
    const rCeil = Math.ceil(radius);
    const cx = Math.floor(center.x);
    const cy = Math.floor(center.y);
    const cz = Math.floor(center.z);

    for (let dx = -rCeil; dx <= rCeil; dx++) {
      for (let dy = -rCeil; dy <= rCeil; dy++) {
        for (let dz = -rCeil; dz <= rCeil; dz++) {
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist <= radius) {
            const bx = cx + dx;
            const by = cy + dy;
            const bz = cz + dz;
            const bId = this.world.getBlock(bx, by, bz);
            if (bId === BlockId.Air || bId === BlockId.Bedrock) continue;

            // 連鎖引爆其他 TNT！
            if (bId === BlockId.TNT) {
              this.igniteTNT(bx, by, bz, 0.4 + Math.random() * 0.5);
              continue;
            }

            this.world.setBlock(bx, by, bz, BlockId.Air);
            if (Math.random() < 0.28) {
              const def = getItemDef(bId);
              this.spawnDrop(new THREE.Vector3(bx, by, bz), def.dropId ?? bId, 1);
            }
          }
        }
      }
    }

    // 震退並傷害範圍內的生物
    for (const mob of this.mobs) {
      const d = mob.pos.distanceTo(center);
      if (d < 7) {
        const dir = mob.pos.clone().sub(center).normalize();
        mob.vel.add(dir.multiplyScalar(10));
        mob.vel.y = 6;
        this.damageMob(mob, Math.ceil((7 - d) * 3), center);
      }
    }

    // 震退玩家
    const pDist = playerPos.distanceTo(center);
    if (pDist < 7) {
      const kb = playerPos.clone().sub(center).normalize().multiplyScalar((7 - pDist) * 2.5);
      kb.y = 5;
      onPlayerDamage(Math.max(1, Math.floor((7 - pDist) * 1.8)), kb);
    }
  }

  // 建立方塊生物模型 (小豬、綿羊、夜晚殭屍、夜晚史萊姆)
  public createMobMesh(type: 'pig' | 'sheep' | 'zombie' | 'slime'): {
    group: THREE.Group;
    headGroup: THREE.Group;
    flameGroup?: THREE.Group;
    legs: THREE.Mesh[];
    materials: Array<{ mat: THREE.MeshLambertMaterial; origHex: number }>;
  } {
    const group = new THREE.Group();
    const headGroup = new THREE.Group();
    let flameGroup: THREE.Group | undefined;
    const legs: THREE.Mesh[] = [];
    const materials: Array<{ mat: THREE.MeshLambertMaterial; origHex: number }> = [];

    const makeMat = (hex: number, opts?: THREE.MeshLambertMaterialParameters) => {
      const mat = new THREE.MeshLambertMaterial({ color: hex, ...opts });
      materials.push({ mat, origHex: hex });
      return mat;
    };

    if (type === 'pig' || type === 'sheep') {
      const bodyColor = type === 'pig' ? 0xf472b6 : 0xf8fafc;
      const headColor = type === 'pig' ? 0xf9a8d4 : 0xe2e8f0;
      const legColor = type === 'pig' ? 0xec4899 : 0xcbd5e1;

      const bodyMat = makeMat(bodyColor);
      const headMat = makeMat(headColor);
      const legMat = makeMat(legColor);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 1.05), bodyMat);
      body.position.set(0, 0.55, 0);
      group.add(body);

      // 頭部轉動樞紐 (支援轉頭張望動畫)
      headGroup.position.set(0, 0.78, 0.48);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.52, 0.55), headMat);
      head.position.set(0, 0, 0.14);
      headGroup.add(head);

      if (type === 'pig') {
        const snoutMat = makeMat(0xfb7185);
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.12), snoutMat);
        snout.position.set(0, -0.06, 0.44);
        headGroup.add(snout);
      }

      // 眼睛
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eyeMat);
      leftEye.position.set(0.16, 0.06, 0.42);
      const rightEye = leftEye.clone();
      rightEye.position.x = -0.16;
      headGroup.add(leftEye, rightEye);
      group.add(headGroup);

      const legOffsets = [
        [-0.22, 0.2, 0.35],
        [0.22, 0.2, 0.35],
        [-0.22, 0.2, -0.35],
        [0.22, 0.2, -0.35],
      ];
      for (const [lx, ly, lz] of legOffsets) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), legMat);
        leg.position.set(lx, ly, lz);
        group.add(leg);
        legs.push(leg);
      }
    } else if (type === 'zombie') {
      // 殭屍 (Zombie)
      const skinMat = makeMat(0x4ade80);
      const shirtMat = makeMat(0x0284c7);
      const pantsMat = makeMat(0x3730a3);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

      headGroup.position.set(0, 1.5, 0);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
      headGroup.add(head);

      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.05), eyeMat);
      leftEye.position.set(0.12, 0.02, 0.26);
      const rightEye = leftEye.clone();
      rightEye.position.x = -0.12;
      headGroup.add(leftEye, rightEye);
      group.add(headGroup);

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.68, 0.28), shirtMat);
      torso.position.set(0, 0.92, 0);
      group.add(torso);

      // 雙手向前伸直
      const armGeo = new THREE.BoxGeometry(0.2, 0.2, 0.62);
      const leftArm = new THREE.Mesh(armGeo, skinMat);
      leftArm.position.set(-0.36, 1.15, 0.26);
      const rightArm = new THREE.Mesh(armGeo, skinMat);
      rightArm.position.set(0.36, 1.15, 0.26);
      group.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(0.22, 0.58, 0.22);
      const leftLeg = new THREE.Mesh(legGeo, pantsMat);
      leftLeg.position.set(-0.13, 0.29, 0);
      const rightLeg = new THREE.Mesh(legGeo, pantsMat);
      rightLeg.position.set(0.13, 0.29, 0);
      group.add(leftLeg, rightLeg);
      legs.push(leftLeg, rightLeg);

      // 陽光下自燃的 3D 火焰模型群組 (預設隱藏，天亮曝曬時顯示)
      flameGroup = new THREE.Group();
      const outerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xff5500,
        transparent: true,
        opacity: 0.78,
      });
      const innerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
      });
      const flameBody = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.88, 0.44), outerFlameMat);
      flameBody.position.set(0, 0.98, 0);
      const flameHead = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.62, 0.58), innerFlameMat);
      flameHead.position.set(0, 1.56, 0);
      const flameCrown = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.36), outerFlameMat);
      flameCrown.position.set(0, 1.92, 0);
      flameGroup.add(flameBody, flameHead, flameCrown);
      flameGroup.visible = false;
      group.add(flameGroup);
    } else {
      // 彈跳史萊姆 (Slime)：外層半透明果凍方塊 + 內部核心與眼睛
      const outerMat = makeMat(0x4ade80, { transparent: true, opacity: 0.72 });
      const innerMat = makeMat(0x15803d);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x052e16 });

      headGroup.position.set(0, 0.45, 0);
      const outerCube = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), outerMat);
      const innerCore = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), innerMat);
      headGroup.add(outerCube, innerCore);

      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), eyeMat);
      leftEye.position.set(0.18, 0.1, 0.42);
      const rightEye = leftEye.clone();
      rightEye.position.x = -0.18;
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), eyeMat);
      mouth.position.set(0, -0.1, 0.42);
      headGroup.add(leftEye, rightEye, mouth);
      group.add(headGroup);
    }

    return { group, headGroup, flameGroup, legs, materials };
  }

  public spawnMobNearPlayer(
    playerPos: THREE.Vector3,
    isNight: boolean,
    forceHostile = false,
    explicitType?: 'pig' | 'sheep' | 'zombie' | 'slime'
  ): void {
    if (this.mobs.length >= 16) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = forceHostile ? 8 + Math.random() * 10 : 9 + Math.random() * 15;
    const wx = Math.floor(playerPos.x + Math.cos(angle) * dist);
    const wz = Math.floor(playerPos.z + Math.sin(angle) * dist);

    const top = this.world.getTopBlockAt(wx, wz);
    if (top.y <= SEA_LEVEL || top.id === BlockId.Water || top.id === BlockId.OakLeaves) return;

    let type: 'pig' | 'sheep' | 'zombie' | 'slime';
    if (explicitType) {
      type = explicitType;
    } else if (forceHostile || (isNight && Math.random() < 0.72)) {
      type = Math.random() < 0.55 ? 'zombie' : 'slime';
    } else {
      const r = Math.random();
      type = r < 0.4 ? 'pig' : r < 0.8 ? 'sheep' : 'slime';
    }

    const { group, headGroup, flameGroup, legs, materials } = this.createMobMesh(type);
    const pos = new THREE.Vector3(wx + 0.5, top.y + 1, wz + 0.5);
    group.position.copy(pos);
    this.entityGroup.add(group);

    const isHostile = type === 'zombie' || type === 'slime';
    const mobName =
      type === 'pig'
        ? '方塊小豬'
        : type === 'sheep'
        ? '方塊綿羊'
        : type === 'zombie'
        ? '夜晚殭屍'
        : '彈跳史萊姆';

    this.mobs.push({
      id: this.nextMobId++,
      type,
      name: mobName,
      hostile: isHostile,
      group,
      headGroup,
      flameGroup,
      legs,
      materials,
      pos,
      vel: new THREE.Vector3(),
      yaw: Math.random() * Math.PI * 2,
      onGround: true,
      hp: isHostile ? 16 : 10,
      maxHp: isHostile ? 16 : 10,
      hurtTimer: 0,
      knockbackTimer: 0,
      aiTimer: 0.5 + Math.random() * 1.5,
      lookTimer: 1.0 + Math.random() * 2.0,
      targetHeadYaw: 0,
      targetHeadPitch: 0,
      moveSpeed: type === 'zombie' ? 2.75 : type === 'slime' ? 4.2 : 1.7,
      attackCooldown: 0,
      jumpCooldown: 0.4 + Math.random() * 0.7,
      burnTimer: 0.5,
    });
  }

  // 檢查準星是否瞄準某隻生物並進行攻擊與擊退
  public tryAttackMob(origin: THREE.Vector3, dir: THREE.Vector3, damage: number): boolean {
    const normDir = dir.clone().normalize();
    const ray = new THREE.Ray(origin, normDir);
    let closestMob: MobEntity | null = null;
    let minDist = 5.4;

    for (const mob of this.mobs) {
      const boxHeight = mob.type === 'zombie' ? 1.95 : 1.25;
      const r = 0.58;
      const box = new THREE.Box3(
        new THREE.Vector3(mob.pos.x - r, mob.pos.y - 0.1, mob.pos.z - r),
        new THREE.Vector3(mob.pos.x + r, mob.pos.y + boxHeight, mob.pos.z + r)
      );
      const hitPoint = new THREE.Vector3();
      if (ray.intersectBox(box, hitPoint)) {
        const d = origin.distanceTo(hitPoint);
        if (d < minDist) {
          minDist = d;
          closestMob = mob;
        }
      }
    }

    if (!closestMob) return false;
    this.damageMob(closestMob, damage, origin, normDir, false);
    return true;
  }

  public damageMob(
    mob: MobEntity,
    damage: number,
    attackerPos: THREE.Vector3,
    attackDir?: THREE.Vector3,
    isBurnDamage = false
  ): void {
    mob.hp -= damage;
    mob.hurtTimer = 0.28;
    this.sound.playHurt();

    // 受傷紅閃回饋
    for (const item of mob.materials) {
      item.mat.color.setHex(isBurnDamage ? 0xff6b00 : 0xff3b3b);
    }

    if (!isBurnDamage) {
      mob.knockbackTimer = 0.52;
      mob.attackCooldown = Math.max(mob.attackCooldown, 0.75);

      // 結合攻擊者朝向與相對位置計算強力擊退方向 (後退 + 往上彈起)
      const kb = mob.pos.clone().sub(attackerPos).setY(0);
      if (attackDir) {
        kb.add(new THREE.Vector3(attackDir.x, 0, attackDir.z).multiplyScalar(1.5));
      }
      if (kb.lengthSq() < 0.001) {
        kb.set(Math.sin(mob.yaw + Math.PI), 0, Math.cos(mob.yaw + Math.PI));
      }
      kb.normalize();

      mob.vel.x = kb.x * 10.5;
      mob.vel.z = kb.z * 10.5;
      mob.vel.y = 5.8;
      mob.onGround = false;
    } else {
      // 陽光自燃小幅跳動與火焰粒子
      this.spawnFireParticles(mob.pos, 9);
      if (mob.onGround) {
        mob.vel.y = 2.6;
        mob.onGround = false;
      }
    }

    if (mob.hp <= 0) {
      this.spawnBreakParticles(mob.pos.clone(), mob.hostile ? BlockId.OakLeaves : BlockId.Bricks, 24);
      if (mob.hostile) {
        this.spawnDrop(mob.pos, BlockId.IronIngot, 1);
        this.spawnDrop(mob.pos, BlockId.Coal, 2);
        if (mob.type === 'slime') {
          this.spawnDrop(mob.pos, BlockId.Diamond, 1);
        }
      } else {
        this.spawnDrop(mob.pos, BlockId.CookedPork, 2);
      }
      this.entityGroup.remove(mob.group);
      this.mobs = this.mobs.filter((m) => m.id !== mob.id);
      const mobDisplayName = getMobName(mob.type);
      if (isBurnDamage) {
        this.onToast(t('toastMobBurned', { name: mobDisplayName }));
      } else {
        this.onToast(t('toastMobDefeated', { name: mobDisplayName }));
      }
    }
  }

  private isSolidAt(wx: number, wy: number, wz: number): boolean {
    const id = this.world.getBlock(Math.floor(wx), Math.floor(wy), Math.floor(wz));
    return id !== BlockId.Air && Boolean(getItemDef(id).solid);
  }

  // 檢查座標上方是否直接曝曬於陽光下（無不透明遮蔽物）
  private isExposedToSky(wx: number, wy: number, wz: number): boolean {
    const ix = Math.floor(wx);
    const iz = Math.floor(wz);
    const startY = Math.max(1, Math.floor(wy));
    for (let y = startY; y < 63; y++) {
      const id = this.world.getBlock(ix, y, iz);
      if (id !== BlockId.Air && id !== BlockId.Glass) {
        return false;
      }
    }
    return true;
  }

  public update(
    dt: number,
    playerPos: THREE.Vector3,
    isNight: boolean,
    isSurvival: boolean,
    onPlayerDamage: (dmg: number, kb: THREE.Vector3) => void
  ): void {
    // 1. 更新破壞粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.entityGroup.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.vel.y -= 14 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += 5 * dt;
      p.mesh.rotation.y += 5 * dt;
    }

    // 2. 更新掉落物與磁吸拾取
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.age += dt;
      if (d.age > 90) {
        this.entityGroup.remove(d.mesh);
        this.drops.splice(i, 1);
        continue;
      }

      d.vel.y -= 15 * dt;
      const nextY = d.pos.y + d.vel.y * dt;
      const belowBlock = this.world.getBlock(d.pos.x, nextY - 0.18, d.pos.z);
      if (belowBlock !== BlockId.Air && getItemDef(belowBlock).solid) {
        d.pos.y = Math.floor(nextY - 0.18) + 1.18;
        d.vel.y = 0;
        d.vel.x *= 0.8;
        d.vel.z *= 0.8;
      } else {
        d.pos.y = nextY;
      }
      d.pos.x += d.vel.x * dt;
      d.pos.z += d.vel.z * dt;

      // 玩家靠近自動吸入背包
      const distToPlayer = d.pos.distanceTo(playerPos);
      if (d.age > 0.25 && distToPlayer < 2.3) {
        const pull = playerPos.clone().sub(d.pos).normalize().multiplyScalar(10 * dt);
        d.pos.add(pull);
        if (distToPlayer < 1.25) {
          if (this.inventory.addItem(d.itemId, d.count)) {
            this.sound.playPop();
            this.entityGroup.remove(d.mesh);
            this.drops.splice(i, 1);
            continue;
          }
        }
      }

      d.mesh.position.set(d.pos.x, d.pos.y + Math.sin(d.age * 4) * 0.08, d.pos.z);
      d.mesh.rotation.y += 2.2 * dt;
    }

    // 3. 更新點燃的 TNT
    for (let i = this.tnts.length - 1; i >= 0; i--) {
      const t = this.tnts[i];
      t.fuse -= dt;

      t.vel.y -= 16 * dt;
      const nextY = t.pos.y + t.vel.y * dt;
      const below = this.world.getBlock(t.pos.x, nextY - 0.48, t.pos.z);
      if (below !== BlockId.Air && getItemDef(below).solid) {
        t.pos.y = Math.floor(nextY - 0.48) + 1.48;
        t.vel.y = 0;
        t.vel.x *= 0.82;
        t.vel.z *= 0.82;
      } else {
        t.pos.y = nextY;
      }
      t.pos.x += t.vel.x * dt;
      t.pos.z += t.vel.z * dt;
      t.mesh.position.copy(t.pos);

      const flash = Math.floor(t.fuse * 10) % 2 === 0;
      const mat = t.mesh.material as THREE.MeshLambertMaterial;
      mat.color.setHex(flash ? 0xffffff : 0xef4444);
      const scale = 1 + Math.max(0, (0.6 - t.fuse) * 0.35);
      t.mesh.scale.setScalar(scale);

      if (t.fuse <= 0) {
        this.entityGroup.remove(t.mesh);
        this.tnts.splice(i, 1);
        this.explodeTNT(t.pos, playerPos, onPlayerDamage);
      }
    }

    // 4. 定期在玩家周圍生成生物（夜晚確保有殭屍與史萊姆）
    this.spawnTimer += dt;
    const hostileCount = this.mobs.filter((m) => m.hostile).length;
    if (isNight && hostileCount < 4 && this.spawnTimer > 0.8) {
      this.spawnTimer = 0;
      this.spawnMobNearPlayer(playerPos, true, true);
    } else if (this.spawnTimer > 3.2) {
      this.spawnTimer = 0;
      this.spawnMobNearPlayer(playerPos, isNight, false);
    }

    // 5. 更新生物 AI、轉頭張望、史萊姆彈跳行進、天亮殭屍自燃與 1 格自動跳躍
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      const dist = mob.pos.distanceTo(playerPos);

      // 距離過遠自動移除
      if (dist > 56) {
        this.entityGroup.remove(mob.group);
        this.mobs.splice(i, 1);
        continue;
      }

      // 受傷紅閃顏色復原
      if (mob.hurtTimer > 0) {
        mob.hurtTimer -= dt;
        if (mob.hurtTimer <= 0) {
          for (const item of mob.materials) {
            item.mat.color.setHex(item.origHex);
          }
        }
      }

      if (mob.attackCooldown > 0) {
        mob.attackCooldown -= dt;
      }

      const inWater = this.world.getBlock(mob.pos.x, mob.pos.y + 0.3, mob.pos.z) === BlockId.Water;

      // 天亮殭屍陽光自燃機制 (天亮 + 非水中 + 上方無遮蔽物)
      if (mob.type === 'zombie') {
        const burningInSun = !isNight && !inWater && this.isExposedToSky(mob.pos.x, mob.pos.y + 1.8, mob.pos.z);
        if (mob.flameGroup) {
          mob.flameGroup.visible = burningInSun;
          if (burningInSun) {
            const flicker = 0.92 + Math.sin(performance.now() * 0.035 + mob.id) * 0.14;
            mob.flameGroup.scale.set(flicker, 0.9 + Math.cos(performance.now() * 0.04) * 0.18, flicker);
          }
        }
        if (burningInSun) {
          mob.burnTimer -= dt;
          if (mob.burnTimer <= 0) {
            mob.burnTimer = 0.72;
            this.damageMob(mob, 3, mob.pos.clone(), undefined, true);
            if (mob.hp <= 0) {
              continue; // 已燒死移除
            }
          }
        }
      }

      // 轉頭張望動畫更新 (Look Around)
      mob.lookTimer -= dt;
      if (mob.lookTimer <= 0) {
        mob.lookTimer = 1.2 + Math.random() * 2.2;
        if (!mob.hostile && dist < 7 && Math.random() < 0.5) {
          const toPlayerYaw = Math.atan2(playerPos.x - mob.pos.x, playerPos.z - mob.pos.z);
          let diff = toPlayerYaw - mob.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          mob.targetHeadYaw = Math.max(-0.75, Math.min(0.75, diff));
          mob.targetHeadPitch = -0.15;
        } else if (!mob.hostile) {
          mob.targetHeadYaw = (Math.random() - 0.5) * 1.35;
          mob.targetHeadPitch = (Math.random() - 0.5) * 0.4;
        } else {
          mob.targetHeadYaw = 0;
          mob.targetHeadPitch = 0;
        }
      }
      mob.headGroup.rotation.y = THREE.MathUtils.lerp(mob.headGroup.rotation.y, mob.targetHeadYaw, Math.min(1, dt * 6));
      mob.headGroup.rotation.x = THREE.MathUtils.lerp(mob.headGroup.rotation.x, mob.targetHeadPitch, Math.min(1, dt * 6));

      // 若處於被擊退狀態，保留擊退後退速度並施加空氣阻力，不被 AI 覆蓋
      if (mob.knockbackTimer > 0) {
        mob.knockbackTimer -= dt;
        const drag = Math.exp(-3.2 * dt);
        mob.vel.x *= drag;
        mob.vel.z *= drag;
      } else if (mob.type === 'slime') {
        // 史萊姆專屬跳躍行進 (Slime Hopping Locomotion)：
        // 在地面蓄力時完全靜止並壓扁果凍身體，起跳瞬間向前方彈射，在空中拉長身體並水平移動！
        const chasing = isSurvival && dist < 20;
        if (chasing) {
          mob.yaw = Math.atan2(playerPos.x - mob.pos.x, playerPos.z - mob.pos.z);
        }

        if (mob.onGround || inWater) {
          // 地面蓄力階段：水平速度歸零，不滑行
          mob.vel.x = 0;
          mob.vel.z = 0;
          mob.jumpCooldown -= dt;

          // 果凍蓄力壓扁動畫
          const chargeRatio = Math.max(0, Math.min(1, 1 - mob.jumpCooldown / 0.7));
          const sx = 1.0 + chargeRatio * 0.24;
          const sy = 1.0 - chargeRatio * 0.28;
          mob.headGroup.scale.lerp(new THREE.Vector3(sx, sy, sx), Math.min(1, dt * 14));
          mob.headGroup.position.y = 0.45 * sy;

          if (mob.jumpCooldown <= 0) {
            if (!chasing) {
              mob.yaw += (Math.random() - 0.5) * 1.8;
            }
            const hopSpeed = chasing ? 4.8 : 3.6;
            mob.vel.y = inWater ? 5.6 : 7.8;
            mob.vel.x = Math.sin(mob.yaw) * hopSpeed;
            mob.vel.z = Math.cos(mob.yaw) * hopSpeed;
            mob.onGround = false;
            mob.jumpCooldown = chasing ? 0.52 + Math.random() * 0.28 : 0.75 + Math.random() * 0.45;
            if (dist < 18) {
              this.sound.playSlimeJump();
            }
          }
        } else {
          // 空中彈跳飛行階段：果凍縱向拉長，維持跳躍水平速度
          mob.headGroup.scale.lerp(new THREE.Vector3(0.84, 1.24, 0.84), Math.min(1, dt * 12));
          mob.headGroup.position.y = 0.52;
        }

        if (chasing && dist < 1.45 && mob.attackCooldown <= 0) {
          mob.attackCooldown = 1.25;
          const kb = playerPos.clone().sub(mob.pos).setY(0).normalize().multiplyScalar(8.5);
          kb.y = 4.6;
          onPlayerDamage(2, kb);
        }
      } else {
        // 一般步行生物 (小豬、綿羊、殭屍) AI 決策
        mob.aiTimer -= dt;
        if (mob.hostile && isSurvival && dist < 20) {
          const dx = playerPos.x - mob.pos.x;
          const dz = playerPos.z - mob.pos.z;
          mob.yaw = Math.atan2(dx, dz);
          mob.vel.x = Math.sin(mob.yaw) * mob.moveSpeed;
          mob.vel.z = Math.cos(mob.yaw) * mob.moveSpeed;

          if (dist < 1.45 && mob.attackCooldown <= 0) {
            mob.attackCooldown = 1.25;
            const kb = playerPos.clone().sub(mob.pos).setY(0).normalize().multiplyScalar(8.5);
            kb.y = 4.6;
            onPlayerDamage(2, kb);
          }
        } else if (mob.aiTimer <= 0) {
          mob.aiTimer = 2.0 + Math.random() * 3.0;
          if (Math.random() < 0.78) {
            mob.yaw += (Math.random() - 0.5) * 2.2;
            mob.vel.x = Math.sin(mob.yaw) * mob.moveSpeed;
            mob.vel.z = Math.cos(mob.yaw) * mob.moveSpeed;
          } else {
            // 停下腳步東張西望
            mob.vel.x = 0;
            mob.vel.z = 0;
            mob.targetHeadYaw = (Math.random() - 0.5) * 1.4;
          }
        }
      }

      // 前方 1 格高障礙物偵測與自動跳躍 (Proactive 1-Block Auto Jump)
      const horizSpeed = Math.hypot(mob.vel.x, mob.vel.z);
      if (horizSpeed > 0.1 && mob.knockbackTimer <= 0 && mob.type !== 'slime') {
        const dirX = mob.vel.x / horizSpeed;
        const dirZ = mob.vel.z / horizSpeed;
        const footY = Math.floor(mob.pos.y + 0.05);

        for (const probeDist of [0.42, 0.68]) {
          const px = mob.pos.x + dirX * probeDist;
          const pz = mob.pos.z + dirZ * probeDist;
          if (this.isSolidAt(px, footY, pz)) {
            const canJumpOver = !this.isSolidAt(px, footY + 1, pz) && !this.isSolidAt(px, footY + 2, pz);
            if (canJumpOver) {
              if (mob.onGround) {
                mob.vel.y = 7.8; // 跳過 1 格高障礙並維持水平前進速度
                mob.onGround = false;
              }
            } else if (!mob.hostile && mob.onGround) {
              // 遇到 2 格以上高牆或樹幹則自動轉向
              mob.yaw += Math.PI * (0.65 + Math.random() * 0.7);
              mob.vel.x = Math.sin(mob.yaw) * mob.moveSpeed;
              mob.vel.z = Math.cos(mob.yaw) * mob.moveSpeed;
            }
            break;
          }
        }
      }

      // 垂直重力、水中浮力與地面碰撞
      if (inWater) {
        mob.vel.y += 9.5 * dt; // 水中浮力使生物自然上浮
        mob.vel.y = Math.min(2.6, Math.max(-2.2, mob.vel.y));
      } else {
        mob.vel.y -= 18 * dt;
      }

      const nextY = mob.pos.y + mob.vel.y * dt;
      if (mob.vel.y <= 0 && this.isSolidAt(mob.pos.x, nextY, mob.pos.z)) {
        mob.pos.y = Math.floor(nextY) + 1;
        mob.vel.y = 0;
        mob.onGround = true;
      } else {
        mob.pos.y = nextY;
        mob.onGround = false;
      }

      // 水平 X / Z 分軸移動與台階跳躍輔助
      const bodyRadius = 0.28;
      const checkY = Math.floor(mob.pos.y + 0.15);

      const nextX = mob.pos.x + mob.vel.x * dt;
      const leadX = nextX + Math.sign(mob.vel.x) * bodyRadius;
      if (!this.isSolidAt(leadX, checkY, mob.pos.z)) {
        mob.pos.x = nextX;
      } else if (mob.onGround && !this.isSolidAt(leadX, checkY + 1, mob.pos.z) && !this.isSolidAt(leadX, checkY + 2, mob.pos.z)) {
        mob.vel.y = 7.8;
        mob.onGround = false;
      }

      const nextZ = mob.pos.z + mob.vel.z * dt;
      const leadZ = nextZ + Math.sign(mob.vel.z) * bodyRadius;
      if (!this.isSolidAt(mob.pos.x, checkY, leadZ)) {
        mob.pos.z = nextZ;
      } else if (mob.onGround && !this.isSolidAt(mob.pos.x, checkY + 1, leadZ) && !this.isSolidAt(mob.pos.x, checkY + 2, leadZ)) {
        mob.vel.y = 7.8;
        mob.onGround = false;
      }

      mob.group.position.copy(mob.pos);
      mob.group.rotation.y = mob.yaw;

      // 四肢擺動動畫
      const swing = horizSpeed > 0.2 ? Math.sin(performance.now() * 0.012) * 0.55 : 0;
      mob.legs.forEach((leg, idx) => {
        leg.rotation.x = idx % 2 === 0 ? swing : -swing;
      });
    }
  }
}
