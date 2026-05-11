import { StatusBadge } from "../../components/StatusBadge";
import { money, type Booking, type Photographer } from "../../lib/api";

export function AnalyticsPanel({ bookings, photographer }: { bookings: Booking[]; photographer: Photographer }) {
  const my = bookings.filter((b) => b.photographer.id === photographer.id);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalEarnings = my.reduce((sum, b) => sum + b.priceEstimate, 0);
  const monthEarnings = my
    .filter((b) => b.status !== "CANCELLED" && new Date(b.createdAt) >= thisMonthStart)
    .reduce((sum, b) => sum + b.priceEstimate, 0);
  const pendingEarnings = my
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.priceEstimate, 0);

  const statusCounts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
  my.forEach((b) => { statusCounts[b.status]++; });

  const serviceStats = new Map<string, { title: string; count: number; revenue: number }>();
  my.forEach((b) => {
    const s = serviceStats.get(b.service.id) || { title: b.service.title ?? "Unknown", count: 0, revenue: 0 };
    s.count++;
    s.revenue += b.priceEstimate;
    serviceStats.set(b.service.id, s);
  });
  const topServices = [...serviceStats.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  const monthLabels: string[] = [];
  const monthData: { bookings: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(new Intl.DateTimeFormat("en-CA", { month: "short", year: "2-digit" }).format(d));
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const monthBookings = my.filter((b) => {
      const date = new Date(b.createdAt);
      return date >= start && date <= end;
    });
    monthData.push({
      bookings: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + b.priceEstimate, 0)
    });
  }

  return (
    <div className="content-stack">
      <div className="dashboard-grid">
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>Total Earnings</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(totalEarnings)}</strong>
        </div>
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>This Month</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(monthEarnings)}</strong>
        </div>
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>Pending (Confirmed)</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(pendingEarnings)}</strong>
        </div>
      </div>

      <div className="panel" style={{ display: "grid", gap: "10px" }}>
        <h3>Booking Status</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{count}</div>
              <StatusBadge value={status} />
            </div>
          ))}
        </div>
      </div>

      {topServices.length > 0 && (
        <div className="panel" style={{ display: "grid", gap: "10px" }}>
          <h3>Top Services</h3>
          <div className="table-list">
            {topServices.map((s, i) => (
              <div className="table-row" key={i} style={{ gridTemplateColumns: "1fr auto auto" }}>
                <span>{s.title}</span>
                <span className="muted">{s.count} bookings</span>
                <strong>{money(s.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel" style={{ display: "grid", gap: "10px" }}>
        <h3>Monthly Trend</h3>
        <div className="table-list">
          {monthLabels.map((label, i) => (
            <div className="table-row" key={i} style={{ gridTemplateColumns: "1fr auto auto" }}>
              <span>{label}</span>
              <span className="muted">{monthData[i].bookings} bookings</span>
              <strong>{money(monthData[i].revenue)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
