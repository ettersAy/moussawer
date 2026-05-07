import {
  ChevronLeft, ChevronRight, Plus,
  CalendarDays, Columns, List,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import type { CalendarBlock, CalendarView } from "./types";
import {
  monthDays, weekDays, monthYearLabel, isOtherMonth,
  nextMonth, prevMonth, nextWeek, prevWeek,
} from "./utils";
import { useCalendarData } from "./useCalendarData";
import { MiniCalendar } from "./MiniCalendar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { RulesList } from "./RulesList";
import { BlockModal } from "./BlockModal";
import { DayDetail } from "./DayDetail";

/* ── Calendar (orchestrator) ──────────────── */

export function Calendar() {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [blockModal, setBlockModal] = useState<{
    open: boolean; block?: CalendarBlock; startDate?: string; endDate?: string;
  }>({ open: false });
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });

  const {
    rules, blocks, rangeData, loading,
    loadMonth, refreshRange,
    addRule, toggleRule, deleteRule,
    saveBlock, deleteBlock,
  } = useCalendarData();

  useEffect(() => {
    loadMonth(anchor);
  }, [anchor.getMonth(), anchor.getFullYear(), loadMonth]);

  // ── Navigation ──
  const navigate = useCallback((dir: -1 | 1) => {
    if (view === "month") setAnchor(dir === 1 ? nextMonth(anchor) : prevMonth(anchor));
    else setAnchor(dir === 1 ? nextWeek(anchor) : prevWeek(anchor));
  }, [view, anchor]);

  const goToday = useCallback(() => {
    const t = new Date();
    setAnchor(t);
    setSelected(t);
  }, []);

  // ── Block actions ──
  const handleSaveBlock = async (data: { startAt: string; endAt: string; reason: string }, blockId?: string) => {
    try {
      await saveBlock(data, blockId);
      setBlockModal({ open: false });
      await refreshRange(anchor);
    } catch {
      // Modal stays open on error, toast already shown by useCalendarData
    }
  };

  const handleDeleteBlock = async (id: string) => {
    await deleteBlock(id);
    setConfirmDeleteBlock(null);
    await refreshRange(anchor);
  };

  const handleSlotSelect = (start: string, end: string) => {
    setBlockModal({ open: true, startDate: start, endDate: end });
  };

  // ── Rule actions ──
  const handleAddRule = async () => {
    await addRule(newRule);
  };

  // ── Derived ──
  const days = useMemo(() => view === "month" ? monthDays(anchor) : weekDays(anchor), [view, anchor]);

  // ── Render ──
  if (loading) {
    return (
      <div className="calendar-shell">
        <div className="calendar-sidebar">
          <div className="mini-calendar" style={{ textAlign: "center", padding: "40px 0" }}>Loading...</div>
        </div>
        <div className="calendar-main">
          <div className="panel" style={{ textAlign: "center", padding: "40px 0" }}>Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="calendar-shell">
        {/* ── Sidebar ── */}
        <div className="calendar-sidebar">
          <MiniCalendar
            anchor={anchor} selected={selected}
            onSelect={(d) => { setSelected(d); if (isOtherMonth(d, anchor)) setAnchor(d); }}
            onPrev={() => setAnchor(prevMonth(anchor))}
            onNext={() => setAnchor(nextMonth(anchor))}
          />

          <div className="quick-actions-panel">
            <h3>Actions</h3>
            <button type="button" className="quick-action-btn" onClick={() => setBlockModal({ open: true })}>
              <Plus size={14} /> Add Block
            </button>
            <button type="button" className="quick-action-btn" onClick={goToday}>
              <CalendarDays size={14} /> Today
            </button>
          </div>

          <RulesList
            rules={rules} newRule={newRule} onNewRuleChange={setNewRule}
            onAdd={handleAddRule} onToggle={toggleRule} onDelete={deleteRule}
          />

          <DayDetail
            date={selected} rangeData={rangeData} blocks={blocks}
            onRemoveBlock={(id) => setConfirmDeleteBlock(id)}
          />
        </div>

        {/* ── Main ── */}
        <div className="calendar-main">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button type="button" className="ghost-button compact" onClick={() => navigate(-1)}>
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ margin: 0, fontSize: "1.1rem", minWidth: "160px", textAlign: "center" }}>
                {view === "day" ? monthYearLabel(selected) : monthYearLabel(anchor)}
              </h2>
              <button type="button" className="ghost-button compact" onClick={() => navigate(1)}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="calendar-view-toggle">
              <button type="button" className={view === "month" ? "active" : ""} onClick={() => setView("month")}>
                <Columns size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Month
              </button>
              <button type="button" className={view === "week" ? "active" : ""} onClick={() => setView("week")}>
                <List size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Week
              </button>
              <button type="button" className={view === "day" ? "active" : ""} onClick={() => setView("day")}>
                <CalendarDays size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Day
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="calendar-legend-item">
              <span className="calendar-legend-swatch available" /> Available
            </div>
            <div className="calendar-legend-item">
              <span className="calendar-legend-swatch partial" /> Partial
            </div>
            <div className="calendar-legend-item">
              <span className="calendar-legend-swatch booked" /> Booked
            </div>
            <div className="calendar-legend-item">
              <span className="calendar-legend-swatch blocked" /> Blocked
            </div>
          </div>

          {/* Views */}
          {view === "month" && (
            <MonthView days={days} anchor={anchor} selected={selected}
              rangeData={rangeData} blocks={blocks} onSelect={(d) => setSelected(d)} />
          )}
          {view === "week" && (
            <WeekView days={days} rangeData={rangeData} blocks={blocks}
              selected={selected} onSelectSlot={handleSlotSelect} />
          )}
          {view === "day" && (
            <DayView date={selected} rangeData={rangeData} blocks={blocks}
              onSelectSlot={handleSlotSelect} />
          )}
        </div>
      </div>

      {/* Modals */}
      <BlockModal
        open={blockModal.open}
        block={blockModal.block}
        startDate={blockModal.startDate}
        endDate={blockModal.endDate}
        onClose={() => setBlockModal({ open: false })}
        onSave={handleSaveBlock}
      />

      <ConfirmDialog
        open={!!confirmDeleteBlock}
        title="Delete Block"
        message="Remove this calendar block? The time slot will become available again."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDeleteBlock && handleDeleteBlock(confirmDeleteBlock)}
        onCancel={() => setConfirmDeleteBlock(null)}
      />
    </>
  );
}
