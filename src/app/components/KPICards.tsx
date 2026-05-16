import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertTriangle, ShoppingCart, Heart, Egg } from 'lucide-react';

interface KPICardsProps {
  selectedLivestock: 'bovinos' | 'gallinas' | 'both';
  dateRange: { from: string; to: string };
  darkMode: boolean;
}

const mockData = {
  bovinos: {
    total: 248,
    production: 12450,
    revenue: 125000,
    expenses: 45000,
    births: 34,
    deaths: 8,
    sales: 22,
    diseases: 5,
  },
  gallinas: {
    total: 1842,
    production: 45600,
    revenue: 98500,
    expenses: 38000,
    births: 324,
    deaths: 48,
    sales: 156,
    diseases: 12,
    incubations: 280,
  }
};

export default function KPICards({ selectedLivestock, darkMode }: KPICardsProps) {
  const getKPIs = () => {
    if (selectedLivestock === 'bovinos') return mockData.bovinos;
    if (selectedLivestock === 'gallinas') return mockData.gallinas;
    return {
      total: mockData.bovinos.total + mockData.gallinas.total,
      production: mockData.bovinos.production + mockData.gallinas.production,
      revenue: mockData.bovinos.revenue + mockData.gallinas.revenue,
      expenses: mockData.bovinos.expenses + mockData.gallinas.expenses,
      births: mockData.bovinos.births + mockData.gallinas.births,
      deaths: mockData.bovinos.deaths + mockData.gallinas.deaths,
      sales: mockData.bovinos.sales + mockData.gallinas.sales,
      diseases: mockData.bovinos.diseases + mockData.gallinas.diseases,
    };
  };

  const data = getKPIs();
  const profit = data.revenue - data.expenses;

  const cards = [
    {
      title: 'Total Animales',
      value: data.total.toLocaleString(),
      icon: Users,
      trend: '+12%',
      positive: true,
      color: selectedLivestock === 'bovinos' ? 'blue' : selectedLivestock === 'gallinas' ? 'orange' : 'purple',
    },
    {
      title: 'Producción Total',
      value: data.production.toLocaleString(),
      icon: Activity,
      trend: '+8%',
      positive: true,
      color: 'green',
      unit: selectedLivestock === 'gallinas' ? 'huevos' : 'L',
    },
    {
      title: 'Ganancias',
      value: `$${profit.toLocaleString()}`,
      icon: DollarSign,
      trend: '+15%',
      positive: true,
      color: 'green',
    },
    {
      title: 'Gastos',
      value: `$${data.expenses.toLocaleString()}`,
      icon: ShoppingCart,
      trend: '-3%',
      positive: true,
      color: 'amber',
    },
    {
      title: 'Nacimientos',
      value: data.births.toLocaleString(),
      icon: Heart,
      trend: '+22%',
      positive: true,
      color: 'pink',
    },
    {
      title: 'Muertes',
      value: data.deaths.toLocaleString(),
      icon: AlertTriangle,
      trend: '-5%',
      positive: true,
      color: 'red',
    },
    {
      title: 'Ventas',
      value: data.sales.toLocaleString(),
      icon: ShoppingCart,
      trend: '+10%',
      positive: true,
      color: 'indigo',
    },
    {
      title: 'Enfermedades',
      value: data.diseases.toLocaleString(),
      icon: AlertTriangle,
      trend: '-8%',
      positive: true,
      color: 'red',
    },
  ];

  if (selectedLivestock === 'gallinas' || selectedLivestock === 'both') {
    cards.push({
      title: 'Incubaciones',
      value: (mockData.gallinas.incubations || 0).toLocaleString(),
      icon: Egg,
      trend: '+18%',
      positive: true,
      color: 'orange',
    });
  }

  const colorClasses: Record<string, { bg: string; gradient: string; icon: string; text: string }> = {
    blue: {
      bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    },
    orange: {
      bg: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
      icon: 'text-orange-600',
      text: 'text-orange-600'
    },
    green: {
      bg: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
      icon: 'text-green-600',
      text: 'text-green-600'
    },
    amber: {
      bg: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
      icon: 'text-amber-600',
      text: 'text-amber-600'
    },
    pink: {
      bg: darkMode ? 'bg-pink-500/10' : 'bg-pink-50',
      gradient: 'from-pink-500 to-pink-600',
      icon: 'text-pink-600',
      text: 'text-pink-600'
    },
    red: {
      bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
      gradient: 'from-red-500 to-red-600',
      icon: 'text-red-600',
      text: 'text-red-600'
    },
    indigo: {
      bg: darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50',
      gradient: 'from-indigo-500 to-indigo-600',
      icon: 'text-indigo-600',
      text: 'text-indigo-600'
    },
    purple: {
      bg: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
      icon: 'text-purple-600',
      text: 'text-purple-600'
    },
  };

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-9 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color];
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-lg border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              darkMode
                ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Gradient overlay */}
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full blur-xl`} />

            <div className="relative p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs ${card.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="font-light">{card.trend}</span>
                </div>
              </div>

              <div className={`text-xl font-light mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {card.value}
                {card.unit && <span className="text-xs ml-1 text-slate-500">{card.unit}</span>}
              </div>
              <div className={`text-xs font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
