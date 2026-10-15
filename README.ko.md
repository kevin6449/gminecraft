# ⛏️ GMinecraft — Web 3D 복셀 샌드박스 월드

[![Built with Gemini 4 Argon](https://img.shields.io/badge/Built%20with-Gemini%204%20Argon-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🌐 [English](./README.md) | [繁體中文](./README.zh-TW.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md) | **한국어**

> 🤖 **본 프로젝트는 `Gemini 4 Argon`의 도움으로 개발되었습니다** — 3D 복셀 엔진, 지형 알고리즘, 물리 충돌, 엔티티 AI부터 UI 및 제작 시스템까지 모두 AI에 의해 생성 및 구축되었습니다.

**Three.js**와 **TypeScript**로 제작된 웹 브라우저 기반 3D 복셀 샌드박스 게임(Voxel Sandbox)입니다. **크리에이티브 모드**와 **서바이벌 모드** 전환, 다중 바이옴 지형 생성, 동적 낮/밤 사이클 및 앰비언트 오클루전(AO) 조명, 폭발 가능한 TNT, 동물 및 야간 몬스터 AI, 인벤토리 제작 시스템과 월드 저장/내보내기 기능을 지원합니다.

🌐 **온라인 플레이 (GitHub Pages)**: [https://kevin6449.github.io/gminecraft/](https://kevin6449.github.io/gminecraft/)

---

## ✨ 주요 특징

- 🌲 **다중 바이옴 심리스 청크 생성**: Simplex Noise를 활용하여 평원, 숲, 사막, 설원 등 다양한 지형과 나무 구조를 생성합니다.
- 🌓 **동적 낮/밤 사이클 및 환경광 차폐 (AO)**: 낮과 밤의 변화, 발광석 동적 포인트 조명 및 블록 정점 앰비언트 오클루전(AO) 효과를 지원합니다.
- 🛠️ **크리에이티브 / 서바이벌 듀얼 모드**:
  - **크리에이티브 모드**: 자유 비행, 무제한 블록 카탈로그, 좌클릭 즉시 파괴.
  - **서바이벌 모드**: 체력, 포만감, 수중 산소 게이지, 블록 재질 및 도구 속성에 따른 채굴 속도와 드롭 아이템 계산.
- ⚒️ **인벤토리 및 작업대 제작 시스템**: 원목, 돌, 철광석, 다이아몬드, 모래를 수집하여 도구 세트(나무/돌/철/다이아몬드 곡괭이, 도끼, 삽, 검), 조명 및 TNT를 제작할 수 있습니다.
- 🧨 **상호작용 블록 및 TNT 폭발**: 나무 문 개폐, 우클릭으로 TNT 점화 및 연쇄 폭발을 통한 지형 파괴를 지원합니다.
- 🐷 **생태 엔티티 및 몬스터 AI**: 낮에는 돼지 등 동물이 스폰되고, 밤에는 좀비가 출몰합니다 (낮이 되면 햇빛에 자연 발화).
- 🌐 **5개 국어 실시간 전환 (i18n)**: **繁體中文 (`zh-TW`)**, **简体中文 (`zh-CN`)**, **English (`en`)**, **日本語 (`ja`)**, **한국어 (`ko`)**를 완벽 지원하며 브라우저 `localStorage`에 설정이 저장됩니다.
- 💾 **월드 저장 및 JSON 내보내기/불러오기**: 브라우저 `localStorage` 실시간 저장을 지원하며 `.json` 월드 백업 파일로 내보내거나 불러올 수 있습니다.

---

## 🎮 조작 방법

| 키 / 조작 | 기능 설명 |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 전후좌우 이동 (<kbd>Ctrl</kbd>과 함께 눌러 질주 또는 비행 가속) |
| <kbd>Space</kbd> | 점프 / 수중 상승 / 두 번 눌러 자유 비행 전환 (비행 중 누르면 상승, <kbd>Shift</kbd>는 하강) |
| <kbd>마우스 좌클릭</kbd> | 블록 파괴 (크리에이티브 즉시 파괴 / 서바이벌 재질·도구별 채굴) / 생물 공격 / 미폭발 TNT 안전 해체 |
| <kbd>마우스 우클릭</kbd> | 블록 배치 / 나무 문 개폐 / TNT 점화 / 음식 섭취로 포만감 회복 |
| <kbd>1</kbd> ~ <kbd>9</kbd> / 휠 | 하단 9칸 핫바 아이템 전환 |
| <kbd>E</kbd> | 가방, 크리에이티브 카탈로그 및 서바이벌 제작 창 열기 / 닫기 |
| <kbd>M</kbd> | 「크리에이티브 모드 / 서바이벌 모드」 빠른 전환 |
| <kbd>F</kbd> | 자유 비행 모드 전환 |
| <kbd>T</kbd> | 낮 / 밤 빠른 전환 |
| <kbd>F3</kbd> | 디버그 정보 패널 표시 / 숨기기 |
| <kbd>ESC</kbd> | 게임 일시정지 및 마우스 커서 잠금 해제 |

---

## 🚀 로컬 개발 및 실행

### 1. 의존성 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

실행 후 브라우저에서 `http://localhost:5173`을 열면 바로 플레이할 수 있습니다.

### 3. 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

## 📦 GitHub Pages 배포 안내

본 프로젝트에는 GitHub Actions 자동 배포 설정([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))이 포함되어 있습니다:

1. 코드를 GitHub의 `main` 브랜치에 푸시합니다.
2. GitHub 저장소의 **Settings** → **Pages**로 이동합니다.
3. **Build and deployment** 아래의 **Source**에서 **GitHub Actions**를 선택합니다.
4. Actions 실행이 완료되면 `https://<사용자계정>.github.io/gminecraft/`에서 온라인으로 플레이할 수 있습니다.
