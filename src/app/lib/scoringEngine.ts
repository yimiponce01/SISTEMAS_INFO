/**
 * scoringEngine.ts - Motor de Scoring Global Compuesto
 * 
 * Este módulo implementa un sistema profesional de scoring similar a:
 * - Credit scores (FICO, VantageScore)
 * - Health scores corporativos
 * - KPI compuestos empresariales
 * 
 * ARQUITECTURA:
 * 1. Helpers matemáticos (clamp, safeDivide, normalize)
 * 2. Configuración de pesos y umbrales
 * 3. Cálculo de métricas normalizadas
 * 4. Aplicación de ponderaciones
 * 5. Sistema de penalizaciones
 * 6. Score final compuesto (0-100)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Estado del score para clasificación visual
 */
export type ScoreStatus = 'critico' | 'medio' | 'optimo';

/**
 * Configuración de una métrica individual dentro del scoring
 */
export interface MetricConfig {
  /** Nombre identificador de la métrica */
  key: string;
  /** Etiqueta para visualización */
  label: string;
  /** Peso máximo que aporta al score global (0-100) */
  maxWeight: number;
  /** Si es true, es una métrica de penalización (resta en lugar de sumar) */
  isPenalty: boolean;
  /** Valor mínimo esperado para normalización */
  minExpected: number;
  /** Valor máximo esperado/metas para normalización */
  maxExpected: number;
  /** Si true, valores más bajos son mejores (ej: mortalidad) */
  lowerIsBetter: boolean;
}

/**
 * Datos de entrada para el cálculo del score
 */
export interface ScoreInputData {
  // Métricas de producción
  produccion: number;
  produccionEsperada: number;
  
  // Métricas de salud animal
  animalesTotales: number;
  muertes: number;
  enfermedades: number;
  
  // Métricas financieras
  ingresos: number;
  gastos: number;
  ganancias: number;
  
  // Métricas de eficiencia
  nacimientos: number;
  ventas: number;
}

/**
 * Resultado detallado del scoring
 */
export interface ScoreResult {
  /** Score final compuesto (0-100) */
  scoreFinal: number;
  /** Estado cualitativo */
  estado: ScoreStatus;
  /** Color asociado al estado */
  color: string;
  /** Desglose detallado por métrica */
  desglose: MetricScoreDetail[];
  /** Total de penalizaciones aplicadas */
  totalPenalizaciones: number;
  /** Score bruto antes de penalizaciones */
  scoreBruto: number;
}

/**
 * Detalle del scoring por métrica individual
 */
export interface MetricScoreDetail {
  key: string;
  label: string;
  valorCrudo: number;
  valorNormalizado: number; // 0-1 después de normalizar
  aporteAlScore: number; // Puntos reales aportados (0 a maxWeight)
  porcentajeCumplimiento: number; // 0-100%
  estado: 'critico' | 'atencion' | 'bueno' | 'excelente';
}

// ============================================================================
// CONFIGURACIÓN DEL SISTEMA DE SCORING
// ============================================================================

/**
 * Configuración oficial de pesos para el dashboard agropecuario
 * 
 * Distribución conceptual:
 * - Producción: 0-30 puntos (30% del total)
 * - Salud: 0-25 puntos (25% del total)  
 * - Finanzas: 0-20 puntos (20% del total)
 * - Eficiencia: 0-15 puntos (15% del total)
 * - Penalización mortalidad: 0-(-10) puntos
 * - Penalización enfermedades: 0-(-15) puntos
 */
