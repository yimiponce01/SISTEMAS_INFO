import { supabase } from './supabase';

export type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';

export interface DateRange {
  from: string;
  to: string;
}

export interface DashboardMonthlyData {
  month: string;
  bovinosProduccion: number;
  gallinasProduccion: number;
  bovinosNacimientos: number;
  gallinasNacimientos: number;
  bovinosMuertes: number;
  gallinasMuertes: number;
  bovinosIngresos: number;
  gallinasIngresos: number;
  bovinosGastos: number;
  gallinasGastos: number;
  bovinosVentas: number;
  gallinasVentas: number;
  produccion: number;
  nacimientos: number;
  muertes: number;
  ingresos: number;
  gastos: number;
  ganancias: number;
  ventas: number;
}

export interface DashboardData {
  selectedAnimal: AnimalFilter;
  dateRange: DateRange;
  animalIds: number[];
  bovinoIds: number[];
  gallinaIds: number[];
  monthly: DashboardMonthlyData[];
  totals: {
    animales: number;
    produccion: number;
    nacimientos: number;
    muertes: number;
    enfermedades: number;
    incubaciones: number;
    ventas: number;
    ingresos: number;
    gastos: number;
    ganancias: number;
    balance: number;
    rentabilidad: number;
  };
  healthGauge: {
    red: number;
    yellow: number;
    green: number;
  };
  debug: Record<string, unknown>;
}

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const animalTypeIds: Record<AnimalFilter, number[]> = {
  bovinos: [1],
  gallinas: [2],
  ambos: [1, 2],
};

const emptyMonthly = (): Record<string, DashboardMonthlyData> => {
  const map: Record<string, DashboardMonthlyData> = {};

  months.forEach((month) => {
    map[month] = {
      month,
      bovinosProduccion: 0,
      gallinasProduccion: 0,
      bovinosNacimientos: 0,
      gallinasNacimientos: 0,
      bovinosMuertes: 0,
      gallinasMuertes: 0,
      bovinosIngresos: 0,
      gallinasIngresos: 0,
      bovinosGastos: 0,
      gallinasGastos: 0,
      bovinosVentas: 0,
      gallinasVentas: 0,
      produccion: 0,
      nacimientos: 0,
      muertes: 0,
      ingresos: 0,
      gastos: 0,
      ganancias: 0,
      ventas: 0,
    };
  });

  return map;
};

const monthKey = (dateValue?: string) => {
  const date = dateValue ? new Date(dateValue) : new Date('');
  return months[Number.isNaN(date.getTime()) ? 0 : date.getMonth()];
};

const sumAmount = (records: any[], keys: string[]) =>
  records.reduce((acc, item) => {
    const key = keys.find((candidate) => item[candidate] !== undefined && item[candidate] !== null);
    return acc + Number(key ? item[key] || 0 : 0);
  }, 0);

const getRecordDate = (record: any) =>
  record.fecha ||
  record.fecha_registro ||
  record.fecha_enfermedad ||
  record.fecha_inicio ||
  record.fecha_incubacion ||
  record.created_at;

const isWithinDateRange = (record: any, dateRange: DateRange) => {
  const value = getRecordDate(record);

  if (!value) return true;

  const date = new Date(value);
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);

  if (Number.isNaN(date.getTime())) return true;

  return date >= from && date <= to;
};

const belongsToSelection = (
  record: any,
  selectedIds: number[],
  animalIds: number[]
) => {
  if (record.id_tipo_animal !== undefined && record.id_tipo_animal !== null) {
    return selectedIds.includes(Number(record.id_tipo_animal));
  }

  if (record.id_animal !== undefined && record.id_animal !== null) {
    return animalIds.includes(Number(record.id_animal));
  }

  return true;
};

async function safeSelect(table: string, query: any) {
  const { data, error } = await query;

  if (error) {
    console.warn(`[dashboardData] ${table}: sin registros o error de consulta`, error.message);
    return [];
  }

  return data || [];
}

function isBovino(id: number, bovinoIds: number[]) {
  return bovinoIds.includes(Number(id));
}

function animalPrefix(id: number, bovinoIds: number[]) {
  return isBovino(id, bovinoIds) ? 'bovinos' : 'gallinas';
}

