import { useState } from 'react';
interface DateRangeFiltersProps {
  dateRange: { from: string; to: string };
  setDateRange: (range: { from: string; to: string }) => void;
  darkMode: boolean;
}

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const years = Array.from(
  { length: 31 },
  (_, i) => 2020 + i
);

const monthToIndex: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

export default function DateRangeFilters({
  dateRange,
  setDateRange,
  darkMode
}: DateRangeFiltersProps) {

  const getDaysInMonth = (
  month: number,
  year: number
) => {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
};

const buildDate = (
  day: number,
  month: number,
  year: number
) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const [fromYear, fromMonth, fromDayValue] =
  dateRange.from.split('-').map(Number);

const [toYear, toMonth, toDayValue] =
  dateRange.to.split('-').map(Number);

const fromDate = new Date(
  fromYear,
  fromMonth - 1,
  fromDayValue
);

const toDate = new Date(
  toYear,
  toMonth - 1,
  toDayValue
);

const [fromDay, setFromDay] = useState(
  String(fromDate.getDate())
);

const [toDay, setToDay] = useState(
  String(toDate.getDate())
);

  const inputClass = `
w-full rounded-2xl border py-3 pl-4 pr-3 text-sm outline-none transition-all duration-300 focus:scale-[1.01]
${
  darkMode
    ? 'bg-slate-950/50 text-white [color-scheme:dark]'
    : 'bg-white text-slate-800'
}
`;
    const inputStyle = darkMode
  ? {
      borderColor: 'rgba(103, 232, 249, 0.22)',
      boxShadow:
        '0 12px 28px rgba(2,6,23,0.32), 0 0 18px rgba(34,211,238,0.12), inset 0 1px 14px rgba(255,255,255,0.06)',
    }
  : {
      borderColor: '#cbd5e1',
      boxShadow:
        '0 0 0 1px rgba(203,213,225,0.3), 0 6px 20px rgba(15,23,42,0.06)',
    };



  return (
    <div className="space-y-4">
      <p
  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
    darkMode
      ? 'text-cyan-300'
      : 'text-cyan-700'
  }`}
>
  Desde
</p>
      <div className="grid grid-cols-3 gap-2">

<input
  type="number"
  min={1}
  max={getDaysInMonth(
    fromDate.getMonth(),
    fromDate.getFullYear()
  )}
  value={fromDay}
  className={inputClass}
  style={inputStyle}
  onChange={(e) => {
    setFromDay(e.target.value);
  }}
  onBlur={() => {
    const day = Math.min(
      Number(fromDay || 1),
      getDaysInMonth(
        fromDate.getMonth(),
        fromDate.getFullYear()
      )
    );

    setDateRange({
      ...dateRange,
      from: buildDate(
        day,
        fromDate.getMonth(),
        fromDate.getFullYear()
      )
    });
  }}
/>

  <select
  value={fromDate.getMonth()}
  className={inputClass}
  style={inputStyle}
  onChange={(e) =>
    setDateRange({
      ...dateRange,
      from: buildDate(
        fromDate.getDate(),
        Number(e.target.value),
        fromDate.getFullYear()
      )
    })
  }
>
    {months.map((month, index) => (
      <option key={month} value={index}>
        {month}
      </option>
    ))}
  </select>

<datalist id="meses">
  {months.map((month) => (
    <option key={month} value={month} />
  ))}
</datalist>

  <input
  type="number"
  min={2020}
  max={2050}
  value={fromDate.getFullYear()}
  className={inputClass}
  style={inputStyle}
  onChange={(e) =>
    setDateRange({
      ...dateRange,
      from: buildDate(
        fromDate.getDate(),
        fromDate.getMonth(),
        Number(e.target.value || 2020)
      )
    })
  }
/>

</div>

<p
  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
    darkMode
      ? 'text-cyan-300'
      : 'text-cyan-700'
  }`}
>
  Hasta
</p>
<div className="grid grid-cols-3 gap-2">

  <input
  type="number"
  min={1}
  max={getDaysInMonth(
    toDate.getMonth(),
    toDate.getFullYear()
  )}
  value={toDay}
  className={inputClass}
  style={inputStyle}
  onChange={(e) => {
    setToDay(e.target.value);
  }}
  onBlur={() => {
    const day = Math.min(
      Number(toDay || 1),
      getDaysInMonth(
        toDate.getMonth(),
        toDate.getFullYear()
      )
    );

    setDateRange({
      ...dateRange,
      to: buildDate(
        day,
        toDate.getMonth(),
        toDate.getFullYear()
      )
    });
  }}
/>

  <select
    value={toDate.getMonth()}
    className={inputClass}
    style={inputStyle}
    onChange={(e) =>
      setDateRange({
        ...dateRange,
        to: buildDate(
          toDate.getDate(),
          Number(e.target.value),
          toDate.getFullYear()
        )
      })
    }
  >
    {months.map((month, index) => (
      <option key={month} value={index}>
        {month}
      </option>
    ))}
  </select>

  <select
    value={toDate.getFullYear()}
    className={inputClass}
    style={inputStyle}
    onChange={(e) =>
      setDateRange({
        ...dateRange,
        to: buildDate(
          toDate.getDate(),
          toDate.getMonth(),
          Number(e.target.value)
        )
      })
    }
  >
    {years.map(year => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>

</div>
    </div>
  );
}
