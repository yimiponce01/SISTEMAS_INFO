import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadModuleProps {
  darkMode: boolean;
}

export default function UploadModule({ darkMode }: UploadModuleProps) {
  const [selectedType, setSelectedType] = useState<'bovinos' | 'gallinas' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedRecords, setUploadedRecords] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (selectedType && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedType && e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = (file: File) => {
    setUploading(true);
    setUploadComplete(false);

    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
      setUploadedRecords(Math.floor(Math.random() * 200) + 50);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`rounded-xl border p-8 ${
        darkMode
          ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Añadir Registros
        </h2>
        <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Importa datos desde archivos Excel o CSV
        </p>

        {/* Type Selection */}
        <div className="mb-8">
          <label className={`block text-sm font-light mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Selecciona el tipo de ganado
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedType('bovinos');
                setUploadComplete(false);
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedType === 'bovinos'
                  ? 'border-blue-500 bg-blue-500/10'
                  : darkMode
                    ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="text-center">
                {/*<div className="text-4xl mb-2">🐄</div>*/}
                <div className={`font-light ${selectedType === 'bovinos' ? 'text-blue-600' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Bovinos
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedType('gallinas');
                setUploadComplete(false);
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedType === 'gallinas'
                  ? 'border-orange-500 bg-orange-500/10'
                  : darkMode
                    ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🐔</div>
                <div className={`font-light ${selectedType === 'gallinas' ? 'text-orange-600' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Gallinas
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {selectedType && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 transition-all ${
              dragActive
                ? selectedType === 'bovinos'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-orange-500 bg-orange-500/10'
                : darkMode
                  ? 'border-slate-600 bg-slate-700/30'
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
                  <Upload className={`w-16 h-16 mx-auto mb-4 ${
                    selectedType === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
                  }`} />
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
                <Loader className={`w-16 h-16 mx-auto mb-4 animate-spin ${
                  selectedType === 'bovinos' ? 'text-blue-600' : 'text-orange-600'
                }`} />
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
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <div className={`text-lg font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  ¡Datos añadidos correctamente!
                </div>
                <div className={`text-2xl font-light text-green-600 mb-4`}>
                  {uploadedRecords} registros importados
                </div>
                <button
                  onClick={() => setUploadComplete(false)}
                  className={`px-6 py-2.5 rounded-lg font-light transition-all ${
                    selectedType === 'bovinos'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Subir otro archivo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Supported Formats */}
        <div className={`mt-8 p-6 rounded-lg border ${
          darkMode
            ? 'bg-slate-700/30 border-slate-600'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-4">
            <FileSpreadsheet className={`w-6 h-6 flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            <div className="flex-1">
              <div className={`font-light mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Formatos de archivo soportados
              </div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <ul className="list-disc list-inside space-y-1">
                  <li>Microsoft Excel (.xlsx, .xls)</li>
                  <li>Valores separados por comas (.csv)</li>
                  <li>Tamaño máximo: 10 MB</li>
                  <li>Los datos deben incluir columnas: ID, Fecha, Categoría, Valores</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
