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
import GaugeIndicators from './GaugeIndicators';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ComparisonViewProps {
  darkMode: boolean;
  dateRange: { from: string; to: string };
}

const COLORS = ['#38BDF8', '#F97316'];

const initialData = {
  bovinos: {
    total: 0,
    production: 0,
    revenue: 0,
    expenses: 0,
    births: 0,
    deaths: 0,
    sales: 0,
    diseases: 0,
  },

  gallinas: {
    total: 0,
    production: 0,
    revenue: 0,
    expenses: 0,
    births: 0,
    deaths: 0,
    sales: 0,
    diseases: 0,
  },

  monthly: [],
};

export default function ComparisonView({ darkMode }: ComparisonViewProps) {
  const [dashboardData, setDashboardData] = useState(initialData);

  useEffect(() => {

    const loadData = async () => {

      // ===== BOVINOS =====

      const { data: bovinosAnimales } = await supabase
        .from('animales')
        .select('*')
        .eq('id_tipo', 1);

      const { data: bovinosIngresos } = await supabase
        .from('ingresos')
        .select('*')
        .eq('id_tipo_animal', 1);

      const { data: bovinosGastos } = await supabase
        .from('gastos')
        .select('*')
        .eq('id_tipo_animal', 1);

      const { data: bovinos } = await supabase
        .from('animales')
        .select('*')
        .eq('id_tipo', 1);

      const bovinoIds =
        (bovinos || []).map((a: any) => a.id_animal);

      const { data: bovinosProduccion } = await supabase
        .from('produccion')
        .select('*')
        .in('id_animal', bovinoIds);

      const { data: bovinosNacimientos } = await supabase
        .from('nacimientos')
        .select('*')
        .eq('id_tipo_animal', 1);

      const { data: bovinosMuertes } = await supabase
        .from('muertes')
        .select('*')
        .eq('id_tipo_animal', 1);

      const { data: bovinosEnfermedades } = await supabase
        .from('enfermedades')
        .select('*')
        .eq('id_tipo_animal', 1);

      // ===== GALLINAS =====

      const { data: gallinasAnimales } = await supabase
        .from('animales')
        .select('*')
        .eq('id_tipo', 2);

      const { data: gallinasIngresos } = await supabase
        .from('ingresos')
        .select('*')
        .eq('id_tipo_animal', 2);

      const { data: gallinasGastos } = await supabase
        .from('gastos')
        .select('*')
        .eq('id_tipo_animal', 2);

      const { data: gallinas } = await supabase
        .from('animales')
        .select('*')
        .eq('id_tipo', 2);

      const gallinaIds =
        (gallinas || []).map((a: any) => a.id_animal);

      const { data: gallinasProduccion } = await supabase
        .from('produccion')
        .select('*')
        .in('id_animal', gallinaIds);

      const { data: gallinasNacimientos } = await supabase
        .from('nacimientos')
        .select('*')
        .eq('id_tipo_animal', 2);

      const { data: gallinasMuertes } = await supabase
        .from('muertes')
        .select('*')
        .eq('id_tipo_animal', 2);

      const { data: gallinasEnfermedades } = await supabase
        .from('enfermedades')
        .select('*')
        .eq('id_tipo_animal', 2);

      setDashboardData({
        bovinos: {
          total: bovinosAnimales?.length || 0,

          production:
            bovinosProduccion?.reduce(
              (acc, item) => acc + Number(item.cantidad || 0),
              0
            ) || 0,

          revenue:
            bovinosIngresos?.reduce(
              (acc, item) => acc + Number(item.monto || 0),
              0
            ) || 0,

          expenses:
            bovinosGastos?.reduce(
              (acc, item) => acc + Number(item.monto || 0),
              0
            ) || 0,

          births: bovinosNacimientos?.length || 0,
          deaths: bovinosMuertes?.length || 0,
          sales: bovinosIngresos?.length || 0,
          diseases: bovinosEnfermedades?.length || 0,
        },

        gallinas: {
          total: gallinasAnimales?.length || 0,

          production:
            gallinasProduccion?.reduce(
              (acc, item) => acc + Number(item.cantidad || 0),
              0
            ) || 0,

          revenue:
            gallinasIngresos?.reduce(
              (acc, item) => acc + Number(item.monto || 0),
              0
            ) || 0,

          expenses:
            gallinasGastos?.reduce(
              (acc, item) => acc + Number(item.monto || 0),
              0
            ) || 0,

          births: gallinasNacimientos?.length || 0,
          deaths: gallinasMuertes?.length || 0,
          sales: gallinasIngresos?.length || 0,
          diseases: gallinasEnfermedades?.length || 0,
        },

        monthly: [],
      });

    };

    loadData();

  }, []);

  const bovinosProfit = dashboardData.bovinos.revenue - dashboardData.bovinos.expenses;
  const gallinasProfit = dashboardData.gallinas.revenue - dashboardData.gallinas.expenses;
  const comparisonData = [
    { category: 'Ingresos', bovinos: dashboardData.bovinos.revenue, gallinas: dashboardData.gallinas.revenue },
    { category: 'Gastos', bovinos: dashboardData.bovinos.expenses, gallinas: dashboardData.gallinas.expenses },
    { category: 'Ganancias', bovinos: bovinosProfit, gallinas: gallinasProfit },
    { category: 'Producción', bovinos: dashboardData.bovinos.production, gallinas: dashboardData.gallinas.production },
  ];
  const monthlyComparison = dashboardData.monthly;
  const mortalityComparison = dashboardData.monthly.map((item: any) => ({
    month: item.month,
    bovinos: item.bovinosMuertes,
    gallinas: item.gallinasMuertes,
  }));
  const birthsComparison = dashboardData.monthly.map((item: any) => ({
    month: item.month,
    bovinos: item.bovinosNacimientos,
    gallinas: item.gallinasNacimientos,
  }));
  const totalRevenue = [
    { name: 'Bovinos', value: dashboardData.bovinos.revenue },
    { name: 'Gallinas', value: dashboardData.gallinas.revenue },
  ];
  const expenseBreakdown = [
    { category: 'Gastos', bovinos: dashboardData.bovinos.expenses, gallinas: dashboardData.gallinas.expenses },
    { category: 'Salud', bovinos: dashboardData.bovinos.diseases, gallinas: dashboardData.gallinas.diseases },
    { category: 'Producción', bovinos: dashboardData.bovinos.production, gallinas: dashboardData.gallinas.production },
    { category: 'Ventas', bovinos: dashboardData.bovinos.sales, gallinas: dashboardData.gallinas.sales },
    { category: 'Muertes', bovinos: dashboardData.bovinos.deaths, gallinas: dashboardData.gallinas.deaths },
  ];
  const performanceRadar = [
    {
      metric: 'Rentabilidad',
      bovinos: bovinosProfit,
      gallinas: gallinasProfit,
    },
    {
      metric: 'Producción',
      bovinos: dashboardData.bovinos.production,
      gallinas: dashboardData.gallinas.production,
    },
    {
      metric: 'Salud',
      bovinos: dashboardData.bovinos.diseases,
      gallinas: dashboardData.gallinas.diseases,
    },
    {
      metric: 'Ventas',
      bovinos: dashboardData.bovinos.sales,
      gallinas: dashboardData.gallinas.sales,
    },
    {
      metric: 'Muertes',
      bovinos: dashboardData.bovinos.deaths,
      gallinas: dashboardData.gallinas.deaths,
    },
  ];
  const chartCardClass = `rounded-xl border p-4 transition-all ${darkMode
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

  const kpiComparisons = [
    { title: 'Total Animales', metric: 'Animales', bovinos: dashboardData.bovinos.total, gallinas: dashboardData.gallinas.total },
    { title: 'Producción Total', metric: 'Producción', bovinos: dashboardData.bovinos.production, gallinas: dashboardData.gallinas.production },
    { title: 'Ganancias', metric: 'Ganancias', bovinos: bovinosProfit, gallinas: gallinasProfit },
    { title: 'Gastos', metric: 'Gastos', bovinos: dashboardData.bovinos.expenses, gallinas: dashboardData.gallinas.expenses },
    { title: 'Nacimientos', metric: 'Nacimientos', bovinos: dashboardData.bovinos.births, gallinas: dashboardData.gallinas.births },
    { title: 'Muertes', metric: 'Muertes', bovinos: dashboardData.bovinos.deaths, gallinas: dashboardData.gallinas.deaths },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Row 1: Category Comparison and Monthly Trends */}
      <div className="contents">
        <GaugeIndicators
          selectedLivestock="both"
          darkMode={darkMode}
        />

        {kpiComparisons.map((item) => (
          <div key={item.title} className={chartCardClass}>
            <h3 className={titleClass}>{item.title}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[item]}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="metric" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="bovinos" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="gallinas" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}

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
      <div className="contents">
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
      <div className="contents">
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
      <div className="contents">
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

