import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import GaugeIndicators from './GaugeIndicators';
import HealthGauge from './HealthGauge';
import TopProductiveMonths from './TopProductiveMonths';
import type { DashboardData } from '../lib/dashboardData';

type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';

interface ChartsSectionProps {
  selectedLivestock: AnimalFilter;
  dateRange: { from: string; to: string };
  darkMode: boolean;
  dashboardData: DashboardData | null;
}

const COLORS = ['#38BDF8', '#F97316', '#22C55E', '#EAB308', '#EF4444'];

const formatTooltip = (value: unknown, name: string): [string, string] => {
  const formatted = typeof value === 'number' ? value.toFixed(2) : String(value);
  const labels: Record<string, string> = {
    bovinos: 'Bovinos',
    gallinas: 'Gallinas',
    bovinosMuertes: 'Muertes Bovinos',
    gallinasMuertes: 'Muertes Gallinas',
    nacimientos: 'Nacimientos',
    muertes: 'Muertes',
    produccion: 'Producción',
    ventas: 'Ventas',
    ingresos: 'Ingresos',
    gastos: 'Gastos',
  };
  return [formatted, labels[name] || name];
};

export default function ChartsSection({ selectedLivestock, darkMode, dashboardData }: ChartsSectionProps) {
  const monthlyData = dashboardData?.monthly || [];
  const totals = dashboardData?.totals || {
    produccion: 0,
    nacimientos: 0,
    muertes: 0,
    ingresos: 0,
    gastos: 0,
    ganancias: 0,
    ventas: 0,
  };
  const healthGaugeData = dashboardData?.healthGauge || { red: 0, yellow: 0, green: 0 };

  const productionData = monthlyData.map((item) => {
    if (selectedLivestock === 'ambos') return item;

    const prefix = selectedLivestock === 'bovinos' ? 'bovinos' : 'gallinas';

    return {
      month: item.month,
      produccion: item[`${prefix}Produccion` as keyof typeof item] as number,
      nacimientos: item[`${prefix}Nacimientos` as keyof typeof item] as number,
      muertes: item[`${prefix}Muertes` as keyof typeof item] as number,
      ingresos: item[`${prefix}Ingresos` as keyof typeof item] as number,
      gastos: item[`${prefix}Gastos` as keyof typeof item] as number,
      ventas: item[`${prefix}Ventas` as keyof typeof item] as number,
    };
  });

  const distributionData = [
    { name: 'Producción', value: totals.produccion },
    { name: 'Ventas', value: totals.ventas },
    { name: 'Ganancias', value: totals.ganancias },
  ];

  const performanceData = [
    { metric: 'Productividad', value: totals.produccion },
    { metric: 'Rendimiento', value: totals.ganancias },
    { metric: 'Eficiencia', value: Math.max(totals.ingresos - totals.gastos, 0) },
    { metric: 'Salud', value: healthGaugeData.green },
    { metric: 'Ingresos', value: totals.ingresos },
    { metric: 'Ventas', value: totals.ventas },
  ];

  const topData = productionData
    .map((item: any) => ({
      id: item.month,
      production: Number(item.produccion || 0),
    }))
    .sort((a: any, b: any) => b.production - a.production)
    .slice(0, 5);

  const comparisonData = monthlyData.map((item) => ({
    month: item.month,
    bovinos: item.bovinosProduccion,
    gallinas: item.gallinasProduccion,
    total: item.bovinosProduccion + item.gallinasProduccion,
    bovinosMuertes: item.bovinosMuertes,
    gallinasMuertes: item.gallinasMuertes,
  }));

  console.log('[ChartsSection] values', {
    selectedLivestock,
    totals,
    monthlyData,
  });

  const primaryColor = selectedLivestock === 'gallinas' ? '#F97316' : '#38BDF8';
  const chartCardClass = `rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] ${
    darkMode
      ? 'bg-gradient-to-br from-slate-900/78 via-slate-950/70 to-cyan-950/18 border-cyan-300/18 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl hover:border-cyan-300/45 hover:shadow-cyan-500/20'
      : 'bg-white border-slate-200 shadow-sm'
  }`;
  const titleClass = `text-base font-light mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(103, 232, 249, 0.25)',
    borderRadius: '12px',
    color: '#ffffff',
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <GaugeIndicators dashboardData={dashboardData} darkMode={darkMode} />

      <div className={chartCardClass}>
        <h3 className={titleClass}>Producción Mensual</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={selectedLivestock === 'ambos' ? comparisonData : productionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {selectedLivestock === 'ambos' ? (
              <>
                <Bar dataKey="bovinos" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="gallinas" fill="#F97316" radius={[6, 6, 0, 0]} />
              </>
            ) : (
              <Bar dataKey="produccion" fill={primaryColor} radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Productividad y Salud</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={performanceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis dataKey="metric" type="category" width={95} stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Bar dataKey="value" fill="url(#performanceGradient)" radius={[0, 8, 8, 0]} />
            <defs>
              <linearGradient id="performanceGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Nacimientos vs Muertes</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  nacimientos: 'Nacimientos',
                  muertes: 'Muertes',
                };
                return <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{labels[value] || value}</span>;
              }}
            />
            <Area
              type="monotone"
              dataKey="nacimientos"
              name="Nacimientos"
              stroke="#22C55E"
              fill="#22C55E"
              fillOpacity={0.35}
            />
            <Area
              type="monotone"
              dataKey="muertes"
              name="Muertes"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.35}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Distribución de Producción</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={distributionData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={82}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Mortalidad Comparativa</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="bovinosMuertes" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.35} />
            <Area type="monotone" dataKey="gallinasMuertes" stroke="#F97316" fill="#F97316" fillOpacity={0.35} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Comparación de Producción Mensual</h3>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="bovinos" name="Bovinos" fill="#38BDF8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="gallinas" name="Gallinas" fill="#F97316" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#67e8f9" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Top Meses Productivos - Componente mejorado */}
      <TopProductiveMonths
        selectedLivestock={selectedLivestock}
        dateRange={{ from: '', to: '' }}
        darkMode={darkMode}
        dashboardData={dashboardData}
      />

      <div className={chartCardClass}>
        <h3 className={titleClass}>Semáforo de Salud</h3>
        <HealthGauge data={healthGaugeData} darkMode={darkMode} />
      </div>
    </div>
  );
}
