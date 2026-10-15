# ⛏️ GMinecraft — Web 3D ボクセルサンドボックス

[![Built with Gemini 4 Argon](https://img.shields.io/badge/Built%20with-Gemini%204%20Argon-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🌐 [English](./README.md) | [繁體中文](./README.zh-TW.md) | [简体中文](./README.zh-CN.md) | **日本語** | [한국어](./README.ko.md)

> 🤖 **本プロジェクトは `Gemini 4 Argon` によって開発されました** — 3D ボクセルエンジン、地形生成アルゴリズム、物理衝突判定、エンティティ AI から UI・クラフトシステムに至るまで、すべて AI によって生成・構築されています。

**Three.js** と **TypeScript** で構築されたブラウザ向け 3D ボクセルサンドボックスゲーム（Voxel Sandbox）です。**クリエイティブモード**と**サバイバルモード**の切り替え、複数バイオームの地形生成、動的な昼夜サイクルと環境光遮蔽（AO）、起爆可能な TNT、動物や夜間モンスターの AI、インベントリ＆作業台クラフト、ワールドデータの保存・JSON 入出力機能を備えています。

🌐 **オンラインデモ (GitHub Pages)**：[https://kevin6449.github.io/gminecraft/](https://kevin6449.github.io/gminecraft/)

---

## ✨ ゲームの特徴

- 🌲 **マルチバイオームのシームレスチャンク生成**：Simplex Noise を用いて平原、森林、砂漠、雪原など多彩な地形と樹木構造を自動生成します。
- 🌓 **動的な昼夜サイクルと環境光遮蔽 (AO)**：昼夜の移り変わり、グロウストーンの動的ポイントライト、ブロック頂点のアンビエントオクルージョン（AO）に対応。
- 🛠️ **クリエイティブ / サバイバルの2モード**：
  - **クリエイティブモード**：自由飛行、無限のブロック・アイテムカタログ、左クリックで一撃破壊。
  - **サバイバルモード**：体力・満腹度・水中酸素ゲージ、ブロック材質とツールの適性に応じた採掘速度とドロップアイテム。
- ⚒️ **インベントリ＆作業台クラフトシステム**：原木、石、鉄鉱石、ダイヤモンド、砂を集めて、各種ツール（木/石/鉄/ダイヤのツルハシ、斧、シャベル、剣）、照明、TNT をクラフト可能。
- 🧨 **インタラクティブブロックと TNT 爆発**：木製ドアの開閉、右クリックでの TNT 着火と連鎖誘爆による地形破壊に対応。
- 🐷 **動物＆モンスター AI**：昼間はブタなどの動物がスポーンし、夜間はゾンビが出現（夜明けとともに日光で自然発火）。
- 🌐 **5言語リアルタイム切り替え (i18n)**：**繁體中文 (`zh-TW`)**、**简体中文 (`zh-CN`)**、**English (`en`)**、**日本語 (`ja`)**、**한국어 (`ko`)** に完全対応し、設定はブラウザの `localStorage` に保存されます。
- 💾 **ワールド保存＆ JSON エクスポート/インポート**：ブラウザの `localStorage` への即時セーブに加え、`.json` ファイルとしてワールドのバックアップ出力・読み込みが可能です。

---

## 🎮 操作方法

| キー / 操作 | 機能説明 |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 前後左右に移動（<kbd>Ctrl</kbd> と併用でダッシュ / 飛行加速） |
| <kbd>Space</kbd> | ジャンプ / 水中で浮上 / 2回押しで自由飛行切替（飛行中は長押しで上昇、<kbd>Shift</kbd> で下降） |
| <kbd>左クリック</kbd> | ブロック破壊（クリエイティブは一撃 / サバイバルは材質・ツールに応じる）/ 攻撃 / 未起爆 TNT の安全回収 |
| <kbd>右クリック</kbd> | ブロック設置 / 木製ドアの開閉 / TNT 着火 / 食料を食べて満腹度回復 |
| <kbd>1</kbd> 〜 <kbd>9</kbd> / ホイール | 下部 9 スロットのホットバー切り替え |
| <kbd>E</kbd> | インベントリ・クリエイティブ一覧・サバイバル合成画面の開閉 |
| <kbd>M</kbd> | 「クリエイティブモード / サバイバルモード」の切り替え |
| <kbd>F</kbd> | 自由飛行モードの切り替え |
| <kbd>T</kbd> | 昼 / 夜の切り替え |
| <kbd>F3</kbd> | デバッグ情報パネルの表示 / 非表示 |
| <kbd>ESC</kbd> | ゲームを一時停止してマウスカーソルを解放 |

---

## 🚀 ローカル開発と実行

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで `http://localhost:5173` を開くとプレイできます。

### 3. 本番用ビルド

```bash
npm run build
npm run preview
```

---

## 📦 GitHub Pages デプロイ手順

本プロジェクトには GitHub Actions による自動デプロイ設定（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）が含まれています：

1. GitHub の `main` ブランチにコードをプッシュします。
2. GitHub リポジトリの **Settings** → **Pages** を開きます。
3. **Build and deployment** の **Source** で **GitHub Actions** を選択します。
4. Actions の完了後、`https://<あなたのアカウント>.github.io/gminecraft/` からオンラインでプレイできます。
