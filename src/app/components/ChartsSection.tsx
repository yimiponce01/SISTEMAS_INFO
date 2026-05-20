import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
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
  ComposedChart,
} from 'recharts';
import GaugeIndicators from './GaugeIndicators';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface ChartsSectionProps {
  selectedLivestock:
  | 'bovinos'
  | 'gallinas'
  | 'both';
  dateRange: { from: string; to: string };
  darkMode: boolean;
}

const COLORS = ['#38BDF8', '#F97316', '#22C55E', '#EAB308', '#EF4444'];

export default function ChartsSection({
  selectedLivestock,
  dateRange,
  darkMode
}: ChartsSectionProps) {

  const [monthlyData, setMonthlyData] =
    useState<any[]>([]);



  useEffect(() => {

    const loadChartsData = async () => {

      const tipo =
        selectedLivestock === 'bovinos'
          ? 1
          : 2;

      const { data: animales = [] } = await supabase
        .from('animales')
        .select('*')
        .in(
          'id_tipo',
          selectedLivestock === 'bovinos'
            ? [1]
            : [2]
        );

      const animalIds =
        (animales || []).map(
          (a: any) => a.id_animal
        );

      // ===== PRODUCCION =====

      const { data: produccion } =
        await supabase
          .from('produccion')
          .select('*')
          .in('id_animal', animalIds);

      // ===== NACIMIENTOS =====

      const { data: nacimientos } =
        await supabase
          .from('nacimientos')
          .select('*')
          .or(
            `id_madre.in.(${animalIds.join(',')}),id_padre.in.(${animalIds.join(',')})`
          );

      // ===== MUERTES =====

      const { data: muertes } =
        await supabase
          .from('muertes')
          .select('*')
          .in('id_animal', animalIds);

      // ===== INGRESOS =====

      const { data: ingresos } =
        await supabase
          .from('ingresos')
          .select('*')
          .in(
            'id_tipo_animal',
            selectedLivestock === 'both'
              ? [1, 2]
              : selectedLivestock === 'bovinos'
                ? [1]
                : [2]
          );

      // ===== GASTOS =====

      const { data: gastos } =
        await supabase
          .from('gastos')
          .select('*')
          .eq('id_tipo_animal', tipo);



      // =========================
      // PRODUCCION DATA
      // =========================

      const totalProduccion =
        produccion?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.produccion || 0),
          0
        ) || 0;

      const totalRevenue =
        ingresos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const totalGastos =
        gastos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
      ];

      const monthlyMap: any = {};

      months.forEach((month) => {
        monthlyMap[month] = {
          month,

          bovinosProduccion: 0,
          gallinasProduccion: 0,

          bovinosNacimientos: 0,
          gallinasNacimientos: 0,

          bovinosMuertes: 0,
          gallinasMuertes: 0,

          bovinosGastos: 0,
          gallinasGastos: 0,

          bovinosGanancias: 0,
          gallinasGanancias: 0,

          bovinosVentas: 0,
          gallinasVentas: 0,

          bovinosIngresos: 0,
          gallinasIngresos: 0,
        };
      });

      produccion?.forEach((item: any) => {

        const date = new Date(item.fecha);

        const month =
          months[date.getMonth()];

        if (selectedLivestock === 'bovinos') {

          monthlyMap[month]
            .bovinosProduccion +=
            Number(item.cantidad || 0);

        } else {

          monthlyMap[month]
            .gallinasProduccion +=
            Number(item.cantidad || 0);

        }

      });

      ingresos?.forEach((item: any) => {

        const date = new Date(item.fecha);

        const month =
          months[date.getMonth()];

        if (selectedLivestock === 'bovinos') {

          monthlyMap[month]
            .bovinosIngresos +=
            Number(item.monto || 0);

          monthlyMap[month]
            .bovinosVentas += 1;

        } else {

          monthlyMap[month]
            .gallinasIngresos +=
            Number(item.monto || 0);

          monthlyMap[month]
            .gallinasVentas += 1;

        }

      });

      gastos?.forEach((item: any) => {

        const date = new Date(item.fecha);

        const month =
          months[date.getMonth()];

        if (selectedLivestock === 'bovinos') {

          monthlyMap[month]
            .bovinosGastos +=
            Number(item.monto || 0);

        } else {

          monthlyMap[month]
            .gallinasGastos +=
            Number(item.monto || 0);

        }

      });

      nacimientos?.forEach((item: any) => {

        const date =
          new Date(item.fecha_nacimiento);

        const month =
          months[date.getMonth()];

        if (selectedLivestock === 'bovinos') {

          monthlyMap[month]
            .bovinosNacimientos += 1;

        } else {

          monthlyMap[month]
            .gallinasNacimientos += 1;

        }

      });

      muertes?.forEach((item: any) => {

        const date =
          new Date(item.fecha_muerte);

        const month =
          months[date.getMonth()];

        if (selectedLivestock === 'bovinos') {

          monthlyMap[month]
            .bovinosMuertes += 1;

        } else {

          monthlyMap[month]
            .gallinasMuertes += 1;

        }

      });

      Object.values(monthlyMap)
        .forEach((item: any) => {

          item.bovinosGanancias =
            item.bovinosIngresos -
            item.bovinosGastos;

          item.gallinasGanancias =
            item.gallinasIngresos -
            item.gallinasGastos;

        });

      setMonthlyData(
        Object.values(monthlyMap)
      );

      const totalAnimales =
        animales?.length || 0;

      const totalMuertes =
        muertes?.length || 0;

      const saludables =
        Math.max(
          totalAnimales - totalMuertes,
          0
        );



    };

    loadChartsData();

  }, [selectedLivestock]);

  const productionData = monthlyData.map((item: any) => ({
    month: item.month,

    produccion:
      selectedLivestock === 'bovinos'
        ? item.bovinosProduccion
        : item.gallinasProduccion,

    nacimientos:
      selectedLivestock === 'bovinos'
        ? item.bovinosNacimientos
        : item.gallinasNacimientos,

    muertes:
      selectedLivestock === 'bovinos'
        ? item.bovinosMuertes
        : item.gallinasMuertes,

    gastos:
      selectedLivestock === 'bovinos'
        ? item.bovinosGastos
        : item.gallinasGastos,

    ganancias:
      selectedLivestock === 'bovinos'
        ? item.bovinosGanancias
        : item.gallinasGanancias,

    ventas:
      selectedLivestock === 'bovinos'
        ? item.bovinosVentas
        : item.gallinasVentas,
  }));

  const incomeExpenseData = monthlyData.map((item: any) => ({
    month: item.month,
    ingresos:
      selectedLivestock === 'bovinos'
        ? item.bovinosIngresos
        : item.gallinasIngresos,

    gastos:
      selectedLivestock === 'bovinos'
        ? item.bovinosGastos
        : item.gallinasGastos,
  }));

  const distributionData = [
    {
      name: 'Producción',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.produccion || 0),
          0
        ),
    },

    {
      name: 'Ventas',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.ventas || 0),
          0
        ),
    },

    {
      name: 'Ganancias',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.ganancias || 0),
          0
        ),
    },
  ];

  const categories = [
    {
      category:
        selectedLivestock === 'bovinos'
          ? 'Bovinos'
          : 'Gallinas',

      produccion:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.produccion || 0),
          0
        ),
    },

    {
      category: 'Nacimientos',

      produccion:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.nacimientos || 0),
          0
        ),
    },

    {
      category: 'Ventas',

      produccion:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.ventas || 0),
          0
        ),
    },
  ];

  const performanceData = [
    {
      metric: 'Producción',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.produccion || 0),
          0
        ),
    },

    {
      metric: 'Ventas',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.ventas || 0),
          0
        ),
    },

    {
      metric: 'Ganancias',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.ganancias || 0),
          0
        ),
    },

    {
      metric: 'Nacimientos',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.nacimientos || 0),
          0
        ),
    },

    {
      metric: 'Muertes',
      value:
        productionData.reduce(
          (acc: number, item: any) =>
            acc + Number(item.muertes || 0),
          0
        ),
    },
  ];

  const totalMuertes =
    productionData.reduce(
      (acc: number, item: any) =>
        acc + Number(item.muertes || 0),
      0
    );

  const totalNacimientos =
    productionData.reduce(
      (acc: number, item: any) =>
        acc + Number(item.nacimientos || 0),
      0
    );

  const totalProduccion =
    productionData.reduce(
      (acc: number, item: any) =>
        acc + Number(item.produccion || 0),
      0
    );

  const healthStatusData = [
    {
      status: 'Excelente',
      value:
        totalProduccion > 0
          ? Math.max(
            0,
            100 - totalMuertes * 5
          )
          : 0,
      color: '#22C55E',
    },

    {
      status: 'En Tratamiento',
      value:
        totalNacimientos > 0
          ? Math.min(
            100,
            totalNacimientos
          )
          : 0,
      color: '#EAB308',
    },

    {
      status: 'Crítico',
      value: totalMuertes,
      color: '#EF4444',
    },
  ];

  const topData =
    productionData
      .map((item: any, index: number) => ({
        id: `${selectedLivestock === 'bovinos' ? 'B' : 'G'}-${index + 1}`,

        production:
          Number(item.produccion || 0),

        name:
          selectedLivestock === 'bovinos'
            ? `Bovino ${index + 1}`
            : `Gallina ${index + 1}`,
      }))
      .sort(
        (a: any, b: any) =>
          b.production - a.production
      )
      .slice(0, 5);

  const primaryColor =
    selectedLivestock === 'bovinos'
      ? '#38BDF8'
      : '#F97316';

  const secondaryColor =
    selectedLivestock === 'bovinos'
      ? '#3B82F6'
      : '#FB923C';

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

  return (
    <div className="space-y-4">
      {/* Row 1: Production and Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GaugeIndicators
          selectedLivestock={selectedLivestock}
          darkMode={darkMode}
        />

        {/* Monthly Production Bar Chart */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Producción Mensual</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="produccion" fill={primaryColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Evolution Line Chart */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Ganancias Mensuales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="ganancias" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
              <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Births/Deaths and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Births vs Deaths Area Chart */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Nacimientos vs Muertes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="nacimientos" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
              <Area type="monotone" dataKey="muertes" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Distribución de Producción</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Monthly Sales and Income/Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Sales */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="ventas" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Composed */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Ingresos vs Egresos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="ingresos" fill="#22C55E" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="egresos" stroke="#EF4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Categories and Performance Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Production */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Producción por Categoría</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis dataKey="category" type="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="produccion" fill={primaryColor} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Rendimiento Multidimensional</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <PolarAngleAxis dataKey="metric" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '11px' }} />
              <PolarRadiusAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
              <Radar name="Rendimiento" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.5} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 5: Top Performers and Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Top {selectedLivestock === 'bovinos' ? 'Bovinos' : 'Secciones'} Productivos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} />
              <YAxis dataKey="id" type="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} style={{ fontSize: '12px' }} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="production" fill={primaryColor} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Status Doughnut */}
        <div className={chartCardClass}>
          <h3 className={titleClass}>Estado de Salud General</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={healthStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, value }) => `${status}: ${value}%`}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {healthStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 6: Health Indicators Semaforo */}
      <div className={chartCardClass}>
        <h3 className={titleClass}>Indicadores Semáforo de Salud</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'} border border-green-200`}>
            <div className="text-center">
              <div className="text-3xl font-light text-green-600 mb-1">
                {healthStatusData[0]?.value || 0}%
              </div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Salud Excelente</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'} border border-amber-200`}>
            <div className="text-center">
              <div className="text-3xl font-light text-amber-600 mb-1">
                {healthStatusData[1]?.value || 0}%
              </div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>En Tratamiento</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-amber-500"></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-50'} border border-red-200`}>
            <div className="text-center">
              <div className="text-3xl font-light text-red-600 mb-1">
                {healthStatusData[2]?.value || 0}%
              </div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Estado Crítico</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
