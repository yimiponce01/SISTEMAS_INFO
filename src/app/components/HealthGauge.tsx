import { useEffect, useMemo, useState } from 'react';

interface HealthGaugeProps {
  data: {
    red: number;
    yellow: number;
    green: number;
  };
  darkMode: boolean;
}

const center = { x: 180, y: 172 };
const radius = 126;
const arcWidth = 26;

function polarToCartesian(angle: number, distance = radius) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: center.x + distance * Math.cos(radians),
    y: center.y + distance * Math.sin(radians),
  };
}

function describeArc(startAngle: number, endAngle: number, distance = radius) {
  const start = polarToCartesian(startAngle, distance);
  const end = polarToCartesian(endAngle, distance);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${distance} ${distance} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(' ');
}

export default function HealthGauge({ data, darkMode }: HealthGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(180);

  const segments = useMemo(
    () => [
      {
        key: 'red',
        label: 'Crítico',
        value: Math.max(0, data.red),
        color: '#ff4d5e',
        glow: 'rgba(255, 77, 94, 0.58)',
        start: 180,
        end: 238,
      },
      {
        key: 'yellow',
        label: 'Regular',
        value: Math.max(0, data.yellow),
        color: '#ffd447',
        glow: 'rgba(255, 212, 71, 0.58)',
        start: 244,
        end: 296,
      },
      {
        key: 'green',
        label: 'Excelente',
        value: Math.max(0, data.green),
        color: '#35ff93',
        glow: 'rgba(53, 255, 147, 0.58)',
        start: 302,
        end: 360,
      },
    ],
    [data.red, data.yellow, data.green]
  );

  const highest = useMemo(
    () => segments.reduce((current, item) => (item.value > current.value ? item : current)),
    [segments]
  );

  const displayStatus =
    highest.key === 'green'
      ? highest.value >= 75
        ? 'Excelente'
        : 'Bueno'
      : highest.key === 'yellow'
        ? 'Regular'
        : 'Riesgo';

  const targetAngle = (highest.start + highest.end) / 2;
  const needleEnd = polarToCartesian(animatedAngle, 92);
  const needleBaseLeft = polarToCartesian(animatedAngle + 92, 9);
  const needleBaseRight = polarToCartesian(animatedAngle - 92, 9);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimatedAngle(targetAngle), 80);
    return () => window.clearTimeout(timer);
  }, [targetAngle]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-8 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto h-[292px] max-w-[420px]">
        <svg viewBox="0 0 360 275" className="h-full w-full overflow-visible">
          <defs>
            <filter id="healthGaugeBloom" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="healthGaugeCore" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
              <stop offset="52%" stopColor="rgba(15,23,42,0.72)" />
              <stop offset="100%" stopColor="rgba(2,6,23,0)" />
            </radialGradient>
          </defs>

          <path
            d={describeArc(180, 360)}
            stroke={darkMode ? 'rgba(15, 23, 42, 0.94)' : 'rgba(226, 232, 240, 0.9)'}
            strokeWidth={arcWidth + 8}
            strokeLinecap="round"
            fill="none"
          />

          {segments.map((segment) => {
            const mid = (segment.start + segment.end) / 2;
            const labelPosition = polarToCartesian(mid, 96);
            const tickPosition = polarToCartesian(mid, 144);

            return (
              <g key={segment.key}>
                <path
                  d={describeArc(segment.start, segment.end)}
                  stroke={segment.color}
                  strokeWidth={arcWidth}
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#healthGaugeBloom)"
                  style={{
                    filter: `drop-shadow(0 0 10px ${segment.glow}) drop-shadow(0 0 22px ${segment.glow})`,
                  }}
                />
                <circle cx={tickPosition.x} cy={tickPosition.y} r="3.5" fill={segment.color} opacity="0.9" />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="700"
                >
                  {segment.value.toFixed(0)}%
                </text>
              </g>
            );
          })}

          <circle cx={center.x} cy={center.y} r="74" fill="url(#healthGaugeCore)" opacity="0.85" />
          <path
            d={`M ${needleBaseLeft.x.toFixed(2)} ${needleBaseLeft.y.toFixed(2)} L ${needleEnd.x.toFixed(2)} ${needleEnd.y.toFixed(2)} L ${needleBaseRight.x.toFixed(2)} ${needleBaseRight.y.toFixed(2)} Z`}
            fill="#050505"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
            style={{ transition: 'all 760ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
          <circle
            cx={center.x}
            cy={center.y}
            r="18"
            fill="#050505"
            stroke="#e2e8f0"
            strokeWidth="4"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.24))',
            }}
          />
          <circle cx={center.x} cy={center.y} r="5" fill="#94a3b8" />
        </svg>

        <div className="absolute inset-x-0 bottom-2 text-center">
          <div
            className="text-4xl font-light text-white"
            style={{ textShadow: `0 0 18px ${highest.glow}, 0 0 32px ${highest.glow}` }}
          >
            {highest.value.toFixed(0)}%
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-300">
            {displayStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
