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
  productionDistributionData: {
  name: string;
  value: number;
}[];
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
  bovinos: [1, 3, 4],
  gallinas: [2, 5],
  ambos: [1, 2, 3, 4, 5],
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

  const todosAnimales = await safeSelect(
  'animales',
  supabase
    .from('animales')
    .select('*')
);


const animales = todosAnimales.filter(
  (animal: any) =>
    selectedIds.includes(Number(animal.id_tipo))
);


const animalIds = animales.map((animal: any) =>
  Number(animal.id_animal)
);

const bovinoIds = todosAnimales
  .filter((animal: any) =>
    [1, 3, 4].includes(Number(animal.id_tipo))
  )
  .map((animal: any) =>
    Number(animal.id_animal)
  );

const gallinaIds = todosAnimales
  .filter((animal: any) =>
    [2, 5].includes(Number(animal.id_tipo))
  )
  .map((animal: any) =>
    Number(animal.id_animal)
  );

const emptyAnimalFilter = [-1];

const [p1, p2, p3] = await Promise.all([
  supabase
    .from('produccion')
    .select(`
      *,
      tipos_produccion(nombre)
    `)
    .gte('fecha', dateRange.from)
    .lte('fecha', dateRange.to)
    .range(0, 999),

  supabase
    .from('produccion')
    .select(`
      *,
      tipos_produccion(nombre)
    `)
    .gte('fecha', dateRange.from)
    .lte('fecha', dateRange.to)
    .range(1000, 1999),

  supabase
    .from('produccion')
    .select(`
      *,
      tipos_produccion(nombre)
    `)
    .gte('fecha', dateRange.from)
    .lte('fecha', dateRange.to)
    .range(2000, 2999),
]);

const produccion = [
  ...(p1.data || []),
  ...(p2.data || []),
  ...(p3.data || []),
];



  const [

  ingresos,
  gastos,
  ventasMovimientos,
  nacimientos,
  muertes,
  enfermedades,
  movimientos_animales,
  incubaciones,
  
] = await Promise.all([


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
    safeSelect(
      'movimientos_venta',
      supabase
        .from('movimientos_animales')
        .select('*')
        .eq('id_tipo_movimiento', 2)
        .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
        .gte('fecha', dateRange.from)
        .lte('fecha', dateRange.to)
        
    ),
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
        .gte('fecha_muerte', dateRange.from)
        .lte('fecha_muerte', dateRange.to)
        
    ),

      safeSelect(
    'enfermedades',
    supabase
      .from('enfermedades')
      .select('*')
      .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
      .gte('fecha', dateRange.from)
      .lte('fecha', dateRange.to)
  ),
    
      safeSelect(
    'movimientos_animales',
    supabase
      .from('movimientos_animales')
      .select('*')
      .in('id_animal', animalIds.length ? animalIds : emptyAnimalFilter)
      .lte('fecha', dateRange.to)
    ),

    safeSelect(
    'incubacion',
    supabase
      .from('incubacion')
      .select('*')
      
    ),
    ]);

    

