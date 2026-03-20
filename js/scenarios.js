// js/scenarios.js
// 機械工程應用場景定義模組

/**
 * @typedef {Object} ApplicationScenario
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} defaultVoltage
 * @property {'series'|'parallel'|'mixed'} defaultTopology
 * @property {number[]} defaultResistors
 * @property {function(object): string} resultInterpretation
 */

/** @type {ApplicationScenario[]} */
export const scenarios = [
  {
    id: 'dc-motor',
    name: '直流電動機起動電路',
    description:
      '直流電動機在起動瞬間，反電動勢（Back-EMF）為零，電路等效為電源串聯電樞電阻。' +
      '此時起動電流最大，隨轉速提升反電動勢增加，穩態電流下降。' +
      '分析此電路可幫助了解電動機的起動特性與過電流保護設計。',
    defaultVoltage: 24,
    defaultTopology: 'series',
    defaultResistors: [2, 4],
    resultInterpretation: function (result) {
      const I = result.totalCurrent;
      const P = result.totalPower;
      return (
        `【直流電動機分析】\n` +
        `起動電流：${I} A（此為最大起動電流，實際運轉時因反電動勢存在電流將降低）\n` +
        `起動功率：${P} W\n` +
        `機械應用說明：起動電流越大，初始轉矩（τ = k×I）越大，有助於克服靜摩擦力。` +
        `設計時需確保電源及導線能承受此起動電流，通常會加裝串聯限流電阻或使用軟起動器。`
      );
    },
  },
  {
    id: 'electromagnet',
    name: '電磁鐵致動器',
    description:
      '電磁鐵致動器透過線圈通電產生磁場，驅動鐵芯移動以完成機械動作（如夾持、閥門開關）。' +
      '線圈電阻決定穩態電流大小，而磁力強度與安培匝數（N×I）成正比。' +
      '分析此電路可估算致動力與能耗。',
    defaultVoltage: 12,
    defaultTopology: 'series',
    defaultResistors: [3, 9],
    resultInterpretation: function (result) {
      const I = result.totalCurrent;
      const P = result.totalPower;
      return (
        `【電磁鐵致動器分析】\n` +
        `線圈電流：${I} A\n` +
        `消耗功率：${P} W\n` +
        `機械應用說明：磁力強度 F ∝ N×I（安培匝數），電流越大磁力越強。` +
        `實際設計中需考慮線圈發熱（P = I²R）與散熱設計，避免絕緣材料過熱導致故障。` +
        `若需更大致動力，可增加線圈匝數 N 而非單純增加電流。`
      );
    },
  },
  {
    id: 'thermistor',
    name: '熱敏電阻分壓電路',
    description:
      '熱敏電阻（NTC 型）的阻值隨溫度升高而降低，與定值電阻串聯構成分壓電路。' +
      '量測熱敏電阻兩端電壓即可推算環境溫度，廣泛用於溫度感測與控制系統中。' +
      '此為機械設備中常見的溫度監控電路。',
    defaultVoltage: 5,
    defaultTopology: 'series',
    defaultResistors: [10000, 10000],
    resultInterpretation: function (result) {
      const vThermistor = result.componentResults[1]
        ? result.componentResults[1].voltage
        : result.componentResults[0].voltage;
      const I = result.totalCurrent;
      return (
        `【熱敏電阻分壓電路分析】\n` +
        `分壓輸出（熱敏電阻兩端）：${vThermistor} V\n` +
        `電路電流：${(I * 1000).toFixed(2)} mA\n` +
        `機械應用說明：當環境溫度上升時，NTC 熱敏電阻阻值下降，分壓輸出電壓隨之降低。` +
        `微控制器（如 Arduino）讀取此電壓後可換算為溫度值，用於機械設備的過熱保護或溫控系統。` +
        `目前兩電阻相等（各 10 kΩ），輸出電壓為電源一半（${vThermistor} V），對應常溫基準。`
      );
    },
  },
];
