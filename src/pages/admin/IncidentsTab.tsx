import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { shortDate, type CaseItem } from "../../lib/api";

export function IncidentsTab({
  incidents,
  onUpdateStatus
}: {
  incidents: CaseItem[];
  onUpdateStatus: (incident: CaseItem, status: string) => void;
}) {
  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Incidents ({incidents.length})</h2>
        <div className="table-list">
          {incidents.map((incident) => (
            <div className="table-row" key={incident.id}>
              <div>
                <strong>{incident.category}</strong>
                <p>{incident.description.slice(0, 80)}{incident.description.length > 80 ? "…" : ""}</p>
                <p className="muted">Reported by {incident.reporter.name} · {shortDate(incident.createdAt)}</p>
              </div>
              <StatusBadge value={incident.status} />
              <div className="inline-actions">
                {incident.status === "OPEN" && (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(incident, "UNDER_REVIEW")}>
                    <CheckCircle2 size={15} /> Review
                  </button>
                )}
                {incident.status === "UNDER_REVIEW" && (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(incident, "RESOLVED")}>
                    <CheckCircle2 size={15} /> Resolve
                  </button>
                )}
                {incident.status !== "CLOSED" && incident.status !== "RESOLVED" && (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(incident, "CLOSED")}>
                    <AlertTriangle size={15} /> Close
                  </button>
                )}
              </div>
            </div>
          ))}
          {!incidents.length && <p className="muted">No incidents reported.</p>}
        </div>
      </section>
    </div>
  );
}
