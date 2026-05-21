import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CompactKPICardsProps {
  darkMode: boolean;
}

export default function CompactKPICards({ darkMode }: CompactKPICardsProps) {
  const [comparisons, setComparisons] = useState<any[]>([]);
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

const { data: bovinosProduccion } = await supabase
  .from('produccion')
  .select('*')
  .eq('id_tipo_animal', 1);

const { data: bovinosNacimientos } = await supabase
  .from('nacimientos')
  .select('*')
  .eq('id_tipo_animal', 1);

const { data: bovinosMuertes } = await supabase
  .from('muertes')
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

const { data: gallinasProduccion } = await supabase
  .from('produccion')
  .select('*')
  .eq('id_tipo_animal', 2);

const { data: gallinasNacimientos } = await supabase
  .from('nacimientos')
  .select('*')
  .eq('id_tipo_animal', 2);

const { data: gallinasMuertes } = await supabase
  .from('muertes')
  .select('*')
  .eq('id_tipo_animal', 2);

      const bovinosRevenue =
        bovinosIngresos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const gallinasRevenue =
        gallinasIngresos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const bovinosExpenses =
        bovinosGastos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const gallinasExpenses =
        gallinasGastos?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.monto || 0),
          0
        ) || 0;

      const bovinosProduction =
        bovinosProduccion?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.cantidad || 0),
          0
        ) || 0;

      const gallinasProduction =
        gallinasProduccion?.reduce(
          (acc: number, item: any) =>
            acc + Number(item.cantidad || 0),
          0
        ) || 0;

      setComparisons([
        {
          title: 'Total Animales',
          bovinos: bovinosAnimales?.length || 0,
          gallinas: gallinasAnimales?.length || 0,
          winner:
            (bovinosAnimales?.length || 0) >
              (gallinasAnimales?.length || 0)
              ? 'bovinos'
              : 'gallinas',
          //icon: '🐄🐔',
        },

        {
          title: 'Producción',
          bovinos: bovinosProduction,
          gallinas: gallinasProduction,
          winner:
            bovinosProduction > gallinasProduction
              ? 'bovinos'
              : 'gallinas',
          icon: '📊',
          unit: 'L/huevos',
        },

        {
          title: 'Ganancias',
          bovinos: bovinosRevenue - bovinosExpenses,
          gallinas: gallinasRevenue - gallinasExpenses,
          winner:
            (bovinosRevenue - bovinosExpenses) >
              (gallinasRevenue - gallinasExpenses)
              ? 'bovinos'
              : 'gallinas',
          icon: '💰',
          prefix: '$',
        },

        {
          title: 'Gastos',
          bovinos: bovinosExpenses,
          gallinas: gallinasExpenses,
          winner:
            bovinosExpenses < gallinasExpenses
              ? 'bovinos'
              : 'gallinas',
          icon: '💳',
          prefix: '$',
          inverted: true,
        },

        {
          title: 'Nacimientos',
          bovinos: bovinosNacimientos?.length || 0,
          gallinas: gallinasNacimientos?.length || 0,
          winner:
            (bovinosNacimientos?.length || 0) >
              (gallinasNacimientos?.length || 0)
              ? 'bovinos'
              : 'gallinas',
          icon: '🐣',
        },

        {
          title: 'Muertes',
          bovinos: bovinosMuertes?.length || 0,
          gallinas: gallinasMuertes?.length || 0,
          winner:
            (bovinosMuertes?.length || 0) <
              (gallinasMuertes?.length || 0)
              ? 'bovinos'
              : 'gallinas',
          icon: '⚠️',
          inverted: true,
        },
      ]);

    };

    loadData();

  }, []);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {comparisons.map((item, idx) => {
        const bovinosWins = item.winner === 'bovinos';
        const inverted = item.inverted || false;

        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-lg border transition-all hover:shadow-lg hover:-translate-y-0.5 ${darkMode
              ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
              : 'bg-white border-slate-200 shadow-sm'
              }`}
          >
            <div className="p-3">
              <div className="text-center mb-2">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className={`text-xs font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.title}
                </div>
              </div>

              {/* Bovinos */}
              <div className={`mb-2 p-2 rounded-lg ${bovinosWins && !inverted
                ? 'bg-blue-500/10 ring-1 ring-blue-500/30'
                : darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">Bovinos</span>
                  {bovinosWins ? (
                    inverted
                      ? <TrendingDown className="w-3 h-3 text-red-600" />
                      : <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : null}
                </div>
                <div className={`text-base font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.prefix || ''}{item.bovinos.toLocaleString()}
                </div>
              </div>

              {/* Gallinas */}
              <div className={`p-2 rounded-lg ${!bovinosWins && !inverted
                ? 'bg-orange-500/10 ring-1 ring-orange-500/30'
                : darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600">Gallinas</span>
                  {!bovinosWins ? (
                    inverted
                      ? <TrendingDown className="w-3 h-3 text-red-600" />
                      : <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : null}
                </div>
                <div className={`text-base font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.prefix || ''}{item.gallinas.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
