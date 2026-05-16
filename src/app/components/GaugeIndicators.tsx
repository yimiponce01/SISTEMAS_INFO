interface GaugeIndicatorsProps {
  selectedLivestock: 'bovinos' | 'gallinas' | 'both';
  darkMode: boolean;
}

const GaugeCircle = ({
  value,
  label,
  color,
  darkMode
}: {
  value: number;
  label: string;
  color: 'green' | 'yellow' | 'red';
  darkMode: boolean;
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: darkMode ? 'bg-green-500/20' : 'bg-green-50',
          ring: 'ring-green-500',
          glow: 'shadow-green-500/50',
          text: 'text-green-600',
          fill: 'text-green-500',
        };
      case 'yellow':
        return {
          bg: darkMode ? 'bg-amber-500/20' : 'bg-amber-50',
          ring: 'ring-amber-500',
          glow: 'shadow-amber-500/50',
          text: 'text-amber-600',
          fill: 'text-amber-500',
        };
      case 'red':
        return {
          bg: darkMode ? 'bg-red-500/20' : 'bg-red-50',
          ring: 'ring-red-500',
          glow: 'shadow-red-500/50',
          text: 'text-red-600',
          fill: 'text-red-500',
        };
    }
  };

  const colors = getColorClasses();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative p-4 rounded-xl border transition-all hover:scale-105 ${
      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
    } ${colors.bg}`}>
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-3">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${colors.fill} transition-all duration-1000 ease-out drop-shadow-lg ${colors.glow}`}
              style={{
                filter: `drop-shadow(0 0 8px currentColor)`,
              }}
            />
          </svg>
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-light ${colors.text}`}>{value}%</span>
          </div>
        </div>
        <div className={`text-sm font-light ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default function GaugeIndicators({ selectedLivestock, darkMode }: GaugeIndicatorsProps) {
  const getGaugeData = () => {
    if (selectedLivestock === 'bovinos') {
      return [
        { value: 92, label: 'Salud General', color: 'green' as const },
        { value: 85, label: 'Rendimiento', color: 'green' as const },
        { value: 12, label: 'Mortalidad', color: 'yellow' as const },
        { value: 88, label: 'Producción', color: 'green' as const },
      ];
    } else if (selectedLivestock === 'gallinas') {
      return [
        { value: 84, label: 'Salud General', color: 'green' as const },
        { value: 91, label: 'Rendimiento', color: 'green' as const },
        { value: 8, label: 'Mortalidad', color: 'green' as const },
        { value: 94, label: 'Producción', color: 'green' as const },
      ];
    } else {
      return [
        { value: 88, label: 'Salud General', color: 'green' as const },
        { value: 87, label: 'Rendimiento', color: 'green' as const },
        { value: 10, label: 'Mortalidad', color: 'yellow' as const },
        { value: 91, label: 'Producción', color: 'green' as const },
      ];
    }
  };

  const gauges = getGaugeData();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {gauges.map((gauge, idx) => (
        <GaugeCircle
          key={idx}
          value={gauge.value}
          label={gauge.label}
          color={gauge.color}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}
