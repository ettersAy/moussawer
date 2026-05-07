import { useState, useMemo, useCallback } from "react";
import type { CalendarView } from "./types";
import {
  monthDays, weekDays, nextMonth, prevMonth, nextWeek, prevWeek,
} from "./utils";

export function useCalendarNavigation() {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(today);

  const navigate = useCallback((dir: -1 | 1) => {
    setAnchor((a) => {
      if (view === "month") return dir === 1 ? nextMonth(a) : prevMonth(a);
      return dir === 1 ? nextWeek(a) : prevWeek(a);
    });
  }, [view]);

  const goToday = useCallback(() => {
    const t = new Date();
    setAnchor(t);
    setSelected(t);
  }, []);

  const days = useMemo(() => {
    return view === "month" ? monthDays(anchor) : weekDays(anchor);
  }, [view, anchor]);

  return {
    view, setView,
    anchor, setAnchor,
    selected, setSelected,
    days,
    navigate, goToday,
  };
}
