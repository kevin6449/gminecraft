import * as THREE from 'three';

export class SkyAndLighting {
  public timeOfDay = 0.23; // 0.25 為正午，0.75 為午夜
  public dayDurationSeconds = 360; // 6 分鐘一個完整日夜循環

  private ambientLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private skyGroup = new THREE.Group();
  private sunMesh: THREE.Mesh;
  private moonMesh: THREE.Mesh;
  private starsPoints: THREE.Points;
  private cloudsGroup = new THREE.Group();
  private fog: THREE.Fog;

  private readonly colorNoon = new THREE.Color('#78b7ff');
  private readonly colorSunset = new THREE.Color('#f97316');
  private readonly colorNight = new THREE.Color('#090d1a');

  constructor(private scene: THREE.Scene) {
    this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.72);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
    this.dirLight.position.set(40, 80, 30);
    this.scene.add(this.dirLight);

    this.fog = new THREE.Fog('#78b7ff', 42, 76);
    this.scene.fog = this.fog;
    this.scene.background = this.colorNoon.clone();

    // 太陽方塊
    const sunGeo = new THREE.BoxGeometry(10, 10, 10);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.skyGroup.add(this.sunMesh);

    // 月亮方塊
    const moonGeo = new THREE.BoxGeometry(8, 8, 8);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, fog: false });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.skyGroup.add(this.moonMesh);

    // 夜晚星空粒子
    const starPositions: number[] = [];
    for (let i = 0; i < 320; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 135;
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        Math.abs(r * Math.cos(phi)) + 10,
        r * Math.sin(phi) * Math.sin(theta)
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      transparent: true,
      opacity: 0,
      fog: false,
    });
    this.starsPoints = new THREE.Points(starGeo, starMat);
    this.skyGroup.add(this.starsPoints);

    // 立體像素雲朵
    this.createBlockyClouds();
    this.skyGroup.add(this.cloudsGroup);

    this.scene.add(this.skyGroup);
  }

  private createBlockyClouds(): void {
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
    });

    for (let i = 0; i < 18; i++) {
      const w = 10 + (i % 4) * 6;
      const d = 8 + ((i * 3) % 4) * 5;
      const geo = new THREE.BoxGeometry(w, 2.2, d);
      const cloud = new THREE.Mesh(geo, cloudMat);
      const angle = (i / 18) * Math.PI * 2;
      const dist = 18 + (i % 5) * 16;
      cloud.position.set(Math.cos(angle) * dist, 52 + (i % 3) * 2, Math.sin(angle) * dist);
      this.cloudsGroup.add(cloud);
    }
  }

  public update(dt: number, playerPos: THREE.Vector3, isUnderwater: boolean): void {
    this.timeOfDay = (this.timeOfDay + dt / this.dayDurationSeconds) % 1.0;

    // 讓天空盒跟隨玩家水平位置
    this.skyGroup.position.set(playerPos.x, 0, playerPos.z);

    // 雲朵緩慢漂浮
    for (const child of this.cloudsGroup.children) {
      child.position.x += dt * 1.2;
      if (child.position.x > 90) child.position.x = -90;
    }

    // 太陽與月亮軌道角度
    const angle = this.timeOfDay * Math.PI * 2;
    const orbitRadius = 115;
    const sunX = Math.cos(angle) * orbitRadius;
    const sunY = Math.sin(angle) * orbitRadius;

    this.sunMesh.position.set(sunX, sunY + 20, -25);
    this.moonMesh.position.set(-sunX, -sunY + 20, 25);

    const sunHeight = Math.sin(angle); // -1 (午夜) ~ +1 (正午)

    // 計算天空背景與光照強度
    const skyColor = new THREE.Color();
    if (sunHeight > 0.2) {
      const t = Math.min(1, (sunHeight - 0.2) / 0.5);
      skyColor.lerpColors(this.colorSunset, this.colorNoon, t);
    } else if (sunHeight > -0.2) {
      const t = (sunHeight + 0.2) / 0.4;
      skyColor.lerpColors(this.colorNight, this.colorSunset, t);
    } else {
      skyColor.copy(this.colorNight);
    }

    if (isUnderwater) {
      const waterBg = new THREE.Color('#0c4a6e');
      this.scene.background = waterBg;
      this.fog.color.copy(waterBg);
      this.fog.near = 4;
      this.fog.far = 26;
    } else {
      this.scene.background = skyColor;
      this.fog.color.copy(skyColor);
      this.fog.near = 40;
      this.fog.far = 76;
    }

    const dayFactor = Math.max(0, sunHeight);
    const nightFactor = Math.max(0, -sunHeight);

    this.ambientLight.intensity = 0.26 + dayFactor * 0.55;
    this.dirLight.intensity = 0.18 + dayFactor * 0.85;
    this.dirLight.position.set(
      playerPos.x + (sunHeight >= 0 ? sunX : -sunX) * 0.5,
      Math.max(25, Math.abs(sunY) + 25),
      playerPos.z + 20
    );

    const starMat = this.starsPoints.material as THREE.PointsMaterial;
    starMat.opacity = Math.min(0.95, nightFactor * 1.4);
  }

  public isNight(): boolean {
    const sunHeight = Math.sin(this.timeOfDay * Math.PI * 2);
    return sunHeight < -0.05;
  }

  public toggleDayNight(): string {
    if (this.isNight()) {
      this.timeOfDay = 0.23; // 切換至晴朗正午
      return '☀️ 已切換為晴朗白天';
    } else {
      this.timeOfDay = 0.73; // 切換至星光夜晚
      return '🌙 已切換為星光夜晚';
    }
  }

  public getTimeLabel(): string {
    const h = Math.sin(this.timeOfDay * Math.PI * 2);
    if (h > 0.35) return '☀️ 正午';
    if (h >= 0) return '🌅 黃昏/黎明';
    return '🌙 深夜';
  }
}
