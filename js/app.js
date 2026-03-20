// js/app.js
// UI 事件綁定與 DOM 更新模組

import {
  analyzeSeriesCircuit,
  analyzeParallelCircuit,
  analyzeMixedCircuit,
  validateInput,
} from './circuit-analyzer.js';
import { scenarios } from './scenarios.js';

// ─────────────────────────────────────────────
// 全域狀態
// ─────────────────────────────────────────────
let currentResult = null;
let currentScenarioId = null;

// ─────────────────────────────────────────────
// 輔助函式
// ─────────────────────────────────────────────

/** 取得所有電阻輸入欄位的數值陣列 */
function getResistorValues() {
  const inputs = document.querySelectorAll('.resistor-input');
  return Array.from(inputs).map((el) => el.value.trim() === '' ? '' : Number(el.value));
}

/** 清除結果顯示區 */
function clearResults() {
  const resultsSection = document.getElementById('results');
  if (resultsSection) resultsSection.innerHTML = '';
  const interpretation = document.getElementById('scenario-interpretation');
  if (interpretation) interpretation.textContent = '';
  const exportBtn = document.getElementById('export');
  if (exportBtn) exportBtn.style.display = 'none';
  const printView = document.getElementById('print-view');
  if (printView) printView.innerHTML = '';
  currentResult = null;
}

/** 顯示錯誤訊息於 #results */
function showError(message) {
  const resultsSection = document.getElementById('results');
  if (resultsSection) {
    resultsSection.innerHTML = `<p class="error-message">${message}</p>`;
  }
}

/** 渲染 AnalysisResult 至 #results */
function renderResult(result) {
  const resultsSection = document.getElementById('results');
  if (!resultsSection) return;

  const topologyNames = { series: '串聯', parallel: '並聯', mixed: '混合' };
  const topologyLabel = topologyNames[result.topology] || result.topology;

  let componentRows = result.componentResults
    .map(
      (c) =>
        `<tr>
          <td>${c.label}</td>
          <td>${c.voltage} V</td>
          <td>${c.current} A</td>
          <td>${c.power} W</td>
        </tr>`
    )
    .join('');

  resultsSection.innerHTML = `
    <h2>分析結果 <span class="topology-badge">${topologyLabel}電路</span></h2>
    <div class="summary-grid">
      <div class="summary-card">
        <span class="summary-label">等效總電阻</span>
        <span class="summary-value">${result.totalResistance} Ω</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">總電流</span>
        <span class="summary-value">${result.totalCurrent} A</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">總功率</span>
        <span class="summary-value">${result.totalPower} W</span>
      </div>
    </div>
    <h3>各元件分析結果</h3>
    <table class="component-table">
      <thead>
        <tr>
          <th>元件</th>
          <th>電壓 (V)</th>
          <th>電流 (A)</th>
          <th>功率 (W)</th>
        </tr>
      </thead>
      <tbody>${componentRows}</tbody>
    </table>
  `;

  // 顯示場景詮釋
  const scenario = scenarios.find((s) => s.id === currentScenarioId);
  const interpretation = document.getElementById('scenario-interpretation');
  if (interpretation) {
    if (scenario) {
      interpretation.textContent = scenario.resultInterpretation(result);
      interpretation.style.display = 'block';
    } else {
      interpretation.textContent = '';
      interpretation.style.display = 'none';
    }
  }

  // 顯示匯出按鈕
  const exportBtn = document.getElementById('export');
  if (exportBtn) exportBtn.style.display = 'inline-block';
}

// ─────────────────────────────────────────────
// 動態電阻輸入管理
// ─────────────────────────────────────────────

/** 建立一個電阻輸入列 */
function createResistorRow(index, value) {
  const row = document.createElement('div');
  row.className = 'resistor-row';
  row.innerHTML = `
    <label>R${index} <span class="unit">（Ω 歐姆）</span></label>
    <input type="number" class="resistor-input" min="0.001" step="any"
           placeholder="電阻值" aria-label="電阻 R${index}" value="${value !== undefined ? value : ''}">
    <button type="button" class="btn-remove" aria-label="移除電阻 R${index}">移除</button>
  `;
  row.querySelector('.btn-remove').addEventListener('click', () => removeResistorRow(row));
  return row;
}

/** 重新編號所有電阻列 */
function reindexResistorRows() {
  const rows = document.querySelectorAll('.resistor-row');
  rows.forEach((row, i) => {
    const label = row.querySelector('label');
    const input = row.querySelector('input');
    const btn = row.querySelector('.btn-remove');
    if (label) label.innerHTML = `R${i + 1} <span class="unit">（Ω 歐姆）</span>`;
    if (input) input.setAttribute('aria-label', `電阻 R${i + 1}`);
    if (btn) btn.setAttribute('aria-label', `移除電阻 R${i + 1}`);
  });
  // 最後一個移除按鈕不可按（至少 1 個）
  const allRemoveBtns = document.querySelectorAll('.resistor-row .btn-remove');
  allRemoveBtns.forEach((btn, i) => {
    btn.disabled = allRemoveBtns.length <= 1;
  });
}

