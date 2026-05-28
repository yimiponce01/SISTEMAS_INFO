/**
 * scoringEngine.validation.ts - Validación standalone del motor de scoring
 * 
 * Este archivo contiene validaciones para verificar el comportamiento correcto
 * del sistema de scoring global compuesto. No requiere framework de testing.
 * 
 * Para ejecutar: node --import tsx src/app/lib/scoringEngine.validation.ts
 * o simplemente importar en el navegador para validación manual.
 */

import {
  clamp,
  safeDivide,
  normalizeMetric,
  calculateCompliance,
  getStateFromPercentage,
  getGlobalStatus,
  getStatusColor,
  calculateGlobalScore,
  calculateScoreFromDashboardData,
  type ScoreInputData,
} from './scoringEngine';

// ============================================================================
// UTILITARIOS DE VALIDACIÓN
// ============================================================================

type TestResult = { passed: boolean; message: string };

function assert(condition: boolean, message: string): TestResult {
  return { passed: condition, message };
}

function assertEquals<T>(actual: T, expected: T, label: string): TestResult {
  const passed = actual === expected;
  return {
    passed,
    message: passed
      ? `✓ ${label}`
      : `✗ ${label}: esperado ${expected}, obtenido ${actual}`,
  };
}

function assertInRange(
  value: number,
  min: number,
  max: number,
  label: string
): TestResult {
  const passed = value >= min && value <= max;
  return {
    passed,
    message: passed
      ? `✓ ${label}: ${value} en rango [${min}, ${max}]`
      : `✗ ${label}: ${value} fuera de rango [${min}, ${max}]`,
  };
}

// ============================================================================
// BATERÍA DE VALIDACIONES
// ============================================================================

