import { useState, type MouseEvent } from 'react';
import type { DashboardData } from '../lib/dashboardData';

interface GaugeIndicatorsProps {
  dashboardData: DashboardData | null;
  darkMode: boolean;
}

type Segment = {
  label: string;
  value: number;
};

type GaugeSegment = Segment & {
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
};

const segmentColors = ['#ef1d1d', '#ff8a00', '#ffd21f', '#8bdc22', '#00b84a'];
const center = { x: 380, y: 330 };
const arcRadius = 235;
const labelRadius = arcRadius;

function polarToCartesian(angle: number, radius: number) {
  const angleInRadians = (angle * Math.PI) / 180;

  return {
    x: center.x + radius * Math.cos(angleInRadians),
    y: center.y + radius * Math.sin(angleInRadians),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle, arcRadius);
  const end = polarToCartesian(endAngle, arcRadius);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(' ');
}

export default function GaugeIndicators({ dashboardData, darkMode }: GaugeIndicatorsProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    segment: GaugeSegment;
  } | null>(null);

  const totals = dashboardData?.totals;
  const mortalityRate = totals?.animales ? Math.round((totals.muertes / totals.animales) * 100) : 0;
  const expenseRate = totals?.ingresos ? Math.round((totals.gastos / totals.ingresos) * 100) : 0;
  const productionRate = totals?.produccion ? 100 : 0;
  const profitRate = totals?.ingresos ? Math.round((totals.ganancias / totals.ingresos) * 100) : 0;
  const healthRate = Math.round(dashboardData?.healthGauge.green || 0);

  const indicatorSegments: Segment[] = [
    { label: 'Mortalidad', value: mortalityRate || 1 },
    { label: 'Gastos', value: expenseRate || 1 },
    { label: 'Rendimiento', value: Math.max(profitRate, 1) },
    { label: 'Producción', value: productionRate || 1 },
    { label: 'Salud', value: healthRate || 1 },
  ];

  console.log('[GaugeIndicators] values', {
    totals,
    indicatorSegments,
  });

  const sortedSegments = [...indicatorSegments].sort((a, b) => a.value - b.value);
  const total = sortedSegments.reduce((acc, segment) => acc + segment.value, 0);
  let currentAngle = 180;

  const segments: GaugeSegment[] = sortedSegments.map((segment, index) => {
    const sweep = (segment.value / total) * 180;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweep;

    currentAngle = endAngle;

    return {
      ...segment,
      color: segmentColors[index],
      startAngle,
      endAngle,
      midAngle: startAngle + sweep / 2,
    };
  });

  const maxSegment = segments.reduce((highest, segment) =>
    segment.value > highest.value ? segment : highest
  );
  const needleEnd = polarToCartesian(maxSegment.midAngle, 205);
  const titleColor = darkMode ? 'text-white' : 'text-slate-800';
  const percentageColor = darkMode ? '#ffffff' : '#1e3a8a';
  const tooltipStyle = {
    backgroundColor: '#1E293B',
    border: `1px solid ${darkMode ? '#475569' : '#334155'}`,
    color: '#FFFFFF',
  };

  const handleTooltipMove = (event: MouseEvent<SVGGElement>, segment: GaugeSegment) => {
    const bounds = event.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();

    if (!bounds) return;

    setTooltip({
      x: event.clientX - bounds.left + 14,
      y: event.clientY - bounds.top - 10,
      segment,
    });
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] ${darkMode
        ? 'bg-gradient-to-br from-slate-900/78 via-slate-950/70 to-cyan-950/18 border-cyan-300/18 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl hover:border-cyan-300/45 hover:shadow-cyan-500/20'
        : 'bg-white border-slate-200 shadow-sm'
        }`}
    >
      <h3 className={`text-base font-light mb-3 ${titleColor}`}>
        Semáforo General de Rendimiento
      </h3>

      <div className="flex h-[220px] justify-center">
        <div className="relative h-full w-full">
          <svg
            viewBox="85 40 590 340"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Semaforo general de rendimiento por porcentajes"
          >
            {segments.map((segment) => {
              const labelPosition = polarToCartesian(segment.midAngle, labelRadius);

              return (
                <g
                  key={segment.label}
                  onMouseEnter={(event) => handleTooltipMove(event, segment)}
                  onMouseMove={(event) => handleTooltipMove(event, segment)}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-default"
                >
                  <path
                    d={describeArc(segment.startAngle, segment.endAngle)}
                    stroke={segment.color}
                    strokeWidth="94"
                    strokeLinecap="butt"
                    fill="none"
                  />

                  <text
                    x={labelPosition.x}
                    y={labelPosition.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    <tspan
                      x={labelPosition.x}
                      fill={percentageColor}
                      fontSize="21"
                      fontWeight="600"
                    >
                      {segment.value}%
                    </tspan>
                  </text>
                </g>
              );
            })}

            <line
              x1={center.x}
              y1={center.y}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#050505"
              strokeWidth="7"
              strokeLinecap="round"
              className="transition-all duration-700"
            />

            <circle
              cx={center.x}
              cy={center.y}
              r="21"
              fill="#050505"
              stroke="#d1d5db"
              strokeWidth="5"
            />
          </svg>

          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg px-3 py-2 text-sm shadow-lg"
              style={{
                ...tooltipStyle,
                left: tooltip.x,
                top: tooltip.y,
              }}
            >
              <div className="font-medium text-white">{tooltip.segment.label}</div>
              <div style={{ color: tooltip.segment.color }}>
                {tooltip.segment.value}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
