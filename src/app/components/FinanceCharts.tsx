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
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 3 }} />
            <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 3 }} />
            <Line type="monotone" dataKey="ganancias" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={chartCardClass}>
        <h3 className={titleClass}>Rentabilidad y Balance</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="balance" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.28} />
            <Area type="monotone" dataKey="rentabilidad" stroke="#a855f7" fill="#a855f7" fillOpacity={0.28} />
          </AreaChart>
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
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="ingresos" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ventas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
