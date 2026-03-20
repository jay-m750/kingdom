// js/circuit-analyzer.js
// 電路計算核心模組 — 純函式，無副作用，可獨立測試

/**
 * 四捨五入至小數點後 2 位
 * @param {number} x
 * @returns {number}
 */
function round2(x) {
  return Math.round(x * 100) / 100;
}

/**
 * 驗證輸入參數（不拋出例外，供 UI 即時驗證）
 * @param {number} voltage
 * @param {number[]} resistors
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateInput(voltage, resistors) {
  if (voltage === undefined || voltage === null || voltage === '' || isNaN(Number(voltage))) {
    return { valid: false, message: '請輸入大於零的電壓值（單位：V）' };
  }
  if (Number(voltage) <= 0) {
    return { valid: false, message: '請輸入大於零的電壓值（單位：V）' };
  }
  if (!Array.isArray(resistors) || resistors.length === 0) {
    return { valid: false, message: '至少需輸入一個電阻才能進行分析' };
  }
  for (let i = 0; i < resistors.length; i++) {
    const r = Number(resistors[i]);
    const label = `R${i + 1}`;
    if (resistors[i] === '' || resistors[i] === null || resistors[i] === undefined || isNaN(r)) {
      return { valid: false, message: `請輸入 ${label} 的電阻值（單位：Ω）` };
    }
    if (r === 0) {
      return { valid: false, message: `短路偵測：電阻值不得為零，請修正元件 ${label}` };
    }
    if (r < 0) {
      return { valid: false, message: `無效電阻：電阻值必須大於零（您輸入了 ${r} Ω）` };
    }
  }
  return { valid: true };
}

/**
 * 分析串聯電路
 * @param {number} voltage
 * @param {number[]} resistors
 * @returns {object} AnalysisResult
 */
export function analyzeSeriesCircuit(voltage, resistors) {
  // 驗證
  if (Number(voltage) <= 0 || isNaN(Number(voltage))) {
    throw new Error('請輸入大於零的電壓值（單位：V）');
  }
  if (!Array.isArray(resistors) || resistors.length === 0) {
    throw new Error('至少需輸入一個電阻才能進行分析');
  }
  for (let i = 0; i < resistors.length; i++) {
    const r = Number(resistors[i]);
    const label = `R${i + 1}`;
    if (isNaN(r) || resistors[i] === '' || resistors[i] === null) {
      throw new Error(`請輸入 ${label} 的電阻值（單位：Ω）`);
    }
    if (r === 0) {
      throw new Error(`短路偵測：電阻值不得為零，請修正元件 ${label}`);
    }
    if (r < 0) {
      throw new Error(`無效電阻：電阻值必須大於零（您輸入了 ${r} Ω）`);
    }
  }

  const V = Number(voltage);
  const R_total = resistors.reduce((sum, r) => sum + Number(r), 0);
  const I_total = V / R_total;
  const P_total = V * I_total;

  const componentResults = resistors.map((r, i) => {
    const ri = Number(r);
    const vi = I_total * ri;
    const pi = I_total * I_total * ri;
    return {
      label: `R${i + 1}`,
      voltage: round2(vi),
      current: round2(I_total),
      power: round2(pi),
    };
  });

  return {
    topology: 'series',
    totalResistance: round2(R_total),
    totalCurrent: round2(I_total),
    totalPower: round2(P_total),
    componentResults,
  };
}

/**
 * 分析並聯電路
 * @param {number} voltage
 * @param {number[]} resistors
 * @returns {object} AnalysisResult
 */