/** 移除一個電阻列 */
function removeResistorRow(row) {
  const container = document.getElementById('resistors-container');
  if (!container) return;
  const rows = container.querySelectorAll('.resistor-row');
  if (rows.length <= 1) return; // 至少保留 1 個
  container.removeChild(row);
  reindexResistorRows();
}

/** 新增一個電阻列 */
function addResistorRow(value) {
  const container = document.getElementById('resistors-container');
  if (!container) return;
  const rows = container.querySelectorAll('.resistor-row');
  if (rows.length >= 10) {
    showError('最多只能輸入 10 個電阻');
    return;
  }
  const newIndex = rows.length + 1;
  const row = createResistorRow(newIndex, value);
  container.appendChild(row);
  reindexResistorRows();
}

// ─────────────────────────────────────────────
// 場景選擇
// ─────────────────────────────────────────────

/** 填入場景預設參數至表單 */
function applyScenario(scenario) {
  currentScenarioId = scenario.id;

  const topologySelect = document.getElementById('topology');
  if (topologySelect) topologySelect.value = scenario.defaultTopology;

  const voltageInput = document.getElementById('voltage');
  if (voltageInput) voltageInput.value = scenario.defaultVoltage;

  // 重建電阻列
  const container = document.getElementById('resistors-container');
  if (container) {
    container.innerHTML = '';
    scenario.defaultResistors.forEach((r, i) => {
      const row = createResistorRow(i + 1, r);
      container.appendChild(row);
    });
    reindexResistorRows();
  }

  clearResults();
}

// ─────────────────────────────────────────────
// 建立匯出文件
// ─────────────────────────────────────────────

/**
 * 依 ExportDocument 結構組裝物件
 * @param {{ topology: string, voltage: number, resistors: number[] }} circuit
 * @param {object} result
 * @param {object|null} scenario
 * @returns {object} ExportDocument
 */
export function buildExportDocument(circuit, result, scenario) {
  const topologyNames = { series: '串聯', parallel: '並聯', mixed: '混合' };
  const topologyLabel = topologyNames[circuit.topology] || circuit.topology;
  const scenarioName = scenario ? `— ${scenario.name}` : '';

  const title = `電路分析報告 ${scenarioName}`.trim();

  const circuitDescription =
    `電路類型：${topologyLabel}電路\n` +
    `電壓源：${circuit.voltage} V\n` +
    `電阻數量：${circuit.resistors.length} 個\n` +
    circuit.resistors.map((r, i) => `R${i + 1} = ${r} Ω`).join('、');

  const inputParameters =
    `電壓源：${circuit.voltage} V\n` +
    circuit.resistors.map((r, i) => `R${i + 1}：${r} Ω`).join('\n');

  let calculationSteps = '';
  if (circuit.topology === 'series') {
    calculationSteps =
      `串聯電路計算步驟：\n` +
      `1. 等效總電阻 R_total = ${circuit.resistors.join(' + ')} = ${result.totalResistance} Ω\n` +
      `2. 總電流 I = V / R_total = ${circuit.voltage} / ${result.totalResistance} = ${result.totalCurrent} A\n` +
      `3. 各元件電壓 V_i = I × R_i\n` +
      result.componentResults.map((c, i) => `   ${c.label}: ${result.totalCurrent} × ${circuit.resistors[i] ?? '?'} = ${c.voltage} V`).join('\n') +
      `\n4. 各元件功率 P_i = I² × R_i`;
  } else if (circuit.topology === 'parallel') {
    calculationSteps =
      `並聯電路計算步驟：\n` +
      `1. 等效總電阻：1/R_total = ${circuit.resistors.map((r) => `1/${r}`).join(' + ')} → R_total = ${result.totalResistance} Ω\n` +
      `2. 總電流 I_total = V / R_total = ${circuit.voltage} / ${result.totalResistance} = ${result.totalCurrent} A\n` +
      `3. 各支路電流 I_i = V / R_i\n` +
      result.componentResults.map((c, i) => `   ${c.label}: ${circuit.voltage} / ${circuit.resistors[i] ?? '?'} = ${c.current} A`).join('\n');
  } else {
    calculationSteps =
      `混合電路計算步驟：\n` +
      `1. 化簡並聯段為等效電阻\n` +
      `2. 等效總電阻 R_total = ${result.totalResistance} Ω\n` +
      `3. 總電流 I = V / R_total = ${circuit.voltage} / ${result.totalResistance} = ${result.totalCurrent} A\n` +
      `4. 各元件依所屬段計算電壓與電流`;
  }

  const results =
    `等效總電阻：${result.totalResistance} Ω\n` +
    `總電流：${result.totalCurrent} A\n` +
    `總功率：${result.totalPower} W\n` +
    result.componentResults
      .map((c) => `${c.label}：電壓 ${c.voltage} V、電流 ${c.current} A、功率 ${c.power} W`)
      .join('\n');

  const scenarioContext = scenario
    ? `場景說明：${scenario.name}\n${scenario.description}\n\n結果詮釋：\n${scenario.resultInterpretation(result)}`
    : '';

  return {
    title,
    circuitDescription,
    inputParameters,
    calculationSteps,
    results,
    scenarioContext,
  };
}

