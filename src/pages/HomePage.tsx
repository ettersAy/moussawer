import { ArrowRight, CalendarCheck, MessageCircle, Search, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhotographerCard } from "../components/PhotographerCard";
import { api, type Photographer } from "../lib/api";

export function HomePage() {
  const [featured, setFeatured] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api<Photographer[]>("/photographers?limit=3&sort=rating", { auth: false })
      .then((response) => { if (!cancelled) setFeatured(response.data); })
      .catch(() => { if (!cancelled) setFeatured([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=85"
          alt=""
          role="presentation"
          fetchPriority="high"
        />
        <div className="hero-content">
          <span className="eyebrow">Photography booking, made accountable</span>
          <h1>Find a photographer. Compare portfolios. Book real availability.</h1>
          <p>
            Moussawer connects clients with trusted photographers through verified profiles, calendar-aware booking, safe messaging, and platform support when something needs care.
          </p>
          <form
            className="search-band"
            aria-label="Search photographers by location"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/photographers${location ? `?location=${encodeURIComponent(location)}` : ""}`);
            }}
          >
            <label htmlFor="home-location-search">
              Location
              <input
                id="home-location-search"
                type="search"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Toronto, Montreal, Ottawa"
              />
            </label>
            <button className="solid-button" type="submit">
              <Search size={17} aria-hidden="true" />
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="page section-grid">
        <div className="section-heading">
          <span className="eyebrow">Core flow</span>
          <h2>Discovery, booking, chat, and support in one place.</h2>
        </div>
        <div className="feature-grid">
          <Feature icon={<Search aria-hidden="true" />} title="Find specialists" text="Filter by city, category, price, rating, and available dates." />
          <Feature icon={<Star aria-hidden="true" />} title="Compare portfolios" text="Review public work, services, packages, ratings, and pricing before booking." />
          <Feature icon={<CalendarCheck aria-hidden="true" />} title="Book availability" text="Calendar rules, blocked dates, and conflicts are enforced by the API." />
          <Feature icon={<MessageCircle aria-hidden="true" />} title="Chat safely" text="Conversations can link to bookings, incidents, and disputes." />
          <Feature icon={<ShieldCheck aria-hidden="true" />} title="Resolve issues" text="Incidents and disputes create a clear status trail for users and admins." />
        </div>
      </section>

      <section className="page">
        <div className="split-heading">
          <div>
            <span className="eyebrow">Featured photographers</span>
            <h2>Premium profiles ready for real bookings.</h2>
          </div>
          <Link className="ghost-button" to="/photographers">
            Browse all <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="panel">Loading featured photographers...</div>
        ) : featured.length > 0 ? (
          <div className="card-grid">
            {featured.map((photographer) => (
              <PhotographerCard photographer={photographer} key={photographer.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={32} aria-hidden="true" />
            <h2>No featured photographers available yet.</h2>
            <p>Check back soon for premium profiles ready for real bookings.</p>
          </div>
        )}
      </section>
    </>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="feature">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
