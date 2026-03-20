# 實作計畫：高中物理電路分析工具（機械系申請應用）

**分支**: `001-physics-circuit-analysis` | **日期**: 2026-03-13 | **規格**: [spec.md](./spec.md)  
**輸入**: `/specs/001-physics-circuit-analysis/spec.md`

## 摘要

為高中生提供穩態直流電路（串聯、並聯、混合）分析工具，內建機械工程應用場景說明，並支援匯出分析結果。採用純靜態前端（Vanilla HTML/CSS/JS），可直接部署至 GitHub Pages，無需後端服務或建置流程。

## 技術脈絡

**語言/版本**: HTML5、CSS3、JavaScript（ES6+，原生瀏覽器，無需 Node.js）  
**主要依賴**:
- QUnit 2.20.0（CDN，僅測試用）
- `window.print()` + CSS `@media print`（PDF 匯出，零依賴）  

**儲存**: 無持久儲存；工作階段內以 DOM 狀態維護（符合規格「一次工作階段一個電路」）  
**測試**: QUnit（CDN，於 `test.html` 執行，支援瀏覽器直接開啟）  
**目標平台**: 桌面與行動瀏覽器（GitHub Pages 靜態部署）  
**專案型態**: 靜態網站（single-page application，純前端）  
**效能目標**: 電路計算 < 100ms；使用者從輸入到查看結果 < 3 分鐘（SC-001）  
**約束**:
- 純靜態，可離線使用；不得引入任何後端或 npm 建置流程
- 所有 UI 文字使用繁體中文（FR-007）
- 電路規模上限：最多 10 個元件（規格假設）

**規模/範圍**: 個人高中生使用；3 個應用場景（FR-004）；2 頁面（主頁＋測試頁）

## 憲章檢查

*關卡：Phase 0 研究前必須通過。Phase 1 設計後再次確認。*

- [x] 規格文件內容以繁體中文撰寫（必要英文術語可附中文說明）
- [x] 設計方案符合「不要過度設計」：Vanilla JS，無框架，無後端，直接計算
- [x] 已規劃 TDD 流程：`test.html` 先寫測試（Red）→ 實作 `circuit-analyzer.js`（Green）→ 重構
- [x] 網站專案：純靜態前端，可部署至 GitHub Pages（無需後端）
- [x] implement 階段：`spec.md`、`plan.md`、`tasks.md` 由 tasks.md 明示保護，禁止覆蓋
- [x] 各階段開始與結束皆執行 `git status --short --branch`

## 專案結構

### 規格文件（此功能）

```text
specs/001-physics-circuit-analysis/
├── plan.md              # 本檔案（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出（/speckit.plan）
├── data-model.md        # Phase 1 輸出（/speckit.plan）
├── quickstart.md        # Phase 1 輸出（/speckit.plan）
├── contracts/           # Phase 1 輸出（/speckit.plan）
│   └── ui-contract.md
└── tasks.md             # Phase 2 輸出（/speckit.tasks，本指令不建立）
```

### 原始碼（儲存庫根目錄）

```text
index.html               # 主頁面：電路輸入、分析結果、應用場景、匯出
css/
└── style.css            # 螢幕樣式 + @media print 列印版面
js/
├── circuit-analyzer.js  # 電路計算核心（純函式，可獨立測試）
├── scenarios.js         # 三種機械工程應用場景定義
└── app.js               # UI 事件綁定、DOM 更新
test/
└── test.html            # QUnit 測試套件（開瀏覽器直接執行）
```

**結構決策**: 選用單一靜態網站結構（Option 1 精簡版）。無後端、無建置流程，完全符合 Constitution V（GitHub Pages 靜態部署）。

## 複雜度追蹤

> 本計畫無憲章違規，此區段留空。
