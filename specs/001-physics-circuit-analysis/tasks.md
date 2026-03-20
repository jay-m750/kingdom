# Tasks: 高中物理電路分析工具（機械系申請應用）

**Input**: Design documents from `/specs/001-physics-circuit-analysis/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contract.md ✓, quickstart.md ✓

**Tests**: 測試為必要項目。所有使用者故事 MUST 先建立測試並確認失敗，再進入實作（TDD）。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup（共用基礎建設）

**Purpose**: 建立專案目錄結構與骨架檔案

- [x] T001 Create project directory structure: `css/`, `js/`, `test/` at repository root
- [x] T002 [P] Create `index.html` with HTML5 boilerplate, `<script type="module">` imports for `js/app.js`, `<link>` to `css/style.css`, and 繁體中文 `<title>` and `<meta charset>`
- [x] T003 [P] Create `css/style.css` with base layout skeleton (body, container, section resets)
- [x] T004 Record baseline git status: execute `git status --short --branch`

---

## Phase 2: Foundational（阻塞性前置任務）

**Purpose**: 所有使用者故事開始前必須完成的核心模組骨架與測試框架

**⚠️ CRITICAL**: 任何使用者故事的實作均不得在本階段完成前開始

- [x] T005 Create `test/test.html` with QUnit 2.20.0 CDN (`<script src="https://code.jquery.com/qunit/qunit-2.20.0.js">`), QUnit CSS, and ES6 module `<script type="module">` placeholder for test suites
- [x] T006 Create `js/circuit-analyzer.js` as ES6 module with empty exported stubs: `analyzeSeriesCircuit`, `analyzeParallelCircuit`, `analyzeMixedCircuit`, `validateInput`
- [x] T007 [P] Create `js/scenarios.js` as ES6 module with empty exported array stub: `export const scenarios = []`
- [x] T008 [P] Create `js/app.js` as ES6 module with `import` stubs for `circuit-analyzer.js` and `scenarios.js`, and a bare `DOMContentLoaded` listener

**Checkpoint**: 骨架完成——各使用者故事的實作可並行開始

---

## Phase 3: User Story 1 - 基礎電路分析計算（Priority: P1）🎯 MVP

**Goal**: 提供串聯、並聯及混合電路的穩態直流分析，顯示各元件電流、電壓、功率（FR-001、FR-002、FR-003、FR-005）

**Independent Test**: 給定 12V 電源、R1=4Ω、R2=8Ω 串聯電路，輸入參數後系統輸出總電流 1A、R1 電壓 4V、R2 電壓 8V，可與 spec.md US1-AC1 教科書答案比對

### Tests for User Story 1（MANDATORY）⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Add QUnit test module `analyzeSeriesCircuit` to `test/test.html`：覆蓋 US1-AC1（12V, R1=4Ω, R2=8Ω → I=1A, V1=4V, V2=8V）及錯誤輸入（電阻為 0、負數、空陣列）
- [x] T010 [P] [US1] Add QUnit test module `analyzeParallelCircuit` to `test/test.html`：覆蓋 US1-AC2（6V, R1=6Ω, R2=3Ω → I_total=3A, I1=1A, I2=2A, P=18W）
- [x] T011 [P] [US1] Add QUnit test module `analyzeMixedCircuit` to `test/test.html`：覆蓋三電阻混合電路（一並聯段＋一串聯段），驗證 totalResistance、totalCurrent、componentResults
- [x] T012 [P] [US1] Add QUnit test module `validateInput` to `test/test.html`：覆蓋 US1-AC3（電阻=0 短路、負電阻、空白欄位、電壓≤0）回傳繁體中文錯誤訊息
- [x] T013 [US1] Open `test/test.html` in browser and verify ALL US1 tests FAIL（Red state）before implementation

### Implementation for User Story 1

- [x] T014 [US1] Implement `validateInput(voltage, resistors)` in `js/circuit-analyzer.js`：依 data-model.md 驗證規則彙整，回傳 `{ valid, message }` 物件（繁體中文訊息）
- [x] T015 [US1] Implement `analyzeSeriesCircuit(voltage, resistors)` in `js/circuit-analyzer.js`：使用 `R_total=ΣR_i`、`I=V/R_total`、`V_i=I×R_i`、`P_i=I²×R_i`，結果精確至小數點後 2 位（`Math.round(x*100)/100`）
- [x] T016 [US1] Implement `analyzeParallelCircuit(voltage, resistors)` in `js/circuit-analyzer.js`：使用 `1/R_total=Σ(1/R_i)`、`I_i=V/R_i`、`P_i=V²/R_i`，結果精確至小數點後 2 位
- [x] T017 [US1] Implement `analyzeMixedCircuit(voltage, groups)` in `js/circuit-analyzer.js`：先化簡 `type='parallel'` 群組為等效電阻，再按串聯計算，對應 ui-contract.md § 1.3
- [x] T018 [P] [US1] Add circuit input form to `index.html`：包含 `<select id="topology">`（串聯/並聯/混合）、`<input id="voltage" type="number">`、動態電阻輸入群（`.resistor-input`）、「新增電阻」與「分析電路」按鈕（`<button id="analyze">`），以及結果顯示區（`<section id="results">`）
- [x] T019 [P] [US1] Style circuit input form and results section in `css/style.css`：表單版面、數字欄位標籤（單位說明 V/Ω/A/W）、錯誤訊息樣式（`.error-message`）、結果表格樣式
- [x] T020 [US1] Bind analyze button click handler in `js/app.js`：收集表單數值、呼叫對應 `analyze*Circuit()`、將 `AnalysisResult` 渲染至 `<section id="results">` 結果表格（totalResistance、totalCurrent、totalPower、componentResults）
- [x] T021 [US1] Implement dynamic resistor add/remove and inline validation in `js/app.js`：「新增電阻」追加 `.resistor-input` 欄（上限 10）、「移除」按鈕（下限 1）、呼叫 `validateInput()` 並在欄位下方顯示繁體中文錯誤訊息
- [x] T022 [US1] Open `test/test.html` in browser and verify ALL US1 tests PASS（Green state）

**Checkpoint**: User Story 1 應可獨立運作——開啟 `index.html`，輸入 US1-AC1 串聯電路，確認結果符合規格

---

## Phase 4: User Story 2 - 機械工程應用場景模擬（Priority: P2）

**Goal**: 提供三種機械工程應用場景（直流電動機、電磁鐵致動器、熱敏電阻分壓電路），自動填入預設參數並顯示繁體中文機械概念詮釋（FR-004）

**Independent Test**: 選擇「直流電動機起動電路」場景，不修改預設值直接分析，系統顯示起動電流及轉矩說明文字

### Tests for User Story 2（MANDATORY）⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T023 [P] [US2] Add QUnit test module `scenarios` to `test/test.html`：驗證 `scenarios.js` 匯出陣列恰好包含 3 個場景（`dc-motor`、`electromagnet`、`thermistor`）；各場景具有 `id`、`name`、`description`、`defaultVoltage`、`defaultTopology`、`defaultResistors`、`resultInterpretation` 必要欄位；`resultInterpretation` 為函式且呼叫後回傳非空字串
- [x] T024 [US2] Open `test/test.html` in browser and verify US2 tests FAIL（Red state）before implementation

### Implementation for User Story 2

- [x] T025 [US2] Implement 3 `ApplicationScenario` objects in `js/scenarios.js`：`dc-motor`（24V 串聯，電樞電阻 2Ω，說明起動電流與轉矩）、`electromagnet`（12V 串聯，線圈電阻 3Ω，說明磁力強度）、`thermistor`（5V 串聯，定值電阻 10kΩ＋熱敏電阻 10kΩ，說明分壓測溫原理），`resultInterpretation` 為接受 `AnalysisResult` 並回傳繁體中文詮釋字串的函式
- [x] T026 [P] [US2] Add scenario selector section to `index.html`：包含 `<section id="scenarios">` 標題、三個場景卡片或 `<select id="scenario-select">`（含場景說明）、一個「套用場景」或「選取即套用」的互動方式
- [x] T027 [P] [US2] Style scenario section in `css/style.css`：場景選擇器樣式、場景說明文字排版
- [x] T028 [US2] Bind scenario selection in `js/app.js`：使用者選擇場景時，自動將 `defaultVoltage`、`defaultTopology`、`defaultResistors` 填入電路輸入表單欄位
- [x] T029 [US2] Display `resultInterpretation` after analysis in `js/app.js`：分析完成後呼叫目前選定場景的 `resultInterpretation(result)`，將回傳字串顯示於結果區塊的 `<div id="scenario-interpretation">` 內
- [x] T030 [US2] Open `test/test.html` in browser and verify ALL US2 tests PASS（Green state）

**Checkpoint**: User Stories 1 AND 2 應可獨立運作——選取直流電動機場景，分析後確認顯示轉矩說明文字

---

## Phase 5: User Story 3 - 分析結果匯出與備審呈現（Priority: P3）

**Goal**: 提供「匯出分析報告」功能，呼叫 `window.print()` 產生包含電路描述、輸入參數、計算步驟與結果的整潔 PDF 文件（FR-006），可直接附入學習歷程檔案

**Independent Test**: 完成一次電路分析後點擊「匯出分析報告」，瀏覽器列印預覽顯示包含電路描述、輸入參數表、計算步驟與數值結果的整潔版面，不含操作按鈕

### Tests for User Story 3（MANDATORY）⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T031 [P] [US3] Add QUnit test module `buildExportDocument` to `test/test.html`：驗證給定一個 `AnalysisResult` 與場景，函式回傳包含 `title`、`circuitDescription`、`inputParameters`、`calculationSteps`、`results`、`scenarioContext` 欄位的物件，各欄位非空字串（對應 data-model.md ExportDocument 結構）
- [x] T032 [US3] Open `test/test.html` in browser and verify US3 tests FAIL（Red state）before implementation

### Implementation for User Story 3

- [x] T033 [P] [US3] Add export button and print-view section to `index.html`：`<button id="export">匯出分析報告</button>`（預設隱藏，分析完成後顯示）、`<section id="print-view" class="print-only">` 含 `ExportDocument` 各欄位的 HTML 結構（標題、電路描述段落、輸入參數表、計算步驟清單、結果表格、場景說明段落）
- [x] T034 [P] [US3] Add `@media print` rules to `css/style.css`：隱藏操作介面（表單、按鈕、場景選擇器），顯示 `.print-only` 區塊，設定字型、間距與分頁，確保列印版面適合附入備審資料（對應 SC-005）
- [x] T035 [US3] Implement `buildExportDocument(circuit, result, scenario)` and wire export button in `js/app.js`：函式依 data-model.md ExportDocument 結構組裝物件；export 按鈕點擊時呼叫函式填入 `#print-view` 各欄位 DOM，再呼叫 `window.print()`
- [x] T036 [US3] Open `test/test.html` in browser and verify ALL US3 tests PASS（Green state）

