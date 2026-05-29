import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Loader, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadModuleProps {
  darkMode: boolean;
}

const TIPO_ANIMAL_MAP: Record<number, string> = {
  1: 'Vaca',
  2: 'Gallina',
  3: 'Toro',
  4: 'Cría Bovina',
  5: 'Pollito'
};

const TIPO_ANIMAL_PREFIX: Record<number, string> = {
  1: 'BOV',
  2: 'GAL',
  3: 'TOR',
  4: 'CRB',
  5: 'POL'
};

const RAZAS_POR_TIPO: Record<number, string[]> = {
  1: ['Holstein', 'Jersey', 'Gyr', 'Brown Swiss', 'Normando'],
  2: ['Leghorn', 'Rhode Island Red', 'Plymouth Rock', 'Criolla', 'Cobb 500'],
  3: ['Brahman', 'Angus', 'Hereford', 'Charolais', 'Nelore'],
  4: ['Mestizo Bovino', 'Puro por cruce'],
  5: ['BB Línea Carne', 'BB Línea Postura', 'BB Criollo']
};

const TIPO_MOVIMIENTO_MAP: Record<number, string> = {
  1: 'Venta',
  2: 'Compra',
  3: 'Traslado',
  4: 'Ajuste'
};

const ESTADOS_PERMITIDOS = ['activo', 'enfermo', 'muerto'];

interface AnimalDB {
  id_animal: number;
  id_tipo: number;
  codigo: string;
  sexo?: string;
  raza?: string;
  fecha_ingreso: string;
  estado: string;
}

interface MovimientoDB {
  id_movimiento: number;
  id_animal: number;
  fecha: string;
  descripcion: string;
  id_tipo_animal: number;
  id_tipo_movimiento: number;
  monto: number;
  animales?: {
    codigo: string;
    raza: string;
    id_tipo: number;
  };
}

interface NewAnimalRow {
  _tempId: string;
  id_tipo: number;
  codigo: string;
  raza: string;
  estado: string;
  fecha_ingreso: string;
}

interface NewMovRow {
  _tempId: string;
  id_animal: number;
  id_tipo_movimiento: number;
  descripcion: string;
  monto: string;
  fecha: string;
}

