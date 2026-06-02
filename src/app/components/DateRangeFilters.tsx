
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
  { length: 7 },
  (_, i) => 2020 + i
);

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

const fromDate = new Date(dateRange.from);
const toDate = new Date(dateRange.to);

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

  <select
    value={fromDate.getDate()}
    className={inputClass}
    style={inputStyle}
    onChange={(e) =>
      setDateRange({
        ...dateRange,
        from: buildDate(
          Number(e.target.value),
          fromDate.getMonth(),
          fromDate.getFullYear()
        )
      })
    }
  >
    {Array.from(
      {
        length: getDaysInMonth(
          fromDate.getMonth(),
          fromDate.getFullYear()
        )
      },
      (_, i) => i + 1
    ).map(day => (
      <option key={day} value={day}>
        {day}
      </option>
    ))}
  </select>

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

  <select
    value={fromDate.getFullYear()}
    className={inputClass}
    style={inputStyle}
    onChange={(e) =>
      setDateRange({
        ...dateRange,
        from: buildDate(
          fromDate.getDate(),
          fromDate.getMonth(),
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

  <select
    value={toDate.getDate()}
    className={inputClass}
    style={inputStyle}
    onChange={(e) =>
      setDateRange({
        ...dateRange,
        to: buildDate(
          Number(e.target.value),
          toDate.getMonth(),
          toDate.getFullYear()
        )
      })
    }
  >
    {Array.from(
      {
        length: getDaysInMonth(
          toDate.getMonth(),
          toDate.getFullYear()
        )
      },
      (_, i) => i + 1
    ).map(day => (
      <option key={day} value={day}>
        {day}
      </option>
    ))}
  </select>

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
