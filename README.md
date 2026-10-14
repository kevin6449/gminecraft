# ⛏️ GMinecraft — Web 3D 體素沙盒世界

[![Built with Gemini 4 Argon](https://img.shields.io/badge/Built%20with-Gemini%204%20Argon-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> 🤖 **本專案由 `Gemini 4 Argon` 協助開發** — 從 3D 體素引擎、地形演算法、物理碰撞、實體 AI 到 UI 與合成系統皆由 AI 生成與建構。

使用 **Three.js** 與 **TypeScript** 打造的瀏覽器 3D 體素沙盒遊戲（Voxel Sandbox），支援**創造模式**與**生存模式**雙模式切換、多生態系地形生成、動態日夜光影與環境光遮蔽（AO）、可引爆 TNT、動物與夜間怪物 AI，以及完整背包合成與世界存檔匯出入功能。

🌐 **線上試玩 (GitHub Pages)**：[https://kevin6449.github.io/gminecraft/](https://kevin6449.github.io/gminecraft/)

---

## ✨ 遊戲特色

- 🌲 **多生態系無縫區塊生成**：使用 Simplex Noise 生成平原、森林、沙漠、雪地等多樣地形與樹木結構。
- 🌓 **動態日夜與環境光遮蔽 (AO)**：支援日夜交替、螢石動態點光源，以及方塊頂點環境光遮蔽效果。
- 🛠️ **創造 / 生存雙模式**：
  - **創造模式**：自由飛行、無限方塊物品庫、左鍵一擊破壞。
  - **生存模式**：生命值、飽食度、水下氧氣條、依方塊材質與工具屬性計算挖掘速度與掉落物。
- ⚒️ **背包與工作台合成系統**：收集原木、石頭、鐵礦、鑽石與沙子，合成全套工具（木/石/鐵/鑽石鎬、斧、鏟、劍）、光源與 TNT。
- 🧨 **互動方塊與 TNT 爆炸**：支援木門開關、右鍵點燃 TNT 引信並產生連鎖爆炸地形破壞。
- 🐷 **生態實體與怪物 AI**：白天生成小豬等動物，夜晚生成殭屍（天亮會自燃）。
- 🌐 **五國語言即時切換 (i18n)**：完整支援 **繁體中文 (`zh-TW`)**、**简体中文 (`zh-CN`)**、**English (`en`)**、**日本語 (`ja`)**、**한국어 (`ko`)**，並記憶於瀏覽器 `localStorage`。
- 💾 **世界存檔與 JSON 匯出入**：支援瀏覽器 `localStorage` 即時存檔，並可匯出/匯入 `.json` 世界備份檔。

---

## 🎮 操作說明

| 按鍵 / 操作 | 功能說明 |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 前後左右移動（搭配 <kbd>Ctrl</kbd> 衝刺或飛行加速） |
| <kbd>Space</kbd> | 跳躍 / 水中上浮 / 雙擊切換自由飛行（飛行時按住上升、<kbd>Shift</kbd> 下降） |
| <kbd>滑鼠左鍵</kbd> | 破壞方塊（創造一擊破 / 生存依材質與工具挖掘）/ 攻擊生物 / 安全拆除未爆 TNT |
| <kbd>滑鼠右鍵</kbd> | 放置方塊 / 開關木門 / 點燃 TNT / 食用食物回復飽食度 |
| <kbd>1</kbd> ~ <kbd>9</kbd> / 滾輪 | 切換底部 9 格快捷欄物品 |
| <kbd>E</kbd> | 開啟 / 關閉背包、創造物品庫與生存合成介面 |
| <kbd>M</kbd> | 快速切換「創造模式 / 生存模式」 |
| <kbd>F</kbd> | 切換自由飛行模式 |
| <kbd>T</kbd> | 快速切換白天 / 夜晚 |
| <kbd>F3</kbd> | 顯示 / 隱藏除錯資訊面板 |
| <kbd>ESC</kbd> | 暫停遊戲並釋放滑鼠游標 |

---

## 🚀 本地開發與執行

### 1. 安裝相依套件

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

啟動後於瀏覽器開啟 `http://localhost:5173` 即可開始遊玩。

### 3. 建置正式版

```bash
npm run build
npm run preview
```

---

## 📦 GitHub Pages 部署說明

本專案已內建 GitHub Actions 自動部署設定（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）：

1. 推送程式碼至 GitHub 的 `main` 分支。
2. 前往 GitHub 儲存庫的 **Settings** → **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 選擇 **GitHub Actions**。
4. 等待 Actions 執行完成後，即可透過 `https://<你的帳號>.github.io/gminecraft/` 線上遊玩。
