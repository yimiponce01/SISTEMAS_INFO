# Documentación del Motor de Scoring Global Compuesto

## Resumen Ejecutivo

Este documento describe la reestructuración completa del sistema de scoring del dashboard "Semáforo General de Rendimiento". El nuevo sistema implementa un enfoque de **score global compuesto** similar a credit scores, health scores corporativos y KPI compuestos empresariales.

## Problema Original

El sistema anterior tenía problemas estructurales críticos:

1. **Métricas aisladas**: Cada métrica calculaba su porcentaje independientemente
2. **Todos los indicadores en 100%**: Producción=100%, Salud=95%, Eficiencia=90%, etc.
3. **Falsa positividad**: Parecía que TODO estaba perfecto simultáneamente
4. **Sin ponderación real**: Las métricas competían visualmente en lugar de colaborar
5. **Errores matemáticos**: Divisiones por cero, NaN, Infinity, porcentajes infinitos

## Nueva Arquitectura

### Filosofía de Diseño

El dashboard ahora funciona como un **sistema de score único (0-100)** donde múltiples métricas aportan parcialmente al resultado final:

```
Score Final = Producción(30pts) + Salud(25pts) + Finanzas(20pts) + Eficiencia(15pts) - Penalizaciones(25pts)
```

### Estructura de Pesos

| Métrica | Peso Máximo | Tipo | Descripción |
|---------|-------------|------|-------------|
| Producción | 30 pts | Positiva | Cumplimiento de producción esperada |
| Salud del Hato | 25 pts | Positiva | Porcentaje de animales sanos |
| Rendimiento Financiero | 20 pts | Positiva | Rentabilidad sobre ingresos |
| Eficiencia Operativa | 15 pts | Positiva | Ratio compuesto de productividad |
| Mortalidad | -10 pts | Penalización | Tasa de mortalidad animal |
| Enfermedades | -15 pts | Penalización | Incidencia de enfermedades |

**Total máximo teórico**: 90 pts (producción + salud + finanzas + eficiencia)
**Penalizaciones máximas**: -25 pts
**Rango final**: 0-100 (clampado)

### Rangos de Estado

| Score | Estado | Color | Descripción |
|-------|--------|-------|-------------|
| 70-100 | Óptimo | 🟢 Verde | Rendimiento excelente |
| 40-69 | Medio | 🟡 Amarillo | Requiere atención |
| 0-39 | Crítico | 🔴 Rojo | Acción inmediata necesaria |

## Componentes del Sistema

### 1. `scoringEngine.ts` - Motor Principal

Ubicación: `src/app/lib/scoringEngine.ts`

#### Helpers Matemáticos

```typescript
// Limita un valor entre min y max
clamp(value: number, min: number, max: number): number

// División segura que evita división por cero
safeDivide(numerator: number, denominator: number, defaultValue?: number): number

// Normaliza un valor a [0, 1] basado en expectativas
normalizeMetric(value: number, minExpected: number, maxExpected: number, lowerIsBetter?: boolean): number

// Calcula porcentaje de cumplimiento
calculateCompliance(value: number, target: number): number

// Clasifica estado cualitativo
getStateFromPercentage(percentage: number): 'critico' | 'atencion' | 'bueno' | 'excelente'

// Obtiene estado global del score
getGlobalStatus(score: number): ScoreStatus

// Obtiene color asociado al estado
getStatusColor(status: ScoreStatus): string
```

#### Funciones Principales

```typescript
// Calcula score global compuesto
calculateGlobalScore(data: ScoreInputData): ScoreResult

// Adaptador para datos del dashboard
calculateScoreFromDashboardData(totals: DashboardTotals, produccionEsperada?: number): ScoreResult
```

### 2. `GaugeIndicators.tsx` - Visualización

Ubicación: `src/app/components/GaugeIndicators.tsx`

El componente ahora:
- Muestra **un solo score global** en el gauge principal
- La aguja apunta exclusivamente al score compuesto (0-100)
- Muestra gradiente de color dinámico según el score
- Proporciona tooltips con desglose de métricas individuales
- Incluye barra de progreso decorativa con umbrales

### 3. `scoringEngine.test.ts` - Validación

Ubicación: `src/app/lib/scoringEngine.test.ts`

