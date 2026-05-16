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

interface ChartsSectionProps {
  selectedLivestock: 'bovinos' | 'gallinas';
  dateRange: { from: string; to: string };
  darkMode: boolean;
}

const monthlyProductionData = [
  { month: 'Ene', produccion: 3200, nacimientos: 8, muertes: 2, gastos: 12000, ganancias: 18000, ventas: 5 },
  { month: 'Feb', produccion: 3400, nacimientos: 12, muertes: 3, gastos: 11500, ganancias: 19500, ventas: 7 },
  { month: 'Mar', produccion: 3800, nacimientos: 15, muertes: 1, gastos: 13000, ganancias: 22000, ventas: 6 },
  { month: 'Abr', produccion: 4100, nacimientos: 10, muertes: 2, gastos: 12800, ganancias: 24000, ventas: 8 },
  { month: 'May', produccion: 4450, nacimientos: 18, muertes: 4, gastos: 14000, ganancias: 26500, ventas: 9 },
];

const monthlyProductionGallinas = [
  { month: 'Ene', produccion: 8200, nacimientos: 45, muertes: 12, gastos: 8000, ganancias: 15000, ventas: 28 },
  { month: 'Feb', produccion: 8800, nacimientos: 68, muertes: 8, gastos: 7500, ganancias: 17500, ventas: 35 },
  { month: 'Mar', produccion: 9200, nacimientos: 82, muertes: 10, gastos: 8200, ganancias: 19000, ventas: 42 },
  { month: 'Abr', produccion: 9600, nacimientos: 72, muertes: 9, gastos: 8500, ganancias: 20500, ventas: 38 },
  { month: 'May', produccion: 9800, nacimientos: 95, muertes: 11, gastos: 9000, ganancias: 22000, ventas: 45 },
];

const distributionData = [
  { name: 'Producción', value: 42 },
  { name: 'Ventas', value: 28 },
  { name: 'Reserva', value: 30 },
];

const categoryData = [
  { category: 'Holstein', cantidad: 85, produccion: 3800 },
  { category: 'Jersey', cantidad: 62, produccion: 2900 },
  { category: 'Brown Swiss', cantidad: 48, produccion: 2200 },
  { category: 'Angus', cantidad: 35, produccion: 1600 },
];

const categoryGallinasData = [
  { category: 'Leghorn', cantidad: 485, produccion: 12800 },
  { category: 'Rhode Island', cantidad: 362, produccion: 9200 },
  { category: 'Plymouth Rock', cantidad: 298, produccion: 7400 },
  { category: 'Sussex', cantidad: 215, produccion: 5600 },
];

const performanceData = [
  { metric: 'Producción', value: 85 },
  { metric: 'Salud', value: 92 },
  { metric: 'Crecimiento', value: 78 },
  { metric: 'Nutrición', value: 88 },
  { metric: 'Rentabilidad', value: 82 },
  { metric: 'Eficiencia', value: 79 },
];

const incomeExpenseData = [
  { month: 'Ene', ingresos: 28000, egresos: 12000 },
  { month: 'Feb', ingresos: 31000, egresos: 11500 },
  { month: 'Mar', ingresos: 35000, egresos: 13000 },
  { month: 'Abr', ingresos: 36800, egresos: 12800 },
  { month: 'May', ingresos: 40500, egresos: 14000 },
];

const healthStatusData = [
  { status: 'Excelente', value: 82, color: '#22C55E' },
  { status: 'Bueno', value: 12, color: '#EAB308' },
  { status: 'Regular', value: 4, color: '#F97316' },
  { status: 'Crítico', value: 2, color: '#EF4444' },
];

const topAnimalsData = [
  { id: 'B-001', production: 450, name: 'Vaca Holstein A' },
  { id: 'B-045', production: 420, name: 'Vaca Jersey B' },
  { id: 'B-023', production: 395, name: 'Vaca Holstein C' },
  { id: 'B-078', production: 380, name: 'Vaca Brown D' },
  { id: 'B-012', production: 365, name: 'Vaca Holstein E' },
];

const topGallinasData = [
  { id: 'G-234', production: 285, name: 'Sección A' },
  { id: 'G-189', production: 278, name: 'Sección B' },
  { id: 'G-412', production: 265, name: 'Sección C' },
  { id: 'G-567', production: 248, name: 'Sección D' },
  { id: 'G-098', production: 232, name: 'Sección E' },
];

const COLORS = ['#38BDF8', '#F97316', '#22C55E', '#EAB308', '#EF4444'];

export default function ChartsSection({ selectedLivestock, darkMode }: ChartsSectionProps) {
  const productionData = selectedLivestock === 'bovinos' ? monthlyProductionData : monthlyProductionGallinas;
  const topData = selectedLivestock === 'bovinos' ? topAnimalsData : topGallinasData;
  const categories = selectedLivestock === 'bovinos' ? categoryData : categoryGallinasData;
  const primaryColor = selectedLivestock === 'bovinos' ? '#38BDF8' : '#F97316';
  const secondaryColor = selectedLivestock === 'bovinos' ? '#3B82F6' : '#FB923C';

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

  return (
    <div className="space-y-4">
      {/* Row 1: Production and Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <div className="text-3xl font-light text-green-600 mb-1">92%</div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Salud Excelente</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'} border border-amber-200`}>
            <div className="text-center">
              <div className="text-3xl font-light text-amber-600 mb-1">6%</div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>En Tratamiento</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-amber-500"></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-50'} border border-red-200`}>
            <div className="text-center">
              <div className="text-3xl font-light text-red-600 mb-1">2%</div>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Estado Crítico</div>
              <div className="w-12 h-12 mx-auto mt-2 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
