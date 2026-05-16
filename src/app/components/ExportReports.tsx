import { Download, FileText, BarChart3, PieChart, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ExportReportsProps {
  darkMode: boolean;
}

export default function ExportReports({ darkMode }: ExportReportsProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setExporting(type);
    setExported(null);

    setTimeout(() => {
      setExporting(null);
      setExported(type);
      setTimeout(() => setExported(null), 3000);
    }, 2000);
  };

  const exportOptions = [
    {
      id: 'pdf-complete',
      title: 'Dashboard Completo PDF',
      description: 'Exporta todos los KPIs, gráficos y análisis en formato PDF',
      icon: FileText,
      color: 'red',
    },
    {
      id: 'charts-images',
      title: 'Gráficos como Imágenes',
      description: 'Descarga todos los gráficos en formato PNG de alta resolución',
      icon: BarChart3,
      color: 'blue',
    },
    {
      id: 'summary-pdf',
      title: 'Resumen Ejecutivo',
      description: 'Informe ejecutivo con métricas clave y recomendaciones',
      icon: PieChart,
      color: 'purple',
    },
    {
      id: 'excel-data',
      title: 'Datos Filtrados Excel',
      description: 'Exporta los datos actuales según filtros aplicados a Excel',
      icon: FileSpreadsheet,
      color: 'green',
    },
    {
      id: 'comparison-report',
      title: 'Informe Comparativo',
      description: 'Reporte detallado de comparación entre Bovinos y Gallinas',
      icon: FileText,
      color: 'orange',
    },
    {
      id: 'financial-report',
      title: 'Reporte Financiero',
      description: 'Análisis completo de ingresos, gastos y ganancias',
      icon: FileText,
      color: 'emerald',
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string; button: string }> = {
    red: {
      bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-500/30',
    },
    blue: {
      bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30',
    },
    purple: {
      bg: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30',
    },
    green: {
      bg: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 shadow-green-500/30',
    },
    orange: {
      bg: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30',
    },
    emerald: {
      bg: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30',
    },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl border p-8 mb-6 ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Exportar Reportes
        </h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Descarga análisis y datos en múltiples formatos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const colors = colorClasses[option.color];
          const isExporting = exporting === option.id;
          const isExported = exported === option.id;

          return (
            <div
              key={option.id}
              className={`rounded-xl border transition-all ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              } ${isExported ? 'ring-2 ring-green-500' : ''} hover:shadow-lg`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {option.title}
                    </h3>
                    <p className={`text-sm font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {option.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExport(option.id)}
                  disabled={isExporting}
                  className={`w-full py-2.5 rounded-lg text-white font-light transition-all flex items-center justify-center gap-2 shadow-lg ${
                    colors.button
                  } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Exportando...</span>
                    </>
                  ) : isExported ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>¡Descargado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Descargar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export History */}
      <div className={`rounded-xl border p-6 mt-6 ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Historial de Exportaciones
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Dashboard_Completo_Mayo_2026.pdf', date: '2026-05-15', time: '14:23', size: '2.4 MB' },
            { name: 'Resumen_Ejecutivo_Abril_2026.pdf', date: '2026-05-10', time: '09:15', size: '1.8 MB' },
            { name: 'Datos_Bovinos_Q1_2026.xlsx', date: '2026-05-05', time: '16:42', size: '854 KB' },
          ].map((file, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <div className={`font-light text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {file.name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {file.date} • {file.time} • {file.size}
                    </div>
                  </div>
                </div>
                <button className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                }`}>
                  <Download className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
