import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FinanceGaugeIndicators from './FinanceGaugeIndicators';
import type { DashboardData } from '../lib/dashboardData';

type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';

interface FinanceChartsProps {
  selectedLivestock: AnimalFilter;
  dateRange: { from: string; to: string };
  darkMode: boolean;
  dashboardData: DashboardData | null;
}

const formatTooltip = (value: unknown): [string] =>
  typeof value === 'number' ? [value.toFixed(2)] : [String(value)];

export default function FinanceCharts({ selectedLivestock, darkMode, dashboardData }: FinanceChartsProps) {
  const monthlyData = dashboardData?.monthly || [];
  const totals = dashboardData?.totals || {
    ingresos: 0,
    gastos: 0,
    ganancias: 0,
    ventas: 0,
    balance: 0,
    rentabilidad: 0,
  };

  const comparisonData = [
    { metric: 'Ganancias', value: totals.ganancias },
    { metric: 'Ingresos', value: totals.ingresos },
    { metric: 'Gastos', value: totals.gastos },
    { metric: 'Ventas', value: totals.ventas },
    { metric: 'Rentabilidad', value: totals.rentabilidad },
    { metric: 'Balance', value: totals.balance },
  ];

  console.log('[FinanceCharts] values', {
    selectedLivestock,
    totals,
    monthlyData,
  });

  const chartCardClass = `rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] ${
    darkMode
      ? 'bg-gradient-to-br from-slate-900/78 via-slate-950/70 to-amber-950/18 border-amber-300/18 shadow-2xl shadow-amber-950/30 backdrop-blur-2xl hover:border-amber-300/45 hover:shadow-amber-500/20'
      : 'bg-white border-slate-200 shadow-sm'
  }`;
  const titleClass = `text-base font-light mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`;
  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(252, 211, 77, 0.25)',
    borderRadius: '12px',
    color: '#ffffff',
  };

  const topMesRentable = [...monthlyData]
  .map(item => ({
    ...item,
    rentabilidadMes:
      Number(item.ingresos || 0) -
      Number(item.gastos || 0)
  }))
  .sort((a, b) => b.rentabilidadMes - a.rentabilidadMes)[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Semáforo Financiero - PRIMER ELEMENTO */}
      <FinanceGaugeIndicators dashboardData={dashboardData} darkMode={darkMode} />

      <div className={chartCardClass}>
        <h3 className={titleClass}>Evolución Financiera</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode
                  ? 'rgba(15,23,42,0.95)'
                  : 'rgba(255,255,255,0.95)',
                border: darkMode
                  ? '1px solid #334155'
                  : '1px solid #cbd5e1',
                borderRadius: '12px',
                color: darkMode ? '#fff' : '#000',
              }}
              formatter={(value: any, name: string) => {
                const labels: Record<string, string> = {
                  ingresos: 'Ingresos',
                  gastos: 'Gastos',
                  ganancias: 'Ganancias',
                };

                return [
                  `S/ ${Number(value).toLocaleString()}`,
                  labels[name] || name,
                ];
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: '12px',
                color: darkMode ? '#ffffff' : '#000000',
              }}
              formatter={(value) => {
                const colors: Record<string, string> = {
                  ingresos: '#22c55e',
                  gastos: '#ef4444',
                  ganancias: '#facc15',
                };

                const labels: Record<string, string> = {
                  ingresos: 'Ingresos',
                  gastos: 'Gastos',
                  ganancias: 'Ganancias',
                };

                return (
                  <span
                    style={{
                      color: colors[value] || (darkMode ? '#fff' : '#000'),
                      fontWeight: 500,
                    }}
                  >
                    {labels[value] || value}
                  </span>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 3 }} />
            <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 3 }} />
            <Line type="monotone" dataKey="ganancias" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={titleClass}>Top Meses Más Rentables</h3>

          {topMesRentable && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                darkMode
                  ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              🏆 {topMesRentable.month}: S/ {topMesRentable.rentabilidadMes.toLocaleString()}
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={[...monthlyData]
              .map(item => ({
                ...item,
                rentabilidadMes:
                  Number(item.ingresos || 0) -
                  Number(item.gastos || 0)
              }))
              .sort((a, b) => b.rentabilidadMes - a.rentabilidadMes)
              .slice(0, 6)}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

            <XAxis
              type="number"
              stroke="#94a3b8"
            />

            <YAxis
              dataKey="month"
              type="category"
              stroke="#94a3b8"
            />

            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: any) => [
                `S/ ${Number(value).toLocaleString()}`,
                'Ganancia'
              ]}
            />

            <Bar
              dataKey="rentabilidadMes"
              fill="#22c55e"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Comparación Financiera</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis dataKey="metric" type="category" width={95} stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Bar dataKey="value" fill="url(#financeGradient)" radius={[0, 8, 8, 0]} />
            <defs>
              <linearGradient id="financeGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Ventas e Ingresos por Mes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode
                  ? 'rgba(15,23,42,0.95)'
                  : 'rgba(255,255,255,0.92)',
                border: darkMode
                  ? '1px solid rgba(59,130,246,0.3)'
                  : '1px solid rgba(203,213,225,0.8)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{
                color: darkMode ? '#ffffff' : '#000000',
                fontWeight: 600
              }}
              formatter={(value: number, name: string) => {
                switch (name) {
                  case 'ingresos':
                    return [`S/ ${Number(value).toLocaleString()}`, 'Ingresos'];

                  case 'ventas':
                    return [Number(value).toLocaleString(), 'Ventas'];

                  default:
                    return [value, name];
                }
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ventas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
