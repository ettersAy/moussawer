import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PortfolioItem } from "../../lib/api";

export function ModerationTab({
  portfolio,
  onModerate
}: {
  portfolio: PortfolioItem[];
  onModerate: (id: string, isModerated: boolean) => void;
}) {
  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Portfolio Moderation ({portfolio.filter((p) => p.isModerated).length} flagged)</h2>
        <div className="portfolio-manager-grid">
          {portfolio.filter((p) => !p.isModerated).length === 0 && portfolio.length === 0 && (
            <p className="muted" style={{ gridColumn: "1/-1" }}>No portfolio items to moderate.</p>
          )}
          {portfolio.map((item) => (
            <article className="portfolio-manager-card" key={item.id}>
              <img src={item.imageUrl} alt={item.title} />
              <div className="card-body">
                <h3>{item.title}</h3>
                <div className="inline-actions" style={{ marginTop: "8px" }}>
                  {item.isModerated ? (
                    <button className="ghost-button compact tone-good" onClick={() => onModerate(item.id, false)}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  ) : (
                    <button className="ghost-button compact tone-warning" onClick={() => onModerate(item.id, true)}>
                      <AlertTriangle size={14} /> Flag
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
