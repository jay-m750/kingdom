# 研究紀錄：高中物理電路分析工具

**功能分支**: `001-physics-circuit-analysis`  
**完成日期**: 2026-03-13  
**狀態**: 所有 NEEDS CLARIFICATION 已解決

---

## 決策 1：前端技術框架

**決策**: 採用 Vanilla HTML/CSS/JavaScript（ES6+），無任何前端框架

**理由**:
- 規格功能範疇小（單一頁面、表單輸入、計算結果顯示），框架帶來的模組化優勢在此無法體現
- 靜態部署至 GitHub Pages 不需要建置流程，Vanilla JS 可直接從 `.html` 開啟，零配置
- 使用 `<script type="module">` 可達到原始碼拆分（`circuit-analyzer.js`、`scenarios.js`、`app.js`）
- 符合 Constitution II（簡潔設計優先）：選最小可行方案

**已考慮的替代方案**:
- **Vue 3（CDN 版）**：可透過 CDN 不需建置，但增加外部依賴及學習曲線；被拒絕，因原生 DOM API 已足夠
- **React/Preact**：需 npm 建置流程（JSX 轉譯），違反「無建置管線」約束；被拒絕
- **Svelte**：需編譯步驟；被拒絕

---

## 決策 2：電路計算方法

**決策**: 純 JavaScript 公式計算，不引入任何數學函式庫

**理由**:
- 規格範疇限定為**穩態直流電路**（DC steady-state），計算僅需四則運算與倒數
- 串聯：`R_total = ΣR_i`；`I = V / R_total`；`V_i = I × R_i`；`P_i = I² × R_i`
- 並聯：`1/R_total = Σ(1/R_i)`；所有支路電壓相等；`I_i = V / R_i`
- 混合電路：先化簡並聯群為等效電阻，再按串聯計算
- 最大 10 個元件，不需矩陣求解（Nodal/Mesh analysis 僅在元件多時才需要）
- 精確度要求：小數點後兩位（`Math.round(x * 100) / 100`）

**錯誤偵測**:
- 短路（R = 0）：除以零前偵測並拋出繁體中文錯誤（FR-005）
- 負電阻：同上
- 空白輸入：NaN 偵測
- 不連通電路：結構驗證（至少需一個電源與一個電阻）

**已考慮的替代方案**:
- **math.js**：通用數學函式庫，功能遠超需求；被拒絕，避免過度依賴
- **Numeric.js**：矩陣求解；對小型 DC 電路不必要；被拒絕
- **sylvester.js**：線性代數；同上；被拒絕

---

## 決策 3：分析結果匯出方式

**決策**: `window.print()` + CSS `@media print`（零依賴）；若使用者回饋不佳可升級至 html2pdf.js（CDN）

**理由**:
- 完全無外部依賴，靜態網站 100% 相容
- 瀏覽器原生列印對話框支援直接「另存為 PDF」，使用者無需額外操作
- CSS `@media print` 可精確控制列印版面，隱藏操作按鈕、美化結果區塊
- 符合 FR-006（匯出包含電路描述、輸入參數、計算步驟、最終結果）
- 符合 SC-005（文件格式適合直接附入備審資料）

**已考慮的替代方案**:
- **html2pdf.js（CDN）**：需外部 CDN，功能超出需求；留作備援但不作主要選項
- **jsPDF**：需 npm 建置；被拒絕
- **Blob 下載為 .html**：格式難以控制版面；被拒絕
- **Blob 下載為 .txt**：純文字無法滿足 SC-005（格式化文件）；被拒絕

---

## 決策 4：測試框架

**決策**: QUnit 2.20.0（CDN），在 `test/test.html` 中執行；開瀏覽器即可查看測試結果

**理由**:
- 從 CDN 載入，無需 npm 或任何建置步驟
- 測試結果直接呈現在 DOM，符合高中生理解層級
- 支援 TDD 流程（Constitution III）：先在 `test.html` 寫測試（Red）→ 實作函式（Green）→ 重構
- 可輕易擴充至 CI/CD（QUnit CLI 可在 Node.js 環境執行）

**TDD 流程規劃**:
1. 在 `test/test.html` 撰寫 QUnit 測試（對應 spec.md 驗收情境）
2. 測試必定失敗（Red）——因為 `circuit-analyzer.js` 尚不存在
3. 實作 `js/circuit-analyzer.js` 直到測試通過（Green）
4. 重構，保持測試通過（Refactor）

**已考慮的替代方案**:
- **Jest**：需 npm + 建置流程；被拒絕
- **Mocha + Chai**：需 npm；被拒絕
- **瀏覽器 console + 手動斷言**：無結構化報告；被拒絕（TDD 需明確 Red/Green 狀態）
- **Playwright/Cypress**：E2E 工具，對此規模過重；被拒絕

---

## 解決的 NEEDS CLARIFICATION 清單

| 項目 | 解決方案 |
|------|---------|
| 前端框架 | Vanilla JS（ES6+），無框架，無建置流程 |
| 電路計算函式庫 | 不需要；純 JS 四則運算已足夠 |
| PDF 匯出方式 | `window.print()` + CSS `@media print` |
| 測試框架 | QUnit 2.20.0（CDN） |
