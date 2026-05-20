import {
  FileSpreadsheet,
  Calendar,
  Clock,
  Database
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

interface ActivityTrackingProps {
  darkMode: boolean;
}



export default function ActivityTracking({ darkMode }: ActivityTrackingProps) {

  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {

    const loadActivities = async () => {

      const { data } = await supabase
        .from('reportes_exportados')
        .select('*')
        .order('fecha_exportacion', {
          ascending: false
        });

      const formattedData =
        (data || []).map((item: any) => ({

          fileName:
            item.nombre_archivo,

          records:
            Number(item.registros || 0),

          date:
            new Date(item.fecha_exportacion)
              .toLocaleDateString(),

          time:
            new Date(item.fecha_exportacion)
              .toLocaleTimeString(),

          type:
            item.tipo_reporte?.includes('bovinos')
              ? 'bovinos'
              : 'gallinas',

        }));

      setActivities(formattedData);

    };

    loadActivities();

  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl border p-8 ${darkMode
        ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
        : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Seguimiento de Actividad
            </h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Historial de archivos importados
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'
            }`}>
            <div className="flex items-center gap-2">
              <Database className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              <span className={`font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {activities.length} importaciones
              </span>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-lg border transition-all hover:shadow-md ${darkMode
                ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
            >
              <div className="flex items-center gap-6">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${activity.type === 'bovinos'
                  ? darkMode
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-blue-50 border border-blue-200'
                  : darkMode
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-orange-50 border border-orange-200'
                  }`}>
                  <FileSpreadsheet className={`w-6 h-6 ${activity.type === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {activity.fileName}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm inline-flex items-center gap-1 ${activity.type === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {activity.type === 'bovinos' ? 'Bovinos' : 'Gallinas'}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {activity.records} registros
                    </span>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="flex-shrink-0 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-light ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {activity.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-light ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}">
          <div className="text-center">
            <div className={`text-3xl font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {activities
                .reduce(
                  (sum, a) => sum + Number(a.records || 0),
                  0
                )
                .toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Total de Registros
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-blue-600 mb-1">
              {activities.filter(
                a => a.type === 'bovinos'
              ).length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Archivos Bovinos
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-orange-600 mb-1">
              {activities.filter(
                a => a.type === 'gallinas'
              ).length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Archivos Gallinas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