**Checkpoint**: 三個使用者故事應全部可獨立運作——完整執行 quickstart.md「匯出分析報告」流程

---

## Phase 6: Polish & Cross-Cutting Concerns（完善與橫切關注點）

**Purpose**: 跨使用者故事的 UI 細節、無障礙與整體品質

- [x] T037 [P] Review and finalize all 繁體中文 UI text (labels, placeholders, aria-labels, button text) in `index.html`，確認符合 FR-007（所有介面文字使用繁體中文）
- [x] T038 [P] Add mobile/responsive styles in `css/style.css`：`@media (max-width: 768px)` 斷點調整表單與結果區塊版面，確保行動瀏覽器可用（對應 SC-001）
- [x] T039 Run quickstart.md manual validation：執行三個使用者故事的所有 Acceptance Scenarios，確認輸出符合規格；記錄任何不符合之處並修正
- [x] T040 Record final git status: execute `git status --short --branch`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: No dependencies — 可立即開始
- **Foundational（Phase 2）**: 依賴 Phase 1 完成 — 阻塞所有使用者故事
- **User Stories（Phase 3–5）**: 依賴 Phase 2 完成
  - 單人：依優先順序循序進行（P1 → P2 → P3）
  - 多人：Phase 2 完成後可並行
- **Polish（Phase 6）**: 依賴所有目標使用者故事完成

