import { Filter, RotateCcw } from 'lucide-react';

interface FilterActionsProps {
  onClear: () => void;
  onApply: () => void;
  darkMode: boolean;
}

export default function FilterActions({
  onClear,
  onApply,
  darkMode
}: FilterActionsProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClear}
        style={
          darkMode
            ? {
                borderColor: 'rgba(148, 163, 184, 0.32)',
                boxShadow:
                  '0 12px 28px rgba(2,6,23,0.32), inset 0 1px 14px rgba(255,255,255,0.06), inset 0 0 18px rgba(148,163,184,0.06)',
              }
            : {
                borderColor: '#cbd5e1',
                boxShadow:
                  '0 0 0 1px rgba(203,213,225,0.35), 0 6px 18px rgba(15,23,42,0.06)',
              }
        }
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-light uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] ${
        darkMode
          ? 'bg-white/[0.045] text-slate-300 hover:border-slate-200/60 hover:bg-white/[0.08] hover:text-white'
          : 'bg-white text-slate-700 hover:text-slate-900'
      }`}      >
        <RotateCcw className="h-4 w-4" />
        Limpiar filtros
      </button>

      <button
        type="button"
        onClick={onApply}
        style={{
          borderColor: 'rgba(196, 181, 253, 0.72)',
          boxShadow:
            '0 0 0 1px rgba(196,181,253,0.32), 0 0 28px rgba(139,92,246,0.50), 0 0 56px rgba(34,211,238,0.24), inset 0 1px 18px rgba(255,255,255,0.16)',
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-medium uppercase tracking-[0.14em] className={`flex w-full items-center justify-center gap-2 rounded-2xl border bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-light uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] ${
  darkMode
    ? 'text-white'
    : 'text-white'
}`} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015]"
      >
        <Filter className="h-4 w-4" />
        Aplicar filtros
      </button>
    </div>
  );
}
