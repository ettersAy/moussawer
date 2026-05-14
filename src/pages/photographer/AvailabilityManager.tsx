import { useEffect, useState } from "react";
import { Calendar, EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Calendar as CalendarComponent } from "../../components/calendar/Calendar";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { useToast } from "../../components/shared/Toast";
import { api, type AvailabilityRule, type CalendarBlock, type Photographer } from "../../lib/api";
import { GCalSyncPanel } from "./GCalSyncPanel";

export function AvailabilityManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [loaded, setLoaded] = useState(false);

  type RuleForm = { dayOfWeek: number; startTime: string; endTime: string };
  const [ruleForm, setRuleForm] = useState<RuleForm>({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [confirmDeleteRule, setConfirmDeleteRule] = useState<string | null>(null);

  type BlockForm = { startAt: string; endAt: string; reason: string };
  const [blockForm, setBlockForm] = useState<BlockForm>({ startAt: "", endAt: "", reason: "" });
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);

  useEffect(() => { fetchAvailability(); }, []);

  async function fetchAvailability() {
    try {
      const res = await api<{ rules: AvailabilityRule[]; blocks: CalendarBlock[] }>("/me/availability");
      setRules(res.data.rules);
      setBlocks(res.data.blocks);
    } catch { /* auth-guarded */ } finally { setLoaded(true); }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function formatBlockDate(iso: string) {
    return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  }

  function startAddRule() { setShowAddRule(true); setEditingRuleId(null); setRuleForm({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }); }
  function startEditRule(r: AvailabilityRule) { setEditingRuleId(r.id); setShowAddRule(false); setRuleForm({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime }); }
  function cancelRuleForm() { setEditingRuleId(null); setShowAddRule(false); }

  async function saveRule() {
    try {
      if (editingRuleId) {
        await api(`/me/availability/${editingRuleId}`, { method: "PATCH", body: ruleForm });
        toast.success("Rule updated.");
      } else {
        await api("/me/availability", { method: "POST", body: ruleForm });
        toast.success("Rule added.");
      }
      cancelRuleForm(); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleRule(r: AvailabilityRule) {
    try {
      await api(`/me/availability/${r.id}`, { method: "PATCH", body: { isActive: !r.isActive } });
      toast.success(r.isActive ? "Rule deactivated." : "Rule activated.");
      fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteRule(id: string) {
    try {
      await api(`/me/availability/${id}`, { method: "DELETE" });
      toast.success("Rule deleted.");
      setConfirmDeleteRule(null); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  function startAddBlock() { setShowAddBlock(true); setBlockForm({ startAt: "", endAt: "", reason: "" }); }

  async function saveBlock() {
    try {
      await api("/me/calendar-blocks", { method: "POST", body: { startAt: new Date(blockForm.startAt).toISOString(), endAt: new Date(blockForm.endAt).toISOString(), reason: blockForm.reason || undefined } });
      toast.success("Block created.");
      setShowAddBlock(false); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteBlock(id: string) {
    try {
      await api(`/me/calendar-blocks/${id}`, { method: "DELETE" });
      toast.success("Block removed.");
      setConfirmDeleteBlock(null); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  if (!loaded) return <div className="panel">Loading availability...</div>;

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>Availability Calendar</h2>
        <span className="muted" style={{ fontSize: "0.82rem" }}>Timezone: {photographer.timezone}</span>
      </div>
      <CalendarComponent />

      <GCalSyncPanel onRefresh={onRefresh} />

      <div className="content-stack" style={{ marginTop: "8px" }}>
        <div className="split-heading compact-heading">
          <h3>Weekly Rules ({rules.length})</h3>
          {!showAddRule && !editingRuleId && (
            <button className="solid-button compact" onClick={startAddRule}><Plus size={14} /> Add Rule</button>
          )}
        </div>

        {(showAddRule || editingRuleId) && (
          <div className="panel" style={{ display: "grid", gap: "10px" }}>
            <h4>{editingRuleId ? "Edit Rule" : "New Rule"}</h4>
            <div className="form-row">
              <label>Day
                <select value={ruleForm.dayOfWeek} onChange={(e) => setRuleForm({ ...ruleForm, dayOfWeek: Number(e.target.value) })}>
                  {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </label>
              <label>Start <input type="time" value={ruleForm.startTime} onChange={(e) => setRuleForm({ ...ruleForm, startTime: e.target.value })} /></label>
              <label>End <input type="time" value={ruleForm.endTime} onChange={(e) => setRuleForm({ ...ruleForm, endTime: e.target.value })} /></label>
            </div>
            <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ghost-button compact" onClick={cancelRuleForm}><X size={14} /> Cancel</button>
              <button className="solid-button compact" onClick={saveRule}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        {rules.length ? (
          <div className="list-stack">
            {rules.map((r) => (
              <article className="panel service-row" key={r.id} style={{ opacity: r.isActive ? 1 : 0.55 }}>
                <div>
                  <div className="card-title-row">
                    <strong>{dayNames[r.dayOfWeek]}s</strong>
                    <span className={`tag ${r.isActive ? "tone-good" : "tone-neutral"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="muted">{r.startTime} — {r.endTime}</p>
                </div>
                <div className="inline-actions">
                  <button className="ghost-button compact" onClick={() => toggleRule(r)} title={r.isActive ? "Deactivate" : "Activate"}>
                    <EyeOff size={14} />
                  </button>
                  <button className="ghost-button compact" onClick={() => startEditRule(r)}><Pencil size={14} /></button>
                  <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDeleteRule(r.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel muted">No weekly rules yet. Add a rule to define your recurring availability.</div>
        )}
      </div>

      <div className="content-stack" style={{ marginTop: "8px" }}>
        <div className="split-heading compact-heading">
          <h3>Blocked Dates ({blocks.length})</h3>
          {!showAddBlock && (
            <button className="solid-button compact" onClick={startAddBlock}><Plus size={14} /> Block Dates</button>
          )}
        </div>

        {showAddBlock && (
          <div className="panel" style={{ display: "grid", gap: "10px" }}>
            <h4>New Block</h4>
            <div className="form-row">
              <label>Start <input type="datetime-local" value={blockForm.startAt} onChange={(e) => setBlockForm({ ...blockForm, startAt: e.target.value })} /></label>
              <label>End <input type="datetime-local" value={blockForm.endAt} onChange={(e) => setBlockForm({ ...blockForm, endAt: e.target.value })} /></label>
            </div>
            <label>Reason (optional) <input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="Vacation, personal day..." /></label>
            <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ghost-button compact" onClick={() => setShowAddBlock(false)}><X size={14} /> Cancel</button>
              <button className="solid-button compact" onClick={saveBlock}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        {blocks.length ? (
          <div className="list-stack">
            {blocks.map((b) => {
              const isGoogle = b.source === "google_calendar";
              return (
                <article className="panel service-row" key={b.id} style={{ opacity: isGoogle ? 0.85 : 1 }}>
                  <div>
                    <div className="card-title-row">
                      <strong>{formatBlockDate(b.startAt)} — {formatBlockDate(b.endAt)}</strong>
                      {isGoogle && <span className="tag" style={{ background: "var(--blue)", color: "#fff", fontSize: "0.7rem" }}><Calendar size={10} /> Google</span>}
                    </div>
                    {b.reason && <p className="muted" style={{ marginTop: "4px" }}>{b.reason}</p>}
                  </div>
                  {!isGoogle && (
                    <div className="inline-actions">
                      <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDeleteBlock(b.id)}><Trash2 size={14} /></button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="panel muted">No blocked dates. Block dates when you're on vacation or unavailable.</div>
        )}
      </div>

      <ConfirmDialog open={!!confirmDeleteRule} title="Delete Rule" message="This will permanently remove this availability rule."
        confirmLabel="Delete" variant="danger" onConfirm={() => deleteRule(confirmDeleteRule!)} onCancel={() => setConfirmDeleteRule(null)} />
      <ConfirmDialog open={!!confirmDeleteBlock} title="Delete Block" message="This will permanently remove this calendar block."
        confirmLabel="Delete" variant="danger" onConfirm={() => deleteBlock(confirmDeleteBlock!)} onCancel={() => setConfirmDeleteBlock(null)} />
    </div>
  );
}