function runValidations(): TestResult[] {
  const results: TestResult[] = [];

  // --- clamp ---
  results.push(assert(clamp(5, 0, 10) === 5, 'clamp(5, 0, 10) === 5'));
  results.push(assert(clamp(-5, 0, 10) === 0, 'clamp(-5, 0, 10) === 0'));
  results.push(assert(clamp(15, 0, 10) === 10, 'clamp(15, 0, 10) === 10'));

  // --- safeDivide ---
  results.push(assertEquals(safeDivide(10, 2), 5, 'safeDivide(10, 2)'));
  results.push(assert(safeDivide(10, 0) === 0, 'safeDivide(10, 0) === 0'));
  results.push(assert(safeDivide(10, 0, 999) === 999, 'safeDivide(10, 0, 999) === 999'));
  results.push(assert(!Number.isNaN(safeDivide(10, NaN)), 'safeDivide(10, NaN) no es NaN'));

  // --- normalizeMetric ---
  results.push(
    assertEquals(normalizeMetric(50, 0, 100, false), 0.5, 'normalizeMetric(50, 0, 100, false)')
  );
  results.push(
    assertEquals(normalizeMetric(0, 0, 100, false), 0, 'normalizeMetric(0, 0, 100, false)')
  );
  results.push(
    assertEquals(normalizeMetric(100, 0, 100, false), 1, 'normalizeMetric(100, 0, 100, false)')
  );
  results.push(
    assertEquals(normalizeMetric(0, 0, 10, true), 1, 'normalizeMetric(0, 0, 10, true) - lowerIsBetter')
  );
  results.push(
    assertEquals(normalizeMetric(10, 0, 10, true), 0, 'normalizeMetric(10, 0, 10, true) - lowerIsBetter')
  );

  // --- calculateCompliance ---
  results.push(assertEquals(calculateCompliance(50, 100), 50, 'calculateCompliance(50, 100)'));
  results.push(assertEquals(calculateCompliance(100, 100), 100, 'calculateCompliance(100, 100)'));
  results.push(assertEquals(calculateCompliance(0, 0), 100, 'calculateCompliance(0, 0)'));

  // --- getStateFromPercentage ---
  results.push(assertEquals(getStateFromPercentage(95), 'excelente', '95% → excelente'));
  results.push(assertEquals(getStateFromPercentage(80), 'bueno', '80% → bueno'));
  results.push(assertEquals(getStateFromPercentage(50), 'atencion', '50% → atencion'));
  results.push(assertEquals(getStateFromPercentage(20), 'critico', '20% → critico'));

  // --- getGlobalStatus ---
  results.push(assertEquals(getGlobalStatus(85), 'optimo', '85 → optimo'));
  results.push(assertEquals(getGlobalStatus(55), 'medio', '55 → medio'));
  results.push(assertEquals(getGlobalStatus(25), 'critico', '25 → critico'));
  results.push(assertEquals(getGlobalStatus(70), 'optimo', '70 → optimo'));
  results.push(assertEquals(getGlobalStatus(40), 'medio', '40 → medio'));

  // --- getStatusColor ---
  results.push(assertEquals(getStatusColor('optimo'), '#00b84a', 'color optimo'));
  results.push(assertEquals(getStatusColor('medio'), '#ffd21f', 'color medio'));
  results.push(assertEquals(getStatusColor('critico'), '#ef1d1d', 'color critico'));

  // --- calculateGlobalScore ---
  const defaultInput: ScoreInputData = {
    produccion: 700,
    produccionEsperada: 1000,
    animalesTotales: 100,
    muertes: 2,
    enfermedades: 3,
    ingresos: 10000,
    gastos: 7000,
    ganancias: 3000,
    nacimientos: 15,
    ventas: 8,
  };

  const result1 = calculateGlobalScore(defaultInput);
  results.push(
    assertInRange(result1.scoreFinal, 0, 100, 'scoreFinal en rango [0, 100]')
  );
  results.push(
    assertEquals(result1.desglose.length, 6, '6 métricas en desglose')
  );
  results.push(
    assert(result1.scoreBruto >= 0, 'scoreBruto >= 0')
  );
  results.push(
    assert(result1.totalPenalizaciones >= 0, 'totalPenalizaciones >= 0')
  );

  // Validar que cada métrica en el desglose tenga valores válidos
  result1.desglose.forEach((metric) => {
    results.push(
      assertInRange(metric.valorNormalizado, 0, 1, `${metric.key} valorNormalizado`)
    );
    results.push(
      assertInRange(metric.porcentajeCumplimiento, 0, 100, `${metric.key} porcentajeCumplimiento`)
    );
    results.push(
      assert(
        ['critico', 'atencion', 'bueno', 'excelente'].includes(metric.estado),
        `${metric.key} estado válido`
      )
    );
  });

  // --- Caso: métricas excelentes → score óptimo ---
  const excellentInput: ScoreInputData = {
    produccion: 1000,
    produccionEsperada: 1000,
    animalesTotales: 100,
    muertes: 0,
    enfermedades: 0,
    ingresos: 10000,
    gastos: 5000,
    ganancias: 5000,
    nacimientos: 20,
    ventas: 15,
  };
  const resultExcellent = calculateGlobalScore(excellentInput);
  results.push(
    assertEquals(resultExcellent.estado, 'optimo', 'métricas excelentes → estado optimo')
  );
  results.push(
    assert(resultExcellent.scoreFinal >= 70, 'scoreExcellent >= 70')
  );

  // --- Caso: métricas pésimas → score crítico ---
  const terribleInput: ScoreInputData = {
    produccion: 0,
    produccionEsperada: 1000,
    animalesTotales: 100,
    muertes: 15,
    enfermedades: 20,
    ingresos: 10000,
    gastos: 12000,
    ganancias: -2000,
    nacimientos: 0,
    ventas: 0,
  };
  const resultTerrible = calculateGlobalScore(terribleInput);
  results.push(
    assertEquals(resultTerrible.estado, 'critico', 'métricas pésimas → estado critico')
  );
  results.push(
    assert(resultTerrible.scoreFinal < 40, 'scoreTerrible < 40')
  );

  // --- Caso: división por cero (animales = 0) ---
  const zeroAnimalsInput: ScoreInputData = {
    produccion: 100,
    produccionEsperada: 1000,
    animalesTotales: 0,
    muertes: 0,
    enfermedades: 0,
    ingresos: 1000,
    gastos: 500,
    ganancias: 500,
    nacimientos: 0,
    ventas: 0,
  };
  const resultZeroAnimals = calculateGlobalScore(zeroAnimalsInput);
  results.push(
    assert(!Number.isNaN(resultZeroAnimals.scoreFinal), 'scoreFinal no es NaN con animales=0')
  );
  results.push(
    assert(Number.isFinite(resultZeroAnimals.scoreFinal), 'scoreFinal es finito con animales=0')
  );

  // --- Caso: ingresos = 0 ---
  const zeroIncomeInput: ScoreInputData = {
    produccion: 100,
    produccionEsperada: 1000,
    animalesTotales: 10,
    muertes: 0,
    enfermedades: 0,
    ingresos: 0,
    gastos: 0,
    ganancias: 0,
    nacimientos: 0,
    ventas: 0,
  };
  const resultZeroIncome = calculateGlobalScore(zeroIncomeInput);
  results.push(
    assert(!Number.isNaN(resultZeroIncome.scoreFinal), 'scoreFinal no es NaN con ingresos=0')
  );

  // --- Penalizaciones aplican correctamente ---
  const noPenaltyInput = { ...defaultInput, muertes: 0, enfermedades: 0 };
  const highPenaltyInput = { ...defaultInput, muertes: 15, enfermedades: 20 };
  const resultNoPenalty = calculateGlobalScore(noPenaltyInput);
  const resultHighPenalty = calculateGlobalScore(highPenaltyInput);
  results.push(
    assert(
      resultHighPenalty.scoreFinal < resultNoPenalty.scoreFinal,
      'penalizaciones reducen el score'
    )
  );
  results.push(
    assert(
      resultHighPenalty.totalPenalizaciones > resultNoPenalty.totalPenalizaciones,
      'mayores problemas → mayores penalizaciones'
    )
  );

  // --- Clamp final a 0-100 ---
  const extremeInput: ScoreInputData = {
    produccion: 0,
    produccionEsperada: 1000,
    animalesTotales: 100,
    muertes: 50,
    enfermedades: 50,
    ingresos: 1000,
    gastos: 5000,
    ganancias: -4000,
    nacimientos: 0,
    ventas: 0,
  };
  const resultExtreme = calculateGlobalScore(extremeInput);
  results.push(
    assertInRange(resultExtreme.scoreFinal, 0, 100, 'scoreFinal clampado en caso extremo')
  );

  // --- calculateScoreFromDashboardData ---
  const totals = {
    animales: 100,
    produccion: 700,
    muertes: 2,
    enfermedades: 3,
    ingresos: 10000,
    gastos: 7000,
    ganancias: 3000,
    nacimientos: 15,
    ventas: 8,
  };
  const resultFromDashboard = calculateScoreFromDashboardData(totals);
  results.push(
    assertInRange(resultFromDashboard.scoreFinal, 0, 100, 'calculateScoreFromDashboardData en rango')
  );

  // --- Producción esperada personalizada ---
  const resultCustomProduction = calculateScoreFromDashboardData(
    { ...totals, produccion: 500 },
    500
  );
  const produccionMetric = resultCustomProduction.desglose.find(m => m.key === 'produccion');
  results.push(
    assertEquals(produccionMetric?.porcentajeCumplimiento, 100, 'produccion 500/500 → 100%')
  );

  // --- Valores negativos en ganancias ---
  const negativeProfitInput: ScoreInputData = {
    produccion: 500,
    produccionEsperada: 1000,
    animalesTotales: 50,
    muertes: 1,
    enfermedades: 2,
    ingresos: 5000,
    gastos: 8000,
    ganancias: -3000,
    nacimientos: 5,
    ventas: 3,
  };
  const resultNegativeProfit = calculateGlobalScore(negativeProfitInput);
  results.push(
    assert(!Number.isNaN(resultNegativeProfit.scoreFinal), 'scoreFinal no es NaN con ganancias negativas')
  );
  results.push(
    assertInRange(resultNegativeProfit.scoreFinal, 0, 100, 'scoreFinal en rango con ganancias negativas')
  );

  // --- Todos los valores en cero ---
  const allZeroInput: ScoreInputData = {
    produccion: 0,
    produccionEsperada: 1000,
    animalesTotales: 0,
    muertes: 0,
    enfermedades: 0,
    ingresos: 0,
    gastos: 0,
    ganancias: 0,
    nacimientos: 0,
    ventas: 0,
  };
  const resultAllZero = calculateGlobalScore(allZeroInput);
  results.push(
    assert(!Number.isNaN(resultAllZero.scoreFinal), 'scoreFinal no es NaN con todos ceros')
  );
  results.push(
    assertInRange(resultAllZero.scoreFinal, 0, 100, 'scoreFinal en rango con todos ceros')
  );

  return results;
}

