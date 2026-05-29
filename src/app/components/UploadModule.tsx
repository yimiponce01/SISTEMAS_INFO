import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, AlertCircle, CheckCircle,
  Loader, History, ChevronDown, Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UploadModuleProps {
  darkMode: boolean;
}

// ─── Tipos de animal (id_tipo real en Supabase) ───────────────────────────────
const TIPO_ANIMAL_MAP: Record<number, string> = {
  1: 'Vaca',
  2: 'Gallina',
  3: 'Toro',
  4: 'Cría Bovina',
  5: 'Pollito',
};

const TIPO_ANIMAL_PREFIX: Record<number, string> = {
  1: 'BOV',
  2: 'GAL',
  3: 'TOR',
  4: 'CRB',
  5: 'POL',
};

// Estados por tipo de animal
const ESTADOS_POR_TIPO: Record<number, string[]> = {
  1: ['activo', 'enfermo', 'muerto', 'vendido'],          // Vaca
  2: ['activo', 'enfermo', 'muerto', 'vendido'],          // Gallina
  3: ['activo', 'enfermo', 'muerto', 'alquilado'],        // Toro
  4: ['activo', 'enfermo', 'muerto', 'vendido'],          // Cría Bovina
  5: ['activo', 'enfermo', 'muerto', 'vendido'],          // Pollito
};

// ─── Acciones por tipo de animal ──────────────────────────────────────────────
const ACCIONES_ANIMAL: Record<number, string[]> = {
  1: ['Venta viva', 'Venta de carne', 'Enfermedad', 'Muerte'],
  2: ['Venta carne pollo', 'Venta jaba huevos', 'Venta caja pollitos', 'Enfermedad', 'Muerte'],
  3: ['Alquiler', 'Enfermedad', 'Muerte'],
  4: ['Crecimiento', 'Vacunación', 'Venta', 'Enfermedad'],
  5: ['Venta carne pollo', 'Venta jaba huevos', 'Enfermedad', 'Muerte'],
};

// Acciones de compra
const ACCIONES_COMPRA = [
  'Compra alimentos',
  'Compra vaca',
  'Compra toro',
  'Compra gallina',
  'Compra medicina',
];

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface AnimalDB {
  id_animal: number;
  id_tipo: number;
  codigo: string;
  raza?: string;
  peso_inicial?: number;
  fecha_ingreso: string;
  estado: string;
}

interface MovimientoDB {
  id_movimiento?: number;
  id_animal?: number;
  codigo?: string;
  id_tipo_movimiento?: number;
  tipo?: string;
  accion?: string;
  detalle_accion?: string;
  cantidad?: number;
  precio?: number;
  precio_total?: number;
  fecha?: string;
}

interface NewAnimalRow {
  _tempId: string;
  id_tipo: number;
  codigo: string;
  raza: string;
  peso_inicial: string;
  estado: string;
  fecha_ingreso: string;
  isNew: true;
}

