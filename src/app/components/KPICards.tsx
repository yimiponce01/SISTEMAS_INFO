import {
  Activity,
  AlertTriangle,
  DollarSign,
  Egg,
  Heart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { DashboardData } from '../lib/dashboardData';

type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';
type AreaFilter = 'produccion' | 'finanzas';

interface KPICardsProps {
  selectedLivestock: AnimalFilter;
  selectedArea: AreaFilter;
  dateRange: { from: string; to: string };
  darkMode: boolean;
  dashboardData: DashboardData | null;
  loading: boolean;
}

export default function KPICards({
  selectedLivestock,
  selectedArea,
  darkMode,
  dashboardData,
  loading,
}: KPICardsProps) {
  const totals = dashboardData?.totals;
  const profit = totals?.ganancias || 0;
  const rentability = totals?.rentabilidad || 0;
  const balance = totals?.balance || 0;

  const productionCards = [
    {
      title: 'Total Animales',
      value: (totals?.animales || 0).toLocaleString(),
      icon: Users,
      color: selectedLivestock === 'bovinos' ? 'blue' : selectedLivestock === 'gallinas' ? 'orange' : 'purple',
    },
    {
      title: 'Producción Total',
      value: (totals?.produccion || 0).toLocaleString(),
      icon: Activity,
      color: 'green',
      unit: selectedLivestock === 'gallinas' ? 'huevos' : 'L',
    },
    {
      title: 'Nacimientos',
      value: (totals?.nacimientos || 0).toLocaleString(),
      icon: Heart,
      color: 'pink',
    },
    {
      title: 'Muertes',
      value: (totals?.muertes || 0).toLocaleString(),
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Enfermedades',
      value: (totals?.enfermedades || 0).toLocaleString(),
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Ventas',
      value: (totals?.ventas || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'indigo',
    },
  ];

  if (selectedLivestock === 'gallinas' || selectedLivestock === 'ambos') {
    productionCards.push({
      title: 'Incubaciones',
      value: (totals?.incubaciones || 0).toLocaleString(),
      icon: Egg,
      color: 'orange',
    });
  }

  const financeCards = [
    {
      title: 'Ganancias',
      value: `$${Number(profit || 0).toFixed(2)}`,
      icon: DollarSign,
      color: profit >= 0 ? 'green' : 'red',
    },
    {
      title: 'Ingresos',
      value: `$${Number(totals?.ingresos || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Gastos',
      value: `$${Number(totals?.gastos || 0).toFixed(2)}`,
      icon: ShoppingCart,
      color: 'amber',
    },
    {
      title: 'Ventas',
      value: (totals?.ventas || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'indigo',
    },
    {
      title: 'Balance',
      value: `$${Number(balance || 0).toFixed(2)}`,
      icon: Activity,
      color: balance >= 0 ? 'blue' : 'red',
    },
    {
      title: 'Rentabilidad',
      value: `${rentability.toFixed(2)}%`,
      icon: TrendingUp,
      color: rentability >= 0 ? 'purple' : 'red',
    },
  ];

  const cards = selectedArea === 'finanzas' ? financeCards : productionCards;

  console.log('[KPICards] values', {
    selectedArea,
    selectedLivestock,
    totals,
  });

  const colorClasses: Record<string, { bg: string; gradient: string; icon: string; glow: string }> = {
    blue: {
      bg: darkMode ? 'bg-sky-400/15' : 'bg-blue-50',
      gradient: 'from-[#00BFFF] to-[#3B82F6]',
      icon: 'text-sky-300',
      glow: 'rgba(0,191,255,0.38)',
    },
    orange: {
      bg: darkMode ? 'bg-orange-400/15' : 'bg-orange-50',
      gradient: 'from-[#FF7A00] to-[#FF8C42]',
      icon: 'text-orange-300',
      glow: 'rgba(255,122,0,0.38)',
    },
    green: {
      bg: darkMode ? 'bg-emerald-400/15' : 'bg-green-50',
      gradient: 'from-[#00FFB3] to-[#00FFC8]',
      icon: 'text-emerald-300',
      glow: 'rgba(0,255,179,0.38)',
    },
    amber: {
      bg: darkMode ? 'bg-amber-400/15' : 'bg-amber-50',
      gradient: 'from-[#FFD700] to-[#FFE66D]',
      icon: 'text-amber-300',
      glow: 'rgba(255,215,0,0.38)',
    },
    pink: {
      bg: darkMode ? 'bg-pink-400/15' : 'bg-pink-50',
      gradient: 'from-pink-400 to-fuchsia-500',
      icon: 'text-pink-300',
      glow: 'rgba(244,114,182,0.34)',
    },
    red: {
      bg: darkMode ? 'bg-red-400/15' : 'bg-red-50',
      gradient: 'from-red-400 to-rose-500',
      icon: 'text-red-300',
      glow: 'rgba(248,113,113,0.34)',
    },
    indigo: {
      bg: darkMode ? 'bg-indigo-400/15' : 'bg-indigo-50',
      gradient: 'from-indigo-400 to-violet-500',
      icon: 'text-indigo-300',
      glow: 'rgba(129,140,248,0.34)',
    },
    purple: {
      bg: darkMode ? 'bg-fuchsia-400/15' : 'bg-purple-50',
      gradient: 'from-[#C026FF] to-[#D946EF]',
      icon: 'text-fuchsia-300',
      glow: 'rgba(192,38,255,0.38)',
    },
  };

  return (
    <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color];

        return (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.012] ${
              darkMode
                ? 'bg-gradient-to-br from-[#071426]/90 via-slate-950/78 to-cyan-950/22 border-cyan-300/24 backdrop-blur-2xl hover:border-cyan-300/60'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
            style={
              darkMode
                ? {
                    boxShadow: `0 18px 46px rgba(2,6,23,0.42), 0 0 24px ${colors.glow}, inset 0 1px 18px rgba(255,255,255,0.07)`,
                  }
                : undefined
            }
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-25 blur-2xl`} />

            <div className="relative p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${colors.bg}`}>
                  <Icon className={`h-4 w-4 ${colors.icon}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-300">
                  {card.color === 'red' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  <span className="font-light">Real</span>
                </div>
              </div>

              <div className={`mb-1 text-xl font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {loading ? 'Cargando...' : card.value}
                {'unit' in card && card.unit && !loading && <span className="ml-1 text-xs text-slate-400">{card.unit}</span>}
              </div>
              <div className={`text-xs font-light uppercase tracking-[0.12em] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
