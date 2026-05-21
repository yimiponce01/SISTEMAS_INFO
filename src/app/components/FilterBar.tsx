import { Calendar, X } from 'lucide-react';

interface FilterBarProps {
  selectedLivestock: 'bovinos' | 'gallinas' | 'both';
  setSelectedLivestock: (value: 'bovinos' | 'gallinas' | 'both') => void;
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  darkMode: boolean;
}

export default function FilterBar({
  selectedLivestock,
  setSelectedLivestock,
  dateRange,
  setDateRange,
  darkMode
}: FilterBarProps) {
  const handleClearFilters = () => {

    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    setSelectedLivestock('both');

    setDateRange({
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    });

  };

  return (
    <div className={`mb-6 p-5 rounded-xl border transition-all hover:shadow-lg ${darkMode
      ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
      : 'bg-white border-slate-200 shadow-sm'
      }`}>
      <div className="flex flex-wrap items-center gap-6">
        {/* Livestock Selector */}
        <div className="flex-1 min-w-[250px]">
          <label className={`block text-sm font-light mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Tipo de ganado
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLivestock('bovinos')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-light transition-all transform hover:scale-105 ${selectedLivestock === 'bovinos'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {/*            🐄*/} Bovinos
            </button>
            {/*<button
              onClick={() => setSelectedLivestock('gallinas')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-light transition-all transform hover:scale-105 ${selectedLivestock === 'gallinas'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
                           🐔Gallinas
            </button>
            <button
              onClick={() => setSelectedLivestock('both')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-light transition-all transform hover:scale-105 ${selectedLivestock === 'both'
                  ? 'bg-gradient-to-r from-blue-500 to-orange-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            > 
            🐄🐔 Ambos
            </button>*/}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex-1 min-w-[300px]">
          <label className={`block text-sm font-light mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Rango de fechas
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border font-light ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
                  }`}
              />
            </div>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>—</span>
            <div className="flex-1 relative">
              <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border font-light ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className={`px-4 py-2.5 rounded-lg font-light transition-all flex items-center gap-2 ${darkMode
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
