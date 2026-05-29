import { supabase } from './supabase';

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
  characterMaximumLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
}

export interface ForeignKeyInfo {
  columnName: string;
  foreignTableName: string;
  foreignColumnName: string;
}

/**
 * Inspecciona automáticamente la estructura de una tabla en Supabase
 */
export async function inspectTableSchema(tableName: string): Promise<TableSchema | null> {
  try {
    // Obtener columnas
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (columnsError || !columnsData || columnsData.length === 0) {
      console.warn(`Tabla ${tableName} no encontrada o sin columnas`);
      return null;
    }

    const columns: ColumnInfo[] = columnsData.map(col => ({
      columnName: col.column_name,
      dataType: col.data_type,
      isNullable: col.is_nullable === 'YES',
      columnDefault: col.column_default,
      characterMaximumLength: col.character_maximum_length,
      numericPrecision: col.numeric_precision,
      numericScale: col.numeric_scale,
    }));

    // Obtener foreign keys (esto requiere una consulta más compleja)
    // Por ahora, usamos un enfoque simplificado
    const foreignKeys: ForeignKeyInfo[] = [];

    return {
      tableName,
      columns,
      foreignKeys,
    };
  } catch (error) {
    console.error(`Error inspecting table ${tableName}:`, error);
    return null;
  }
}

/**
 * Inspecciona múltiples tablas
 */
export async function inspectMultipleTables(tableNames: string[]): Promise<Record<string, TableSchema>> {
  const schemas: Record<string, TableSchema> = {};
  
  for (const tableName of tableNames) {
    const schema = await inspectTableSchema(tableName);
    if (schema) {
      schemas[tableName] = schema;
    }
  }
  
  return schemas;
}

/**
 * Obtiene el último código de animal para generar el siguiente
 */
export async function getLastAnimalCode(animalType: 'bovino' | 'toro' | 'gallina'): Promise<string | null> {
  const codePrefix = animalType === 'bovino' ? 'BOV' : animalType === 'toro' ? 'TOR' : 'GAL';
  
  try {
    const { data, error } = await supabase
      .from('animales')
      .select('codigo')
      .ilike('codigo', `${codePrefix}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0].codigo;
  } catch (error) {
    console.error('Error getting last animal code:', error);
    return null;
  }
}

/**
 * Genera el siguiente código de animal
 */
export function generateNextCode(lastCode: string | null, animalType: 'bovino' | 'toro' | 'gallina'): string {
  const prefix = animalType === 'bovino' ? 'BOV' : animalType === 'toro' ? 'TOR' : 'GAL';
  
  if (!lastCode) {
    return `${prefix}-001`;
  }
  
  // Extraer el número del último código
  const match = lastCode.match(/-(\d+)$/);
  if (!match) {
    return `${prefix}-001`;
  }
  
  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;
  
  return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Obtiene tipos de movimientos disponibles
 */
export const MOVEMENT_TYPES = [
  { value: 'venta', label: 'Venta' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'muerte', label: 'Muerte' },
  { value: 'produccion', label: 'Producción' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'nacimiento', label: 'Nacimiento' },
  { value: 'compra', label: 'Compra' },
];

/**
 * Obtiene tipos de animales disponibles
 */
export const ANIMAL_TYPES = [
  { value: 'bovino', label: 'Bovino' },
  { value: 'toro', label: 'Toro' },
  { value: 'gallina', label: 'Gallina' },
];