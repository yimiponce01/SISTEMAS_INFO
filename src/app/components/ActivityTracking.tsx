import { FileSpreadsheet, Calendar, Clock, Database } from 'lucide-react';

interface ActivityTrackingProps {
  darkMode: boolean;
}

const mockActivities = [
  {
    fileName: 'EXCEL_BOVINOS_MAYO.xlsx',
    records: 125,
    date: '2026-05-15',
    time: '16:06',
    type: 'bovinos',
  },
  {
    fileName: 'GALLINAS_PRODUCCION_MAYO.csv',
    records: 84,
    date: '2026-05-14',
    time: '10:14',
    type: 'gallinas',
  },
  {
    fileName: 'BOVINOS_VENTAS_ABRIL.xlsx',
    records: 43,
    date: '2026-05-10',
    time: '14:32',
    type: 'bovinos',
  },
  {
    fileName: 'GALLINAS_INCUBACION_MAYO.xlsx',
    records: 156,
    date: '2026-05-08',
    time: '09:22',
    type: 'gallinas',
  },
  {
    fileName: 'BOVINOS_NACIMIENTOS_ABRIL.csv',
    records: 28,
    date: '2026-05-05',
    time: '15:45',
    type: 'bovinos',
  },
  {
    fileName: 'GALLINAS_SALUD_MAYO.xlsx',
    records: 92,
    date: '2026-05-03',
    time: '11:18',
    type: 'gallinas',
  },
  {
    fileName: 'BOVINOS_GASTOS_ABRIL.xlsx',
    records: 67,
    date: '2026-04-28',
    time: '16:50',
    type: 'bovinos',
  },
  {
    fileName: 'GALLINAS_VENTAS_ABRIL.csv',
    records: 112,
    date: '2026-04-25',
    time: '13:27',
    type: 'gallinas',
  },
];

export default function ActivityTracking({ darkMode }: ActivityTrackingProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl border p-8 ${
        darkMode
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
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-slate-700' : 'bg-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <Database className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              <span className={`font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {mockActivities.length} importaciones
              </span>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {mockActivities.map((activity, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-lg border transition-all hover:shadow-md ${
                darkMode
                  ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  activity.type === 'bovinos'
                    ? darkMode
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-blue-50 border border-blue-200'
                    : darkMode
                      ? 'bg-orange-500/20 border border-orange-500/30'
                      : 'bg-orange-50 border border-orange-200'
                }`}>
                  <FileSpreadsheet className={`w-6 h-6 ${
                    activity.type === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
                  }`} />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {activity.fileName}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm inline-flex items-center gap-1 ${
                      activity.type === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
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
              {mockActivities.reduce((sum, a) => sum + a.records, 0).toLocaleString()}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Total de Registros
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-blue-600 mb-1">
              {mockActivities.filter(a => a.type === 'bovinos').length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Archivos Bovinos
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-orange-600 mb-1">
              {mockActivities.filter(a => a.type === 'gallinas').length}
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
