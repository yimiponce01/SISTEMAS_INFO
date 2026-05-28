# Guía de Testing - Validar Fixes del Dashboard

## Paso 1: Compilar y Ejecutar

```bash
cd c:\Users\asilk\SISTEMAS_INFO

# Limpiar build anterior
rm -r dist

# Compilar
npm run build  # Debe completar sin errores

# Iniciar servidor de desarrollo
npm run dev
```

El dashboard debe estar disponible en: **http://localhost:3409**

---

## Paso 2: Verificar en Consola (Chrome DevTools)

Abre la consola del navegador (F12 → Console) y busca logs como:

```
✅ CORRECTO - Ver estos logs:
[dashboardData] animales: 53  
[dashboardData] VACAS: 50
[dashboardData] TOROS: 3
[dashboardData] CRIAS BOVINAS: 0
[dashboardData] VENDIDOS (hasta fecha final): 30
[dashboardData] MUERTOS (hasta fecha final): 2
[dashboardData] ACTIVOS AL FINAL DEL PERIODO: 21
[dashboardData] totals: {animales: 21, ventas: 30, ...}
```

❌ **INCORRECTO - Si ves:**
```
[dashboardData] animales: 50 (falta contar toros)
[dashboardData] ventas: 0 (ventas hardcodeadas)
```

---

## Paso 3: Validar en UI

### Test 1: Inventario Enero 2020

1. Selecciona **Fechas**: `01/01/2020` a `31/01/2020`
2. Selecciona **Animales**: `Bovinos`
3. Espera carga

**Esperado**:
- KPI "Total Animales": **53** (50 vacas + 3 toros)
- KPI "Ventas": **0** (no hay ventas en enero)
- KPI "Muertes": **0** (no hay muertes en enero)
- Gráfico: Muestra enero con 53 bovinos

**Si ves**:
- Total Animales: 50 ❌ → Bug #4 no aplicado (toros no contados)
- Ventas: 0 ✅ → Bug #1 sería problem si hubiera ventas en enero
- Muertes: 15 ❌ → Bug #3 - muertes de todo el histórico

### Test 2: Inventario Febrero 2020

1. Selecciona **Fechas**: `01/01/2020` a `29/02/2020`
2. Selecciona **Animales**: `Bovinos`
3. Espera carga

**Esperado**:
- KPI "Total Animales": **21** (después de ventas/muertes)
- KPI "Ventas": **32** (30 vendidas en febrero + 2 de enero)
- KPI "Muertes": **2** (si hay 2 en febrero)
- Gráfico febrero: Menos animales que enero

**Si ves**:
- Total Animales: 53 ❌ → Bug #5 - no resta vendidos
- Ventas: 0 ❌ → Bug #1 - ventas no se cuentan
- Muertes: 50 ❌ → Bug #3 - muertes de todo el histórico

### Test 3: Gallinas Febrero 2020

1. Selecciona **Fechas**: `01/01/2020` a `29/02/2020`
2. Selecciona **Animales**: `Gallinas`
3. Espera carga

**Esperado**:
- KPI "Total Animales": **60** (después de muertes/ventas)
- KPI "Ventas": **90** (vendidas durante el período)
- Gráfico: Decaimiento desde 150 (enero) a 60 (febrero)

---

## Paso 4: Verificar Inconsistencias

### ❌ Si hay inconsistencias entre:

1. **KPI vs Gráfico**
   - KPI dice 21 animales pero gráfico muestra 53
   - → Bug #3 aún presente (gráficos no filtrados por rango)

2. **Ingresos bovinos vs gallinas**
   - Ingresos de tipo "toro" van a "gallinas"
   - → Bug #4 aún presente (clasificación incompleta)

3. **Ventas siempre 0**
   - Con fechas donde hay ventas registradas
   - → Bug #1 aún presente (ventas hardcodeadas)

4. **Inventario negativo**
   - Animales no pueden ser negativos
   - → Bug #5 aún presente (vendidos no restados)

---

## Paso 5: Query Supabase Directa (Opcional)

Para verificar datos reales en BD, ejecuta en Supabase console:

```sql
-- Ver animales en enero 2020
SELECT id_animal, id_tipo, fecha_ingreso 
FROM animales 
WHERE fecha_ingreso >= '2020-01-01' 
  AND fecha_ingreso <= '2020-01-31'
  AND id_tipo IN (1, 3, 4);
-- Debe retornar: 53 registros

-- Ver movimientos de venta en febrero 2020
SELECT id_animal, fecha 
FROM movimientos_animales 
WHERE id_tipo_movimiento = 2 
  AND fecha >= '2020-02-01' 
  AND fecha <= '2020-02-29';
-- Debe retornar: 30 vendidos

-- Ver muertes en febrero 2020
SELECT id_animal, fecha_muerte 
FROM muertes 
WHERE fecha_muerte >= '2020-02-01' 
  AND fecha_muerte <= '2020-02-29';
-- Debe retornar: 2 muertes (si corresponde)
```

