import { CalendarDays, Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { money, type Photographer } from "../lib/api";

export function PhotographerCard({ photographer }: { photographer: Photographer }) {
  return (
    <article className="photographer-card">
      <div className="card-image">
        <img src={photographer.profileImageUrl ?? photographer.avatarUrl ?? ""} alt={photographer.name} />
        {photographer.verified && <span className="verified">Verified</span>}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <div>
            <h3>{photographer.name}</h3>
            <p>
              <MapPin size={14} /> {photographer.city}, {photographer.country}
            </p>
          </div>
          <span className="rating">
            <Star size={15} fill="currentColor" /> {photographer.rating}
          </span>
        </div>
        <p className="muted clamp">{photographer.bio}</p>
        <div className="tag-row">
          {photographer.categories.slice(0, 3).map((category) => (
            <span key={category.id} className="tag">
              {category.name}
            </span>
          ))}
        </div>
        <div className="card-footer">
          <span className="price">From {money(photographer.startingPrice)}</span>
          <div className="inline-actions">
            <button className="icon-button" type="button" title="Save photographer">
              <Heart size={16} />
            </button>
            <Link className="solid-button compact" to={`/photographers/${photographer.slug}`}>
              <CalendarDays size={15} />
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
