# 快速上手指南：高中物理電路分析工具

**功能分支**: `001-physics-circuit-analysis`  
**目標讀者**: 開發者（貢獻者）/ 使用者

---

## 使用者快速上手（2 分鐘）

### 開啟工具
1. 在瀏覽器中開啟 `index.html`（或透過 GitHub Pages URL 存取）
2. 不需安裝任何軟體，不需網路連線

### 基本電路分析
1. 選擇**電路類型**：串聯 / 並聯 / 混合
2. 輸入**電壓源**（V）
3. 輸入**電阻值**（Ω）；可用「新增電阻」按鈕增加元件（最多 10 個）
4. 點擊**「分析電路」**
5. 查看結果：等效電阻、總電流、各元件電壓與功率

### 機械工程應用場景
1. 在「應用場景」區塊選擇場景（直流電動機 / 電磁鐵 / 熱敏電阻）
2. 系統自動填入預設參數
3. 可修改預設值後點擊**「分析電路」**
4. 查看機械工程概念說明

### 匯出分析報告
1. 完成分析後點擊**「匯出分析報告」**
2. 瀏覽器彈出列印對話框
3. 選擇「另存為 PDF」或直接列印
4. 生成的文件可直接附入學習歷程檔案

---

## 開發者環境設定

### 前置需求

| 工具 | 最低版本 | 說明 |
|------|---------|------|
| 任何現代瀏覽器 | Chrome 80+ / Firefox 75+ / Safari 13+ | 執行與測試 |
| 文字編輯器 | — | VS Code 推薦 |
| Git | 2.x | 版本控制 |

**不需要**：Node.js、npm、Python、任何建置工具

### 取得程式碼

```bash
git clone https://github.com/jay-m750/kingdom.git
cd kingdom
```

### 直接開啟（最快方式）

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

或在瀏覽器地址欄輸入 `file:///path/to/kingdom/index.html`

### 使用本地 HTTP 伺服器（推薦，避免 CORS 問題）

```bash
# Python 3
python3 -m http.server 8080

# Node.js（需已安裝）
npx serve .

# VS Code Live Server 擴充功能（圖形介面）
```

然後在瀏覽器開啟 `http://localhost:8080`

---

## 執行測試

### 瀏覽器中執行（主要方式）

```bash
# 開啟測試頁面
open test/test.html
# 或在瀏覽器地址欄輸入 file:///path/to/kingdom/test/test.html
```

QUnit 測試結果直接顯示在頁面中（綠色 = 通過，紅色 = 失敗）。

### TDD 開發流程

```bash
# 1. 開啟測試頁面（保持開啟）
open test/test.html

# 2. 修改 js/circuit-analyzer.js

# 3. 在測試頁面按 F5 重新整理查看測試結果
```

---

## 檔案結構說明

```text
kingdom/
├── index.html               # 主頁面（完整功能）
├── css/
│   └── style.css            # 螢幕樣式 + @media print 列印版面
├── js/
│   ├── circuit-analyzer.js  # 電路計算核心（純函式）
│   ├── scenarios.js         # 三種應用場景資料定義
│   └── app.js               # UI 事件綁定與 DOM 更新
└── test/
    └── test.html            # QUnit 測試套件
```

---

## 部署至 GitHub Pages

1. 確認 `index.html` 位於儲存庫根目錄
2. 在 GitHub 儲存庫設定中：Settings → Pages → Source → 選擇分支（`main`）→ 根目錄（`/`）
3. 儲存後等待約 1 分鐘
4. 網址格式：`https://jay-m750.github.io/kingdom/`

---

## 常見問題

**Q: 開啟 `index.html` 後畫面空白或出現錯誤？**  
A: 使用本地 HTTP 伺服器（`python3 -m http.server 8080`）而非直接用 `file://` 開啟，以避免 ES6 模組的 CORS 限制。

**Q: 如何新增第四個應用場景？**  
A: 在 `js/scenarios.js` 的陣列中新增一個物件，依照現有場景格式填寫即可。

**Q: 匯出的 PDF 版面不整齊？**  
A: 調整 `css/style.css` 中的 `@media print` 區塊。