/** 填入 #print-view 並呼叫 window.print() */
function exportReport() {
  if (!currentResult) return;

  const topology = document.getElementById('topology')?.value || 'series';
  const voltage = Number(document.getElementById('voltage')?.value || 0);
  const resistors = getResistorValues().map(Number);
  const scenario = scenarios.find((s) => s.id === currentScenarioId) || null;

  const circuit = { topology, voltage, resistors };
  const doc = buildExportDocument(circuit, currentResult, scenario);

  const printView = document.getElementById('print-view');
  if (!printView) return;

  printView.innerHTML = `
    <h1>${doc.title}</h1>
    <section class="print-section">
      <h2>電路描述</h2>
      <p style="white-space:pre-line">${doc.circuitDescription}</p>
    </section>
    <section class="print-section">
      <h2>輸入參數</h2>
      <p style="white-space:pre-line">${doc.inputParameters}</p>
    </section>
    <section class="print-section">
      <h2>計算步驟</h2>
      <p style="white-space:pre-line">${doc.calculationSteps}</p>
    </section>
    <section class="print-section">
      <h2>分析結果</h2>
      <p style="white-space:pre-line">${doc.results}</p>
    </section>
    ${doc.scenarioContext ? `<section class="print-section"><h2>機械工程應用說明</h2><p style="white-space:pre-line">${doc.scenarioContext}</p></section>` : ''}
  `;

  window.print();
}

// ─────────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // ── 初始化場景選擇器 ──
  const scenarioSelect = document.getElementById('scenario-select');
  if (scenarioSelect) {
    scenarios.forEach((s) => {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = s.name;
      scenarioSelect.appendChild(option);
    });

    scenarioSelect.addEventListener('change', () => {
      const selected = scenarios.find((s) => s.id === scenarioSelect.value);
      if (selected) applyScenario(selected);
      else currentScenarioId = null;
    });
  }

  // ── 初始化電阻容器（預設 2 個電阻） ──
  const container = document.getElementById('resistors-container');
  if (container && container.querySelectorAll('.resistor-row').length === 0) {
    for (let i = 1; i <= 2; i++) {
      const row = createResistorRow(i, '');
      container.appendChild(row);
    }
    reindexResistorRows();
  }

  // ── 新增電阻按鈕 ──
  const addResistorBtn = document.getElementById('add-resistor');
  if (addResistorBtn) {
    addResistorBtn.addEventListener('click', () => addResistorRow());
  }

  // ── 分析電路按鈕 ──
  const analyzeBtn = document.getElementById('analyze');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      clearResults();

      const topology = document.getElementById('topology')?.value;
      const voltageRaw = document.getElementById('voltage')?.value;
      const voltage = voltageRaw === '' ? NaN : Number(voltageRaw);
      const resistorValues = getResistorValues();

      // 驗證
      const validation = validateInput(voltage, resistorValues);
      if (!validation.valid) {
        showError(validation.message);
        return;
      }

      try {
        let result;
        if (topology === 'series') {
          result = analyzeSeriesCircuit(voltage, resistorValues);
        } else if (topology === 'parallel') {
          result = analyzeParallelCircuit(voltage, resistorValues);
        } else if (topology === 'mixed') {
          // 混合電路：將電阻分成兩段（前半串聯，後半並聯，若只有一個則單串聯）
          const half = Math.ceil(resistorValues.length / 2);
          const groups = [];
          if (resistorValues.length === 1) {
            groups.push({ type: 'series', resistors: resistorValues });
          } else {
            groups.push({ type: 'series', resistors: resistorValues.slice(0, half) });
            groups.push({ type: 'parallel', resistors: resistorValues.slice(half) });
          }
          result = analyzeMixedCircuit(voltage, groups);
        } else {
          throw new Error('未知的電路類型');
        }

        currentResult = result;
        renderResult(result);
      } catch (e) {
        showError(e.message);
      }
    });
  }

  // ── 匯出按鈕 ──
  const exportBtn = document.getElementById('export');
  if (exportBtn) {
    exportBtn.style.display = 'none';
    exportBtn.addEventListener('click', exportReport);
  }
});
