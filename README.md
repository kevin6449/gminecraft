# ⛏️ GMinecraft — Web 3D Voxel Sandbox World

[![Built with Gemini 4 Argon](https://img.shields.io/badge/Built%20with-Gemini%204%20Argon-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🌐 **English** | [繁體中文](./README.zh-TW.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

> 🤖 **Built with `Gemini 4 Argon`** — From the 3D voxel engine, procedural terrain generation, physics collision, and entity AI to the UI and crafting system, this entire project was generated and built by AI.

A browser-based 3D Voxel Sandbox game built with **Three.js** and **TypeScript**, featuring seamless switching between **Creative Mode** and **Survival Mode**, multi-biome terrain generation, dynamic day/night cycles with Ambient Occlusion (AO), explosive TNT, passive & hostile mob AI, a full inventory crafting system, and world save/export functionality.

🌐 **Live Demo (GitHub Pages)**: [https://kevin6449.github.io/gminecraft/](https://kevin6449.github.io/gminecraft/)

---

## ✨ Key Features

- 🌲 **Seamless Multi-Biome Chunk Generation**: Procedural terrain using Simplex Noise across Plains, Forests, Deserts, and Snowy Tundra with natural trees.
- 🌓 **Dynamic Day/Night & Ambient Occlusion (AO)**: Full day/night cycle, dynamic point lights from Glowstone, and per-vertex voxel ambient occlusion.
- 🛠️ **Creative & Survival Dual Modes**:
  - **Creative Mode**: Free flight, infinite block & item catalog, instant one-click block breaking.
  - **Survival Mode**: Health, hunger, underwater oxygen bar, and material/tool-based mining speeds & item drops.
- ⚒️ **Inventory & Workbench Crafting System**: Gather logs, stone, iron ore, diamonds, and sand to craft full sets of tools (Wood/Stone/Iron/Diamond Pickaxes, Axes, Shovels, Swords), light sources, and TNT.
- 🧨 **Interactive Blocks & TNT Explosions**: Open/close oak doors, ignite TNT fuses with right-click, and trigger chain-reaction explosions that deform terrain.
- 🐷 **Passive Animals & Hostile Mob AI**: Pigs spawn during the day, while Zombies spawn at night and burn up in daylight.
- 🌐 **Real-Time 5-Language Switching (i18n)**: Full support for **English (`en`)**, **繁體中文 (`zh-TW`)**, **简体中文 (`zh-CN`)**, **日本語 (`ja`)**, and **한국어 (`ko`)**, persisted in browser `localStorage`.
- 💾 **World Saving & JSON Export/Import**: Instant saving to browser `localStorage`, plus exporting and importing `.json` world backup files.

---

## 🎮 Controls

| Key / Action | Description |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Move around (Hold <kbd>Ctrl</kbd> to sprint or boost flight speed) |
| <kbd>Space</kbd> | Jump / Swim up / Double-tap to toggle Free Flight (Hold to ascend, <kbd>Shift</kbd> to descend) |
| <kbd>Left Click</kbd> | Mine blocks (Instant in Creative / Tool-based in Survival) / Attack mobs / Safely defuse unlit TNT |
| <kbd>Right Click</kbd> | Place blocks / Open & close doors / Ignite TNT / Eat food to restore hunger |
| <kbd>1</kbd> ~ <kbd>9</kbd> / Scroll | Select active slot in the 9-slot bottom hotbar |
| <kbd>E</kbd> | Open / Close Inventory, Creative Catalog & Survival Crafting menu |
| <kbd>M</kbd> | Quickly toggle between Creative Mode and Survival Mode |
| <kbd>F</kbd> | Toggle Free Flight mode |
| <kbd>T</kbd> | Toggle between Day and Night |
| <kbd>F3</kbd> | Show / Hide debug information overlay |
| <kbd>ESC</kbd> | Pause game and release mouse pointer lock |

---

## 🚀 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to start playing.

### 3. Build for Production

```bash
npm run build
npm run preview
```

---

## 📦 GitHub Pages Deployment

This project includes a built-in GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) for automatic deployment:

1. Push the code to the `main` branch on GitHub.
2. Go to your repository's **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Once the workflow finishes, your game will be live at `https://<your-username>.github.io/gminecraft/`.
