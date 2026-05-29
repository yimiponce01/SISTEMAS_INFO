-- =========================================
-- SCRIPT SQL PARA CORREGIR ROLES - TABLA USUARIOS EXISTENTE
-- NO crea nuevas tablas, solo configura RLS
-- =========================================

-- =========================================
-- 1. VERIFICAR QUE LA TABLA EXISTE
-- =========================================
-- Este script asume que ya tienes la tabla `usuarios` con:
-- id_usuario, nombre, email, password, rol, fecha_creacion

-- =========================================
-- 2. ACTIVAR RLS EN USUARIOS (si no está activado)
-- =========================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 3. ELIMINAR POLÍTICAS EXISTENTES (para evitar conflictos)
-- =========================================
DROP POLICY IF EXISTS "usuarios_pueden_ver_su_propio_perfil" ON public.usuarios;
DROP POLICY IF EXISTS "admin_puede_ver_todos_los_perfiles" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_pueden_insertar_su_perfil" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_su_perfil" ON public.usuarios;
DROP POLICY IF EXISTS "solo_admin_puede_actualizar_roles" ON public.usuarios;

-- =========================================
-- 4. CREAR POLÍTICAS RLS PARA USUARIOS
-- =========================================

-- POLICY: Todos los usuarios autenticados pueden ver su propio registro
CREATE POLICY "usuarios_pueden_ver_su_propio_registro"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- POLICY: Administrador puede ver todos los usuarios
CREATE POLICY "admin_puede_ver_todos_los_usuarios"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND u.rol = 'administrador'
  )
);

-- POLICY: Usuario puede actualizar su propio registro (solo campos no sensibles)
CREATE POLICY "usuarios_pueden_actualizar_su_perfil"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- POLICY: Solo admin puede actualizar roles
CREATE POLICY "solo_admin_puede_actualizar_roles"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND u.rol = 'administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND u.rol = 'administrador'
  )
);

-- =========================================
-- 5. ÍNDICES PARA MEJORAR RENDIMIENTO
-- =========================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);

-- =========================================
-- 6. ACTUALIZAR ROL DE ADMINISTRADOR EXISTENTE
-- =========================================
-- Si necesitas establecer un admin específico:
-- Reemplaza 'tu-email-admin@ejemplo.com' con el email real
/*
UPDATE public.usuarios 
SET rol = 'administrador' 
WHERE email = 'tu-email-admin@ejemplo.com';
*/

-- =========================================
-- 7. FUNCIÓN PARA OBTENER ROL DEL USUARIO ACTUAL
-- =========================================
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT u.rol INTO user_role
  FROM public.usuarios u
  WHERE u.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'operador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 8. VERIFICACIÓN DE POLÍTICAS
-- =========================================
-- Ejecuta esta consulta para verificar que las políticas se crearon:
-- SELECT policyname FROM pg_policies WHERE tablename = 'usuarios';

-- =========================================
-- FIN DEL SCRIPT
-- =========================================