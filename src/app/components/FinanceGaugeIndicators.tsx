import { useState, type MouseEvent, useMemo } from 'react';
import type { DashboardData } from '../lib/dashboardData';

// ============================================================================
// TYPES
// ============================================================================

interface FinanceGaugeIndicatorsProps {
  dashboardData: DashboardData | null;
  darkMode: boolean;
}

interface MetricData {
  key: string;
  label: string;
  porcentaje: number;
  rawScore: number;
}

interface MetricSegment {
  key: string;
  label: string;
  porcentaje: number;
  rawScore: number;
  colorDinamico: string;
  posicion: 'izquierda' | 'centro' | 'derecha';
  startAngle: number;
  endAngle: number;
  midAngle: number;
  groupedMetrics?: MetricData[];
  isGroup?: boolean;
}

// ============================================================================
// CONFIGURACIÓN VISUAL DEL GAUGE
// ============================================================================

const GAUGE_CONFIG = {
  center: { x: 180, y: 180 },
  arcRadius: 130,
  labelRadius: 165,
  needleRadius: 110,
  arcWidth: 32,
  startAngle: 180,
  endAngle: 360,
  totalSweep: 180,
};

// ============================================================================
// FUNCIONES AUXILIARES DE SVG
// ============================================================================

function polarToCartesian(angle: number, radius: number, center: { x: number; y: number }) {
  const angleInRadians = (angle * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angleInRadians),
    y: center.y + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  startAngle: number,
  endAngle: number,
  center: { x: number; y: number },
  radius: number
) {
  const start = polarToCartesian(startAngle, radius, center);
  const end = polarToCartesian(endAngle, radius, center);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(' ');
}