### User Story Dependencies

- **US1（P1）**: Phase 2 完成後即可開始 — 無跨故事依賴
- **US2（P2）**: Phase 2 完成後即可開始 — `scenarios.js` 中的 `resultInterpretation` 依賴 US1 的 `AnalysisResult` 型別，但可獨立測試
- **US3（P3）**: Phase 2 完成後即可開始 — `buildExportDocument()` 使用 US1/US2 的輸出，但可獨立單元測試

### Within Each User Story

- 測試 MUST 先撰寫並確認失敗（Red）
- 實作後確認測試通過（Green）
- js 核心函式（circuit-analyzer.js）先於 UI（app.js）實作
- UI 結構（index.html）與 UI 樣式（style.css）可與 JS 並行

### Parallel Opportunities

- T002、T003（Setup）可並行
- T006、T007、T008（Foundational）可並行
- T009、T010、T011、T012（US1 測試）可並行
- T018、T019（US1 UI 與樣式）可並行
- T026、T027（US2 UI 與樣式）可並行
- T033、T034（US3 UI 與樣式）可並行
- T037、T038（Polish）可並行

---

## Parallel Example: User Story 1

```bash
# 先並行撰寫 US1 所有測試（不同程式碼區塊，無相依性）：
Task T009: "Add QUnit tests for analyzeSeriesCircuit in test/test.html"
Task T010: "Add QUnit tests for analyzeParallelCircuit in test/test.html"
Task T011: "Add QUnit tests for analyzeMixedCircuit in test/test.html"
Task T012: "Add QUnit tests for validateInput in test/test.html"

# 測試通過 Red 後，並行進行 UI 結構與樣式（不同檔案）：
Task T018: "Add circuit input form to index.html"
Task T019: "Style circuit input form and results section in css/style.css"
```

