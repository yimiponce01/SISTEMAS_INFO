-- =========================================
-- SCRIPT PARA INSPECCIONAR ESTRUCTURA REAL DE TABLAS
-- Ejecutar en SQL Editor de Supabase
-- =========================================

-- =========================================
-- 1. INSPECCIONAR TABLA `animales`
-- =========================================
SELECT 
  'animales' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'animales'
ORDER BY ordinal_position;

-- =========================================
-- 2. INSPECCIONAR TABLA `movimientos_animales`
-- =========================================
SELECT 
  'movimientos_animales' as table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'movimientos_animales'
ORDER BY ordinal_position;

-- =========================================
-- 3. INSPECCIONAR OTRAS TABLAS EXISTENTES
-- =========================================
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name IN (
  'animales', 
  'movimientos_animales', 
  'produccion', 
  'gastos', 
  'ingresos', 
  'muertes', 
  'nacimientos', 
  'enfermedades', 
  'alimentacion'
)
ORDER BY table_name, ordinal_position;

-- =========================================
-- 4. INSPECCIONAR FOREIGN KEYS
-- =========================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- =========================================
-- 5. VER MUESTRA DE DATOS DE ANIMALES
-- =========================================
SELECT * FROM animales LIMIT 5;

-- =========================================
-- 6. VER MUESTRA DE MOVIMIENTOS
-- =========================================
SELECT * FROM movimientos_animales LIMIT 5;

-- =========================================
-- 7. VER ÚLTIMOS CÓDIGOS DE ANIMALES (para generar códigos automáticos)
-- =========================================
SELECT 
  codigo,
  tipo_animal,
  created_at
FROM animales 
ORDER BY created_at DESC 
LIMIT 10;