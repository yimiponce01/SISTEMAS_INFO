import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardData, DashboardMonthlyData } from '../lib/dashboardData';

type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';

interface TopProductiveMonthsProps {
  selectedLivestock: AnimalFilter;
  dateRange: { from: string; to: string };
  darkMode: boolean;
  dashboardData: DashboardData | null;
}

// Tipos de producción detallados por animal (sin emojis)
const PRODUCTION_TYPES = {
  bovinos: [
    { key: 'leche', label: 'Leche', unit: 'L' },
    { key: 'carne', label: 'Carne de vaca', unit: 'kg' },
    { key: 'alquiler', label: 'Alquiler de toro', unit: 'S/' },
  ],
  gallinas: [
    { key: 'huevos', label: 'Huevos', unit: 'unid' },
    { key: 'carne', label: 'Carne de gallina', unit: 'kg' },
    { key: 'pollitos', label: 'Pollitos bebé', unit: 'unid' },
  ],
};

// Colores por categoría - AZUL para bovinos, NARANJA para gallinas
const BOVINO_COLORS = ['#1E3A8A', '#3B82F6', '#93C5FD']; // Azul oscuro, normal, claro
const GALLINA_COLORS = ['#C2410C', '#F97316', '#FDBA74']; // Naranja oscuro, normal, claro

const getProductionColors = (selectedLivestock: AnimalFilter): Record<string, string> => {
  if (selectedLivestock === 'bovinos') {
    return {
      leche: BOVINO_COLORS[0],
      carne: BOVINO_COLORS[1],
      alquiler: BOVINO_COLORS[2],
    };
  }
  if (selectedLivestock === 'gallinas') {
    return {
      huevos: GALLINA_COLORS[0],
      carne: GALLINA_COLORS[1],
      pollitos: GALLINA_COLORS[2],
    };
  }
  // Ambos - combinar azul para bovinos y naranja para gallinas
  return {
    leche: BOVINO_COLORS[0],
    carneBovino: BOVINO_COLORS[1],
    alquiler: BOVINO_COLORS[2],
    huevos: GALLINA_COLORS[0],
    carneGallina: GALLINA_COLORS[1],
    pollitos: GALLINA_COLORS[2],
  };
};

interface ChartData {
  month: string;
  type: string;
  typeLabel: string;
  typeUnit: string;
  value: number;
}

