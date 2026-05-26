import { Calendar } from 'lucide-react';

interface DateRangeFiltersProps {
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
}

export default function DateRangeFilters({ dateRange, setDateRange }: DateRangeFiltersProps) {
  const inputClass =
    'w-full rounded-2xl border bg-slate-950/50 py-3 pl-11 pr-3 text-sm text-white outline-none transition-all duration-300 [color-scheme:dark] focus:scale-[1.01]';
  const inputStyle = {
    borderColor: 'rgba(103, 232, 249, 0.22)',
    boxShadow:
      '0 12px 28px rgba(2,6,23,0.32), 0 0 18px rgba(34,211,238,0.12), inset 0 1px 14px rgba(255,255,255,0.06)',
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/80" />
        <input
          aria-label="Fecha desde"
          type="date"
          value={dateRange.from}
          onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/80" />
        <input
          aria-label="Fecha hasta"
          type="date"
          value={dateRange.to}
          onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })}
          className={inputClass}
          style={inputStyle}
        />
      </div>
    </div>
  );
}
