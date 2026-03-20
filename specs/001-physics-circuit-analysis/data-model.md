# 資料模型：高中物理電路分析工具

**功能分支**: `001-physics-circuit-analysis`  
**完成日期**: 2026-03-13  
**依據**: `spec.md` § Key Entities

---

## 實體定義

### 1. Circuit（電路）

使用者在一次工作階段中建立的電路，描述其拓撲結構與元件清單。

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `topology` | `'series' \| 'parallel' \| 'mixed'` | 電路拓撲類型 | 必填；限定三種值 |
| `voltageSource` | `VoltageSource` | 電壓源 | 必填；電壓值 > 0 |
| `components` | `Component[]` | 電路元件清單 | 長度 1–10；不可全為零電阻 |
| `analysisResult` | `AnalysisResult \| null` | 分析結果（計算後填入） | 計算前為 null |

**約束**:
- 一次工作階段只存在一個 Circuit（不支援多電路並存）
- `components` 陣列中若有任何 Resistor 的 `resistance === 0`，則為短路（short circuit），系統需在計算前偵測並拒絕
- `components` 不得為空陣列（至少需一個電阻）

---

### 2. Component（電路元件）— 抽象型別

電路的基本組成單元，分為 VoltageSource 與 Resistor 兩種具體型別。

#### 2a. VoltageSource（電壓源）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `type` | `'voltage-source'` | 元件種類識別 | 固定值 |
| `label` | `string` | 顯示標號（如 `V1`） | 非空字串 |
| `voltage` | `number` | 電壓值（單位：V） | > 0；有限數值 |

#### 2b. Resistor（電阻）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|----------|
| `type` | `'resistor'` | 元件種類識別 | 固定值 |
| `label` | `string` | 顯示標號（如 `R1`、`R2`） | 非空字串 |
| `resistance` | `number` | 電阻值（單位：Ω） | > 0；有限數值（0 視為短路，負數無效） |

---

### 3. AnalysisResult（分析結果）

由電路計算得出的所有數值，精確至小數點後兩位（FR-002）。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `totalResistance` | `number` | 等效總電阻（Ω） |
| `totalCurrent` | `number` | 總電流（A） |
| `totalPower` | `number` | 總消耗功率（W） |
| `componentResults` | `ComponentResult[]` | 各元件分析結果清單 |

#### 3a. ComponentResult（元件分析結果）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `label` | `string` | 對應元件標號 |
| `voltage` | `number` | 元件兩端電壓（V） |
| `current` | `number` | 流過元件的電流（A） |
| `power` | `number` | 元件消耗功率（W） |

**計算公式**:
- 串聯：`I_total = V / ΣR`；`V_i = I × R_i`；`P_i = I² × R_i`
- 並聯：`1/R_total = Σ(1/R_i)`；`I_i = V / R_i`；`P_i = V² / R_i`
- 混合：先化簡並聯群組，再按串聯計算

---

### 4. ApplicationScenario（應用場景）

預定義的機械工程應用情境，包含說明文字與預設電路結構。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | 場景識別碼（如 `dc-motor`、`electromagnet`、`thermistor`） |
| `name` | `string` | 場景中文名稱（如 `直流電動機起動電路`） |
| `description` | `string` | 機械工程概念說明（繁體中文） |
| `defaultCircuit` | `Circuit` | 預設電路結構（含預設元件參數） |
| `resultInterpretation` | `string` | 計算結果對應的機械概念說明模板 |

**預定義場景（FR-004）**:
1. **直流電動機（`dc-motor`）**: 電壓源 + 電樞電阻（串聯）；說明起動電流與轉矩
2. **電磁鐵致動器（`electromagnet`）**: 電壓源 + 線圈電阻（串聯）；說明電流與磁力強度
3. **熱敏電阻分壓電路（`thermistor`）**: 電壓源 + 定值電阻 + 熱敏電阻（串聯）；說明不同溫度下的輸出電壓

---

### 5. ExportDocument（匯出文件）

使用者選擇匯出時，由現有分析結果動態產生的顯示結構（不需持久化，僅為列印版面的資料結構）。

| 欄位 | 說明 |
|------|------|
| `title` | 文件標題（如 `電路分析報告 — 直流電動機起動電路`） |
| `circuitDescription` | 電路描述（拓撲、元件清單） |
| `inputParameters` | 輸入參數表（元件標號、數值、單位） |
| `calculationSteps` | 逐步計算過程說明（文字） |
| `results` | 最終數值結果表 |
| `scenarioContext` | 機械工程應用說明（若為應用場景） |

---

## 狀態轉換

```
[空白電路] ──輸入元件──► [已輸入] ──點擊分析──► [已分析] ──點擊匯出──► [列印對話框]
                                    ◄──修改元件──┘
                                    
[選擇場景] ──自動填入預設參數──► [已輸入] ──點擊分析──► [已分析]
```

---

## 驗證規則彙整（對應 FR-005）

| 輸入狀況 | 錯誤訊息（繁體中文） |
|---------|------------------|
| 電阻值為 0 | `短路偵測：電阻值不得為零，請修正元件 {label}` |
| 電阻值為負數 | `無效電阻：電阻值必須大於零（您輸入了 {value} Ω）` |
| 電阻欄位空白 | `請輸入 {label} 的電阻值（單位：Ω）` |
| 電壓源為 0 或負數 | `請輸入大於零的電壓值（單位：V）` |
| 無任何元件 | `至少需輸入一個電阻才能進行分析` |
| 不連通電路 | `電路結構有誤：請確認所有元件均正確連接` |