export default function UploadModule({ darkMode }: UploadModuleProps) {
  // --- Hojas de Estilo Dinámicas para Ambos Modos ---
  const headerCls = darkMode 
    ? 'bg-slate-950/40 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]' 
    : 'bg-white border border-slate-200 shadow-sm';
    
  const cardCls = darkMode 
    ? 'bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-xl rounded-xl' 
    : 'bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)]';
    
  const thCls = darkMode 
    ? 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white bg-slate-950 border-b border-cyan-500/20' 
    : 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 border-b border-slate-200';
    
  const inputCls = darkMode 
    ? 'w-full px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-white font-bold text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(34,211,238,0.4)]' 
    : 'w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all';
    
  const selectCls = inputCls + ' cursor-pointer';
  
  const filterInputCls = darkMode 
    ? 'px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-white font-bold text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-64 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]' 
    : 'px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64 shadow-sm';

  // --- Paleta de Estados Elegante (Pastel con Contraste en Modo Claro) ---
  const getEstadoClass = (estadoRaw: string) => {
    const estado = (estadoRaw || '').toLowerCase().trim();
    if (estado === 'activo') {
      return darkMode 
        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-extrabold shadow-[0_0_6px_rgba(16,185,129,0.3)]' 
        : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
    }
    if (estado === 'enfermo') {
      return darkMode 
        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40 font-extrabold shadow-[0_0_6px_rgba(245,158,11,0.3)]' 
        : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
    }
    return darkMode 
      ? 'bg-red-950/80 text-red-400 border border-red-500/40 font-extrabold shadow-[0_0_6px_rgba(239,68,68,0.3)]' 
      : 'bg-red-100 text-red-800 border border-red-300 font-bold';
  };

  // --- Estados de la Aplicación ---
  const [animales, setAnimales] = useState<AnimalDB[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoDB[]>([]);
  const [loadingAnimales, setLoadingAnimales] = useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [savingGlobal, setSavingGlobal] = useState(false);

  const [newAnimalRows, setNewAnimalRows] = useState<NewAnimalRow[]>([]);
  const [newMovRows, setNewMovRows] = useState<NewMovRow[]>([]);

  const [searchAnimal, setSearchAnimal] = useState('');
  const [searchMov, setSearchMov] = useState('');

  const [pageAnimals, setPageAnimals] = useState(1);
  const [pageMovs, setPageMovs] = useState(1);
  const itemsPerPage = 5;

  const [editingEstado, setEditingEstado] = useState<Record<number, string>>({});

  // --- Carga de Datos en memoria ---
  const loadAnimales = useCallback(async () => {
    setLoadingAnimales(true);
    try {
      const { data, error } = await supabase
        .from('animales')
        .select('id_animal, id_tipo, codigo, sexo, raza, fecha_ingreso, estado')
        .order('id_animal', { ascending: false });
      if (error) throw error;
      setAnimales(data || []);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingAnimales(false);
    }
  }, []);

  const loadMovimientos = useCallback(async () => {
    setLoadingMovimientos(true);
    try {
      const { data, error } = await supabase
        .from('movimientos_animales')
        .select(`
          id_movimiento, id_animal, fecha, descripcion, id_tipo_animal, id_tipo_movimiento, monto,
          animales ( codigo, raza, id_tipo )
        `)
        .order('id_movimiento', { ascending: false });
      if (error) throw error;
      setMovimientos((data as any) || []);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoadingMovimientos(false);
    }
  }, []);

  useEffect(() => {
    loadAnimales();
    loadMovimientos();
  }, [loadAnimales, loadMovimientos]);

  // --- Generador de Códigos Autoincrementales Inteligentes ---
  async function generateNextCode(id_tipo: number): Promise<string> {
    const prefix = TIPO_ANIMAL_PREFIX[id_tipo] || 'ANI';
    try {
      const { data, error } = await supabase
        .from('animales')
        .select('codigo')
        .ilike('codigo', `${prefix}-%`)
        .order('codigo', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return `${prefix}-001`;
      }

      const lastCode = data[0].codigo;
      const match = lastCode.match(/-(\d+)$/);
      if (!match) return `${prefix}-001`;

      const nextNumber = parseInt(match[1], 10) + 1;
      return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
    } catch {
      return `${prefix}-001`;
    }
  }

  // --- Manejadores de Eventos de Filas ---
  async function handleAddAnimalRow() {
    const defaultTipo = 1; 
    const customCode = await generateNextCode(defaultTipo);
    const razasDisponibles = RAZAS_POR_TIPO[defaultTipo] || [];
    
    const row: NewAnimalRow = {
      _tempId: `tmp_${Date.now()}`,
      id_tipo: defaultTipo,
      codigo: customCode,
      raza: razasDisponibles[0] || '',
      estado: 'activo',
      fecha_ingreso: new Date().toISOString().slice(0, 10)
    };
    setNewAnimalRows(prev => [row, ...prev]);
  }

  async function handleTipoChangeOnNewRow(tempId: string, newIdTipo: number) {
    const updatedCode = await generateNextCode(newIdTipo);
    const razasDisponibles = RAZAS_POR_TIPO[newIdTipo] || [];
    setNewAnimalRows(prev => prev.map(r => r._tempId === tempId ? { 
      ...r, 
      id_tipo: newIdTipo, 
      codigo: updatedCode, 
      raza: razasDisponibles[0] || '' 
    } : r));
  }

  function handleAddMovRow() {
    if (animales.length === 0) {
      setErrorMsg('Registra un animal primero antes de añadir un movimiento.');
      return;
    }
    const row: NewMovRow = {
      _tempId: `tmp_${Date.now()}`,
      id_animal: animales[0].id_animal,
      id_tipo_movimiento: 1,
      descripcion: '',
      monto: '',
      fecha: new Date().toISOString()
    };
    setNewMovRows(prev => [row, ...prev]);
  }

  async function handleChangeEstado(id_animal: number, nuevoEstado: string) {
    setEditingEstado(prev => ({ ...prev, [id_animal]: nuevoEstado }));
    try {
      const { error } = await supabase
        .from('animales')
        .update({ estado: nuevoEstado.trim().toLowerCase() })
        .eq('id_animal', id_animal);
      if (error) throw error;
      setAnimales(prev => prev.map(a => a.id_animal === id_animal ? { ...a, estado: nuevoEstado } : a));
    } catch (e: any) {
      setErrorMsg('Error al cambiar estado: ' + e.message);
    }
  }

  // --- Transacciones globales a Base de Datos (Corregido) ---
  async function saveChanges() {
    setSavingGlobal(true);
    setErrorMsg(null);
    try {
      if (newAnimalRows.length > 0) {
        const { error } = await supabase.from('animales').insert(
          newAnimalRows.map(r => ({
            id_tipo: r.id_tipo, 
            codigo: r.codigo, 
            raza: r.raza || null,
            estado: r.estado.trim().toLowerCase(),
            fecha_ingreso: r.fecha_ingreso
          }))
        );
        if (error) throw error;
        setNewAnimalRows([]);
        await loadAnimales();
      }

      if (newMovRows.length > 0) {
        const { error } = await supabase.from('movimientos_animales').insert(
          newMovRows.map(r => {
            const ani = animales.find(a => a.id_animal === r.id_animal);
            return {
              id_animal: r.id_animal,
              id_tipo_animal: ani ? ani.id_tipo : 1,
              id_tipo_movimiento: r.id_tipo_movimiento,
              descripcion: r.descripcion,
              monto: parseFloat(r.monto) || 0,
              fecha: r.fecha
            };
          })
        );
        if (error) throw error;
        setNewMovRows([]);
        await loadMovimientos();
      }

      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setSavingGlobal(false);
    }
  }

  // --- Filtros Integrados de Búsqueda ---
  const filteredAnimals = animales.filter(a => {
    const search = searchAnimal.toLowerCase();
    return a.codigo.toLowerCase().includes(search) || 
           (TIPO_ANIMAL_MAP[a.id_tipo] || '').toLowerCase().includes(search) ||
           (a.raza || '').toLowerCase().includes(search) ||
           a.estado.toLowerCase().includes(search);
  });

  const filteredMovs = movimientos.filter(m => {
    const search = searchMov.toLowerCase();
    return (m.animales?.codigo || '').toLowerCase().includes(search) ||
           (TIPO_ANIMAL_MAP[m.animales?.id_tipo || m.id_tipo_animal] || '').toLowerCase().includes(search) ||
           (m.animales?.raza || '').toLowerCase().includes(search) ||
           m.descripcion.toLowerCase().includes(search);
  });

  const totalAnimalPages = Math.ceil(filteredAnimals.length / itemsPerPage) || 1;
  const currentAnimals = filteredAnimals.slice((pageAnimals - 1) * itemsPerPage, pageAnimals * itemsPerPage);

  const totalMovPages = Math.ceil(filteredMovs.length / itemsPerPage) || 1;
  const currentMovs = filteredMovs.slice((pageMovs - 1) * itemsPerPage, pageMovs * itemsPerPage);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 pt-4">
      
      {/* Cabecera Principal */}
      <div className={`flex justify-between items-center p-4 rounded-xl border ${headerCls}`}>
        <h2 className={`text-xl font-black tracking-wide ${darkMode ? 'text-white' : 'text-slate-800'}`}>PonceAgroSistem - Control Operativo</h2>
        <div className="flex gap-2">
          {savedOk && <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg font-bold">¡Guardado con éxito!</span>}
          {errorMsg && <span className="text-xs bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg font-bold">{errorMsg}</span>}
          <button 
            onClick={saveChanges}
            disabled={savingGlobal || (newAnimalRows.length === 0 && newMovRows.length === 0)}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-sm disabled:opacity-30 transition-all transform hover:-translate-y-0.5"
          >
            {savingGlobal ? 'Procesando...' : 'Guardar Cambios Pendientes'}
          </button>
        </div>
      </div>

      {/* Tabla de Animales */}
      <div className={cardCls}>
        <div className={`flex items-center justify-between px-4 py-4 border-b rounded-t-xl flex-wrap gap-4 ${darkMode ? 'border-cyan-500/20 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex items-center gap-4">
            <h3 className={`text-sm font-black tracking-wide ${darkMode ? 'text-cyan-400' : 'text-slate-800'}`}>Listado de Animales</h3>
            <input 
              type="text" 
              placeholder="🔍 Buscar en animales..." 
              value={searchAnimal} 
              onChange={e => { setSearchAnimal(e.target.value); setPageAnimals(1); }} 
              className={filterInputCls} 
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAddAnimalRow} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm"><Plus className="w-4 h-4" /> Añadir Animal</button>
            <button onClick={loadAnimales} className={`p-1.5 rounded-lg border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Código Auto</th>
                <th className={thCls}>Tipo Especie</th>
                <th className={thCls}>Raza Configurada</th>
                <th className={thCls}>Estado Coloreado</th>
                <th className={thCls}>Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {newAnimalRows.map(row => {
                const razasDisponibles = RAZAS_POR_TIPO[row.id_tipo] || [];
                return (
                  <tr key={row._tempId} className={darkMode ? 'bg-cyan-950/10 border-l-4 border-l-cyan-400' : 'bg-blue-50/40 border-l-4 border-l-blue-500'}>
                    <td className="p-2 font-mono font-bold text-cyan-500"><input type="text" value={row.codigo} readOnly className={inputCls + (darkMode ? ' text-cyan-400' : ' text-blue-600 bg-white font-bold')} /></td>
                    <td className="p-2">
                      <select value={row.id_tipo} onChange={e => handleTipoChangeOnNewRow(row._tempId, Number(e.target.value))} className={selectCls}>
                        {Object.entries(TIPO_ANIMAL_MAP).map(([id, val]) => <option key={id} value={id} className={darkMode ? 'bg-slate-950' : 'bg-white text-slate-900'}>{val}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select 
                        value={row.raza} 
                        onChange={e => setNewAnimalRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, raza: e.target.value} : r))} 
                        className={selectCls}
                      >
                        {razasDisponibles.map(rz => <option key={rz} value={rz} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>{rz}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select 
                        value={row.estado} 
                        onChange={e => setNewAnimalRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, estado: e.target.value} : r))} 
                        className={`w-full px-2 py-1.5 rounded-lg border text-sm focus:outline-none transition-all ${getEstadoClass(row.estado)}`}
                      >
                        {ESTADOS_PERMITIDOS.map(est => <option key={est} value={est} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>{est}</option>)}
                      </select>
                    </td>
                    <td className="p-2 flex items-center justify-between mt-1">
                      <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{row.fecha_ingreso}</span>
                      <button onClick={() => setNewAnimalRows(prev => prev.filter(r => r._tempId !== row._tempId))} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}

              {loadingAnimales ? (
                <tr><td colSpan={5} className="p-8 text-center text-xs font-bold text-slate-400">Consultando base de datos PonceAgroSistem...</td></tr>
              ) : currentAnimals.map(animal => {
                const currentEst = editingEstado[animal.id_animal] ?? animal.estado;
                return (
                  <tr key={animal.id_animal} className={`border-t transition-colors ${darkMode ? 'hover:bg-slate-800/40 border-slate-800/60' : 'hover:bg-slate-50 border-slate-100'}`}>
                    <td className={`p-3 font-mono text-xs font-black tracking-wide ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>{animal.codigo}</td>
                    <td className={`p-3 text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{TIPO_ANIMAL_MAP[animal.id_tipo] || 'Desconocido'}</td>
                    <td className={`p-3 text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{animal.raza || '—'}</td>
                    <td className="p-3">
                      <select 
                        value={currentEst} 
                        onChange={e => handleChangeEstado(animal.id_animal, e.target.value)}
                        className={`py-1 px-2.5 text-xs rounded-lg focus:outline-none border transition-all ${getEstadoClass(currentEst)}`}
                      >
                        {ESTADOS_PERMITIDOS.map(op => <option key={op} value={op} className={darkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}>{op}</option>)}
                      </select>
                    </td>
                    <td className={`p-3 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(animal.fecha_ingreso).toLocaleDateString('es-PE')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`flex items-center justify-between p-3 border-t text-xs font-bold text-slate-400 rounded-b-xl ${darkMode ? 'border-cyan-500/20 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}`}>
          <span>Página {pageAnimals} de {totalAnimalPages}</span>
          <div className="flex gap-1">
            <button disabled={pageAnimals === 1} onClick={() => setPageAnimals(p => p - 1)} className={`p-1.5 border rounded-lg disabled:opacity-20 ${darkMode ? 'border-slate-700 hover:text-white' : 'border-slate-300 hover:bg-white text-slate-600'}`}><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={pageAnimals === totalAnimalPages} onClick={() => setPageAnimals(p => p + 1)} className={`p-1.5 border rounded-lg disabled:opacity-20 ${darkMode ? 'border-slate-700 hover:text-white' : 'border-slate-300 hover:bg-white text-slate-600'}`}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className={cardCls}>
        <div className={`flex items-center justify-between px-4 py-4 border-b rounded-t-xl flex-wrap gap-4 ${darkMode ? 'border-cyan-500/20 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="flex items-center gap-4">
            <h3 className={`text-sm font-black tracking-wide ${darkMode ? 'text-purple-400' : 'text-slate-800'}`}>Historial de Flujo de Movimientos</h3>
            <input 
              type="text" 
              placeholder="🔍 Buscar en movimientos..." 
              value={searchMov} 
              onChange={e => { setSearchMov(e.target.value); setPageMovs(1); }} 
              className={filterInputCls} 
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAddMovRow} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"><Plus className="w-4 h-4" /> Añadir Movimiento</button>
            <button onClick={loadMovimientos} className={`p-1.5 rounded-lg border ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Animal Vinculado</th>
                <th className={thCls}>Tipo Especie</th>
                <th className={thCls}>Raza</th>
                <th className={thCls}>Clase Movimiento</th>
                <th className={thCls}>Descripción Adicional</th>
                <th className={thCls}>Monto Efectivo</th>
                <th className={thCls}>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {newMovRows.map(row => {
                const targetAni = animales.find(a => a.id_animal === row.id_animal);
                return (
                  <tr key={row._tempId} className={darkMode ? 'bg-purple-950/20 border-l-4 border-l-purple-400' : 'bg-purple-50/40 border-l-4 border-l-purple-500'}>
                    <td className="p-2">
                      <select value={row.id_animal} onChange={e => setNewMovRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, id_animal: Number(e.target.value)} : r))} className={selectCls}>
                        {animales.map(a => <option key={a.id_animal} value={a.id_animal} className={darkMode ? 'bg-slate-950' : 'bg-white text-slate-900'}>{a.codigo} - {a.raza || 'Sin raza'}</option>)}
                      </select>
                    </td>
                    <td className={`p-2 text-xs opacity-90 font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{targetAni ? TIPO_ANIMAL_MAP[targetAni.id_tipo] : '—'}</td>
                    <td className={`p-2 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{targetAni?.raza || '—'}</td>
                    <td className="p-2">
                      <select value={row.id_tipo_movimiento} onChange={e => setNewMovRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, id_tipo_movimiento: Number(e.target.value)} : r))} className={selectCls}>
                        {Object.entries(TIPO_MOVIMIENTO_MAP).map(([id, val]) => <option key={id} value={id} className={darkMode ? 'bg-slate-950' : 'bg-white text-slate-900'}>{val}</option>)}
                      </select>
                    </td>
                    <td className="p-2"><input type="text" placeholder="Ej: Venta de excedente" value={row.descripcion} onChange={e => setNewMovRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, descripcion: e.target.value} : r))} className={inputCls} /></td>
                    <td className="p-2"><input type="number" placeholder="0.00" value={row.monto} onChange={e => setNewMovRows(prev => prev.map(r => r._tempId === row._tempId ? {...r, monto: e.target.value} : r))} className={inputCls} /></td>
                    <td className="p-2 flex items-center justify-end mt-1">
                      <button onClick={() => setNewMovRows(prev => prev.filter(r => r._tempId !== row._tempId))} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}

              {loadingMovimientos ? (
                <tr><td colSpan={7} className="p-8 text-center text-xs font-bold text-slate-400">Sincronizando flujos de caja operativos...</td></tr>
              ) : currentMovs.map(mov => (
                <tr key={mov.id_movimiento} className={`border-t transition-colors ${darkMode ? 'hover:bg-slate-800/40 border-slate-800/60' : 'hover:bg-slate-50 border-slate-100'}`}>
                  <td className={`p-3 font-mono text-xs font-black tracking-wide ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>{mov.animales?.codigo || 'Sistema'}</td>
                  <td className={`p-3 text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{TIPO_ANIMAL_MAP[mov.animales?.id_tipo || mov.id_tipo_animal] || '—'}</td>
                  <td className={`p-3 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{mov.animales?.raza || '—'}</td>
                  <td className={`p-3 text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{TIPO_MOVIMIENTO_MAP[mov.id_tipo_movimiento] || 'Otro'}</td>
                  <td className={`p-3 text-xs max-w-[200px] truncate font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} title={mov.descripcion}>{mov.descripcion}</td>
                  <td className={`p-3 text-xs font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>S/ {Number(mov.monto).toFixed(2)}</td>
                  <td className={`p-3 text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(mov.fecha).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`flex items-center justify-between p-3 border-t text-xs font-bold text-slate-400 rounded-b-xl ${darkMode ? 'border-cyan-500/20 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}`}>
          <span>Página {pageMovs} de {totalMovPages}</span>
          <div className="flex gap-1">
            <button disabled={pageMovs === 1} onClick={() => setPageMovs(p => p - 1)} className={`p-1.5 border rounded-lg disabled:opacity-20 ${darkMode ? 'border-slate-700 hover:text-white' : 'border-slate-300 hover:bg-white text-slate-600'}`}><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={pageMovs === totalMovPages} onClick={() => setPageMovs(p => p + 1)} className={`p-1.5 border rounded-lg disabled:opacity-20 ${darkMode ? 'border-slate-700 hover:text-white' : 'border-slate-300 hover:bg-white text-slate-600'}`}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

    </div>
  );
}