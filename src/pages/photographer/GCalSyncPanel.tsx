import { useEffect, useState } from "react";
import { Calendar, RefreshCw, Unlink } from "lucide-react";
import { useToast } from "../../components/shared/Toast";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { api } from "../../lib/api";
type GCalStatus = { connected: boolean; calendarId?: string | null; importedBlockCount: number };

export function GCalSyncPanel({ onRefresh }: { onRefresh: () => void }) {
  const toast = useToast();
  const [status, setStatus] = useState<GCalStatus | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  useEffect(() => {
    api<GCalStatus>("/me/calendar-sync/status")
      .then((res) => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function connect() {
    try {
      const res = await api<{ url: string }>("/me/calendar-sync/auth-url");
      window.open(res.data.url, "_blank", "width=600,height=700");
      toast.toast("Complete the Google authorization in the new window, then click 'Sync Now' to import events.", "info");
    } catch (err: any) { toast.error(err.message); }
  }

  async function sync() {
    setSyncing(true);
    try {
      const res = await api<{ imported: number }>("/me/calendar-sync/sync", { method: "POST" });
      toast.success(`${res.data.imported} events synced from Google Calendar.`);
      const s = await api<GCalStatus>("/me/calendar-sync/status");
      setStatus(s.data);
      onRefresh();
    } catch (err: any) { toast.error(err.message); } finally { setSyncing(false); }
  }

  async function disconnect() {
    try {
      const res = await api<{ removedBlocks: number }>("/me/calendar-sync", { method: "DELETE" });
      toast.success(`Disconnected. ${res.data.removedBlocks} Google Calendar blocks removed.`);
      setConfirmDisconnect(false);
      setStatus(null);
      onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  if (!loaded) return null;

  return (
    <div className="panel" style={{ display: "grid", gap: "10px" }}>
      <div className="split-heading compact-heading">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={16} /> Google Calendar</h3>
      </div>
      {status?.connected ? (
        <div style={{ display: "grid", gap: "8px" }}>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Connected to <strong>{status.calendarId}</strong> · {status.importedBlockCount} imported block{status.importedBlockCount !== 1 ? "s" : ""}
          </p>
          <div className="inline-actions">
            <button className="solid-button compact" onClick={sync} disabled={syncing}>
              <RefreshCw size={14} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} /> Sync Now
            </button>
            <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDisconnect(true)}>
              <Unlink size={14} /> Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <p className="muted" style={{ flex: 1, fontSize: "0.85rem" }}>Connect your Google Calendar to automatically block time from calendar events and avoid double-bookings.</p>
          <button className="solid-button compact" onClick={connect}>
            <Calendar size={14} /> Connect Google Calendar
          </button>
        </div>
      )}
      <ConfirmDialog open={confirmDisconnect} title="Disconnect Google Calendar" message="This will remove all Google Calendar blocks from your availability. Manual blocks will be kept."
        confirmLabel="Disconnect" variant="danger" onConfirm={disconnect} onCancel={() => setConfirmDisconnect(false)} />
    </div>
  );
}
