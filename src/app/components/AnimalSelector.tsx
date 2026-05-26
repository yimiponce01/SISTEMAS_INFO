import { Blend, CircleDot } from 'lucide-react';

type Animal = 'bovinos' | 'gallinas' | 'ambos';

interface AnimalSelectorProps {
  selectedAnimal: Animal;
  setSelectedAnimal: (animal: Animal) => void;
}

const animals = [
  {
    id: 'bovinos' as const,
    label: 'Bovinos',
    border: '#38BDF8',
    glow: 'rgba(0, 191, 255, 0.6)',
    fill: 'rgba(59, 130, 246, 0.2)',
    text: 'text-sky-100',
  },
  {
    id: 'gallinas' as const,
    label: 'Gallinas',
    border: '#FF8C42',
    glow: 'rgba(255, 122, 0, 0.6)',
    fill: 'rgba(255, 107, 0, 0.2)',
    text: 'text-orange-100',
  },
  {
    id: 'ambos' as const,
    label: 'Ambos',
    border: '#D946EF',
    glow: 'rgba(192, 38, 255, 0.6)',
    fill: 'rgba(168, 85, 247, 0.2)',
    text: 'text-fuchsia-100',
  },
];

export default function AnimalSelector({ selectedAnimal, setSelectedAnimal }: AnimalSelectorProps) {
  return (
    <div className="space-y-3">
      {animals.map((animal) => {
        const isActive = selectedAnimal === animal.id;
        const Icon = animal.id === 'ambos' ? Blend : CircleDot;

        return (
          <button
            key={animal.id}
            type="button"
            onClick={() => setSelectedAnimal(animal.id)}
            style={{
              borderColor: isActive ? animal.border : 'rgba(255,255,255,0.12)',
              background: isActive
                ? `linear-gradient(135deg, ${animal.fill}, rgba(15, 23, 42, 0.7) 62%, rgba(255,255,255,0.035))`
                : 'linear-gradient(135deg, rgba(255,255,255,0.045), rgba(2,6,23,0.58))',
              boxShadow: isActive
                ? `0 0 0 1px ${animal.border}, 0 0 28px ${animal.glow}, 0 0 68px ${animal.glow}, inset 0 1px 16px rgba(255,255,255,0.14), inset 0 0 26px ${animal.fill}`
                : '0 10px 26px rgba(2,6,23,0.30), inset 0 1px 12px rgba(255,255,255,0.05)',
            }}
            className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-sm font-light uppercase tracking-[0.16em] transition-all duration-300 before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/45 before:to-transparent hover:-translate-y-1 hover:scale-[1.015] ${
              isActive ? animal.text : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="relative z-10">{animal.label}</span>
          </button>
        );
      })}
    </div>
  );
}
