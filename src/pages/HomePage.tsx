import { ArrowRight, CalendarCheck, MessageCircle, Search, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhotographerCard } from "../components/PhotographerCard";
import { api, type Photographer } from "../lib/api";

export function HomePage() {
  const [featured, setFeatured] = useState<Photographer[]>([]);
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api<Photographer[]>("/photographers?limit=3&sort=rating", { auth: false })
      .then((response) => setFeatured(response.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=85"
          alt="Professional camera on a photography set"
        />
        <div className="hero-content">
          <span className="eyebrow">Photography booking, made accountable</span>
          <h1>Find a photographer. Compare portfolios. Book real availability.</h1>
          <p>
            Moussawer connects clients with trusted photographers through verified profiles, calendar-aware booking, safe messaging, and platform support when something needs care.
          </p>
          <form
            className="search-band"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(`/photographers${location ? `?location=${encodeURIComponent(location)}` : ""}`);
            }}
          >
            <label>
              Location
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Toronto, Montreal, Ottawa" />
            </label>
            <button className="solid-button" type="submit">
              <Search size={17} />
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
          <Feature icon={<Search />} title="Find specialists" text="Filter by city, category, price, rating, and available dates." />
          <Feature icon={<Star />} title="Compare portfolios" text="Review public work, services, packages, ratings, and pricing before booking." />
          <Feature icon={<CalendarCheck />} title="Book availability" text="Calendar rules, blocked dates, and conflicts are enforced by the API." />
          <Feature icon={<MessageCircle />} title="Chat safely" text="Conversations can link to bookings, incidents, and disputes." />
          <Feature icon={<ShieldCheck />} title="Resolve issues" text="Incidents and disputes create a clear status trail for users and admins." />
        </div>
      </section>

      <section className="page">
        <div className="split-heading">
          <div>
            <span className="eyebrow">Featured photographers</span>
            <h2>Premium profiles ready for real bookings.</h2>
          </div>
          <Link className="ghost-button" to="/photographers">
            Browse all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="card-grid">
          {featured.map((photographer) => (
            <PhotographerCard photographer={photographer} key={photographer.id} />
          ))}
        </div>
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
