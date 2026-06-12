"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD or ""
  minDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DatePicker({ value, minDate, onChange }: DatePickerProps) {
  const initial = value || minDate;
  const [viewYear, setViewYear] = useState(() => parseInt(initial.slice(0, 4), 10));
  const [viewMonth, setViewMonth] = useState(() => parseInt(initial.slice(5, 7), 10) - 1); // 0-based
  const [openByDay, setOpenByDay] = useState<Record<string, number> | null>(null);

  const monthStart = `${viewYear}-${pad(viewMonth + 1)}-01`;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(`${monthStart}T12:00:00Z`).getUTCDay();

  useEffect(() => {
    let cancelled = false;
    setOpenByDay(null);
    fetch(`/api/availability?start=${monthStart}&days=${daysInMonth}`)
      .then((r) => (r.ok ? r.json() : { days: null }))
      .then((j) => {
        if (!cancelled) setOpenByDay(j.days ?? {});
      })
      .catch(() => {
        if (!cancelled) setOpenByDay({});
      });
    return () => {
      cancelled = true;
    };
  }, [monthStart, daysInMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Don't allow navigating to months entirely before minDate
  const minMonthStart = `${minDate.slice(0, 7)}-01`;
  const canGoPrev = monthStart > minMonthStart;

  return (
    <div className="bg-white border border-apple-gray-2 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-navy hover:bg-apple-gray transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-apple-text-primary">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-navy hover:bg-apple-gray transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[10px] font-semibold text-apple-text-tertiary py-1">
            {w}
          </span>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const isSunday = (firstWeekday + i) % 7 === 0;
          const tooEarly = dateStr < minDate;
          const fullyBooked = openByDay !== null && openByDay[dateStr] === 0;
          const loading = openByDay === null;
          const disabled = tooEarly || isSunday || fullyBooked || loading;
          const selected = value === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              aria-label={
                fullyBooked ? `${dateStr} — fully booked` : dateStr
              }
              className={`h-9 rounded-lg text-sm transition-colors ${
                selected
                  ? "bg-navy text-white font-semibold"
                  : disabled
                    ? "text-apple-text-tertiary/50 cursor-not-allowed " +
                      (fullyBooked && !tooEarly && !isSunday ? "line-through" : "")
                    : "text-apple-text-primary hover:bg-navy/10"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-apple-text-tertiary mt-3">
        Greyed-out dates are fully booked or unavailable. Closed Sundays.
      </p>
    </div>
  );
}
