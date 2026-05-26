import {
  AlertCircle,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { DashboardData } from '../lib/dashboardData';

interface SmartAlertsPanelProps {
  selectedLivestock: 'bovinos' | 'gallinas' | 'both';
  darkMode: boolean;
  fullScreen?: boolean;
  dashboardData?: DashboardData | null;
}

export default function SmartAlertsPanel({
  selectedLivestock,
  darkMode,
  fullScreen,
  dashboardData,
}: SmartAlertsPanelProps) {
  const totals = dashboardData?.totals;

  const alerts: any[] = [];

  if (!dashboardData) {
    alerts.push({
      type: 'info',
      icon: Info,
      title: 'Sin datos disponibles',
      message: 'No hay datos disponibles para generar alertas',
      timestamp: 'Ahora',
      color: 'blue',
    });
  } else {
    if ((totals?.muertes || 0) > 0) {
      alerts.push({
        type: 'critical',
        icon: AlertCircle,
        title: 'Muertes Registradas',
        message: `Se registraron ${totals?.muertes || 0} muertes en el sistema`,
        timestamp: 'Ahora',
        color: 'red',
      });
    }

    if ((totals?.enfermedades || 0) > 0) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Enfermedades Detectadas',
        message: `Hay ${totals?.enfermedades || 0} registros de enfermedades`,
        timestamp: 'Ahora',
        color: 'amber',
      });
    }

    if ((totals?.produccion || 0) > 0) {
      alerts.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Producción Registrada',
        message: `La producción total actual es ${Number(totals?.produccion || 0).toFixed(2)}`,
        timestamp: 'Ahora',
        color: 'green',
      });
    }

    alerts.push({
      type: 'info',
      icon: Info,
      title: 'Balance General',
      message: `Ganancia total actual: $${Number(totals?.ganancias || 0).toFixed(2)}`,
      timestamp: 'Ahora',
      color: (totals?.ganancias || 0) >= 0 ? 'green' : 'red',
    });

    if ((totals?.animales || 0) > 0) {
      alerts.push({
        type: 'recommendation',
        icon: Lightbulb,
        title: 'Sistema Activo',
        message: `Hay ${totals?.animales || 0} animales registrados en el filtro actual`,
        timestamp: 'Ahora',
        color: 'blue',
      });
    }

    if (alerts.length === 1 && (totals?.ganancias || 0) === 0) {
      alerts.push({
        type: 'info',
        icon: Info,
        title: 'Sin registros',
        message: 'No hay registros productivos o financieros en el rango seleccionado',
        timestamp: 'Ahora',
        color: 'blue',
      });
    }
  }

  console.log('[SmartAlertsPanel] values', {
    selectedLivestock,
    totals,
    alerts: alerts.map((alert) => alert.message),
  });

  const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    red: {
      bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-700'
    },
    amber: {
      bg: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-700'
    },
    blue: {
      bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-700'
    },
    green: {
      bg: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-700'
    },
    purple: {
      bg: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-700'
    },
  };

  return (
    <div className={`${fullScreen ? 'w-full' : 'w-full'} ${fullScreen ? '' : 'sticky top-24'}`}>
      <div className={`rounded-xl border overflow-hidden ${darkMode
        ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
        : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`text-base font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Alertas Inteligentes
          </h3>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Alertas calculadas desde Supabase
          </p>
        </div>

        <div className="max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
          {alerts.map((alert, idx) => {
            const Icon = alert.icon;
            const colors = colorClasses[alert.color];
            return (
              <div
                key={`${alert.title}-${idx}`}
                className={`p-4 border-b transition-all hover:bg-opacity-70 hover:scale-[1.02] cursor-pointer ${darkMode ? 'border-slate-700' : 'border-slate-100'
                  } ${colors.bg} last:border-b-0`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-light text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {alert.title}
                      </h4>
                      <span className={`text-xs whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className={`text-xs font-light ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
