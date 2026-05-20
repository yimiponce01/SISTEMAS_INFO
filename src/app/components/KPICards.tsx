import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  ShoppingCart,
  Heart,
  Egg
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

interface KPICardsProps {
  selectedLivestock: 'bovinos' | 'gallinas' | 'both';
  dateRange: { from: string; to: string };
  darkMode: boolean;
}



export default function KPICards({ selectedLivestock, darkMode }: KPICardsProps) {
  const [data, setData] = useState({
    total: 0,
    production: 0,
    revenue: 0,
    income: 0,
    expenses: 0,
    births: 0,
    deaths: 0,
    sales: 0,
    diseases: 0,
    incubations: 0,
  });

  useEffect(() => {

    const loadDashboardData = async () => {

      // ===== ANIMALES =====

      const { data: animales, error: animalesError } = await supabase
        .from('animales')
        .select('*')
        .in(
          'id_tipo',
          selectedLivestock === 'both'
            ? [1, 2]
            : selectedLivestock === 'bovinos'
              ? [1]
              : [2]
        );
      const animalIds = animales?.map(a => a.id_animal) || [];
      console.log('TIPO SELECCIONADO:', selectedLivestock);
      console.log('ANIMAL IDS:', animalIds);
      console.log('ANIMALES:', animales);
      console.log('ERROR ANIMALES:', animalesError);
      console.log('DATA ANIMALES:', animales);

      // ===== NACIMIENTOS =====

      const { data: nacimientos } = await supabase
        .from('nacimientos')
        .select('*')
        .or(
          `id_madre.in.(${animalIds.join(',')}),id_padre.in.(${animalIds.join(',')})`
        );

      // ===== MUERTES =====

      const { data: muertes } = await supabase
        .from('muertes')
        .select('*')
        .in('id_animal', animalIds);

      // ===== INGRESOS =====

      const { data: ingresos } =
        await supabase
          .from('ingresos')
          .select('*')
          .in('id_animal', animalIds);

      // ===== PRODUCCION =====

      const { data: produccion } = await supabase
        .from('produccion')
        .select('*')
        .in('id_animal', animalIds);

      console.log('PRODUCCION:', produccion);
      // ===== GASTOS =====

      const { data: gastos } = await supabase
        .from('gastos')
        .select('*')
        .in(
          'id_tipo_animal',
          selectedLivestock === 'both'
            ? [1, 2]
            : selectedLivestock === 'bovinos'
              ? [1]
              : [2]
        );

      // ===== ENFERMEDADES =====

      const { data: enfermedades } = await supabase
        .from('enfermedades')
        .select('*')
        .in('id_animal', animalIds);


      // ===== INCUBACION =====
      let incubacion = [];

      if (
        selectedLivestock === 'gallinas' ||
        selectedLivestock === 'both'
      ) {

        const { data } = await supabase
          .from('incubacion')
          .select('*');

        incubacion = data || [];
      }



      // ===== CALCULOS =====

      const totalProduccion =
        produccion?.reduce(
          (acc, item) => acc + Number(item.cantidad || 0),
          0
        ) || 0;

      const totalRevenue =
        ingresos?.reduce(
          (acc, item) => acc + Number(item.monto || 0),
          0
        ) || 0;

      const totalExpenses =
        gastos?.reduce(
          (acc, item) => acc + Number(item.monto || 0),
          0
        ) || 0;

      const totalGanancias =
        totalRevenue - totalExpenses;


      // ===== GUARDAR =====

      setData({
        total: animales?.length || 0,
        production: totalProduccion,
        revenue: totalGanancias,
        income: totalRevenue,
        expenses: totalExpenses,
        births: nacimientos?.length || 0,
        deaths: muertes?.length || 0,
        sales: ingresos?.length || 0,
        diseases: enfermedades?.length || 0,
        incubations: incubacion?.length || 0,
      });

    };

    loadDashboardData();

  }, [selectedLivestock]);
  const profit = data.revenue;

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
      title: 'Ingresos',
      value: `$${Number(data.income || 0).toFixed(2)}`,
      icon: DollarSign,
      change: '+15%',
      trend: 'up',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
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
      value: (data.incubations || 0).toLocaleString(),
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
            className={`relative overflow-hidden rounded-lg border transition-all hover:shadow-lg hover:-translate-y-0.5 ${darkMode
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