export const SCORING_CONFIG: MetricConfig[] = [
  // MÉTRICAS POSITIVAS (suman puntos)
  {
    key: 'produccion',
    label: 'Producción',
    maxWeight: 30,
    isPenalty: false,
    minExpected: 0,
    maxExpected: 1000, // litros/unidades esperadas
    lowerIsBetter: false,
  },
  {
    key: 'salud',
    label: 'Salud del Hato',
    maxWeight: 25,
    isPenalty: false,
    minExpected: 0,
    maxExpected: 100, // porcentaje de salud
    lowerIsBetter: false,
  },
  {
    key: 'finanzas',
    label: 'Rendimiento Financiero',
    maxWeight: 20,
    isPenalty: false,
    minExpected: 0,
    maxExpected: 100, // porcentaje de rentabilidad
    lowerIsBetter: false,
  },
  {
    key: 'eficiencia',
    label: 'Eficiencia Operativa',
    maxWeight: 15,
    isPenalty: false,
    minExpected: 0,
    maxExpected: 100, // ratio de eficiencia
    lowerIsBetter: false,
  },
  // MÉTRICAS DE PENALIZACIÓN (restan puntos)
  {
    key: 'mortalidad',
    label: 'Tasa de Mortalidad',
    maxWeight: 10,
    isPenalty: true,
    minExpected: 0,
    maxExpected: 10, // porcentaje máximo tolerable
    lowerIsBetter: true,
  },
  {
    key: 'enfermedades',
    label: 'Incidencia de Enfermedades',
    maxWeight: 15,
    isPenalty: true,
    minExpected: 0,
    maxExpected: 15, // porcentaje máximo tolerable
    lowerIsBetter: true,
  },
];

// ============================================================================
// HELPERS MATEMÁTICOS
// ============================================================================

/**
 * Limita un valor entre un mínimo y máximo (función clamp)
 * 
 * @param value - Valor a limitar
 * @param min - Límite inferior
 * @param max - Límite superior
 * @returns Valor limitado entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * División segura que evita divisiones por cero
 * 
 * @param numerator - Numerador
 * @param denominator - Denominador
 * @param defaultValue - Valor por defecto si denominator es 0
 * @returns Resultado de la división o defaultValue
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  defaultValue: number = 0
): number {
  if (denominator === 0 || Number.isNaN(denominator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  if (Number.isNaN(result) || !Number.isFinite(result)) {
    return defaultValue;
  }
  return result;
}

/**
 * Normaliza un valor a un rango [0, 1] basado en expectativas
 * 
 * @param value - Valor actual
 * @param minExpected - Valor mínimo esperado
 * @param maxExpected - Valor máximo esperado
 * @param lowerIsBetter - Si true, invierte la normalización
 * @returns Valor normalizado entre 0 y 1
 */
export function normalizeMetric(
  value: number,
  minExpected: number,
  maxExpected: number,
  lowerIsBetter: boolean = false
): number {
  // Evitar división por cero
  const range = maxExpected - minExpected;
  if (range === 0) {
    return lowerIsBetter ? 1 : 0;
  }

  let normalized: number;
  
  if (lowerIsBetter) {
    // Para métricas donde menos es mejor (mortalidad, enfermedades)
    // Si value <= minExpected → 1 (excelente)
    // Si value >= maxExpected → 0 (crítico)
    normalized = 1 - clamp((value - minExpected) / range, 0, 1);
  } else {
    // Para métricas donde más es mejor (producción, ganancias)
    // Si value <= minExpected → 0 (crítico)
    // Si value >= maxExpected → 1 (excelente)
    normalized = clamp((value - minExpected) / range, 0, 1);
  }

  return clamp(normalized, 0, 1);
}

/**
 * Calcula el porcentaje de cumplimiento de una métrica
 * 
 * @param value - Valor actual
 * @param target - Valor objetivo/máximo esperado
 * @returns Porcentaje de cumplimiento (0-100)
 */
export function calculateCompliance(
  value: number,
  target: number
): number {
  if (target === 0) return value === 0 ? 100 : 0;
  return clamp((value / target) * 100, 0, 100);
}

/**
 * Determina el estado cualitativo basado en un porcentaje
 * 
 * @param percentage - Porcentaje 0-100
 * @returns Estado cualitativo
 */
export function getStateFromPercentage(percentage: number): 'critico' | 'atencion' | 'bueno' | 'excelente' {
  if (percentage >= 90) return 'excelente';
  if (percentage >= 70) return 'bueno';
  if (percentage >= 40) return 'atencion';
  return 'critico';
}

/**
 * Determina el estado global del score
 * 
 * @param score - Score final 0-100
 * @returns Estado cualitativo global
 */
export function getGlobalStatus(score: number): ScoreStatus {
  if (score >= 70) return 'optimo';
  if (score >= 40) return 'medio';
  return 'critico';
}

/**
 * Obtiene el color asociado a un estado global
 */
export function getStatusColor(status: ScoreStatus): string {
  switch (status) {
    case 'optimo': return '#00b84a'; // Verde
    case 'medio': return '#ffd21f';  // Amarillo
    case 'critico': return '#ef1d1d'; // Rojo
    default: return '#ffd21f';
  }
}