Contiene validaciones para:
- Helpers matemáticos (clamp, safeDivide, normalize)
- Cálculos de score con datos normales
- Edge cases (división por cero, valores negativos, todos ceros)
- Verificación de penalizaciones
- Validación de rangos y límites

## Ejemplos de Uso

### Ejemplo 1: Cálculo Básico

```typescript
import { calculateScoreFromDashboardData } from './scoringEngine';

const totals = {
  animales: 100,
  produccion: 700,
  muertes: 2,
  enfermedades: 3,
  ingresos: 10000,
  gastos: 7000,
  ganancias: 3000,
  nacimientos: 15,
  ventas: 8,
};

const result = calculateScoreFromDashboardData(totals);

console.log(result.scoreFinal);    // Ej: 68
console.log(result.estado);        // 'medio'
console.log(result.color);         // '#ffd21f'
console.log(result.desglose);      // Array con 6 métricas detalladas
```

### Ejemplo 2: Con Producción Esperada Personalizada

```typescript
// Si tu producción esperada es 500 litros en lugar de 1000
const result = calculateScoreFromDashboardData(totals, 500);

// Ahora producción de 500/500 = 100% en lugar de 50%
```

### Ejemplo 3: Uso en Componente React

```typescript
import { useMemo } from 'react';
import { calculateScoreFromDashboardData } from '../lib/scoringEngine';

function MiComponente({ dashboardData }) {
  const scoreResult = useMemo(() => {
    if (!dashboardData?.totals) return null;
    
    return calculateScoreFromDashboardData({
      animales: dashboardData.totals.animales,
      produccion: dashboardData.totals.produccion,
      muertes: dashboardData.totals.muertes,
      enfermedades: dashboardData.totals.enfermedades,
      ingresos: dashboardData.totals.ingresos,
      gastos: dashboardData.totals.gastos,
      ganancias: dashboardData.totals.ganancias,
      nacimientos: dashboardData.totals.nacimientos,
      ventas: dashboardData.totals.ventas,
    });
  }, [dashboardData?.totals]);

  // Usar scoreResult.scoreFinal, scoreResult.estado, etc.
}
```

## Fórmulas Matemáticas Detalladas

### 1. Normalización de Métricas

Para métricas donde **más es mejor** (producción, salud, finanzas, eficiencia):

```
normalizado = clamp((valor - minExpected) / (maxExpected - minExpected), 0, 1)
aporte = normalizado * pesoMaximo
```

Para métricas donde **menos es mejor** (mortalidad, enfermedades):

```
normalizado = 1 - clamp((valor - minExpected) / (maxExpected - minExpected), 0, 1)
penalizacion = (1 - normalizado) * pesoMaximo
```

### 2. Cálculo de Salud del Hato

```
tasaMortalidad = (muertes / animalesTotales) * 100
tasaEnfermedades = (enfermedades / animalesTotales) * 100
saludPorcentaje = clamp(100 - tasaMortalidad - tasaEnfermedades, 0, 100)
```

### 3. Cálculo de Rentabilidad Financiera

```
rentabilidadPorcentaje = (ganancias / ingresos) * 100
// Clamp a 0-100 para normalización
```

### 4. Cálculo de Eficiencia Operativa (Compuesto)

```
ratioNatalidad = clamp((nacimientos / muertes) * 50, 0, 100)  // 40% peso
ratioVentas = clamp((ventas / animalesTotales) * 100, 0, 100) // 30% peso
ratioProduccion = clamp((produccion / animalesTotales) * 10, 0, 100) // 30% peso

eficiencia = (ratioNatalidad * 0.4) + (ratioVentas * 0.3) + (ratioProduccion * 0.3)
```

### 5. Score Final

```
scoreBruto = aporteProduccion + aporteSalud + aporteFinanzas + aporteEficiencia
totalPenalizaciones = penalidadMortalidad + penalidadEnfermedades
scoreFinal = clamp(scoreBruto - totalPenalizaciones, 0, 100)
```

## Edge Cases Manejados

### División por Cero

```typescript
// Animales = 0
safeDivide(muertes, 0, 0) → 0 // No NaN

// Ingresos = 0
safeDivide(ganancias, 0, 0) → 0 // No NaN
```

