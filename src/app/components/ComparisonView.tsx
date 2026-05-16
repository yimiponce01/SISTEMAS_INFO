import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendingUp, Award, AlertTriangle, Target } from 'lucide-react';

interface ComparisonViewProps {
  darkMode: boolean;
  dateRange: { from: string; to: string };
}

const comparisonData = [
  { category: 'Ingresos', bovinos: 125000, gallinas: 98500 },
  { category: 'Gastos', bovinos: 45000, gallinas: 38000 },
  { category: 'Ganancias', bovinos: 80000, gallinas: 60500 },
  { category: 'Producción', bovinos: 12450, gallinas: 45600 },
];

const monthlyComparison = [
  { month: 'Ene', bovinos: 18000, gallinas: 15000, bovinosProduccion: 3200, gallinasProduccion: 8200 },
  { month: 'Feb', bovinos: 19500, gallinas: 17500, bovinosProduccion: 3400, gallinasProduccion: 8800 },
  { month: 'Mar', bovinos: 22000, gallinas: 19000, bovinosProduccion: 3800, gallinasProduccion: 9200 },
  { month: 'Abr', bovinos: 24000, gallinas: 20500, bovinosProduccion: 4100, gallinasProduccion: 9600 },
  { month: 'May', bovinos: 26500, gallinas: 22000, bovinosProduccion: 4450, gallinasProduccion: 9800 },
];

const mortalityComparison = [
  { month: 'Ene', bovinos: 2, gallinas: 12 },
  { month: 'Feb', bovinos: 3, gallinas: 8 },
  { month: 'Mar', bovinos: 1, gallinas: 10 },
  { month: 'Abr', bovinos: 2, gallinas: 9 },
  { month: 'May', bovinos: 4, gallinas: 11 },
];

const birthsComparison = [
  { month: 'Ene', bovinos: 8, gallinas: 45 },
  { month: 'Feb', bovinos: 12, gallinas: 68 },
  { month: 'Mar', bovinos: 15, gallinas: 82 },
  { month: 'Abr', bovinos: 10, gallinas: 72 },
  { month: 'May', bovinos: 18, gallinas: 95 },
];

const performanceRadar = [
  { metric: 'Rentabilidad', bovinos: 85, gallinas: 72 },
  { metric: 'Productividad', bovinos: 78, gallinas: 88 },
  { metric: 'Salud', bovinos: 92, gallinas: 84 },
  { metric: 'Crecimiento', bovinos: 68, gallinas: 82 },
  { metric: 'Eficiencia', bovinos: 75, gallinas: 79 },
  { metric: 'Sostenibilidad', bovinos: 81, gallinas: 76 },
];

const totalRevenue = [
  { name: 'Bovinos', value: 125000 },
  { name: 'Gallinas', value: 98500 },
];

const expenseBreakdown = [
  { category: 'Alimentación', bovinos: 18000, gallinas: 15000 },
  { category: 'Salud', bovinos: 12000, gallinas: 9000 },
  { category: 'Infraestructura', bovinos: 8000, gallinas: 7000 },
  { category: 'Personal', bovinos: 5000, gallinas: 5000 },
  { category: 'Otros', bovinos: 2000, gallinas: 2000 },
];

const COLORS = ['#38BDF8', '#F97316'];

export default function ComparisonView({ darkMode }: ComparisonViewProps) {
  const chartCardClass = `rounded-xl border p-4 transition-all ${
    darkMode
      ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
      : 'bg-white border-slate-200 shadow-sm'
  }`;

  const titleClass = `text-base font-light mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`;

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
    border: `1px solid ${darkMode ? '#475569' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: darkMode ? '#FFFFFF' : '#000000',
  };

  const insights = [
    {
      icon: Award,
      title: 'Bovinos generaron más ingresos',
      value: '+27%',
      color: 'blue',
      description: 'Los bovinos generaron $26,500 más en ganancias netas',
    },
    {
      icon: TrendingUp,
      title: 'Gallinas tienen mejor crecimiento',
      value: '+14%',
      color: 'orange',
      description: 'La producción avícola creció más rápido en el último trimestre',
    },
    {
      icon: AlertTriangle,
      title: 'Mortalidad bovina mayor',
      value: '3.2%',
      color: 'red',
      description: 'La mortalidad bovina es 1.8% mayor que la avícola',
    },
    {
      icon: Target,
      title: 'Eficiencia avícola superior',
      value: '+8%',
      color: 'green',
      description: 'Las gallinas tienen mejor relación costo-beneficio',
    },
  ];

  return (
    <div className="space-y-4">
      {/* AI Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          const colorClasses = {
            blue: {
              bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
              border: 'border-blue-200',
              icon: 'text-blue-600',
            },
            orange: {
              bg: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
              border: 'border-orange-200',
              icon: 'text-orange-600',
            },
            red: {
              bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
              border: 'border-red-200',
              icon: 'text-red-600',
            },
            green: {
              bg: darkMode ? 'bg-green-500/10' : 'bg-green-50',
              border: 'border-green-200',
              icon: 'text-green-600',
            },
          };
          const colors = colorClasses[insight.color as keyof typeof colorClasses];

          return (
            <div key={idx} className={`${chartCardClass} ${colors.bg} border ${colors.border}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xl font-light ${colors.icon} mb-0.5`}>{insight.value}</div>
                  <div className={`text-xs font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {insight.title}
                  </div>
                  <div className={`text-xs font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {insight.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 1: Category Comparison and Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Comparison Bar Chart */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Comparación por Categoría</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="bovinos" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gallinas" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Evolución de Ganancias Mensuales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="bovinos" stroke="#38BDF8" strokeWidth={2} dot={{ fill: '#38BDF8', r: 3 }} />
              <Line type="monotone" dataKey="gallinas" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Revenue Distribution and Mortality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Distribution */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Distribución de Ingresos Totales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={totalRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {totalRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mortality Comparison */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Mortalidad Comparativa</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mortalityComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="bovinos" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.5} />
              <Area type="monotone" dataKey="gallinas" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Production Comparison and Births */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Production Comparison */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Comparación de Producción Mensual</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="bovinosProduccion" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gallinasProduccion" fill="#F97316" radius={[6, 6, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Births Comparison */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Nacimientos Comparativos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={birthsComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="bovinos" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gallinas" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Performance Radar and Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Radar */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Análisis de Rendimiento Multidimensional</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={performanceRadar}>
              <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="metric" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '11px' }} />
              <PolarRadiusAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Bovinos" dataKey="bovinos" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.5} />
              <Radar name="Gallinas" dataKey="gallinas" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Desglose de Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseBreakdown} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis dataKey="category" type="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="bovinos" fill="#38BDF8" radius={[0, 6, 6, 0]} />
              <Bar dataKey="gallinas" fill="#F97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
