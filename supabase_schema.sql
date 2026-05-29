-- =========================================
-- SCRIPT SQL PARA CORREGIR PROBLEMA DE ROLES
-- Ejecutar en SQL Editor de Supabase
-- =========================================

-- =========================================
-- 1. CREAR TABLA DE PERFILES (si no existe)
-- =========================================
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'operador' CHECK (rol IN ('administrador', 'operador')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. ACTIVAR RLS EN PERFILES
-- =========================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 3. POLICIAS RLS PARA PERFILES
-- =========================================

-- POLICY: Todos los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "usuarios_pueden_ver_su_propio_perfil"
ON public.perfiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- POLICY: Administrador puede ver todos los perfiles
CREATE POLICY "admin_puede_ver_todos_los_perfiles"
ON public.perfiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- POLICY: Insertar perfil (para registro)
CREATE POLICY "usuarios_pueden_insertar_su_perfil"
ON public.perfiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- POLICY: Usuario puede actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_su_perfil"
ON public.perfiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- POLICY: Solo admin puede actualizar roles
CREATE POLICY "solo_admin_puede_actualizar_roles"
ON public.perfiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'administrador'
  )
);

-- =========================================
-- 4. FUNCION PARA CREAR PERFIL AUTOMATICAMENTE
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'operador')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 5. TRIGGER PARA CREAR PERFIL AL REGISTRARSE
-- =========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- 6. VISTA PARA CONSULTA PUBLICA DE USUARIOS (opcional)
-- =========================================
CREATE OR REPLACE VIEW public.usuarios AS
SELECT 
  id,
  email,
  nombre,
  rol,
  created_at
FROM public.perfiles;

-- =========================================
-- 7. POLICIAS PARA LA VISTA (usando la tabla base)
-- =========================================

-- Ya están cubiertas por las políticas de perfiles

-- =========================================
-- 8. INDICES PARA MEJORAR RENDIMIENTO
-- =========================================
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);

-- =========================================
-- 9. MIGRAR DATOS EXISTENTES (si los hay)
-- =========================================
-- Si ya tienes una tabla 'usuarios', migra los datos:
-- DESCOMENTAR SOLO SI ES NECESARIO
/*
INSERT INTO public.perfiles (id, email, nombre, rol, created_at)
SELECT 
  COALESCE(u.id, au.id) as id,
  u.email,
  u.nombre,
  COALESCE(u.rol, 'operador') as rol,
  COALESCE(u.created_at, NOW()) as created_at
FROM usuarios u
LEFT JOIN auth.users au ON au.email = u.email
ON CONFLICT (id) DO NOTHING;
*/

-- =========================================
-- 10. ACTUALIZAR USUARIO ADMIN EXISTENTE
-- =========================================
-- Si necesitas crear/actualizar un admin específico:
-- Reemplaza 'tu-email@ejemplo.com' con el email del admin
/*
UPDATE public.perfiles 
SET rol = 'administrador' 
WHERE email = 'tu-email@ejemplo.com';
*/

-- =========================================
-- 11. FUNCION PARA OBTENER ROL DEL USUARIO ACTUAL
-- =========================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT rol INTO user_role
  FROM public.perfiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'operador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 12. LIMPIEZA (opcional)
-- =========================================
-- Si todo funciona, puedes eliminar la tabla antigua 'usuarios'
-- DESCOMENTAR SOLO DESPUES DE VERIFICAR QUE TODO FUNCIONA
/*
DROP TABLE IF EXISTS public.usuarios CASCADE;
*/

-- =========================================
-- FIN DEL SCRIPT
-- =========================================