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
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    const { data } = await supabase
      .from('reportes_exportados')
      .select('*')
      .order('fecha_exportacion', { ascending: false });

    setExportHistory(data?.slice(0, 5) || []);
  };

  const handleExport = async (type: string, title: string) => {
    if (exporting || isGenerating) return;
    
    setExporting(type);
    setExported(null);

    try {
      const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;

      // 1. Lógica de descarga (Prioridad absoluta)
      if (type === 'pdf-complete' && onCustomDownload) {
        await onCustomDownload('all');
      } else if (type === 'charts-images' && onCustomDownload) {
        await onCustomDownload('charts-only');
      } else {
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.text('Reporte generado automáticamente', 15, 20);
        pdf.save(fileName);
      }

      // 2. Inserción en Supabase (Bloque blindado para no romper la descarga)
      try {
        await supabase.from('reportes_exportados').insert([{
          tipo_reporte: type,
          nombre_archivo: fileName,
          formato: 'pdf',
          tamano: '2.5 MB',
          estado: 'generado',
          registros: 1 // Obligatorio según tu estructura de BD
        }]);
        await loadExportHistory();
      } catch (dbError) {
        console.warn("PDF descargado, pero fallo al registrar en BD:", dbError);
      }

      setExported(type);
    } catch (error) {
      console.error('Error crítico:', error);
    } finally {
      setExporting(null);
      setTimeout(() => setExported(null), 3000);
    }
  };
  
  const exportOptions = [
    { id: 'pdf-complete', title: 'Dashboard Completo PDF', description: 'Exporta todos los KPIs y alertas', icon: FileText, color: 'red' },
    { id: 'charts-images', title: 'Gráficos como Imágenes', description: 'Descarga solo el análisis de tendencias', icon: BarChart3, color: 'blue' },
  ];

  const colorClasses: Record<string, any> = {
    red: { bg: darkMode ? 'bg-red-500/10' : 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' },
    blue: { bg: darkMode ? 'bg-blue-500/10' : 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl border p-8 mb-6 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Exportar Reportes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const colors = colorClasses[option.color];
          return (
            <div key={option.id} className={`rounded-xl border p-6 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => handleExport(option.id, option.title)}
                disabled={!!exporting || !!isGenerating}
                className={`w-full py-2.5 rounded-lg text-white ${colors.button} flex items-center justify-center gap-2`}
              >
                {exporting === option.id ? 'Exportando...' : exported === option.id ? <><CheckCircle /> ¡Listo!</> : <><Download /> Descargar</>}
              </button>
            </div>
          );
        })}
      </div>

      <div className={`rounded-xl border p-6 mt-6 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Historial</h3>
        <div className="space-y-3">
          {exportHistory.map((file) => (
            <div key={file.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{file.nombre_archivo}</span>
                <span className="text-xs text-slate-500">
                  {file.fecha_exportacion ? new Date(file.fecha_exportacion).toLocaleDateString() : '---'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}