import { useState, useCallback } from "react";
import { useToast } from "../shared/Toast";
import { api } from "../../lib/api";
import type { AvailabilityRule, CalendarBlock, DayAvailability } from "./types";
import { isoDate } from "./utils";

type RulesResponse = { rules: AvailabilityRule[]; blocks: CalendarBlock[] };
type RangeResponse = { days: DayAvailability[] };

export function useCalendarData() {
  const toast = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [rangeData, setRangeData] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    const res = await api<RulesResponse>("/me/availability");
    setRules(res.data.rules);
    setBlocks(res.data.blocks);
  }, []);

  const fetchRange = useCallback(async (from: Date, to: Date) => {
    try {
      const res = await api<RangeResponse>(`/me/availability/range?from=${isoDate(from)}&to=${isoDate(to)}`);
      const map: Record<string, DayAvailability> = {};
      for (const d of res.data.days) map[d.date] = d;
      setRangeData(map);
    } catch { /* silently handle */ }
  }, []);

  const loadMonth = useCallback((anchor: Date) => {
    const from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    setLoading(true);
    Promise.all([fetchRules(), fetchRange(from, to)]).finally(() => setLoading(false));
  }, [fetchRules, fetchRange]);

  // ── Rule mutations ──
  const addRule = useCallback(async (rule: { dayOfWeek: number; startTime: string; endTime: string }) => {
    await api("/me/availability", { method: "POST", body: rule });
    toast.success("Rule added.");
    await fetchRules();
  }, [fetchRules, toast]);

  const toggleRule = useCallback(async (rule: AvailabilityRule) => {
    await api(`/me/availability/${rule.id}`, { method: "PATCH", body: { isActive: !rule.isActive } });
    toast.success(rule.isActive ? "Rule deactivated." : "Rule activated.");
    await fetchRules();
  }, [fetchRules, toast]);

  const deleteRule = useCallback(async (id: string) => {
    await api(`/me/availability/${id}`, { method: "DELETE" });
    toast.success("Rule deleted.");
    await fetchRules();
  }, [fetchRules, toast]);

  // ── Block mutations ──
  const saveBlock = useCallback(async (data: { startAt: string; endAt: string; reason: string }, blockId?: string) => {
    try {
      if (blockId) {
        await api(`/me/calendar-blocks/${blockId}`, { method: "PATCH", body: data });
        toast.success("Block updated.");
      } else {
        await api("/me/calendar-blocks", { method: "POST", body: data });
        toast.success("Block created.");
      }
      await fetchRules();
    } catch (err: any) {
      toast.error(err.message || "Failed to save block");
      throw err;
    }
  }, [fetchRules, toast]);

  const deleteBlock = useCallback(async (id: string) => {
    await api(`/me/calendar-blocks/${id}`, { method: "DELETE" });
    toast.success("Block removed.");
    await fetchRules();
  }, [fetchRules, toast]);

  const refreshRange = useCallback((anchor: Date) => {
    const from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return fetchRange(from, to);
  }, [fetchRange]);

  return {
    rules, blocks, rangeData, loading,
    loadMonth, refreshRange,
    addRule, toggleRule, deleteRule,
    saveBlock, deleteBlock,
  };
}