export function analyzeParallelCircuit(voltage, resistors) {
  if (Number(voltage) <= 0 || isNaN(Number(voltage))) {
    throw new Error('請輸入大於零的電壓值（單位：V）');
  }
  if (!Array.isArray(resistors) || resistors.length === 0) {
    throw new Error('至少需輸入一個電阻才能進行分析');
  }
  for (let i = 0; i < resistors.length; i++) {
    const r = Number(resistors[i]);
    const label = `R${i + 1}`;
    if (isNaN(r) || resistors[i] === '' || resistors[i] === null) {
      throw new Error(`請輸入 ${label} 的電阻值（單位：Ω）`);
    }
    if (r === 0) {
      throw new Error(`短路偵測：電阻值不得為零，請修正元件 ${label}`);
    }
    if (r < 0) {
      throw new Error(`無效電阻：電阻值必須大於零（您輸入了 ${r} Ω）`);
    }
  }

  const V = Number(voltage);
  const conductanceSum = resistors.reduce((sum, r) => sum + 1 / Number(r), 0);
  const R_total = 1 / conductanceSum;
  const I_total = V / R_total;
  const P_total = V * I_total;

  const componentResults = resistors.map((r, i) => {
    const ri = Number(r);
    const ii = V / ri;
    const pi = V * V / ri;
    return {
      label: `R${i + 1}`,
      voltage: round2(V),
      current: round2(ii),
      power: round2(pi),
    };
  });

  return {
    topology: 'parallel',
    totalResistance: round2(R_total),
    totalCurrent: round2(I_total),
    totalPower: round2(P_total),
    componentResults,
  };
}

/**
 * 分析混合電路（並聯段先化簡，再串聯計算）
 * @param {number} voltage
 * @param {Array<{ type: 'series'|'parallel', resistors: number[] }>} groups
 * @returns {object} AnalysisResult
 */
export function analyzeMixedCircuit(voltage, groups) {
  if (Number(voltage) <= 0 || isNaN(Number(voltage))) {
    throw new Error('請輸入大於零的電壓值（單位：V）');
  }
  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error('至少需輸入一個電阻才能進行分析');
  }

  const V = Number(voltage);

  // 每個 group 化簡為等效電阻，同時驗證所有電阻
  let globalResistorIndex = 0;
  const groupEquivResistors = groups.map((group) => {
    if (!Array.isArray(group.resistors) || group.resistors.length === 0) {
      throw new Error('至少需輸入一個電阻才能進行分析');
    }
    for (const r of group.resistors) {
      const ri = Number(r);
      globalResistorIndex++;
      const label = `R${globalResistorIndex}`;
      if (isNaN(ri) || r === '' || r === null) {
        throw new Error(`請輸入 ${label} 的電阻值（單位：Ω）`);
      }
      if (ri === 0) {
        throw new Error(`短路偵測：電阻值不得為零，請修正元件 ${label}`);
      }
      if (ri < 0) {
        throw new Error(`無效電阻：電阻值必須大於零（您輸入了 ${ri} Ω）`);
      }
    }

    if (group.type === 'parallel') {
      const conductanceSum = group.resistors.reduce((sum, r) => sum + 1 / Number(r), 0);
      return 1 / conductanceSum;
    } else {
      // series within the group
      return group.resistors.reduce((sum, r) => sum + Number(r), 0);
    }
  });

  const R_total = groupEquivResistors.reduce((sum, r) => sum + r, 0);
  const I_total = V / R_total;
  const P_total = V * I_total;

  // Build componentResults for each resistor in each group
  const componentResults = [];
  let resistorIndex = 0;
  groups.forEach((group, gi) => {
    const R_group = groupEquivResistors[gi];
    const V_group = I_total * R_group; // voltage across this group

    if (group.type === 'parallel') {
      group.resistors.forEach((r) => {
        resistorIndex++;
        const ri = Number(r);
        const ii = V_group / ri;
        const pi = V_group * V_group / ri;
        componentResults.push({
          label: `R${resistorIndex}`,
          voltage: round2(V_group),
          current: round2(ii),
          power: round2(pi),
        });
      });
    } else {
      // series within group
      const I_group = I_total; // same current through series elements
      group.resistors.forEach((r) => {
        resistorIndex++;
        const ri = Number(r);
        const vi = I_group * ri;
        const pi = I_group * I_group * ri;
        componentResults.push({
          label: `R${resistorIndex}`,
          voltage: round2(vi),
          current: round2(I_group),
          power: round2(pi),
        });
      });
    }
  });

  return {
    topology: 'mixed',
    totalResistance: round2(R_total),
    totalCurrent: round2(I_total),
    totalPower: round2(P_total),
    componentResults,
  };
}
