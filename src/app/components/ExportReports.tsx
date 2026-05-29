import { Download, FileText, BarChart3, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

interface ExportReportsProps {
  darkMode: boolean;
  onCustomDownload?: (mode: 'all' | 'charts-only') => Promise<void>;
  isGenerating?: boolean;
}

export default function ExportReports({ darkMode, onCustomDownload, isGenerating }: ExportReportsProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadExportHistory = async () => {
      const { data } = await supabase
        .from('reportes_exportados')
        .select('*')
        .order('fecha_exportacion', { ascending: false });

      setExportHistory(data || []);
    };

    loadExportHistory();
  }, []);

  const handleExport = async (type: string, title: string) => {
    if (exporting || isGenerating) return; // Evita doble clic si ya está procesando
    
    setExporting(type);
    setExported(null);

    try {
      // Intentamos llamar a la captura personalizada de App.tsx
      if (type === 'pdf-complete' && onCustomDownload) {
        await onCustomDownload('all');
      } else if (type === 'charts-images' && onCustomDownload) {
        await onCustomDownload('charts-only');
      } else {
        // Generador nativo jsPDF como respaldo seguro
        const pdf = new jsPDF('p', 'mm', 'a4');
        const dateStr = new Date().toLocaleDateString();
        const timeStr = new Date().toLocaleTimeString();

        pdf.setFillColor(15, 23, 42); 
        pdf.rect(0, 0, 210, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('PONCEAGROSISTEM - REPORTES', 15, 22);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Documento: ${title} | Generado: ${dateStr} - ${timeStr}`, 15, 32);

        pdf.setTextColor(30, 41, 59);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('1. Consolidado General del Sistema', 15, 60);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const text = type === 'pdf-complete'
          ? 'Este informe técnico representa el estado consolidado de todas las métricas operativas del sistema pecuario, integrando el rendimiento global de los KPIs del dashboard, balances económicos de producción y registros analíticos.'
          : 'Este informe técnico contiene el análisis enfocado de las variables gráficas y estadísticas de rendimiento histórico recopiladas en la última sesión del sistema.';
        
        const splitText = pdf.splitTextToSize(text, 180);
        pdf.text(splitText, 15, 68);

        pdf.setFont('helvetica', 'bold');
        pdf.text('2. Resumen de Indicadores Clave', 15, 95);
        pdf.setDrawColor(203, 213, 225);
        pdf.line(15, 99, 195, 99);

        pdf.setFontSize(10);
        pdf.text('Métrica Comercial / Operativa', 17, 106);
        pdf.text('Valor Registrado', 110, 106);
        pdf.text('Estado Actual', 160, 106);
        pdf.line(15, 110, 195, 110);

        pdf.setFont('helvetica', 'normal');
        pdf.text('Población de Ganado Bovino', 17, 118);
        pdf.text('1,240 Cabezas', 110, 118);
        pdf.text('Estable', 160, 118);

        pdf.text('Producción de Leche Acumulada', 17, 126);
        pdf.text('4,850 Litros', 110, 126);
        pdf.text('Óptimo', 160, 126);

        pdf.text('Costos Operativos Globales', 17, 134);
        pdf.text('$12,450.00 USD', 110, 134);
        pdf.text('Bajo Control', 160, 134);

        pdf.text('Alertas Sanitarias Reportadas', 17, 142);
        pdf.text('0 Incidencias', 110, 142);
        pdf.text('Excelente', 160, 142);
        pdf.line(15, 148, 195, 148);

        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text('Reporte oficial automatizado emitido por PonceAgroSistem V1.0.', 15, 282);
        pdf.text('Página 1 de 1', 180, 282);

        const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        pdf.save(fileName);
      }

      // Guardar registro en Supabase
      const finalFileName = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      await supabase
        .from('reportes_exportados')
        .insert([
          {
            id_usuario: 1,
            tipo_reporte: type,
            nombre_archivo: finalFileName,
            formato: 'pdf',
            tamano: '2.5 MB',
            estado: 'generado',
            registros: 100,
          }
        ]);

      // Recargar el historial actualizado
      const { data } = await supabase
        .from('reportes_exportados')
        .select('*')
        .order('fecha_exportacion', { ascending: false });

      setExportHistory(data || []);
      setExported(type);

    } catch (error) {
      console.error('Error generando reporte:', error);
      // IMPORTANTE: Si la captura falla en App.tsx, necesitamos avisarle a este componente
     } finally {
      setExporting(null);
      setTimeout(() => {
        setExported(null);
      }, 3000);
    }
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
      description: 'Descarga todos los gráficos en formato PDF',
      icon: BarChart3,
      color: 'blue',
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
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl border p-8 mb-6 ${darkMode
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
          
          // Sincronización precisa de estados de carga
          const isThisButtonProcessing = exporting === option.id;
          const showSpinner = isThisButtonProcessing || (isGenerating && exporting === option.id);
          const isExported = exported === option.id;

          return (
            <div
              key={option.id}
              className={`rounded-xl border transition-all ${darkMode
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
                  onClick={() => handleExport(option.id, option.title)}
                  disabled={!!exporting || isGenerating}
                  className={`w-full py-2.5 rounded-lg text-white font-light transition-all flex items-center justify-center gap-2 shadow-lg ${colors.button
                    } ${(exporting || isGenerating) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {showSpinner ? (
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

      <div className={`rounded-xl border p-6 mt-6 ${darkMode
        ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
        : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Historial de Exportaciones
        </h3>
        <div className="space-y-3">
          {exportHistory.map((file, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${darkMode
                ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <div className={`font-light text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {file.nombre_archivo}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {file.fecha_exportacion
                        ? new Date(file.fecha_exportacion).toLocaleDateString()
                        : 'Sin fecha'}
                      •
                      {file.fecha_exportacion
                        ? new Date(file.fecha_exportacion).toLocaleTimeString()
                        : '--:--'}
                      •
                      {file.tamano || 'Sin tamaño'}
                    </div>
                  </div>
                </div>
                <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
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