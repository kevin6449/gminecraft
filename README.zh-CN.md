# ⛏️ GMinecraft — Web 3D 体素沙盒世界

[![Built with Gemini 4 Argon](https://img.shields.io/badge/Built%20with-Gemini%204%20Argon-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🌐 [English](./README.md) | [繁體中文](./README.zh-TW.md) | **简体中文** | [日本語](./README.ja.md) | [한국어](./README.ko.md)

> 🤖 **本项目由 `Gemini 4 Argon` 协助开发** — 从 3D 体素引擎、地形算法、物理碰撞、实体 AI 到 UI 与合成系统皆由 AI 生成与构建。

使用 **Three.js** 与 **TypeScript** 打造的浏览器 3D 体素沙盒游戏（Voxel Sandbox），支持**创造模式**与**生存模式**双模式切换、多生态系地形生成、动态日夜光影与环境光遮蔽（AO）、可引爆 TNT、动物与夜间怪物 AI，以及完整背包合成与世界存档导入导出功能。

🌐 **在线试玩 (GitHub Pages)**：[https://kevin6449.github.io/gminecraft/](https://kevin6449.github.io/gminecraft/)

---

## ✨ 游戏特色

- 🌲 **多生态系无缝区块生成**：使用 Simplex Noise 生成平原、森林、沙漠、雪地等多样地形与树木结构。
- 🌓 **动态日夜与环境光遮蔽 (AO)**：支持日夜交替、萤石动态点光源，以及方块顶点环境光遮蔽效果。
- 🛠️ **创造 / 生存双模式**：
  - **创造模式**：自由飞行、无限方块物品库、左键一击破坏。
  - **生存模式**：生命值、饱食度、水下氧气条、依方块材质与工具属性计算挖掘速度与掉落物。
- ⚒️ **背包与工作台合成系统**：收集原木、石头、铁矿、钻石与沙子，合成全套工具（木/石/铁/钻石镐、斧、锹、剑）、光源与 TNT。
- 🧨 **互动方块与 TNT 爆炸**：支持木门开关、右键点燃 TNT 引信并产生连锁爆炸地形破坏。
- 🐷 **生态实体与怪物 AI**：白天生成小猪等动物，夜晚生成僵尸（天亮会自燃）。
- 🌐 **五国语言即时切换 (i18n)**：完整支持 **繁體中文 (`zh-TW`)**、**简体中文 (`zh-CN`)**、**English (`en`)**、**日本語 (`ja`)**、**한국어 (`ko`)**，并保存于浏览器 `localStorage`。
- 💾 **世界存档与 JSON 导入导出**：支持浏览器 `localStorage` 即时存档，并可导出/导入 `.json` 世界备份文件。

---

## 🎮 操作说明

| 按键 / 操作 | 功能说明 |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 前后左右移动（搭配 <kbd>Ctrl</kbd> 冲刺或飞行加速） |
| <kbd>Space</kbd> | 跳跃 / 水中上浮 / 双击切换自由飞行（飞行时按住上升、<kbd>Shift</kbd> 下降） |
| <kbd>鼠标左键</kbd> | 破坏方块（创造一击破 / 生存依材质与工具挖掘）/ 攻击生物 / 安全拆除未爆 TNT |
| <kbd>鼠标右键</kbd> | 放置方块 / 开关木门 / 点燃 TNT / 食用食物恢复饱食度 |
| <kbd>1</kbd> ~ <kbd>9</kbd> / 滚轮 | 切换底部 9 格快捷栏物品 |
| <kbd>E</kbd> | 开启 / 关闭背包、创造物品库与生存合成界面 |
| <kbd>M</kbd> | 快速切换「创造模式 / 生存模式」 |
| <kbd>F</kbd> | 切换自由飞行模式 |
| <kbd>T</kbd> | 快速切换白天 / 夜晚 |
| <kbd>F3</kbd> | 显示 / 隐藏调试信息面板 |
| <kbd>ESC</kbd> | 暂停游戏并释放鼠标光标 |

---

## 🚀 本地开发与运行

### 1. 安装依赖包

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后在浏览器打开 `http://localhost:5173` 即可开始游玩。

### 3. 构建正式版

```bash
npm run build
npm run preview
```

---

## 📦 GitHub Pages 部署说明

本项目已内置 GitHub Actions 自动部署配置（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）：

1. 推送代码至 GitHub 的 `main` 分支。
2. 前往 GitHub 仓库的 **Settings** → **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 选择 **GitHub Actions**。
4. 等待 Actions 执行完成后，即可通过 `https://<你的账号>.github.io/gminecraft/` 在线游玩。
