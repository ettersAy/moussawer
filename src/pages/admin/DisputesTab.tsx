import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { shortDate, type CaseItem } from "../../lib/api";

export function DisputesTab({
  disputes,
  onUpdateStatus
}: {
  disputes: CaseItem[];
  onUpdateStatus: (dispute: CaseItem, status: string) => void;
}) {
  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Disputes ({disputes.length})</h2>
        <div className="table-list">
          {disputes.map((dispute) => (
            <div className="table-row" key={dispute.id}>
              <div>
                <strong>{dispute.type}</strong>
                <p>{dispute.description.slice(0, 80)}{dispute.description.length > 80 ? "…" : ""}</p>
                <p className="muted">Reported by {dispute.reporter.name} · {shortDate(dispute.createdAt)}</p>
              </div>
              <StatusBadge value={dispute.status} />
              <div className="inline-actions">
                {(dispute.status === "OPEN" || dispute.status === "AWAITING_RESPONSE") && (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(dispute, "UNDER_REVIEW")}>
                    <CheckCircle2 size={15} /> Review
                  </button>
                )}
                {dispute.status === "UNDER_REVIEW" && (
                  <>
                    <button className="ghost-button compact" onClick={() => onUpdateStatus(dispute, "RESOLVED")}>
                      <CheckCircle2 size={15} /> Resolve
                    </button>
                    <button className="ghost-button compact" onClick={() => onUpdateStatus(dispute, "REJECTED")}>
                      <AlertTriangle size={15} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!disputes.length && <p className="muted">No disputes filed.</p>}
        </div>
      </section>
    </div>
  );
}
