import { CalendarDays, Heart, MessageCircle, ShieldAlert, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiError, api, money, shortDate, type Availability, type Booking, type Photographer, type Service } from "../lib/api";

export function PhotographerProfilePage() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!identifier) return;
    api<Photographer>(`/photographers/${identifier}`, { auth: false }).then((response) => {
      setPhotographer(response.data);
      setSelectedServiceId(response.data.services[0]?.id ?? "");
      setLocation(response.data.city);
    });
  }, [identifier]);

  const selectedService = useMemo<Service | undefined>(() => photographer?.services.find((service) => service.id === selectedServiceId), [photographer, selectedServiceId]);

  useEffect(() => {
    if (!photographer || !date) return;
    const serviceParam = selectedServiceId ? `&serviceId=${selectedServiceId}` : "";
    api<Availability>(`/photographers/${photographer.slug}/availability?date=${date}${serviceParam}`, { auth: false })
      .then((response) => setAvailability(response.data))
      .catch(() => setAvailability(null));
  }, [photographer, date, selectedServiceId]);

  async function createBooking() {
    if (!photographer || !selectedSlot || !selectedService) return;
    setError("");
    setMessage("");
    try {
      const response = await api<Booking>("/bookings", {
        method: "POST",
        body: {
          photographerId: photographer.id,
          serviceId: selectedService.id,
          startAt: selectedSlot,
          location,
          notes
        }
      });
      setMessage(`Booking request created for ${shortDate(response.data.startAt)}.`);
      setSelectedSlot("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Booking failed");
    }
  }

  async function saveFavorite() {
    if (!photographer) return;
    await api(`/favorites/${photographer.id}`, { method: "POST" });
    setMessage("Saved to favorites.");
  }

  if (!photographer) return <section className="page"><div className="panel">Loading profile...</div></section>;

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <img src={photographer.profileImageUrl ?? ""} alt={photographer.name} />
        <div className="profile-hero-content">
          <span className="eyebrow">{photographer.city}, {photographer.country}</span>
          <h1>{photographer.name}</h1>
          <p>{photographer.bio}</p>
          <div className="hero-meta">
            <span><Star size={16} fill="currentColor" /> {photographer.rating} from {photographer.reviewCount} reviews</span>
            <span>From {money(photographer.startingPrice)}</span>
            {photographer.verified && <span>Verified professional</span>}
          </div>
          <div className="tag-row">
            {photographer.categories.map((category) => (
              <span className="tag" key={category.id}>{category.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="page two-column">
        <div className="content-stack">
          <section>
            <div className="split-heading">
              <h2>Services and packages</h2>
            </div>
            <div className="list-stack">
              {photographer.services.map((service) => (
                <article className="panel service-row" key={service.id}>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <span className="muted">{service.durationMinutes} minutes</span>
                  </div>
                  <strong>{money(service.price)}</strong>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Portfolio</h2>
            <div className="portfolio-grid">
              {photographer.portfolioItems.map((item) => (
                <figure key={item.id}>
                  <img src={item.imageUrl} alt={item.title} />
                  <figcaption>{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <h2>Reviews</h2>
            <div className="list-stack">
              {photographer.reviews.length ? photographer.reviews.map((review) => (
                <article className="panel" key={review.id}>
                  <div className="card-title-row">
                    <strong>{review.client.name}</strong>
                    <span className="rating"><Star size={15} fill="currentColor" /> {review.rating}</span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              )) : <div className="panel muted">No reviews yet.</div>}
            </div>
          </section>
        </div>

        <aside className="booking-panel">
          <h2>Book availability</h2>
          <label>
            Service
            <select value={selectedServiceId} onChange={(event) => setSelectedServiceId(event.target.value)}>
              {photographer.services.map((service) => (
                <option value={service.id} key={service.id}>{service.title} - {money(service.price)}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <div className="slot-grid">
            {availability?.slots.map((slot) => (
              <button
                type="button"
                key={slot.startAt}
                className={selectedSlot === slot.startAt ? "slot selected" : "slot"}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.startAt)}
              >
                {new Date(slot.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </button>
            ))}
          </div>
          <label>
            Location
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label>
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Shoot goals, location details, access notes" />
          </label>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          {user?.role === "CLIENT" ? (
            <button className="solid-button full" disabled={!selectedSlot} onClick={createBooking} type="button">
              <CalendarDays size={17} />
              Request booking
            </button>
          ) : user ? (
            <div className="panel muted">Only client accounts can create booking requests.</div>
          ) : (
            <Link className="solid-button full" to="/login">
              Log in to book
            </Link>
          )}
          <div className="inline-actions stretch">
            {user?.role === "CLIENT" && (
              <button className="ghost-button" type="button" onClick={saveFavorite}>
                <Heart size={16} />
                Save
              </button>
            )}
            {user && (
              <Link className="ghost-button" to="/messages">
                <MessageCircle size={16} />
                Message
              </Link>
            )}
            <Link className="ghost-button" to="/cases">
              <ShieldAlert size={16} />
              Report
            </Link>
          </div>
          <div className="mini-note">
            Calendar timezone: {availability?.timezone ?? photographer.timezone}. Unavailable and reserved slots are disabled by the API.
          </div>
        </aside>
      </div>
    </section>
  );
}
