import { BarChart3, Sprout } from 'lucide-react';

type Area = 'produccion' | 'finanzas';

interface AreaSelectorProps {
  selectedArea: Area;
  setSelectedArea: (area: Area) => void;
}

const areas = [
  {
    id: 'produccion' as const,
    label: 'Producción',
    Icon: Sprout,
    border: '#00FFC8',
    glow: 'rgba(0, 255, 179, 0.62)',
    fill: 'rgba(0, 229, 160, 0.2)',
    text: 'text-emerald-100',
    icon: 'text-emerald-300',
  },
  {
    id: 'finanzas' as const,
    label: 'Finanzas',
    Icon: BarChart3,
    border: '#FFE66D',
    glow: 'rgba(255, 215, 0, 0.62)',
    fill: 'rgba(255, 196, 0, 0.2)',
    text: 'text-amber-100',
    icon: 'text-amber-300',
  },
];

export default function AreaSelector({ selectedArea, setSelectedArea }: AreaSelectorProps) {
  return (
    <div className="space-y-3">
      {areas.map(({ id, label, Icon, border, glow, fill, text, icon }) => {
        const isActive = selectedArea === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedArea(id)}
            style={{
              borderColor: isActive ? border : 'rgba(255,255,255,0.12)',
              background: isActive
                ? `linear-gradient(135deg, ${fill}, rgba(15, 23, 42, 0.68) 58%, rgba(255,255,255,0.04))`
                : 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(15,23,42,0.64))',
              boxShadow: isActive
                ? `0 0 0 1px ${border}, 0 0 30px ${glow}, 0 0 76px ${glow}, inset 0 1px 18px rgba(255,255,255,0.14), inset 0 0 28px ${fill}`
                : 'inset 0 1px 14px rgba(255,255,255,0.06), 0 12px 30px rgba(2,6,23,0.34)',
            }}
            className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border px-4 py-4 text-left font-light uppercase tracking-[0.18em] transition-all duration-300 before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent hover:-translate-y-1 hover:scale-[1.015] ${
              isActive ? text : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="relative z-10">{label}</span>
            <Icon className={`relative z-10 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? icon : 'text-slate-500'}`} />
          </button>
        );
      })}
    </div>
  );
}