interface NewMovRow {
  _tempId: string;
  tipo: 'animal' | 'compra';
  id_tipo_animal: number;
  accion: string;
  detalle_accion: string;
  cantidad: string;
  precio: string;
  precio_total: string;
  fecha: string;
  isNew: true;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function tempId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function UploadModule({ darkMode }: UploadModuleProps) {
  // Datos de Supabase
  const [animales, setAnimales] = useState<AnimalDB[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoDB[]>([]);
  const [loadingAnimales, setLoadingAnimales] = useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filas nuevas (inline)
  const [newAnimalRows, setNewAnimalRows] = useState<NewAnimalRow[]>([]);
  const [newMovRows, setNewMovRows] = useState<NewMovRow[]>([]);

  // Guardado
  const [savingAnimales, setSavingAnimales] = useState(false);
  const [savingMovimientos, setSavingMovimientos] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Estado editando (para animales existentes)
  const [editingEstado, setEditingEstado] = useState<Record<number, string>>({});
  const [savingEstado, setSavingEstado] = useState<Record<number, boolean>>({});

  // ─── Cargar animales ────────────────────────────────────────────────────────
  const loadAnimales = useCallback(async () => {
    setLoadingAnimales(true);
    try {
      const { data, error } = await supabase
        .from('animales')
        .select('id_animal, id_tipo, codigo, raza, peso_inicial, fecha_ingreso, estado')
        .order('id_animal', { ascending: false });

      if (error) throw error;
      setAnimales(data || []);
    } catch (e: any) {
      setErrorMsg('Error al cargar animales: ' + e.message);
    } finally {
      setLoadingAnimales(false);
    }
  }, []);

  // ─── Cargar movimientos ─────────────────────────────────────────────────────
  const loadMovimientos = useCallback(async () => {
    setLoadingMovimientos(true);
    try {
      const { data, error } = await supabase
        .from('movimientos_animales')
        .select('*')
        .order('id_movimiento', { ascending: false });

      if (error) throw error;
      setMovimientos(data || []);
    } catch (e: any) {
      setErrorMsg('Error al cargar movimientos: ' + e.message);
    } finally {
      setLoadingMovimientos(false);
    }
  }, []);

  useEffect(() => {
    loadAnimales();
    loadMovimientos();
  }, [loadAnimales, loadMovimientos]);

  // ─── Generar código automático ──────────────────────────────────────────────
  async function generateCode(id_tipo: number): Promise<string> {
    const prefix = TIPO_ANIMAL_PREFIX[id_tipo] || 'ANI';
    try {
      const { data } = await supabase
        .from('animales')
        .select('codigo')
        .ilike('codigo', `${prefix}-%`)
        .order('codigo', { ascending: false })
        .limit(1);

      if (!data || data.length === 0) return `${prefix}-001`;

      const lastCode = data[0].codigo as string;
      const match = lastCode.match(/-(\d+)$/);
      if (!match) return `${prefix}-001`;

      const next = parseInt(match[1], 10) + 1;
      return `${prefix}-${next.toString().padStart(3, '0')}`;
    } catch {
      return `${prefix}-001`;
    }
  }

  // ─── Añadir fila nueva de animal ────────────────────────────────────────────
  async function addAnimalRow() {
    const id_tipo = 1; // Vaca por defecto
    const codigo = await generateCode(id_tipo);
    const row: NewAnimalRow = {
      _tempId: tempId(),
      id_tipo,
      codigo,
      raza: '',
      peso_inicial: '',
      estado: 'activo',
      fecha_ingreso: new Date().toISOString().slice(0, 10),
      isNew: true,
    };
    setNewAnimalRows(prev => [...prev, row]);
  }

  // ─── Actualizar fila nueva de animal ────────────────────────────────────────
  async function updateNewAnimalRow(tid: string, field: keyof NewAnimalRow, value: any) {
    setNewAnimalRows(prev =>
      prev.map(r => {
        if (r._tempId !== tid) return r;
        const updated = { ...r, [field]: value };
        return updated;
      })
    );

    // Si cambia el tipo, regenerar código
    if (field === 'id_tipo') {
      const newCode = await generateCode(Number(value));
      setNewAnimalRows(prev =>
        prev.map(r => r._tempId === tid ? { ...r, id_tipo: Number(value), codigo: newCode } : r)
      );
    }
  }

  // ─── Eliminar fila nueva de animal ──────────────────────────────────────────
  function removeNewAnimalRow(tid: string) {
    setNewAnimalRows(prev => prev.filter(r => r._tempId !== tid));
  }

  // ─── Guardar animales nuevos ────────────────────────────────────────────────
  async function saveNewAnimals() {
    if (newAnimalRows.length === 0) return;
    setSavingAnimales(true);
    try {
      const toInsert = newAnimalRows.map(r => ({
        id_tipo: r.id_tipo,
        codigo: r.codigo,
        raza: r.raza || null,
        peso_inicial: r.peso_inicial ? parseFloat(r.peso_inicial) : null,
        estado: r.estado,
        fecha_ingreso: r.fecha_ingreso,
      }));

      const { error } = await supabase.from('animales').insert(toInsert);
      if (error) throw error;

      setNewAnimalRows([]);
      await loadAnimales();
      flashSaved();
    } catch (e: any) {
      alert('Error al guardar animales: ' + e.message);
    } finally {
      setSavingAnimales(false);
    }
  }

  // ─── Cambiar estado de animal existente (auto-save) ─────────────────────────
  async function changeEstado(id_animal: number, newEstado: string) {
    setEditingEstado(prev => ({ ...prev, [id_animal]: newEstado }));
    setSavingEstado(prev => ({ ...prev, [id_animal]: true }));
    try {
      const { error } = await supabase
        .from('animales')
        .update({ estado: newEstado })
        .eq('id_animal', id_animal);

      if (error) throw error;

      setAnimales(prev =>
        prev.map(a => a.id_animal === id_animal ? { ...a, estado: newEstado } : a)
      );
    } catch (e: any) {
      alert('Error al actualizar estado: ' + e.message);
    } finally {
      setSavingEstado(prev => ({ ...prev, [id_animal]: false }));
    }
  }

  // ─── Añadir fila nueva de movimiento ────────────────────────────────────────
  function addMovRow() {
    const row: NewMovRow = {
      _tempId: tempId(),
      tipo: 'animal',
      id_tipo_animal: 1,
      accion: ACCIONES_ANIMAL[1][0],
      detalle_accion: '',
      cantidad: '1',
      precio: '',
      precio_total: '',
      fecha: new Date().toISOString(),
      isNew: true,
    };
    setNewMovRows(prev => [...prev, row]);
  }

  // ─── Actualizar fila nueva de movimiento ────────────────────────────────────
  function updateNewMovRow(tid: string, field: keyof NewMovRow, value: any) {
    setNewMovRows(prev =>
      prev.map(r => {
        if (r._tempId !== tid) return r;
        const updated = { ...r, [field]: value };

        // Si cambia tipo o acción, resetear acción
        if (field === 'tipo') {
          updated.accion = value === 'animal'
            ? ACCIONES_ANIMAL[updated.id_tipo_animal]?.[0] || ''
            : ACCIONES_COMPRA[0];
        }
        if (field === 'id_tipo_animal') {
          updated.accion = ACCIONES_ANIMAL[Number(value)]?.[0] || '';
        }

        // Calcular precio total automáticamente
        if (field === 'precio' || field === 'cantidad') {
          const qty = parseFloat(field === 'cantidad' ? value : updated.cantidad) || 0;
          const prc = parseFloat(field === 'precio' ? value : updated.precio) || 0;
          updated.precio_total = (qty * prc).toFixed(2);
        }

        return updated;
      })
    );
  }

  // ─── Eliminar fila nueva de movimiento ──────────────────────────────────────
  function removeNewMovRow(tid: string) {
    setNewMovRows(prev => prev.filter(r => r._tempId !== tid));
  }

  // ─── Guardar movimientos nuevos ─────────────────────────────────────────────
  async function saveNewMovimientos() {
    if (newMovRows.length === 0) return;
    setSavingMovimientos(true);
    try {
      const toInsert = newMovRows.map(r => ({
        tipo: r.tipo,
        id_tipo_animal: r.tipo === 'animal' ? r.id_tipo_animal : null,
        accion: r.accion,
        detalle_accion: r.detalle_accion || null,
        cantidad: r.cantidad ? parseFloat(r.cantidad) : null,
        precio: r.precio ? parseFloat(r.precio) : null,
        precio_total: r.precio_total ? parseFloat(r.precio_total) : null,
        fecha: r.fecha || new Date().toISOString(),
      }));

      const { error } = await supabase.from('movimientos_animales').insert(toInsert);
      if (error) throw error;

      setNewMovRows([]);
      await loadMovimientos();
      flashSaved();
    } catch (e: any) {
      alert('Error al guardar movimientos: ' + e.message);
    } finally {
      setSavingMovimientos(false);
    }
  }

  function flashSaved() {
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
  }

  // ─── Guardar todo ────────────────────────────────────────────────────────────
  async function saveAll() {
    if (newAnimalRows.length > 0) await saveNewAnimals();
    if (newMovRows.length > 0) await saveNewMovimientos();
  }

  // ─── Clases de estilo ────────────────────────────────────────────────────────
  const card = darkMode
    ? 'bg-[#0d1f35]/80 border border-[#1e3a5f]/60 rounded-xl'
    : 'bg-white border border-slate-200 rounded-xl shadow-sm';

  const th = darkMode
    ? 'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400'
    : 'px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500';

  const tdBase = darkMode
    ? 'px-3 py-3 text-sm text-slate-200 border-t border-[#1e3a5f]/40'
    : 'px-3 py-3 text-sm text-slate-700 border-t border-slate-100';

  const inputCls = darkMode
    ? 'w-full px-2 py-1.5 rounded-lg border border-[#1e3a5f] bg-[#061326] text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30'
    : 'w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-400';

  const selectCls = inputCls + ' cursor-pointer';

  const btnPrimary =
    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
    'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20';

  const btnSecondary = darkMode
    ? 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#1e3a5f] text-slate-300 hover:border-cyan-500/50 hover:text-white transition-all'
    : 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all';

  const badgeCls =
    'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ' +
    (darkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-100 text-blue-700');

  function estadoBadge(estado: string) {
    const map: Record<string, string> = {
      activo: darkMode
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        : 'bg-emerald-100 text-emerald-700',
      enfermo: darkMode
        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
        : 'bg-yellow-100 text-yellow-700',
      muerto: darkMode
        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
        : 'bg-red-100 text-red-700',
      vendido: darkMode
        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        : 'bg-blue-100 text-blue-700',
      alquilado: darkMode
        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        : 'bg-purple-100 text-purple-700',
    };
    return (map[estado] || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')) +
      ' px-2 py-0.5 rounded-full text-xs font-medium';
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80 mb-1">
            Gestión de Datos
          </p>
          <h2 className={`text-3xl font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Añadir Registros
          </h2>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Datos conectados en tiempo real a Supabase
          </p>
        </div>

        {savedOk && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
            <CheckCircle className="w-4 h-4" />
            Guardado exitosamente
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="ml-2 text-red-300 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TABLA 1 — LISTADO DE ANIMALES
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={card}>
        {/* Cabecera tabla 1 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/40 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Listado de Animales
            </h3>
            <span className={badgeCls}>
              {loadingAnimales ? '…' : animales.length + newAnimalRows.length} animales
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addAnimalRow} className={btnPrimary}>
              <Plus className="w-4 h-4" />
              Nuevo Animal
            </button>
            <button onClick={loadAnimales} className={btnSecondary}>
              <History className="w-4 h-4" />
              Ver historial de animales
            </button>
          </div>
        </div>

        {/* Tabla animales */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className={darkMode ? 'bg-[#061326]/60' : 'bg-slate-50'}>
              <tr>
                <th className={th}>Código</th>
                <th className={th}>Tipo</th>
                <th className={th}>Raza</th>
                <th className={th}>Peso (kg)</th>
                <th className={th}>Estado</th>
                <th className={th}>Fecha ingreso</th>
                <th className={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Filas existentes */}
              {loadingAnimales ? (
                <tr>
                  <td colSpan={7} className={`${tdBase} text-center py-10`}>
                    <Loader className="w-5 h-5 animate-spin inline mr-2 text-cyan-400" />
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Cargando animales...</span>
                  </td>
                </tr>
              ) : animales.map(animal => {
                const estadoActual = editingEstado[animal.id_animal] ?? animal.estado;
                const opciones = ESTADOS_POR_TIPO[animal.id_tipo] || ['activo', 'enfermo', 'muerto', 'vendido'];
                return (
                  <tr key={animal.id_animal} className={darkMode ? 'hover:bg-white/[0.02] transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className={tdBase}>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${darkMode ? 'bg-cyan-500/10 text-cyan-300' : 'bg-blue-50 text-blue-700'}`}>
                        {animal.codigo}
                      </span>
                    </td>
                    <td className={tdBase}>{TIPO_ANIMAL_MAP[animal.id_tipo] || `Tipo ${animal.id_tipo}`}</td>
                    <td className={tdBase}>{animal.raza || <span className="text-slate-500 italic">—</span>}</td>
                    <td className={tdBase}>{animal.peso_inicial != null ? `${animal.peso_inicial} kg` : <span className="text-slate-500 italic">—</span>}</td>
                    <td className={tdBase}>
                      <div className="flex items-center gap-2">
                        <select
                          value={estadoActual}
                          onChange={e => changeEstado(animal.id_animal, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            darkMode
                              ? 'bg-[#061326] border-[#1e3a5f] text-white focus:border-cyan-500/60'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-400'
                          }`}
                        >
                          {opciones.map(op => (
                            <option key={op} value={op}>
                              {op.charAt(0).toUpperCase() + op.slice(1)}
                            </option>
                          ))}
                        </select>
                        {savingEstado[animal.id_animal] && (
                          <Loader className="w-3 h-3 animate-spin text-cyan-400" />
                        )}
                        {!savingEstado[animal.id_animal] && editingEstado[animal.id_animal] && (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </td>
                    <td className={tdBase}>{formatDate(animal.fecha_ingreso)}</td>
                    <td className={tdBase}>
                      <span className={estadoBadge(estadoActual)}>{estadoActual}</span>
                    </td>
                  </tr>
                );
              })}

              {/* Filas nuevas (inline) */}
              {newAnimalRows.map(row => (
                <tr key={row._tempId} className={darkMode ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : 'bg-blue-50/50 border-l-2 border-l-blue-400'}>
                  <td className={tdBase}>
                    <input
                      type="text"
                      value={row.codigo}
                      onChange={e => updateNewAnimalRow(row._tempId, 'codigo', e.target.value)}
                      className={inputCls}
                      placeholder="BOV-001"
                    />
                  </td>
                  <td className={tdBase}>
                    <select
                      value={row.id_tipo}
                      onChange={e => updateNewAnimalRow(row._tempId, 'id_tipo', Number(e.target.value))}
                      className={selectCls}
                    >
                      {Object.entries(TIPO_ANIMAL_MAP).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdBase}>
                    <input
                      type="text"
                      value={row.raza}
                      onChange={e => updateNewAnimalRow(row._tempId, 'raza', e.target.value)}
                      className={inputCls}
                      placeholder="Ej: Holstein"
                    />
                  </td>
                  <td className={tdBase}>
                    <input
                      type="number"
                      value={row.peso_inicial}
                      onChange={e => updateNewAnimalRow(row._tempId, 'peso_inicial', e.target.value)}
                      className={inputCls}
                      placeholder="0"
                      min="0"
                    />
                  </td>
                  <td className={tdBase}>
                    <select
                      value={row.estado}
                      onChange={e => updateNewAnimalRow(row._tempId, 'estado', e.target.value)}
                      className={selectCls}
                    >
                      {(ESTADOS_POR_TIPO[row.id_tipo] || ['activo', 'enfermo', 'muerto', 'vendido']).map(op => (
                        <option key={op} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className={tdBase}>
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDate(row.fecha_ingreso)}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <button
                      onClick={() => removeNewAnimalRow(row._tempId)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Vacío */}
              {!loadingAnimales && animales.length === 0 && newAnimalRows.length === 0 && (
                <tr>
                  <td colSpan={7} className={`${tdBase} text-center py-12`}>
                    <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      No hay animales registrados. Haz clic en <strong>Nuevo Animal</strong> para comenzar.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botón guardar animales nuevos */}
        {newAnimalRows.length > 0 && (
          <div className="px-6 py-4 border-t border-[#1e3a5f]/40 flex justify-end">
            <button
              onClick={saveNewAnimals}
              disabled={savingAnimales}
              className={btnPrimary + ' disabled:opacity-50'}
            >
              {savingAnimales ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar {newAnimalRows.length} animal{newAnimalRows.length > 1 ? 'es' : ''}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TABLA 2 — REGISTRO DE MOVIMIENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={card}>
        {/* Cabecera tabla 2 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/40 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Registro de Movimientos de Animales
            </h3>
            <span className={badgeCls}>
              {loadingMovimientos ? '…' : movimientos.length + newMovRows.length} movimientos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addMovRow} className={btnPrimary}>
              <Plus className="w-4 h-4" />
              Nuevo Movimiento
            </button>
            <button onClick={loadMovimientos} className={btnSecondary}>
              <RefreshCw className="w-4 h-4" />
              Ver todos los movimientos
            </button>
          </div>
        </div>

        {/* Tabla movimientos */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className={darkMode ? 'bg-[#061326]/60' : 'bg-slate-50'}>
              <tr>
                <th className={th}>Código</th>
                <th className={th}>Tipo</th>
                <th className={th}>Acción</th>
                <th className={th}>Detalle de acción</th>
                <th className={th}>Cantidad</th>
                <th className={th}>Precio</th>
                <th className={th}>Fecha y hora</th>
                <th className={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Filas existentes */}
              {loadingMovimientos ? (
                <tr>
                  <td colSpan={8} className={`${tdBase} text-center py-10`}>
                    <Loader className="w-5 h-5 animate-spin inline mr-2 text-cyan-400" />
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Cargando movimientos...</span>
                  </td>
                </tr>
              ) : movimientos.map((mov, idx) => (
                <tr key={mov.id_movimiento ?? idx} className={darkMode ? 'hover:bg-white/[0.02] transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                  <td className={tdBase}>
                    {mov.codigo
                      ? <span className={`font-mono text-xs px-2 py-1 rounded ${darkMode ? 'bg-cyan-500/10 text-cyan-300' : 'bg-blue-50 text-blue-700'}`}>{mov.codigo}</span>
                      : <span className="text-slate-500 italic text-xs">—</span>
                    }
                  </td>
                  <td className={tdBase}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      mov.tipo === 'compra'
                        ? darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                        : darkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      {mov.tipo === 'compra' ? 'Compra' : mov.tipo === 'animal' ? 'Animal' : (mov.tipo || '—')}
                    </span>
                  </td>
                  <td className={tdBase}>{mov.accion || '—'}</td>
                  <td className={tdBase}>{mov.detalle_accion || <span className="text-slate-500 italic">—</span>}</td>
                  <td className={tdBase}>{mov.cantidad ?? <span className="text-slate-500 italic">—</span>}</td>
                  <td className={tdBase}>
                    {mov.precio != null
                      ? <span className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>S/ {Number(mov.precio).toFixed(2)}</span>
                      : <span className="text-slate-500 italic">—</span>
                    }
                  </td>
                  <td className={tdBase}>{formatDateTime(mov.fecha || '')}</td>
                  <td className={tdBase}>
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                  </td>
                </tr>
              ))}

              {/* Filas nuevas (inline) */}
              {newMovRows.map(row => {
                const accionesDisponibles = row.tipo === 'compra'
                  ? ACCIONES_COMPRA
                  : ACCIONES_ANIMAL[row.id_tipo_animal] || [];

                return (
                  <tr key={row._tempId} className={darkMode ? 'bg-purple-500/5 border-l-2 border-l-purple-500' : 'bg-purple-50/50 border-l-2 border-l-purple-400'}>
                    {/* Código (auto) */}
                    <td className={tdBase}>
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} italic`}>Auto</span>
                    </td>
                    {/* Tipo */}
                    <td className={tdBase}>
                      <select
                        value={row.tipo}
                        onChange={e => updateNewMovRow(row._tempId, 'tipo', e.target.value)}
                        className={selectCls}
                      >
                        <option value="animal">Animal</option>
                        <option value="compra">Compra</option>
                      </select>
                      {row.tipo === 'animal' && (
                        <select
                          value={row.id_tipo_animal}
                          onChange={e => updateNewMovRow(row._tempId, 'id_tipo_animal', Number(e.target.value))}
                          className={selectCls + ' mt-1'}
                        >
                          {Object.entries(TIPO_ANIMAL_MAP).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    {/* Acción */}
                    <td className={tdBase}>
                      <select
                        value={row.accion}
                        onChange={e => updateNewMovRow(row._tempId, 'accion', e.target.value)}
                        className={selectCls}
                      >
                        {accionesDisponibles.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </td>
                    {/* Detalle */}
                    <td className={tdBase}>
                      <input
                        type="text"
                        value={row.detalle_accion}
                        onChange={e => updateNewMovRow(row._tempId, 'detalle_accion', e.target.value)}
                        className={inputCls}
                        placeholder="Descripción opcional"
                      />
                    </td>
                    {/* Cantidad */}
                    <td className={tdBase}>
                      <input
                        type="number"
                        value={row.cantidad}
                        onChange={e => updateNewMovRow(row._tempId, 'cantidad', e.target.value)}
                        className={inputCls}
                        placeholder="1"
                        min="0"
                      />
                    </td>
                    {/* Precio */}
                    <td className={tdBase}>
                      <input
                        type="number"
                        value={row.precio}
                        onChange={e => updateNewMovRow(row._tempId, 'precio', e.target.value)}
                        className={inputCls}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      {row.precio_total && (
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          Total: S/ {row.precio_total}
                        </div>
                      )}
                    </td>
                    {/* Fecha (auto) */}
                    <td className={tdBase}>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDateTime(row.fecha)}
                      </span>
                    </td>
                    {/* Eliminar */}
                    <td className={tdBase}>
                      <button
                        onClick={() => removeNewMovRow(row._tempId)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Vacío */}
              {!loadingMovimientos && movimientos.length === 0 && newMovRows.length === 0 && (
                <tr>
                  <td colSpan={8} className={`${tdBase} text-center py-12`}>
                    <div className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      No hay movimientos registrados. Haz clic en <strong>Nuevo Movimiento</strong> para comenzar.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botón guardar movimientos nuevos */}
        {newMovRows.length > 0 && (
          <div className="px-6 py-4 border-t border-[#1e3a5f]/40 flex justify-end">
            <button
              onClick={saveNewMovimientos}
              disabled={savingMovimientos}
              className={btnPrimary + ' disabled:opacity-50'}
            >
              {savingMovimientos ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar {newMovRows.length} movimiento{newMovRows.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CUADROS INFERIORES
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cuadro izquierdo — Ejemplos de acciones */}
        <div className={card + ' p-6'}>
          <h4 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Ejemplos de acciones disponibles
          </h4>
          <div className="space-y-4">
            {[
              {
                label: '🐄 Bovinos (Vacas)',
                color: darkMode ? 'text-cyan-300' : 'text-cyan-700',
                items: ACCIONES_ANIMAL[1],
              },
              {
                label: '🐂 Toros',
                color: darkMode ? 'text-blue-300' : 'text-blue-700',
                items: ACCIONES_ANIMAL[3],
              },
              {
                label: '🐔 Gallinas',
                color: darkMode ? 'text-yellow-300' : 'text-yellow-700',
                items: ACCIONES_ANIMAL[2],
              },
              {
                label: '🐮 Cría Bovina',
                color: darkMode ? 'text-emerald-300' : 'text-emerald-700',
                items: ACCIONES_ANIMAL[4],
              },
            ].map(group => (
              <div key={group.label}>
                <p className={`text-sm font-medium mb-1.5 ${group.color}`}>{group.label}</p>
                <ul className="space-y-1">
                  {group.items.map(item => (
                    <li key={item} className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <ChevronDown className="w-3 h-3 rotate-[-90deg] opacity-50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Cuadro derecho — Información importante */}
        <div className={card + ' p-6'}>
          <h4 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Información importante
          </h4>
          <ul className="space-y-3">
            {[
              { icon: '✓', text: 'Código automático generado por el sistema', color: darkMode ? 'text-emerald-300' : 'text-emerald-600' },
              { icon: '✓', text: 'Datos obtenidos directamente desde Supabase', color: darkMode ? 'text-emerald-300' : 'text-emerald-600' },
              { icon: '✓', text: 'Cambios de estado guardados automáticamente', color: darkMode ? 'text-emerald-300' : 'text-emerald-600' },
              { icon: '✓', text: 'Dashboard actualizado automáticamente', color: darkMode ? 'text-emerald-300' : 'text-emerald-600' },
              { icon: '✓', text: 'Integridad de datos protegida', color: darkMode ? 'text-emerald-300' : 'text-emerald-600' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`text-lg leading-none mt-0.5 ${item.color}`}>{item.icon}</span>
                <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-[#061326]/60 border border-[#1e3a5f]/40' : 'bg-slate-50 border border-slate-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Los registros nuevos se insertan directamente en la tabla al hacer clic en <strong>Guardar registros</strong>.
              Los cambios de estado se guardan de forma inmediata sin necesidad de confirmar.
            </p>
          </div>
        </div>
      </div>

      {/* ── Botón final Guardar registros ── */}
      {(newAnimalRows.length > 0 || newMovRows.length > 0) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={saveAll}
            disabled={savingAnimales || savingMovimientos}
            className={
              'flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ' +
              'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 ' +
              'text-white shadow-purple-500/30 disabled:opacity-50'
            }
          >
            {(savingAnimales || savingMovimientos)
              ? <Loader className="w-5 h-5 animate-spin" />
              : <Save className="w-5 h-5" />
            }
            Guardar registros
          </button>
        </div>
      )}
    </div>
  );
}
