import { useState } from 'react';
import { AlertCircle, CheckCircle, FileSpreadsheet, Loader, Upload } from 'lucide-react';

interface UploadModuleProps {
  darkMode: boolean;
}

type UploadType = 'bovinos' | 'gallinas' | 'ambos';

export default function UploadModule({ darkMode }: UploadModuleProps) {
  const [selectedType, setSelectedType] = useState<UploadType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (selectedType && event.dataTransfer.files?.[0]) {
      handleUpload(event.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedType && event.target.files?.[0]) {
      handleUpload(event.target.files[0]);
    }
  };

  const handleUpload = (file: File) => {
    void file;
    setUploading(true);
    setUploadComplete(false);

    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
    }, 2000);
  };

  const typeAccent = selectedType === 'bovinos' ? 'text-sky-300' : selectedType === 'gallinas' ? 'text-orange-300' : 'text-fuchsia-300';

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-xl border p-6 sm:p-8 ${
        darkMode
          ? 'bg-slate-900/70 border-cyan-300/10 backdrop-blur-xl shadow-2xl shadow-cyan-950/30'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Añadir Registros
        </h2>
        <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Importa datos desde archivos Excel o CSV
        </p>

        <div className="mb-8">
          <label className={`block text-sm font-light mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Selecciona el tipo de importación
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(['bovinos', 'gallinas', 'ambos'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setUploadComplete(false);
                }}
                className={`rounded-xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${
                  selectedType === type
                    ? 'border-cyan-300 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
                    : darkMode
                      ? 'border-slate-700 bg-slate-950/40 hover:border-cyan-300/40'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className={`font-light capitalize ${selectedType === type ? 'text-cyan-200' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedType && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-8 transition-all sm:p-12 ${
              dragActive
                ? 'border-cyan-300 bg-cyan-400/10'
                : darkMode
                  ? 'border-slate-600 bg-slate-950/35'
                  : 'border-slate-300 bg-slate-50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="hidden"
            />

            {!uploading && !uploadComplete && (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center">
                  <Upload className={`w-16 h-16 mx-auto mb-4 ${typeAccent}`} />
                  <div className={`text-lg font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Arrastra el archivo aquí o haz clic para seleccionar
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Formatos soportados: Excel (.xlsx, .xls) o CSV (.csv)
                  </div>
                </div>
              </label>
            )}

            {uploading && (
              <div className="text-center">
                <Loader className={`w-16 h-16 mx-auto mb-4 animate-spin ${typeAccent}`} />
                <div className={`text-lg font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Subiendo archivo...
                </div>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Procesando y validando datos
                </div>
              </div>
            )}

            {uploadComplete && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <div className={`text-lg font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Archivo recibido correctamente
                </div>
                <div className="mb-4 text-sm font-light text-slate-400">
                  Sin conteo de registros hasta completar la importación real en Supabase
                </div>
                <button
                  type="button"
                  onClick={() => setUploadComplete(false)}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-2.5 font-light text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  Subir otro archivo
                </button>
              </div>
            )}
          </div>
        )}

        <div className={`mt-8 rounded-lg border p-6 ${
          darkMode
            ? 'bg-slate-950/40 border-slate-700'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-4">
            <FileSpreadsheet className={`w-6 h-6 flex-shrink-0 ${darkMode ? 'text-cyan-300' : 'text-slate-600'}`} />
            <div className="flex-1">
              <div className={`font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Formatos de archivo soportados
              </div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Excel, CSV, hasta 10 MB. La opción Ambos procesa registros mixtos de bovinos y gallinas.
              </div>
            </div>
            <AlertCircle className="h-5 w-5 text-amber-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
