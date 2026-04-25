import { FileWarning, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { api, type Booking, type CaseItem } from "../lib/api";

export function CasesPage() {
  const [incidents, setIncidents] = useState<CaseItem[]>([]);
  const [disputes, setDisputes] = useState<CaseItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incidentForm, setIncidentForm] = useState({ category: "Late arrival", description: "", bookingId: "" });
  const [disputeForm, setDisputeForm] = useState({ type: "Quality disagreement", description: "", bookingId: "" });

  async function load() {
    const [incidentResponse, disputeResponse, bookingResponse] = await Promise.all([
      api<CaseItem[]>("/incidents"),
      api<CaseItem[]>("/disputes"),
      api<Booking[]>("/bookings")
    ]);
    setIncidents(incidentResponse.data);
    setDisputes(disputeResponse.data);
    setBookings(bookingResponse.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createIncident(event: React.FormEvent) {
    event.preventDefault();
    await api<CaseItem>("/incidents", {
      method: "POST",
      body: { ...incidentForm, bookingId: incidentForm.bookingId || undefined }
    });
    setIncidentForm({ category: "Late arrival", description: "", bookingId: "" });
    load();
  }

  async function createDispute(event: React.FormEvent) {
    event.preventDefault();
    await api<CaseItem>("/disputes", {
      method: "POST",
      body: { ...disputeForm, bookingId: disputeForm.bookingId || undefined }
    });
    setDisputeForm({ type: "Quality disagreement", description: "", bookingId: "" });
    load();
  }

  return (
    <section className="page">
      <div className="split-heading">
        <div>
          <span className="eyebrow">Trust and safety</span>
          <h1>Incidents and disputes with visible status.</h1>
        </div>
      </div>
      <div className="case-grid">
        <form className="panel case-form" onSubmit={createIncident}>
          <h2><FileWarning size={20} /> New incident</h2>
          <label>
            Category
            <select value={incidentForm.category} onChange={(event) => setIncidentForm({ ...incidentForm, category: event.target.value })}>
              <option>Photographer did not show up</option>
              <option>Client did not show up</option>
              <option>Late arrival</option>
              <option>Wrong location</option>
              <option>Bad behavior</option>
              <option>Safety concern</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Related booking
            <select value={incidentForm.bookingId} onChange={(event) => setIncidentForm({ ...incidentForm, bookingId: event.target.value })}>
              <option value="">None</option>
              {bookings.map((booking) => (
                <option value={booking.id} key={booking.id}>{booking.service.title} · {booking.status}</option>
              ))}
            </select>
          </label>
          <label>Description<textarea value={incidentForm.description} onChange={(event) => setIncidentForm({ ...incidentForm, description: event.target.value })} /></label>
          <button className="solid-button full" type="submit">Submit incident</button>
        </form>

        <form className="panel case-form" onSubmit={createDispute}>
          <h2><ShieldAlert size={20} /> New dispute</h2>
          <label>
            Type
            <select value={disputeForm.type} onChange={(event) => setDisputeForm({ ...disputeForm, type: event.target.value })}>
              <option>Refund request</option>
              <option>Cancellation contest</option>
              <option>Quality disagreement</option>
              <option>Package disagreement</option>
              <option>Service not delivered</option>
            </select>
          </label>
          <label>
            Related booking
            <select value={disputeForm.bookingId} onChange={(event) => setDisputeForm({ ...disputeForm, bookingId: event.target.value })}>
              <option value="">None</option>
              {bookings.map((booking) => (
                <option value={booking.id} key={booking.id}>{booking.service.title} · {booking.status}</option>
              ))}
            </select>
          </label>
          <label>Description<textarea value={disputeForm.description} onChange={(event) => setDisputeForm({ ...disputeForm, description: event.target.value })} /></label>
          <button className="solid-button full" type="submit">Open dispute</button>
        </form>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Incidents</h2>
          <div className="list-stack">
            {incidents.map((item) => (
              <article className="soft-row" key={item.id}>
                <div className="card-title-row">
                  <strong>{item.category}</strong>
                  <StatusBadge value={item.status} />
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Disputes</h2>
          <div className="list-stack">
            {disputes.map((item) => (
              <article className="soft-row" key={item.id}>
                <div className="card-title-row">
                  <strong>{item.type}</strong>
                  <StatusBadge value={item.status} />
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