// ============================================================================
// MOTOR DE SCORING PRINCIPAL
// ============================================================================

/**
 * Calcula el score global compuesto del dashboard
 * 
 * Este es el corazón del sistema. Implementa:
 * 1. Normalización de cada métrica
 * 2. Ponderación según pesos configurados
 * 3. Aplicación de penalizaciones
 * 4. Clampeo final a rango 0-100
 * 
 * @param data - Datos de entrada del dashboard
 * @returns Resultado detallado del scoring
 */
export function calculateGlobalScore(data: ScoreInputData): ScoreResult {
  // Paso 1: Calcular métricas derivadas
  const tasaMortalidad = safeDivide(data.muertes, data.animalesTotales, 0) * 100;
  const tasaEnfermedades = safeDivide(data.enfermedades, data.animalesTotales, 0) * 100;
  const saludPorcentaje = clamp(100 - tasaMortalidad - tasaEnfermedades, 0, 100);
  const rentabilidadPorcentaje = safeDivide(data.ganancias, data.ingresos, 0) * 100;
  const eficienciaOperativa = calculateEfficiency(data);

  // Paso 2: Normalizar cada métrica y calcular aporte
  const desglose: MetricScoreDetail[] = [];
  let scoreBruto = 0;
  let totalPenalizaciones = 0;

  // 2.1 Producción (0-30 puntos)
  const produccionNormalizada = normalizeMetric(
    data.produccion,
    0,
    data.produccionEsperada || 1000,
    false
  );
  const aporteProduccion = produccionNormalizada * 30;
  scoreBruto += aporteProduccion;
  desglose.push({
    key: 'produccion',
    label: 'Producción',
    valorCrudo: data.produccion,
    valorNormalizado: produccionNormalizada,
    aporteAlScore: aporteProduccion,
    porcentajeCumplimiento: produccionNormalizada * 100,
    estado: getStateFromPercentage(produccionNormalizada * 100),
  });

  // 2.2 Salud (0-25 puntos)
  const saludNormalizada = normalizeMetric(
    saludPorcentaje,
    0,
    100,
    false
  );
  const aporteSalud = saludNormalizada * 25;
  scoreBruto += aporteSalud;
  desglose.push({
    key: 'salud',
    label: 'Salud del Hato',
    valorCrudo: saludPorcentaje,
    valorNormalizado: saludNormalizada,
    aporteAlScore: aporteSalud,
    porcentajeCumplimiento: saludNormalizada * 100,
    estado: getStateFromPercentage(saludNormalizada * 100),
  });

  // 2.3 Finanzas (0-20 puntos)
  const finanzasNormalizada = normalizeMetric(
    clamp(rentabilidadPorcentaje, 0, 100),
    0,
    100,
    false
  );
  const aporteFinanzas = finanzasNormalizada * 20;
  scoreBruto += aporteFinanzas;
  desglose.push({
    key: 'finanzas',
    label: 'Rendimiento Financiero',
    valorCrudo: rentabilidadPorcentaje,
    valorNormalizado: finanzasNormalizada,
    aporteAlScore: aporteFinanzas,
    porcentajeCumplimiento: finanzasNormalizada * 100,
    estado: getStateFromPercentage(finanzasNormalizada * 100),
  });

  // 2.4 Eficiencia (0-15 puntos)
  const eficienciaNormalizada = normalizeMetric(
    eficienciaOperativa,
    0,
    100,
    false
  );
  const aporteEficiencia = eficienciaNormalizada * 15;
  scoreBruto += aporteEficiencia;
  desglose.push({
    key: 'eficiencia',
    label: 'Eficiencia Operativa',
    valorCrudo: eficienciaOperativa,
    valorNormalizado: eficienciaNormalizada,
    aporteAlScore: aporteEficiencia,
    porcentajeCumplimiento: eficienciaNormalizada * 100,
    estado: getStateFromPercentage(eficienciaNormalizada * 100),
  });

  // 2.5 Penalización por mortalidad (0 a -10 puntos)
  const mortalidadNormalizada = normalizeMetric(
    tasaMortalidad,
    0,
    10,
    true // lowerIsBetter
  );
  // Si mortalidadNormalizada = 1 (0% mortalidad) → penalización = 0
  // Si mortalidadNormalizada = 0 (10%+ mortalidad) → penalización = -10
  const penalidadMortalidad = (1 - mortalidadNormalizada) * 10;
  totalPenalizaciones += penalidadMortalidad;
  desglose.push({
    key: 'mortalidad',
    label: 'Tasa de Mortalidad',
    valorCrudo: tasaMortalidad,
    valorNormalizado: mortalidadNormalizada,
    aporteAlScore: -penalidadMortalidad,
    porcentajeCumplimiento: mortalidadNormalizada * 100,
    estado: getStateFromPercentage(mortalidadNormalizada * 100),
  });

  // 2.6 Penalización por enfermedades (0 a -15 puntos)
  const enfermedadesNormalizada = normalizeMetric(
    tasaEnfermedades,
    0,
    15,
    true // lowerIsBetter
  );
  const penalidadEnfermedades = (1 - enfermedadesNormalizada) * 15;
  totalPenalizaciones += penalidadEnfermedades;
  desglose.push({
    key: 'enfermedades',
    label: 'Incidencia de Enfermedades',
    valorCrudo: tasaEnfermedades,
    valorNormalizado: enfermedadesNormalizada,
    aporteAlScore: -penalidadEnfermedades,
    porcentajeCumplimiento: enfermedadesNormalizada * 100,
    estado: getStateFromPercentage(enfermedadesNormalizada * 100),
  });

  // Paso 3: Calcular score final
  const scoreFinalRaw = scoreBruto - totalPenalizaciones;
  const scoreFinal = clamp(Math.round(scoreFinalRaw), 0, 100);
  const estado = getGlobalStatus(scoreFinal);
  const color = getStatusColor(estado);

  return {
    scoreFinal,
    estado,
    color,
    desglose,
    totalPenalizaciones: Math.round(totalPenalizaciones),
    scoreBruto: Math.round(scoreBruto),
  };
}