---

## Paso 6: Checklist Final

- [ ] Build exitoso sin errores
- [ ] Logs en consola muestran números correctos
- [ ] KPI "Total Animales" en enero = 53 (bovinos)
- [ ] KPI "Total Animales" en febrero = 21 (bovinos)
- [ ] KPI "Ventas" > 0 si hay ventas registradas
- [ ] Gráficos muestran solo período seleccionado
- [ ] KPIs coinciden con los gráficos (consistencia)
- [ ] Clasificación de bovinos correcta (vacas + toros + crías)
- [ ] No hay números negativos en inventario
- [ ] Filtros de fecha funcionan correctamente

---

## Solución de Problemas

### Problema: Todavía ves 50 bovinos en enero

**Causa probable**: Bug #4 no fue aplicado (clasificación de bovinos)

**Verificación**:
1. Abre [src/app/lib/dashboardData.ts](src/app/lib/dashboardData.ts) línea 335
2. Busca: `const isBov = [1, 3, 4].includes(Number(item.id_tipo_animal));`
3. Si NO ves eso, el fix no fue aplicado

**Solución**: Recompila con `npm run build`

---

### Problema: Ventas siempre muestran 0

**Causa probable**: Bug #1 aún presente

**Verificación**:
1. Abre [src/app/lib/dashboardData.ts](src/app/lib/dashboardData.ts) línea 238
2. Busca: `safeSelect('movimientos_venta', supabase.from('movimientos_animales')...`
3. Si ves `Promise.resolve([])`, el fix no fue aplicado

**Solución**: Recompila con `npm run build`

---

### Problema: Inventario no cambia de enero a febrero

**Causa probable**: Bug #5 (vendidos no se restan)

**Verificación**:
1. Abre [src/app/lib/dashboardData.ts](src/app/lib/dashboardData.ts) línea 410
2. Busca: `const vendidosIds = ventasMovimientos.map(...)`
3. Si dice `movimientos.filter(...)`, el fix no fue aplicado

**Solución**: Recompila con `npm run build`

---

### Problema: Muertes muy altas en los gráficos

**Causa probable**: Bug #3 (muertes de todo el histórico)

**Verificación**:
1. Abre [src/app/lib/dashboardData.ts](src/app/lib/dashboardData.ts) línea 368
2. Busca: `const muertesEnRango = muertes.filter(...)`
3. Si NO ves `muertesEnRango`, el fix no fue aplicado

**Solución**: Recompila con `npm run build`

---

## Logs Esperados en Consola

```
[dashboardData] SELECTED IDS: [ 1, 3, 4 ]
[dashboardData] ANIMALES RAW (hasta fecha final): Array(53)
[dashboardData] ANIMALES INGRESADOS (hasta fecha final): 53
[dashboardData] VACAS: 50
[dashboardData] TOROS: 3
[dashboardData] CRIAS BOVINAS: 0
[dashboardData] GALLINAS: 150
[dashboardData] POLLITOS: 0
[dashboardData] VENDIDOS (hasta fecha final): 30
[dashboardData] MUERTOS (hasta fecha final): 2
[dashboardData] ACTIVOS AL FINAL DEL PERIODO: 21
[dashboardData] totals: {
  animales: 21,
  produccion: 0,
  nacimientos: 0,
  muertes: 2,
  enfermedades: 0,
  incubaciones: 0,
  ventas: 30,
  ingresos: 0,
  gastos: 0,
  ganancias: 0,
  balance: 0,
  rentabilidad: 0
}
[dashboardData] query counts: {
  animales: 53,
  produccion: 0,
  ingresos: 0,
  gastos: 0,
  ventas: 30,
  nacimientos: 0,
  muertes: 2,
  enfermedades: 0,
  incubaciones: 0
}
```

---

## Éxito

Si todas las validaciones pasan y ves los logs esperados:

✅ **Todos los bugs fueron corregidos exitosamente**

El dashboard ahora:
- Reconstruye correctamente el inventario histórico ✅
- Cuenta todos los tipos de bovinos ✅
- Procesa ventas real ✅
- Muestra gráficos consistentes con KPIs ✅
- Filtra correctamente por fechas ✅
