# GUÍA DE IMPLEMENTACIÓN - CORRECCIÓN DE ROLES

## PROBLEMA IDENTIFICADO

El sistema no reconocía correctamente el rol de administrador porque:

1. **Consulta incorrecta**: El código no estaba usando los nombres correctos de columnas
2. **Falta de RLS**: Sin políticas Row Level Security, las consultas fallaban silenciosamente
3. **Validación ausente**: No se verificaba si el rol era válido

## SOLUCIÓN IMPLEMENTADA

### 1. Script SQL (`supabase_roles_fix.sql`)
- ✅ Configura RLS en tu tabla EXISTENTE `usuarios`
- ✅ NO crea nuevas tablas
- ✅ NO modifica tu estructura actual
- ✅ 4 políticas RLS para control de acceso

### 2. Código Actualizado (`App.tsx`)
- ✅ Usa ÚNICAMENTE la tabla `usuarios`
- ✅ Consulta columnas reales: `id_usuario`, `nombre`, `email`, `rol`
- ✅ Valida que el rol sea 'administrador' o 'operador'
- ✅ Manejo explícito de errores

## PASOS DE IMPLEMENTACIÓN

### PASO 1: Ejecutar Script SQL en Supabase

1. Abre el [SQL Editor de Supabase](https://ogohkzvwgdmesxpoapkt.supabase.co)
2. Copia y pega TODO el contenido de `supabase_roles_fix.sql`
3. Ejecuta el script completo
4. Verifica que no haya errores

**Resultado esperado:**
- ✅ RLS activado en `usuarios`
- ✅ 4 políticas creadas
- ✅ Función `get_current_user_role()` creada
- ✅ Índices creados

### PASO 2: Actualizar Usuario Admin Existente

Si ya tienes un usuario admin, ejecuta:

```sql
UPDATE public.usuarios 
SET rol = 'administrador' 
WHERE email = 'tu-email-de-admin@ejemplo.com';
```

**Importante:** Reemplaza `tu-email-de-admin@ejemplo.com` con el email real del administrador.

### PASO 3: Verificar Estructura

Ejecuta esta consulta para verificar:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;
```

**Debe mostrar 4 políticas:**
- `admin_puede_ver_todos_los_usuarios`
- `solo_admin_puede_actualizar_roles`
- `usuarios_pueden_actualizar_su_perfil`
- `usuarios_pueden_ver_su_propio_registro`

### PASO 4: Probar Login de Admin

1. Inicia sesión con la cuenta de administrador
2. Verifica que:
   - ✅ El sidebar muestre el menú completo de admin (6 opciones)
   - ✅ Aparezca "Administrador - Acceso completo" en el header
   - ✅ Puede acceder a todas las vistas (Seguimiento, Exportar, Configuración)

### PASO 5: Probar Login de Operador

1. Inicia sesión con una cuenta de operador
2. Verifica que:
   - ✅ El sidebar muestre solo 3 opciones
   - ✅ Aparezca "Operador - Acceso limitado" en el header
   - ✅ NO puede acceder a Seguimiento, Exportar o Configuración

## DIAGNÓSTICO DE PROBLEMAS

### Si el admin sigue entrando como operador:

**1. Verificar que el usuario existe en `usuarios`:**

```sql
SELECT 
  id_usuario,
  email,
  nombre,
  rol
FROM public.usuarios
WHERE email = 'tu-email-admin@ejemplo.com';
```

**Debe mostrar:**
- `rol` = 'administrador'
- El email debe coincidir exactamente con el que usas para login

**2. Verificar que RLS no está bloqueando:**

```sql
-- Ver políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'usuarios';
```

**3. Revisar logs de errores:**

Abre la consola del navegador (F12) e intenta login. Busca errores como:
- "Usuario no encontrado en el sistema"
- "Rol de usuario inválido"
- Errores 404 o 400

### Si aparece "relation does not exist":

Significa que el código aún intenta usar `perfiles`. Verifica que `App.tsx` tenga:

```ts
const { data: usuarioDB, error: usuarioError } = await supabase
  .from('usuarios')  // ← Debe decir 'usuarios', NO 'perfiles'
  .select('id_usuario, nombre, email, rol')
  .eq('email', cleanEmail)
  .single();
```

## ESTRUCTURA DE LA TABLA `usuarios`

El código espera exactamente esta estructura:

```
id_usuario (UUID o SERIAL) - Clave primaria
nombre (TEXT) - Nombre del usuario
email (TEXT) - Email único (debe coincidir con auth.users)
password (TEXT) - Contraseña (no se usa en el frontend)
rol (TEXT) - 'administrador' o 'operador'
fecha_creacion (TIMESTAMP) - Fecha de creación
```

## MENÚS POR ROL

### Administrador (acceso completo):
1. Panel Principal
2. Añadir Registros
3. Seguimiento
4. Exportar Reportes
5. Alertas Inteligentes
6. Configuración

### Operador (acceso limitado):
1. Panel Principal
2. Añadir Registros
3. Alertas Inteligentes

## MANTENIMIENTO FUTURO

### Agregar nuevo administrador:

```sql
UPDATE public.usuarios 
SET rol = 'administrador' 
WHERE email = 'nuevo-admin@ejemplo.com';
```

### Cambiar operador a admin (o viceversa):

```sql
UPDATE public.usuarios 
SET rol = 'operador', fecha_creacion = fecha_creacion
WHERE email = 'usuario@ejemplo.com';
```

### Ver todos los administradores:

```sql
SELECT 
  id_usuario,
  email,
  nombre,
  fecha_creacion
FROM public.usuarios
WHERE rol = 'administrador'
ORDER BY fecha_creacion DESC;
```

## VERIFICACIÓN FINAL

Ejecuta esta secuencia de pruebas:

1. ✅ Script SQL ejecutado sin errors
2. ✅ Admin existe en `usuarios` con `rol = 'administrador'`
3. ✅ Operador existe en `usuarios` con `rol = 'operador'`
4. ✅ Login de admin muestra menú completo (6 opciones)
5. ✅ Login de operador muestra menú limitado (3 opciones)
6. ✅ Todas las vistas funcionan correctamente
7. ✅ Logout funciona correctamente
8. ✅ NO aparecen errores 404 ni 400
9. ✅ NO se usa la tabla `perfiles` en ningún lado

## SOPORTE

Si encuentras problemas después de seguir esta guía:

1. **Verifica que NO haya referencias a `perfiles`:**
   - Busca en todo el proyecto: `from('perfiles')`, `from("perfiles")`
   - Todo debe usar `from('usuarios')`

2. **Revisa la consola del navegador (F12)** para errores

3. **Ejecuta las consultas de diagnóstico** proporcionadas

4. **Confirma que los emails coinciden exactamente** (case-sensitive)

5. **Verifica que el script SQL se ejecutó completamente**

---

**Última actualización:** 2026-05-28  
**Versión:** 2.0 (solo tabla usuarios)  
**Estado:** Implementado

## ARCHIVOS MODIFICADOS

1. `src/app/App.tsx` - Función `hydrateUser` corregida
2. `supabase_roles_fix.sql` - Script SQL para RLS
3. `GUÍA_IMPLEMENTACIÓN_ROLES.md` - Esta guía

## ARCHIVOS QUE DEBEN ELIMINARSE

Para evitar confusión, elimina estos archivos que usan `perfiles`:
- `supabase_schema.sql` (crea tabla perfiles)
- Cualquier otro archivo que mencione `perfiles`