/**
 * Calcula un índice de eficiencia operativa compuesto
 * Combina múltiples ratios en un solo valor 0-100
 */
function calculateEfficiency(data: ScoreInputData): number {
  // Ratio de nacimientos vs muertes (peso: 40%)
  const ratioNatalidad = data.muertes > 0
    ? clamp((data.nacimientos / data.muertes) * 50, 0, 100)
    : data.nacimientos > 0 ? 100 : 0;

  // Ratio de ventas vs animales totales (peso: 30%)
  const ratioVentas = data.animalesTotales > 0
    ? clamp((data.ventas / data.animalesTotales) * 100, 0, 100)
    : 0;

  // Ratio de producción vs animales (peso: 30%)
  const ratioProduccion = data.animalesTotales > 0
    ? clamp((data.produccion / data.animalesTotales) * 10, 0, 100)
    : 0;

  return (ratioNatalidad * 0.4) + (ratioVentas * 0.3) + (ratioProduccion * 0.3);
}

/**
 * Calcula el score global a partir de los datos del dashboard
 * Función adaptadora que convierte DashboardData a ScoreInputData
 */
export function calculateScoreFromDashboardData(
  totals: {
    animales: number;
    produccion: number;
    muertes: number;
    enfermedades: number;
    ingresos: number;
    gastos: number;
    ganancias: number;
    nacimientos: number;
    ventas: number;
  },
  produccionEsperada?: number
): ScoreResult {
  const inputData: ScoreInputData = {
    produccion: totals.produccion,
    produccionEsperada: produccionEsperada || 1000,
    animalesTotales: totals.animales,
    muertes: totals.muertes,
    enfermedades: totals.enfermedades,
    ingresos: totals.ingresos,
    gastos: totals.gastos,
    ganancias: totals.ganancias,
    nacimientos: totals.nacimientos,
    ventas: totals.ventas,
  };

  return calculateGlobalScore(inputData);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Types
  type: {} as ScoreResult,
  
  // Constants
  SCORING_CONFIG,
  
  // Helpers
  clamp,
  safeDivide,
  normalizeMetric,
  calculateCompliance,
  getStateFromPercentage,
  getGlobalStatus,
  getStatusColor,
  
  // Core functions
  calculateGlobalScore,
  calculateScoreFromDashboardData,
};