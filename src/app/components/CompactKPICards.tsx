import { TrendingUp, TrendingDown } from 'lucide-react';

interface CompactKPICardsProps {
  darkMode: boolean;
}

export default function CompactKPICards({ darkMode }: CompactKPICardsProps) {
  const comparisons = [
    {
      title: 'Total Animales',
      bovinos: 248,
      gallinas: 1842,
      winner: 'gallinas',
      icon: '🐄🐔',
    },
    {
      title: 'Producción',
      bovinos: 12450,
      gallinas: 45600,
      winner: 'gallinas',
      icon: '📊',
      unit: 'L/huevos',
    },
    {
      title: 'Ganancias',
      bovinos: 80000,
      gallinas: 60500,
      winner: 'bovinos',
      icon: '💰',
      prefix: '$',
    },
    {
      title: 'Gastos',
      bovinos: 45000,
      gallinas: 38000,
      winner: 'gallinas',
      icon: '💳',
      prefix: '$',
      inverted: true,
    },
    {
      title: 'Nacimientos',
      bovinos: 34,
      gallinas: 324,
      winner: 'gallinas',
      icon: '🐣',
    },
    {
      title: 'Muertes',
      bovinos: 8,
      gallinas: 48,
      winner: 'bovinos',
      icon: '⚠️',
      inverted: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {comparisons.map((item, idx) => {
        const bovinosWins = item.winner === 'bovinos';
        const inverted = item.inverted || false;

        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-lg border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
              darkMode
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
              <div className={`mb-2 p-2 rounded-lg ${
                bovinosWins && !inverted
                  ? 'bg-blue-500/10 ring-1 ring-blue-500/30'
                  : darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">Bovinos</span>
                  {bovinosWins && !inverted && <TrendingUp className="w-3 h-3 text-green-600" />}
                </div>
                <div className={`text-base font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.prefix}{item.bovinos.toLocaleString()}
                </div>
              </div>

              {/* Gallinas */}
              <div className={`p-2 rounded-lg ${
                !bovinosWins && !inverted
                  ? 'bg-orange-500/10 ring-1 ring-orange-500/30'
                  : darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-600">Gallinas</span>
                  {!bovinosWins && !inverted && <TrendingUp className="w-3 h-3 text-green-600" />}
                </div>
                <div className={`text-base font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.prefix}{item.gallinas.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