export async function fetchDashboardData(
  selectedAnimal: AnimalFilter,
  dateRange: DateRange
): Promise<DashboardData> {
  const selectedIds = animalTypeIds[selectedAnimal];

  const animales = await safeSelect(
    'animales',
    supabase.from('animales').select('*').in('id_tipo', selectedIds)
  );

  const animalIds = animales.map((animal: any) => Number(animal.id_animal));
  const bovinoIds = animales
    .filter((animal: any) => Number(animal.id_tipo) === 1)
    .map((animal: any) => Number(animal.id_animal));
  const gallinaIds = animales
    .filter((animal: any) => Number(animal.id_tipo) === 2)
    .map((animal: any) => Number(animal.id_animal));
  const emptyAnimalFilter = [-1];

  const [
    produccion,
    ingresos,
    gastos,
    ventas,
    nacimientos,
    muertes,
    enfermedades,
    incubaciones,
  ] = await Promise.all([
    safeSelect(
      'produccion',
      supabase
        .from('produccion')
        .select('*')
        .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
        .gte('fecha', dateRange.from)
        .lte('fecha', dateRange.to)
    ),
    safeSelect(
      'ingresos',
      supabase
        .from('ingresos')
        .select('*')
        .in('id_tipo_animal', selectedIds)
        .gte('fecha', dateRange.from)
        .lte('fecha', dateRange.to)
    ),
    safeSelect(
      'gastos',
      supabase
        .from('gastos')
        .select('*')
        .in('id_tipo_animal', selectedIds)
        .gte('fecha', dateRange.from)
        .lte('fecha', dateRange.to)
    ),
    safeSelect('ventas', supabase.from('ventas').select('*')),
    safeSelect(
      'nacimientos',
      supabase
        .from('nacimientos')
        .select('*')
        .or(
          animalIds.length
            ? `id_madre.in.(${animalIds.join(',')}),id_padre.in.(${animalIds.join(',')})`
            : 'id_madre.eq.-1'
        )
        .gte('fecha_nacimiento', dateRange.from)
        .lte('fecha_nacimiento', dateRange.to)
    ),
    safeSelect(
      'muertes',
      supabase
        .from('muertes')
        .select('*')
        .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
        .gte('fecha_muerte', dateRange.from)
        .lte('fecha_muerte', dateRange.to)
    ),
    safeSelect(
      'enfermedades',
      supabase
        .from('enfermedades')
        .select('*')
        .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
    ),
    selectedAnimal === 'gallinas' || selectedAnimal === 'ambos'
      ? safeSelect('incubacion', supabase.from('incubacion').select('*'))
      : Promise.resolve([]),
  ]);

  const filteredVentas = ventas.filter(
    (item: any) =>
      belongsToSelection(item, selectedIds, animalIds) &&
      isWithinDateRange(item, dateRange)
  );
  const filteredEnfermedades = enfermedades.filter((item: any) =>
    isWithinDateRange(item, dateRange)
  );
  const filteredIncubaciones = incubaciones.filter(
    (item: any) =>
      belongsToSelection(item, selectedIds, animalIds) &&
      isWithinDateRange(item, dateRange)
  );

  const monthlyMap = emptyMonthly();

  produccion.forEach((item: any) => {
    const prefix = animalPrefix(Number(item.id_animal), bovinoIds);
    monthlyMap[monthKey(item.fecha)][`${prefix}Produccion` as keyof DashboardMonthlyData] =
      Number(monthlyMap[monthKey(item.fecha)][`${prefix}Produccion` as keyof DashboardMonthlyData]) +
      Number(item.cantidad || item.produccion || 0);
  });

  ingresos.forEach((item: any) => {
    const prefix = Number(item.id_tipo_animal) === 1 ? 'bovinos' : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha)];
    month[`${prefix}Ingresos` as keyof DashboardMonthlyData] =
      Number(month[`${prefix}Ingresos` as keyof DashboardMonthlyData]) + Number(item.monto || 0);
  });

  gastos.forEach((item: any) => {
    const prefix = Number(item.id_tipo_animal) === 1 ? 'bovinos' : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha)];
    month[`${prefix}Gastos` as keyof DashboardMonthlyData] =
      Number(month[`${prefix}Gastos` as keyof DashboardMonthlyData]) + Number(item.monto || 0);
  });

  filteredVentas.forEach((item: any) => {
    const prefix =
      item.id_animal !== undefined && item.id_animal !== null
        ? animalPrefix(Number(item.id_animal), bovinoIds)
        : Number(item.id_tipo_animal) === 1
          ? 'bovinos'
          : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha)];
    month[`${prefix}Ventas` as keyof DashboardMonthlyData] =
      Number(month[`${prefix}Ventas` as keyof DashboardMonthlyData]) + 1;
  });

  nacimientos.forEach((item: any) => {
    const prefix =
      isBovino(Number(item.id_madre), bovinoIds) || isBovino(Number(item.id_padre), bovinoIds)
        ? 'bovinos'
        : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha_nacimiento)];
    month[`${prefix}Nacimientos` as keyof DashboardMonthlyData] =
      Number(month[`${prefix}Nacimientos` as keyof DashboardMonthlyData]) + 1;
  });

  muertes.forEach((item: any) => {
    const prefix = animalPrefix(Number(item.id_animal), bovinoIds);
    const month = monthlyMap[monthKey(item.fecha_muerte)];
    month[`${prefix}Muertes` as keyof DashboardMonthlyData] =
      Number(month[`${prefix}Muertes` as keyof DashboardMonthlyData]) + 1;
  });

  const monthly = Object.values(monthlyMap).map((item) => ({
    ...item,
    produccion: item.bovinosProduccion + item.gallinasProduccion,
    nacimientos: item.bovinosNacimientos + item.gallinasNacimientos,
    muertes: item.bovinosMuertes + item.gallinasMuertes,
    ingresos: item.bovinosIngresos + item.gallinasIngresos,
    gastos: item.bovinosGastos + item.gallinasGastos,
    ganancias: item.bovinosIngresos + item.gallinasIngresos - item.bovinosGastos - item.gallinasGastos,
    ventas: item.bovinosVentas + item.gallinasVentas,
  }));

  const totalIngresos = sumAmount(ingresos, ['monto']);
  const totalGastos = sumAmount(gastos, ['monto']);
  const totalGanancias = totalIngresos - totalGastos;
  const totalVentas = filteredVentas.length;
  const totalProduccion = sumAmount(produccion, ['cantidad', 'produccion']);
  const totalNacimientos = nacimientos.length;
  const totalMuertes = muertes.length;
  const totalEnfermedades = filteredEnfermedades.length;
  const totalAnimales = animales.length;
  const totalIncubaciones = filteredIncubaciones.length;

  const healthGauge = {
    red: totalAnimales ? (totalMuertes / totalAnimales) * 100 : 0,
    yellow: totalAnimales ? (totalEnfermedades / totalAnimales) * 100 : 0,
    green: Math.max(
      0,
      100 - (totalAnimales ? ((totalMuertes + totalEnfermedades) / totalAnimales) * 100 : 0)
    ),
  };

  const dashboardData: DashboardData = {
    selectedAnimal,
    dateRange,
    animalIds,
    bovinoIds,
    gallinaIds,
    monthly,
    totals: {
      animales: totalAnimales,
      produccion: totalProduccion,
      nacimientos: totalNacimientos,
      muertes: totalMuertes,
      enfermedades: totalEnfermedades,
      incubaciones: totalIncubaciones,
      ventas: totalVentas,
      ingresos: totalIngresos,
      gastos: totalGastos,
      ganancias: totalGanancias,
      balance: totalGanancias,
      rentabilidad: totalIngresos ? (totalGanancias / totalIngresos) * 100 : 0,
    },
    healthGauge,
    debug: {
      queryCounts: {
        animales: animales.length,
        produccion: produccion.length,
        ingresos: ingresos.length,
        gastos: gastos.length,
        ventas: filteredVentas.length,
        nacimientos: nacimientos.length,
        muertes: muertes.length,
        enfermedades: filteredEnfermedades.length,
        incubaciones: filteredIncubaciones.length,
      },
    },
  };

  console.log('[dashboardData] totals', dashboardData.totals);
  console.log('[dashboardData] query counts', dashboardData.debug.queryCounts);
  console.log('[dashboardData] monthly totals', monthly);

  return dashboardData;
}