---

## Implementation Strategy

### MVP First（僅 User Story 1）

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（CRITICAL — 阻塞所有故事）
3. 完成 Phase 3：User Story 1
4. **STOP and VALIDATE**：在 `index.html` 輸入 US1-AC1 串聯電路，確認輸出正確
5. 部署至 GitHub Pages 進行展示

### Incremental Delivery

1. Setup + Foundational → 骨架就緒
2. US1 完成 → 獨立測試 → 部署展示（MVP！）
3. US2 完成 → 獨立測試 → 部署展示（機械工程應用場景）
4. US3 完成 → 獨立測試 → 部署展示（完整備審匯出功能）
5. Polish → 最終品質驗收

### Parallel Team Strategy

若有多位開發者：

1. 全員完成 Setup + Foundational
2. Phase 2 完成後：
   - 開發者 A：User Story 1（circuit-analyzer.js + 電路輸入 UI）
   - 開發者 B：User Story 2（scenarios.js + 場景選擇 UI）
   - 開發者 C：User Story 3（ExportDocument + @media print）

---

## Notes

- `[P]` 任務 = 不同檔案，無相依性，可並行執行
- `[Story]` 標籤將任務對應至特定使用者故事，確保可追溯性
- 每個使用者故事應可獨立完成並測試
- 測試必須先失敗（Red）再實作
- 實作期間即時將已完成任務從 `[ ]` 更新為 `[x]`
- 每個 Phase 開始與結束時執行 `git status --short --branch`
- 每完成一個任務或邏輯群組後執行 commit
- 在各 Checkpoint 暫停，獨立驗證該使用者故事功能
- 禁止：刪除或覆蓋 `spec.md`、`plan.md`、`tasks.md`
- 避免：模糊任務描述、同一檔案衝突、破壞故事獨立性的跨故事依賴