// ============================================================================
// HELPERS MATEMÁTICOS
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeDivide(numerator: number, denominator: number, defaultValue: number = 0): number {
  if (denominator === 0 || Number.isNaN(denominator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  if (Number.isNaN(result) || !Number.isFinite(result)) {
    return defaultValue;
  }
  return result;
}

// ============================================================================
// COLOR DINÁMICO SEGÚN PORCENTAJE
// ============================================================================

function getColorByPercentage(porcentaje: number): string {
  if (porcentaje < 15) {
    return '#ef1d1d';
  } else if (porcentaje < 25) {
    return '#ff6b35';
  } else if (porcentaje < 35) {
    return '#ffd21f';
  } else if (porcentaje < 45) {
    return '#8bdc22';
  } else {
    return '#00b84a';
  }
}

function getPosicion(porcentaje: number): 'izquierda' | 'centro' | 'derecha' {
  if (porcentaje < 25) return 'izquierda';
  if (porcentaje < 45) return 'centro';
  return 'derecha';
}

// ============================================================================
// CÁLCULO DE MÉTRICAS FINANCIERAS DESDE DATOS REALES (SOLO SUPABASE)
// ============================================================================

function calculateFinanceMetricsFromData(totals: DashboardData['totals']) {
  if (!totals) return null;

  // --- Métricas financieras base (normalizadas 0-100) ---
  
  // Rentabilidad (ganancias/ingresos * 100) - máximo 100
  const rentabilidadScore = clamp(safeDivide(totals.ganancias, totals.ingresos, 0) * 100, 0, 100);
  
  // Eficiencia de gastos (mientras menos gastos respecto a ingresos, mejor)
  const gastoRatio = safeDivide(totals.gastos, totals.ingresos, 1);
  const eficienciaGastosScore = clamp((1 - gastoRatio) * 100, 0, 100);
  
  // Volumen de ingresos (normalizado - asumiendo 10000 como referencia)
  const ingresosScore = clamp((totals.ingresos / 10000) * 100, 0, 100);
  
  // Balance (positivo = bueno)
  const balanceScore = totals.balance >= 0 
    ? clamp((totals.balance / Math.max(totals.ingresos * 0.3, 1)) * 100, 0, 100)
    : clamp(50 + (totals.balance / Math.max(Math.abs(totals.gastos) * 0.3, 1)) * 50, 0, 50);
  
  // Actividad de ventas (normalizado - asumiendo 50 ventas como referencia)
  const ventasScore = clamp((totals.ventas / 50) * 100, 0, 100);

  const rawScores = {
    rentabilidad: rentabilidadScore,
    eficiencia: eficienciaGastosScore,
    ingresos: ingresosScore,
    balance: balanceScore,
    ventas: ventasScore,
  };

  // --- Pesos ponderados para métricas financieras ---
  const weights = {
    rentabilidad: 0.30,
    eficiencia: 0.25,
    balance: 0.20,
    ingresos: 0.15,
    ventas: 0.10,
  };

  // --- Calcular contribuciones ---
  const contributions = {
    rentabilidad: rawScores.rentabilidad * weights.rentabilidad,
    eficiencia: rawScores.eficiencia * weights.eficiencia,
    balance: rawScores.balance * weights.balance,
    ingresos: rawScores.ingresos * weights.ingresos,
    ventas: rawScores.ventas * weights.ventas,
  };

  const totalContribution =
    contributions.rentabilidad + contributions.eficiencia + contributions.balance +
    contributions.ingresos + contributions.ventas;

  // --- Distribuir porcentajes para que sumen EXACTAMENTE 100% ---
  const percentages = {
    rentabilidad: totalContribution > 0 ? (contributions.rentabilidad / totalContribution) * 100 : 20,
    eficiencia: totalContribution > 0 ? (contributions.eficiencia / totalContribution) * 100 : 20,
    balance: totalContribution > 0 ? (contributions.balance / totalContribution) * 100 : 20,
    ingresos: totalContribution > 0 ? (contributions.ingresos / totalContribution) * 100 : 20,
    ventas: totalContribution > 0 ? (contributions.ventas / totalContribution) * 100 : 20,
  };

  // Verificar y ajustar suma = 100%
  const sumCheck = percentages.rentabilidad + percentages.eficiencia + percentages.balance +
                   percentages.ingresos + percentages.ventas;

  if (Math.abs(sumCheck - 100) > 0.001) {
    const factor = 100 / sumCheck;
    percentages.rentabilidad *= factor;
    percentages.eficiencia *= factor;
    percentages.balance *= factor;
    percentages.ingresos *= factor;
    percentages.ventas *= factor;
  }

  // --- Score global financiero (promedio ponderado) ---
  const scoreGlobal = totalContribution;
  const scoreFinal = Math.round(clamp(scoreGlobal, 0, 100));

  return {
    rawScores,
    percentages,
    scoreFinal,
    weights,
    totalContribution,
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function FinanceGaugeIndicators({ dashboardData, darkMode }: FinanceGaugeIndicatorsProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    segment: MetricSegment;
  } | null>(null);

  // Calcular métricas desde datos reales de Supabase
  const metrics = useMemo(() => {
    if (!dashboardData?.totals) return null;
    return calculateFinanceMetricsFromData(dashboardData.totals);
  }, [dashboardData?.totals]);

  // Generar segmentos con agrupación inteligente (filtrando 0%)
  const segments: MetricSegment[] = useMemo(() => {
    if (!metrics) return [];

    const metricLabels: Record<string, string> = {
      rentabilidad: 'Rentabilidad',
      eficiencia: 'Eficiencia',
      balance: 'Balance',
      ingresos: 'Ingresos',
      ventas: 'Ventas',
    };

    // Crear array de métricas (SOLO las que tienen porcentaje > 0)
    const allMetrics: MetricData[] = Object.entries(metrics.percentages)
      .filter(([_, porcentaje]) => porcentaje > 0)
      .map(([key, porcentaje]) => ({
        key,
        label: metricLabels[key] || key,
        porcentaje: Math.round(porcentaje * 10) / 10,
        rawScore: Math.round(metrics.rawScores[key as keyof typeof metrics.rawScores]),
      }));

    // Agrupar por porcentaje (manejo de indicadores repetidos)
    const groupedByPercentage = new Map<number, MetricData[]>();
    allMetrics.forEach((metric) => {
      const roundedPorcentaje = Math.round(metric.porcentaje * 10) / 10;
      const existing = groupedByPercentage.get(roundedPorcentaje) || [];
      existing.push(metric);
      groupedByPercentage.set(roundedPorcentaje, existing);
    });

    // Crear segmentos: si hay múltiples métricas con mismo %, agrupar como "Otros"
    const displaySegments: MetricSegment[] = [];

    // Ordenar porcentajes únicos de menor a mayor
    const uniquePercentages = Array.from(groupedByPercentage.keys()).sort((a, b) => a - b);

    uniquePercentages.forEach((porcentaje) => {
      const metricsInGroup = groupedByPercentage.get(porcentaje) || [];

      if (metricsInGroup.length === 1) {
        // Solo una métrica en este porcentaje → mostrar individual
        const metric = metricsInGroup[0];
        displaySegments.push({
          key: metric.key,
          label: metric.label,
          porcentaje: metric.porcentaje,
          rawScore: metric.rawScore,
          colorDinamico: getColorByPercentage(porcentaje),
          posicion: getPosicion(porcentaje),
          startAngle: 0,
          endAngle: 0,
          midAngle: 0,
          isGroup: false,
        });
      } else {
        // Múltiples métricas con mismo porcentaje → agrupar como "Otros"
        const sortedMetrics = [...metricsInGroup].sort((a, b) => a.label.localeCompare(b.label));

        displaySegments.push({
          key: `group_${porcentaje}`,
          label: 'Otros',
          porcentaje: Math.round(porcentaje * metricsInGroup.length * 10) / 10,
          rawScore: sortedMetrics.length > 0
            ? Math.round(sortedMetrics.reduce((sum, m) => sum + m.rawScore, 0) / sortedMetrics.length)
            : 0,
          colorDinamico: getColorByPercentage(porcentaje),
          posicion: getPosicion(porcentaje),
          startAngle: 0,
          endAngle: 0,
          midAngle: 0,
          isGroup: true,
          groupedMetrics: sortedMetrics,
        });
      }
    });

    // Ordenar segmentos de MENOR a MAYOR porcentaje
    displaySegments.sort((a, b) => a.porcentaje - b.porcentaje);

    // Asignar ángulos
    let currentAngle = GAUGE_CONFIG.startAngle;
    return displaySegments.map((segment) => {
      const sweep = (segment.porcentaje / 100) * GAUGE_CONFIG.totalSweep;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;
      const midAngle = startAngle + sweep / 2;
      currentAngle = endAngle;

      return {
        ...segment,
        startAngle,
        endAngle,
        midAngle,
      };
    });
  }, [metrics]);

  // Calcular ángulo de la aguja → apunta al indicador con MAYOR porcentaje
  const needleAngle = useMemo(() => {
    if (!segments || segments.length === 0) return GAUGE_CONFIG.startAngle;
    const maxSegment = segments[segments.length - 1];
    return maxSegment.midAngle;
  }, [segments]);

  const needleEnd = useMemo(() => {
    return polarToCartesian(needleAngle, GAUGE_CONFIG.needleRadius, GAUGE_CONFIG.center);
  }, [needleAngle]);

  // Color global basado en el indicador dominante
  const dominantSegment = segments && segments.length > 0 ? segments[segments.length - 1] : null;
  const globalColor = dominantSegment?.colorDinamico || '#ffd21f';

  // Manejador de tooltips
  const handleTooltipMove = (event: MouseEvent<SVGGElement>, segment: MetricSegment) => {
    const bounds = event.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
    if (!bounds) return;

    setTooltip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top - 10,
      segment,
    });
  };

  const titleColor = darkMode ? 'text-white' : 'text-slate-800';
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1E293B' : '#ffffff',
    border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
    color: darkMode ? '#FFFFFF' : '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900/78 via-slate-950/70 to-amber-950/18 border-amber-300/18 shadow-2xl shadow-amber-950/30 backdrop-blur-2xl hover:border-amber-300/45 hover:shadow-amber-500/20'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <h3 className={`text-base font-light mb-2 ${titleColor}`}>
        Semáforo Financiero
      </h3>

      <div className="flex h-[260px] justify-center">
        <div className="relative h-full w-full">
          <svg
            viewBox="0 0 360 280"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Semáforo financiero"
          >
            <defs>
              {/* Gradiente del arco: rojo → amarillo → verde */}
              <linearGradient id="financeGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef1d1d" />
                <stop offset="30%" stopColor="#ff8a00" />
                <stop offset="50%" stopColor="#ffd21f" />
                <stop offset="70%" stopColor="#8bdc22" />
                <stop offset="100%" stopColor="#00b84a" />
              </linearGradient>

              {/* Glow effect */}
              <filter id="financeGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Sombra para la aguja */}
              <filter id="financeNeedleShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
              </filter>

              {/* Glow para textos */}
              <filter id="financeTextGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Arco de color COMPLETO (gradiente en todo el semicírculo) */}
            <path
              d={describeArc(
                GAUGE_CONFIG.startAngle,
                GAUGE_CONFIG.endAngle,
                GAUGE_CONFIG.center,
                GAUGE_CONFIG.arcRadius
              )}
              stroke="url(#financeGaugeGradient)"
              strokeWidth={GAUGE_CONFIG.arcWidth}
              strokeLinecap="round"
              fill="none"
              filter="url(#financeGaugeGlow)"
            />

            {/* Segmentos individuales con colores dinámicos */}
            {segments.map((segment) => {
              const labelPos = polarToCartesian(
                segment.midAngle,
                GAUGE_CONFIG.labelRadius,
                GAUGE_CONFIG.center
              );

              return (
                <g
                  key={segment.key}
                  onMouseEnter={(event) => handleTooltipMove(event, segment)}
                  onMouseMove={(event) => handleTooltipMove(event, segment)}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-default"
                >
                  {/* Línea divisoria sutil */}
                  <line
                    x1={polarToCartesian(segment.startAngle, GAUGE_CONFIG.arcRadius - 5, GAUGE_CONFIG.center).x}
                    y1={polarToCartesian(segment.startAngle, GAUGE_CONFIG.arcRadius - 5, GAUGE_CONFIG.center).y}
                    x2={polarToCartesian(segment.startAngle, GAUGE_CONFIG.arcRadius + 15, GAUGE_CONFIG.center).x}
                    y2={polarToCartesian(segment.startAngle, GAUGE_CONFIG.arcRadius + 15, GAUGE_CONFIG.center).y}
                    stroke={darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth="1"
                  />

                  {/* Punto indicador en el arco con color dinámico */}
                  <circle
                    cx={polarToCartesian(segment.midAngle, GAUGE_CONFIG.arcRadius, GAUGE_CONFIG.center).x}
                    cy={polarToCartesian(segment.midAngle, GAUGE_CONFIG.arcRadius, GAUGE_CONFIG.center).y}
                    r="6"
                    fill={segment.colorDinamico}
                    style={{
                      filter: `drop-shadow(0 0 8px ${segment.colorDinamico})`,
                    }}
                  />

                  {/* Etiqueta de la métrica (nombre) */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y - 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    fill={darkMode ? '#cbd5e1' : '#475569'}
                    fontSize="11"
                    fontWeight="600"
                    filter={darkMode ? 'url(#financeTextGlow)' : undefined}
                  >
                    {segment.label}
                  </text>

                  {/* Porcentaje con color dinámico (más grande y destacado) */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                    fill={segment.colorDinamico}
                    fontSize="16"
                    fontWeight="800"
                    filter="url(#financeTextGlow)"
                    style={{
                      textShadow: darkMode ? `0 0 10px ${segment.colorDinamico}60` : 'none',
                    }}
                  >
                    {segment.porcentaje.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* Aguja del gauge */}
            <line
              x1={GAUGE_CONFIG.center.x}
              y1={GAUGE_CONFIG.center.y}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#050505"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#financeNeedleShadow)"
              className="transition-all duration-700 ease-out"
            />

            {/* Círculo central */}
            <circle
              cx={GAUGE_CONFIG.center.x}
              cy={GAUGE_CONFIG.center.y}
              r="16"
              fill="#050505"
              stroke={darkMode ? '#475569' : '#cbd5e1'}
              strokeWidth="3"
            />

            {/* Punto central decorativo */}
            <circle
              cx={GAUGE_CONFIG.center.x}
              cy={GAUGE_CONFIG.center.y}
              r="5"
              fill={globalColor}
              style={{
                filter: `drop-shadow(0 0 10px ${globalColor})`,
              }}
            />
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg px-4 py-3 text-xs shadow-lg"
              style={{
                ...tooltipStyle,
                left: Math.min(tooltip.x, (tooltip.x as number) + 160 > 360 ? tooltip.x - 170 : tooltip.x),
                top: tooltip.y,
              }}
            >
              {tooltip.segment.isGroup && tooltip.segment.groupedMetrics ? (
                <div>
                  <div className="font-medium mb-2" style={{ color: tooltip.segment.colorDinamico }}>
                    {tooltip.segment.label} ({tooltip.segment.groupedMetrics.length} indicadores)
                  </div>
                  <div className="space-y-1">
                    {tooltip.segment.groupedMetrics.map((m) => (
                      <div key={m.key} className="flex justify-between gap-4">
                        <span className="opacity-90">{m.label}</span>
                        <span className="font-semibold" style={{ color: getColorByPercentage(m.porcentaje) }}>
                          {m.porcentaje.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium" style={{ color: tooltip.segment.colorDinamico }}>
                    {tooltip.segment.label}
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="text-[10px] opacity-80">
                      Aporte: {tooltip.segment.porcentaje.toFixed(1)}% del total
                    </div>
                    <div className="text-[10px] opacity-80">
                      Score base: {tooltip.segment.rawScore}/100
                    </div>
                    <div className="text-[10px] opacity-80">
                      Posición: {tooltip.segment.posicion}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}