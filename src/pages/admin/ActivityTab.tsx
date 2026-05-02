import { shortDate } from "../../lib/api";

type ActivityLog = {
  id: string; actor: { id: string; name: string; role: string } | null;
  action: string; entity: string; entityId: string; metadata: Record<string, unknown>; createdAt: string;
};

export function ActivityTab({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Recent activity</h2>
        <div className="list-stack">
          {logs.map((log) => (
            <article className="soft-row" key={log.id}>
              <div className="card-title-row">
                <strong>{log.action}</strong>
                <span className="tone-neutral" style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px" }}>{log.entity}</span>
              </div>
              <p>
                {log.actor ? <>by <strong>{log.actor.name}</strong> ({log.actor.role.toLowerCase()})</> : <>by <strong>System</strong></>}
                {" · "}{shortDate(log.createdAt)}
              </p>
              {Object.keys(log.metadata).length > 0 && (
                <pre className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0", whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(log.metadata, null, 1)}
                </pre>
              )}
            </article>
          ))}
          {!logs.length && <p className="muted">No activity logged yet.</p>}
        </div>
      </section>
    </div>
  );
}