export default function TopProductiveMonths({
  selectedLivestock,
  darkMode,
  dashboardData,
}: TopProductiveMonthsProps) {
  const monthlyData = dashboardData?.monthly || [];

  // Determinar qué tipos de producción mostrar según el filtro
  const productionTypes = selectedLivestock === 'ambos'
    ? [
        ...PRODUCTION_TYPES.bovinos.map(t => ({ ...t, key: t.key === 'carne' ? 'carneBovino' : t.key })),
        ...PRODUCTION_TYPES.gallinas.map(t => ({ ...t, key: t.key === 'carne' ? 'carneGallina' : t.key })),
      ]
    : PRODUCTION_TYPES[selectedLivestock];

  const colors = getProductionColors(selectedLivestock);

  // Preparar datos con desglose por tipo de producción
  const prepareDetailedData = (item: DashboardMonthlyData): ChartData[] => {
    const totalProduction = selectedLivestock === 'bovinos'
      ? item.bovinosProduccion
      : selectedLivestock === 'gallinas'
        ? item.gallinasProduccion
        : item.bovinosProduccion + item.gallinasProduccion;

    if (totalProduction === 0) return [];

    // Distribución por tipo (esto debería venir de la BD)
    const distributions: Record<string, number[]> = {
      bovinos: [0.6, 0.3, 0.1], // 60% leche, 30% carne, 10% alquiler
      gallinas: [0.7, 0.2, 0.1], // 70% huevos, 20% carne, 10% pollitos
    };

    const dist = selectedLivestock === 'ambos'
      ? distributions.bovinos // Por defecto para mix
      : distributions[selectedLivestock];

    return productionTypes.map((type, index) => ({
      month: item.month,
      type: type.key,
      typeLabel: type.label,
      typeUnit: type.unit,
      value: Math.round(totalProduction * dist[index]),
    }));
  };

  // Filtrar meses con producción
  const monthsWithProduction = monthlyData.filter((item) => {
    if (selectedLivestock === 'bovinos') return item.bovinosProduccion > 0;
    if (selectedLivestock === 'gallinas') return item.gallinasProduccion > 0;
    return item.bovinosProduccion > 0 || item.gallinasProduccion > 0;
  });

  // Preparar datos detallados
  const detailedData: ChartData[] = [];
  monthsWithProduction.forEach((item) => {
    detailedData.push(...prepareDetailedData(item));
  });

  // Agrupar por mes para el ranking
  const groupedByMonth = monthlyData.reduce((acc, item) => {
    const total = selectedLivestock === 'bovinos'
      ? item.bovinosProduccion
      : selectedLivestock === 'gallinas'
        ? item.gallinasProduccion
        : item.bovinosProduccion + item.gallinasProduccion;

    if (total > 0) {
      acc.push({ month: item.month, total });
    }
    return acc;
  }, [] as { month: string; total: number }[]);

  // Top 6 meses por producción total
  const topMonths = groupedByMonth
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Mes más productivo
  const topMonth = topMonths[0];

  // Filtrar datos solo para top meses
  const chartData = detailedData.filter((d) =>
    topMonths.some((m) => m.month === d.month)
  );

  const chartCardClass = `rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] ${
    darkMode
      ? 'bg-gradient-to-br from-slate-900/78 via-slate-950/70 to-cyan-950/18 border-cyan-300/18 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl hover:border-cyan-300/45 hover:shadow-cyan-500/20'
      : 'bg-white border-slate-200 shadow-sm'
  }`;
  const titleClass = `text-base font-light mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = {
    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
    border: `1px solid ${darkMode ? 'rgba(103, 232, 249, 0.25)' : 'rgba(203, 213, 225, 0.8)'}`,
    borderRadius: '12px',
    color: darkMode ? '#ffffff' : '#1e293b',
  };

  const formatTooltip = (value: unknown, name: string, props: any): [string, string] => {
    const entry = props?.payload;
    const label = entry?.typeLabel || name;
    const unit = entry?.typeUnit || '';
    const formatted = typeof value === 'number' ? value.toLocaleString() : String(value);
    
    // Formato especial para soles
    if (unit === 'S/') {
      return [`S/ ${formatted}`, label];
    }
    
    return [`${formatted} ${unit}`, label];
  };

  if (chartData.length === 0) {
    return (
      <div className={chartCardClass}>
        <h3 className={titleClass}>Top Meses Productivos</h3>
        <div className="flex items-center justify-center h-[280px]">
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No hay datos de producción en el rango seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={chartCardClass}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={titleClass}>Top Meses Productivos</h3>
        {topMonth && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-gradient-to-r from-cyan-100 to-purple-100 text-cyan-700 border border-cyan-200'
          }`}>
            🏆 {topMonth.month}: {topMonth.total.toLocaleString()}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#e2e8f0'} />
          <XAxis type="number" stroke={darkMode ? '#94a3b8' : '#64748b'} style={{ fontSize: '12px' }} />
          <YAxis
            dataKey="month"
            type="category"
            stroke={darkMode ? '#94a3b8' : '#64748b'}
            style={{ fontSize: '12px' }}
            width={55}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
          <Legend
            formatter={(value, entry) => {
              const type = productionTypes.find(t => t.key === entry.value);
              return (
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {type?.label}
                </span>
              );
            }}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => {
              const color = colors[entry.type as keyof typeof colors] || '#38BDF8';
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  opacity={1 - (Math.floor(index / productionTypes.length) * 0.1)}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda informativa */}
      <div className={`mt-3 flex items-center justify-center gap-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {productionTypes.map((type) => (
          <div key={type.key} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: colors[type.key as keyof typeof colors] }}
            />
            <span>{type.label}</span>
          </div>
        ))}
        <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
          | {topMonths.length} meses analizados
        </span>
      </div>
    </div>
  );
}