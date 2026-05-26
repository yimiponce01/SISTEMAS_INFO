import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  type?: ToastType;
}

const toastStyles = {
  success: {
    Icon: CheckCircle,
    frame: 'border-emerald-300/30 shadow-emerald-500/20',
    icon: 'from-emerald-400 to-cyan-400 shadow-emerald-400/30',
  },
  error: {
    Icon: AlertCircle,
    frame: 'border-rose-300/35 shadow-rose-500/20',
    icon: 'from-rose-500 to-orange-400 shadow-rose-400/30',
  },
  info: {
    Icon: Info,
    frame: 'border-cyan-300/30 shadow-cyan-500/20',
    icon: 'from-cyan-400 to-violet-500 shadow-cyan-400/30',
  },
};

export default function Toast({
  message,
  show,
  onClose,
  duration = 3600,
  type = 'success',
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { Icon, frame, icon } = toastStyles[type];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed right-4 top-20 z-[100] pointer-events-none sm:right-6">
      <div
        className={`pointer-events-auto transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className={`flex min-w-[280px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur-2xl ${frame}`}>
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ${icon}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <p className="flex-1 text-sm font-light text-slate-100">{message}</p>
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