// ============================================================================
// EJECUCIÓN Y REPORTE
// ============================================================================

function printReport(results: TestResult[]) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log('\n' + '='.repeat(60));
  console.log('  VALIDACIÓN DEL MOTOR DE SCORING GLOBAL COMPUESTO');
  console.log('='.repeat(60) + '\n');

  console.log(`Total: ${total} | ✓ Aprobados: ${passed} | ✗ Fallidos: ${failed}\n`);

  if (failed > 0) {
    console.log('--- Fallas ---');
    results.filter(r => !r.passed).forEach(r => console.log(`  ${r.message}`));
    console.log('');
  }

  // Mostrar resumen del score calculado
  const sampleData: ScoreInputData = {
    produccion: 700,
    produccionEsperada: 1000,
    animalesTotales: 100,
    muertes: 2,
    enfermedades: 3,
    ingresos: 10000,
    gastos: 7000,
    ganancias: 3000,
    nacimientos: 15,
    ventas: 8,
  };
  const sampleResult = calculateGlobalScore(sampleData);
  
  console.log('--- Ejemplo de Score Calculado ---');
  console.log(`  Score Final: ${sampleResult.scoreFinal}/100`);
  console.log(`  Estado: ${sampleResult.estado}`);
  console.log(`  Color: ${sampleResult.color}`);
  console.log(`  Score Bruto: ${sampleResult.scoreBruto}`);
  console.log(`  Penalizaciones: ${sampleResult.totalPenalizaciones}`);
  console.log('\n  Desglose por métrica:');
  sampleResult.desglose.forEach(m => {
    console.log(`    ${m.label}: ${m.porcentajeCumplimiento.toFixed(0)}% (${m.estado}) → ${m.aporteAlScore.toFixed(1)} pts`);
  });
  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('  ✓ TODAS LAS VALIDACIONES APROBADAS');
  } else {
    console.log(`  ✗ ${failed} VALIDACION(ES) FALLIDA(S)`);
  }
  console.log('='.repeat(60) + '\n');
}

// Ejecutar validaciones
const validationResults = runValidations();
printReport(validationResults);

export { runValidations, printReport };