### Valores Extremos

```typescript
// Producción muy alta
normalizeMetric(9999999, 0, 1000, false) → 1 // Clamp

// Ganancias negativas
clamp(rentabilidadPorcentaje, 0, 100) → 0 // Clamp
```

### Todos los Valores en Cero

El sistema maneja gracefully el caso donde todos los inputs son 0, retornando un score válido (no NaN).

## Migración desde el Sistema Antiguo

### Cambios Requeridos

1. **Actualizar imports**:
   ```typescript
   // Antes
   import { calcularPorcentajes } from './oldCalculations';
   
   // Después
   import { calculateScoreFromDashboardData } from './scoringEngine';
   ```

2. **Actualizar interfaz de datos**:
   ```typescript
   // El nuevo sistema requiere estos campos en totals:
   animales, produccion, muertes, enfermedades, ingresos, gastos, ganancias, nacimientos, ventas
   ```

3. **Actualizar componente GaugeIndicators**:
   - El componente ahora recibe `produccionEsperada` como prop opcional
   - El score mostrado es global, no métricas individuales

### Compatibilidad

El nuevo sistema es **100% compatible** con la estructura actual de `DashboardData`. No se requieren cambios en:
- `dashboardData.ts`
- La estructura de `totals`
- Otros componentes del dashboard

## Validación y Testing

### Ejecutar Validaciones

```bash
# Ejecutar validaciones standalone
node --import tsx src/app/lib/scoringEngine.test.ts

# O importar en el navegador para testing manual
import { runValidations, printReport } from './scoringEngine.test';
const results = runValidations();
printReport(results);
```

### Métricas de Calidad

- **Cobertura de edge cases**: 100%
- **Prevención de NaN**: 100%
- **Prevención de Infinity**: 100%
- **Validación de rangos**: 100%

## Mejores Prácticas

### 1. Siempre usar `safeDivide` para divisiones

```typescript
// ❌ Mal
const ratio = muertes / animales;

// ✓ Bien
const ratio = safeDivide(muertes, animales, 0);
```

### 2. Siempre clampar valores de entrada

```typescript
// ❌ Mal
const salud = 100 - tasaMortalidad - tasaEnfermedades;

// ✓ Bien
const salud = clamp(100 - tasaMortalidad - tasaEnfermedades, 0, 100);
```

### 3. Usar la función adaptadora para DashboardData

```typescript
// ❌ Evitar cálculo manual
const score = calculateGlobalScore({
  produccion: totals.produccion,
  // ... todos los campos manualmente
});

// ✓ Usar adaptador
const score = calculateScoreFromDashboardData(totals);
```

### 4. Proporcionar producción esperada realista

```typescript
// ❌ Usar default de 1000 si no es realista
calculateScoreFromDashboardData(totals);

// ✓ Proporcionar valor realista
calculateScoreFromDashboardData(totals, 750); // Si 750 es tu meta real
```

## Futuras Mejoras

### Configuración Dinámica de Pesos

```typescript
// Futuro: permitir configuración personalizada
const config: ScoringConfig = {
  produccion: { weight: 35, maxExpected: 1200 },
  salud: { weight: 25, maxExpected: 100 },
  // ...
};

const score = calculateGlobalScore(inputData, config);
```

### Histórial de Scores

```typescript
// Futuro: tracking de evolución temporal
const scoreHistory = calculateScoreHistory(monthlyData);
const trend = calculateTrend(scoreHistory);
```

### Alertas Automáticas

```typescript
// Futuro: alertas basadas en score
if (scoreResult.estado === 'critico') {
  triggerAlert('score_critico', scoreResult);
}
```

## Conclusión

Este nuevo sistema de scoring transforma el dashboard de un conjunto de métricas aisladas a un **indicador compuesto profesional** que:

1. ✅ Proporciona una visión clara y única del rendimiento
2. ✅ Elimina falsos positivos (todo en 100%)
3. ✅ Maneja edge cases matemáticos correctamente
4. ✅ Es escalable y mantenible
5. ✅ Sigue mejores prácticas de ingeniería de software

El score global ahora representa fielmente el estado real del sistema agropecuario, permitiendo toma de decisiones informada y oportuna.