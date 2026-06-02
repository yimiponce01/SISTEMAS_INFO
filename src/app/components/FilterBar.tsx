import AreaSelector from './AreaSelector';
import AnimalSelector from './AnimalSelector';
import DateRangeFilters from './DateRangeFilters';
import FilterActions from './FilterActions';

type Area = 'produccion' | 'finanzas';
type Animal = 'bovinos' | 'gallinas' | 'ambos';

interface FilterBarProps {
  selectedArea: Area;
  setSelectedArea: (value: Area) => void;
  selectedAnimal: Animal;
  setSelectedAnimal: (value: Animal) => void;
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  darkMode: boolean;
}

export default function FilterBar({
  selectedArea,
  setSelectedArea,
  selectedAnimal,
  setSelectedAnimal,
  dateRange,
  setDateRange,
  darkMode,
}: FilterBarProps) {
  const resetDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    setDateRange({
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    });
  };

  const handleClearFilters = () => {
    setSelectedArea('produccion');
    setSelectedAnimal('bovinos');
    resetDates();
  };

  const handleApplyFilters = () => {
    setDateRange({ ...dateRange });
  };

  const sectionTitleClass = darkMode
  ? 'mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]'
  : 'mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-800';
  return (
    <aside
      className={`relative mb-6 overflow-hidden rounded-2xl border p-4 backdrop-blur-2xl transition-all duration-300 sm:p-5 ${
        darkMode
        ? 'bg-slate-950/72'
        : 'bg-white border-slate-300'
      }`}
      style={
        darkMode
          ? {
              borderColor: 'rgba(103, 232, 249, 0.24)',
              boxShadow:
                '0 0 0 1px rgba(103,232,249,0.12), 0 0 34px rgba(34,211,238,0.20), 0 22px 70px rgba(2,6,23,0.55), inset 0 1px 22px rgba(255,255,255,0.06), inset 0 0 38px rgba(14,165,233,0.08)',
            }
          : {
            borderColor: '#cbd5e1',
            boxShadow:
              '0 8px 24px rgba(15,23,42,0.08)',
          }
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <h3 className={sectionTitleClass}>Áreas</h3>
          <AreaSelector
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            darkMode={darkMode}
          />
        </section>

        <section>
          <h3 className={sectionTitleClass}>Animales</h3>
          <AnimalSelector
            selectedAnimal={selectedAnimal}
            setSelectedAnimal={setSelectedAnimal}
            darkMode={darkMode}
          />
        </section>

        <section>
          <h3 className={sectionTitleClass}>Fechas</h3>
          <DateRangeFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            darkMode={darkMode}
          />
        </section>

        <section>
          <h3 className={sectionTitleClass}>Acciones</h3>
          <FilterActions
            onClear={handleClearFilters}
            onApply={handleApplyFilters}
            darkMode={darkMode}
          />        
          </section>
      </div>
    </aside>
  );
}
