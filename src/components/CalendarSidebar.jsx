import React, { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { translations } from "../context/translations";
import "./CalendarSidebar.css";

const CalendarSidebar = () => {
  const { lang, filterDate, setFilterDate, clearFilter } = useLang();
  const [calView, setCalView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const { year, month } = calView;
    if (
      filterDate &&
      filterDate.year === year &&
      filterDate.month === month &&
      filterDate.day === day
    ) {
      clearFilter();
    } else {
      setFilterDate({ year, month, day });
    }
  };

  const handleMonthClick = () => {
    const { year, month } = calView;
    if (
      filterDate &&
      filterDate.year === year &&
      filterDate.month === month &&
      !filterDate.day
    ) {
      clearFilter();
    } else {
      setFilterDate({ year, month, day: null });
    }
  };

  const prevMonth = () =>
    setCalView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const nextMonth = () =>
    setCalView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isFilterActive = filterDate !== null;

  return (
    <div className="cal-sidebar">
      <div className="cal-sidebar-inner">
        {/* Month navigation */}
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth}>
            &#8249;
          </button>
          <button
            className="cal-month-label"
            onClick={handleMonthClick}
            title="Filter by this month"
          >
            {translations[lang].months[calView.month]} {calView.year}
            {filterDate &&
              filterDate.year === calView.year &&
              filterDate.month === calView.month &&
              !filterDate.day && <span className="cal-active-dot" />}
          </button>
          <button className="cal-nav-btn" onClick={nextMonth}>
            &#8250;
          </button>
        </div>

        {/* Day headers */}
        <div className="cal-grid">
          {(lang === "en"
            ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
            : ["র", "স", "মঙ", "বু", "বৃ", "শু", "শ"]
          ).map((d) => (
            <div key={d} className="cal-day-header">
              {d}
            </div>
          ))}

          {/* Empty cells */}
          {Array.from({
            length: getFirstDayOfMonth(calView.year, calView.month),
          }).map((_, i) => (
            <div key={`e${i}`} />
          ))}

          {/* Day cells */}
          {Array.from(
            { length: getDaysInMonth(calView.year, calView.month) },
            (_, i) => i + 1,
          ).map((day) => {
            const isSelected =
              filterDate &&
              filterDate.year === calView.year &&
              filterDate.month === calView.month &&
              filterDate.day === day;
            const isToday = (() => {
              const now = new Date();
              return (
                now.getFullYear() === calView.year &&
                now.getMonth() === calView.month &&
                now.getDate() === day
              );
            })();
            return (
              <button
                key={day}
                className={`cal-day${isSelected ? " cal-day-selected" : ""}${isToday ? " cal-day-today" : ""}`}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {isFilterActive && (
          <div className="cal-footer">
            <button className="cal-clear-btn" onClick={clearFilter}>
              ✕ {lang === "en" ? "Clear filter" : "ফিল্টার মুছুন"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSidebar;