const { data, count, error } = await supabase
  .from('produccion')
  .select('*', { count: 'exact' });


  const filteredVentas = ventasMovimientos.filter(
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


  // Procesamiento corregido de muertes (sin filtros restrictivos previos)
  muertes.forEach((item: any) => {
    // Verificamos que la fecha exista para evitar errores
    const mKey = monthKey(item.fecha_muerte);
    if (mKey && monthlyMap[mKey]) {
      const prefix = animalPrefix(Number(item.id_animal), bovinoIds);
      const month = monthlyMap[mKey];

      (month as any)[`${prefix}Muertes`] =
        Number((month as any)[`${prefix}Muertes`] || 0) + 1;
      
      // Aseguramos que el total general del mes también sume la muerte
      (month as any).muertes = 
        Number((month as any).muertes || 0) + 1;
    }
  });

const productionDistribution: Record<string, number> = {};

produccion.forEach((item: any) => {


  const cantidad =
  Number(item.cantidad || item.produccion || 1);

  const prefix = animalPrefix(
    Number(item.id_animal),
    bovinoIds
  );

  const month =
    monthlyMap[monthKey(item.fecha)];

  if (month) {
    (month as any)[`${prefix}Produccion`] =
      Number(
        (month as any)[`${prefix}Produccion`] || 0
      ) + cantidad;
  }

const animalId = Number(item.id_animal);

const animal = todosAnimales.find(
  (a: any) => Number(a.id_animal) === animalId
);

const tipoAnimal = Number(animal?.id_tipo);



const esBovino = [1,3,4].includes(tipoAnimal);

const esGallina = [2,5].includes(tipoAnimal);


if (
  selectedAnimal === 'bovinos' &&
  !esBovino
) return;


if (
  selectedAnimal === 'gallinas' &&
  !esGallina
) return;

  let nombreTipo = '';


  switch (Number(item.id_tipo_produccion)) {

  case 1:
    nombreTipo = 'Leche';
    break;

  case 2:
  nombreTipo = esBovino
    ? 'Carne Bovino'
    : 'Carne Gallina';
  break;

case 3:
  nombreTipo = 'Huevos';
  break;

case 4:
  nombreTipo = 'Carne Gallina';
  break;

  case 8:
    nombreTipo = 'Venta Pollo Bebé';
    break;

  case 9:
    nombreTipo = 'Alquiler Toro';
    break;


  default:
    nombreTipo = `Tipo ${item.id_tipo_produccion}`;
}



  productionDistribution[nombreTipo] =
    (productionDistribution[nombreTipo] || 0) +
    cantidad;
});


  const productionDistributionData = Object.entries(
  productionDistribution
).map(([name, value]) => ({
  name,
  value,
}));

  ingresos.forEach((item: any) => {
    const isBov = [1, 3, 4].includes(Number(item.id_tipo_animal));
    const prefix = isBov ? 'bovinos' : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha)];

    (month as any)[`${prefix}Ingresos`] =
      Number((month as any)[`${prefix}Ingresos`] || 0) +
      Number(item.monto || 0);
  });

  gastos.forEach((item: any) => {
    const isBov = [1, 3, 4].includes(Number(item.id_tipo_animal));
    const prefix = isBov ? 'bovinos' : 'gallinas';
    const month = monthlyMap[monthKey(item.fecha)];

    (month as any)[`${prefix}Gastos`] =
      Number((month as any)[`${prefix}Gastos`] || 0) +
      Number(item.monto || 0);
  });

  filteredVentas.forEach((item: any) => {
    const prefix =
      item.id_animal !== undefined && item.id_animal !== null
        ? animalPrefix(Number(item.id_animal), bovinoIds)
        : Number(item.id_tipo_animal) === 1
          ? 'bovinos'
          : 'gallinas';

    const month = monthlyMap[monthKey(item.fecha)];

    (month as any)[`${prefix}Ventas`] =
      Number((month as any)[`${prefix}Ventas`] || 0) + 1;
  });

  nacimientos.forEach((item: any) => {
    const prefix =
      isBovino(Number(item.id_madre), bovinoIds) ||
      isBovino(Number(item.id_padre), bovinoIds)
        ? 'bovinos'
        : 'gallinas';

    const month = monthlyMap[monthKey(item.fecha_nacimiento)];

    (month as any)[`${prefix}Nacimientos`] =
      Number((month as any)[`${prefix}Nacimientos`] || 0) + 1;
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
  const totalNacimientos = nacimientos.filter((item: any) =>
    isWithinDateRange(item, dateRange)
  ).length;

  
  const filteredMuertes = muertes.filter((m: any) => {

  const fecha = new Date(m.fecha_muerte);

  const inRange =
    fecha >= new Date(dateRange.from) &&
    fecha <= new Date(dateRange.to);

  if (selectedAnimal === 'bovinos') {
    return inRange && [1, 3, 4].includes(Number(m.id_tipo_animal));
  }

  if (selectedAnimal === 'gallinas') {
    return inRange && [2, 5].includes(Number(m.id_tipo_animal));
  }

  return inRange;
});

  const totalMuertes = filteredMuertes.length;
  const totalEnfermedades = filteredEnfermedades.length;

const vendidosIds = ventasMovimientos
  .map((m: any) => Number(m.id_animal));

const muertosIds = muertes.map(
  (m: any) => Number(m.id_animal)
);

const animalesActivosHistoricos = animales.filter(
  (animal: any) =>
    !vendidosIds.includes(Number(animal.id_animal)) &&
    !muertosIds.includes(Number(animal.id_animal))
);

const totalAnimales = animalesActivosHistoricos.length;
const totalIncubaciones = filteredIncubaciones.length;

const healthGauge = {
  red: totalAnimales ? (totalMuertes / totalAnimales) * 100 : 0,
  yellow: totalAnimales ? (totalEnfermedades / totalAnimales) * 100 : 0,
  green: Math.max(
    0,
    100 - (totalAnimales
      ? ((totalMuertes + totalEnfermedades) / totalAnimales) * 100
      : 0)
  ),
};

  const dashboardData: DashboardData = {
    selectedAnimal,
    dateRange,
    animalIds,
    bovinoIds,
    gallinaIds,
    monthly,
    productionDistributionData,
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
  return dashboardData;
}
