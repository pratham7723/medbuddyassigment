import { useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({
  selected,
  onSelect,
  logs = [],
}: {
  selected: Date | null,
  onSelect: (date: Date) => void,
  logs?: any[]
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selected &&
      day === selected.getDate() &&
      currentMonth === selected.getMonth() &&
      currentYear === selected.getFullYear()
    );
  };

  // Helper to get log status for a day
  const getDayStatus = (day: number) => {
    if (!logs || logs.length === 0) return null;
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split("T")[0];
    const logsForDay = logs.filter((log: any) => log.date === dateStr);
    if (logsForDay.length === 0) return null;
    if (logsForDay.every((l: any) => l.taken)) return "taken";
    if (logsForDay.some((l: any) => !l.taken)) return "missed";
    return null;
  };

  // Generate calendar grid
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
        <span className="font-semibold text-lg">
          {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-1">
        {daysOfWeek.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) =>
          day ? (
            <button
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center
                ${isToday(day) ? "border-2 border-blue-500" : ""}
                ${isSelected(day) ? "bg-blue-500 text-white" : "hover:bg-blue-100"}
                ${
                  getDayStatus(day) === "taken"
                    ? "ring-2 ring-green-400"
                    : getDayStatus(day) === "missed"
                    ? "ring-2 ring-red-400"
                    : ""
                }
              `}
              onClick={() => onSelect(new Date(currentYear, currentMonth, day))}
            >
              {day}
            </button>
          ) : (
            <div key={idx} />
          )
        )}
      </div>
    </div>
  );
} 