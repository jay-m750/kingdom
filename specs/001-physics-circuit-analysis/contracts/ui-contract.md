# UI 介面契約：高中物理電路分析工具

**功能分支**: `001-physics-circuit-analysis`  
**完成日期**: 2026-03-13  
**適用範圍**: 使用者介面（靜態網頁）對外暴露的互動契約

---

## 概述

本工具為純靜態前端網頁應用，無 HTTP API。介面契約描述：
1. **函式契約**：`circuit-analyzer.js` 暴露的公開計算函式（JavaScript）
2. **UI 輸入契約**：使用者輸入表單的欄位定義與驗證規則
3. **場景資料契約**：`scenarios.js` 暴露的應用場景資料格式

---

## 1. 函式契約：`CircuitAnalyzer`

`js/circuit-analyzer.js` 輸出的計算核心物件（ES6 模組）。

### 1.1 `analyzeSeriesCircuit(voltage, resistors)`

```
輸入：
  voltage    : number   — 電壓源數值（V），必須 > 0
  resistors  : number[] — 電阻值陣列（Ω），每個值必須 > 0，長度 1–10

輸出（成功）：
  {
    topology         : 'series',
    totalResistance  : number,   // 單位：Ω，小數點後 2 位
    totalCurrent     : number,   // 單位：A，小數點後 2 位
    totalPower       : number,   // 單位：W，小數點後 2 位
    componentResults : [
      { label: string, voltage: number, current: number, power: number },
      ...
    ]
  }

錯誤（拋出 Error，訊息為繁體中文）：
  - 電阻值為 0  → Error('短路偵測：電阻值不得為零，請修正元件 R{n}')
  - 電阻值 < 0  → Error('無效電阻：電阻值必須大於零（您輸入了 {value} Ω）')
  - 電壓值 ≤ 0  → Error('請輸入大於零的電壓值（單位：V）')
  - 空陣列       → Error('至少需輸入一個電阻才能進行分析')
```

### 1.2 `analyzeParallelCircuit(voltage, resistors)`

```
輸入：
  voltage    : number   — 同上
  resistors  : number[] — 同上（並聯支路電阻，每個值 > 0）

輸出：
  {
    topology         : 'parallel',
    totalResistance  : number,
    totalCurrent     : number,
    totalPower       : number,
    componentResults : [
      { label: string, voltage: number, current: number, power: number },
      ...
    ]
  }

錯誤：同 1.1
```

### 1.3 `analyzeMixedCircuit(voltage, groups)`

```
輸入：
  voltage : number — 同上
  groups  : Array<{ type: 'series' | 'parallel', resistors: number[] }>
            — 混合電路的分段描述，串聯群組按順序排列，
              其中 type='parallel' 的群組表示並聯段

輸出：
  {
    topology         : 'mixed',
    totalResistance  : number,
    totalCurrent     : number,
    totalPower       : number,
    componentResults : [...]
  }

錯誤：同 1.1，另加：
  - groups 為空陣列 → Error('至少需輸入一個電阻才能進行分析')
```

### 1.4 `validateInput(voltage, resistors)`

```
輸入：同 1.1
輸出：{ valid: true } 或 { valid: false, message: string（繁體中文） }
說明：不拋出例外，供 UI 即時驗證使用
```

---

## 2. UI 輸入契約

### 2.1 電路類型選擇

| 欄位 | HTML 元素 | 可選值 | 預設值 |
|------|-----------|--------|--------|
| `topology` | `<select id="topology">` | `series`、`parallel`、`mixed` | `series` |

### 2.2 電壓源輸入

| 欄位 | HTML 元素 | 型別 | 約束 |
|------|-----------|------|------|
| `voltage` | `<input id="voltage" type="number">` | 數字 | > 0；不可空白 |

**單位提示**: 顯示標籤 `V（伏特）`

### 2.3 電阻輸入組

動態生成，初始顯示 2 個電阻輸入欄（最少 1 個，最多 10 個）：

| 欄位 | HTML 元素 | 型別 | 約束 |
|------|-----------|------|------|
| `resistor[n]` | `<input class="resistor-input" type="number">` | 數字 | > 0；不可空白 |

**單位提示**: 顯示標籤 `Ω（歐姆）`  
**按鈕**: `新增電阻`（最多 10 個）、`移除`（最少保留 1 個）

### 2.4 混合電路分段

當 `topology === 'mixed'` 時，UI 顯示分段設定（每段可選擇串聯或並聯，並列出該段電阻）。

### 2.5 分析按鈕

| 元素 | 觸發動作 | 前置條件 |
|------|---------|---------|
| `<button id="analyze">分析電路</button>` | 呼叫對應 `analyze*Circuit()` 函式 | 所有輸入通過驗證 |

### 2.6 匯出按鈕

| 元素 | 觸發動作 | 前置條件 |
|------|---------|---------|
| `<button id="export">匯出分析報告</button>` | 呼叫 `window.print()` | 已有分析結果 |

---

## 3. 場景資料契約：`scenarios.js`

`js/scenarios.js` 輸出的應用場景陣列（ES6 模組）。

```javascript
// 輸出格式：
[
  {
    id: string,                          // 如 'dc-motor'
    name: string,                        // 繁體中文名稱，如 '直流電動機起動電路'
    description: string,                 // 繁體中文說明（多段文字）
    defaultVoltage: number,              // 預設電壓（V）
    defaultTopology: 'series' | 'parallel' | 'mixed',
    defaultResistors: number[],          // 預設電阻值陣列（Ω）
    resultInterpretation: function(result) => string
                                         // 接受 AnalysisResult，回傳繁體中文詮釋說明
  },
  ...
]
```

**三個必要場景**（對應 FR-004）:

| `id` | `name` | `defaultTopology` | 主要說明重點 |
|------|--------|-------------------|-------------|
| `dc-motor` | 直流電動機起動電路 | `series` | 起動電流、穩態電流、轉矩說明 |
| `electromagnet` | 電磁鐵致動器 | `series` | 線圈電流、定性磁力強度說明 |
| `thermistor` | 熱敏電阻分壓電路 | `series` | 輸出電壓變化、溫度量測原理說明 |

---

## 4. 輸出結果顯示契約

分析完成後，UI 必須顯示以下資訊區塊（對應 FR-001、FR-002）：

| 區塊 | 內容 | 精確度 |
|------|------|--------|
| 等效總電阻 | `{value} Ω` | 小數點後 2 位 |
| 總電流 | `{value} A` | 小數點後 2 位 |
| 總功率 | `{value} W` | 小數點後 2 位 |
| 各元件表格 | 標號、電壓(V)、電流(A)、功率(W) | 各小數點後 2 位 |
| 應用場景說明 | 繁體中文詮釋文字 | — |

**錯誤顯示契約**（對應 FR-005）:
- 錯誤訊息以繁體中文顯示於輸入欄位下方（inline validation）
- 分析按鈕在有未解決錯誤時維持可點擊狀態，但點擊後顯示錯誤並阻止計算
