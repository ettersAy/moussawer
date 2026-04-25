import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PhotographerCard } from "../components/PhotographerCard";
import { api, type Category, type Photographer } from "../lib/api";

export function DiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    location: searchParams.get("location") ?? "",
    category: searchParams.get("category") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minRating: searchParams.get("minRating") ?? "",
    availabilityDate: searchParams.get("availabilityDate") ?? "",
    sort: searchParams.get("sort") ?? "rating"
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    api<Category[]>("/categories", { auth: false }).then((response) => setCategories(response.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api<Photographer[]>(`/photographers?${query}`, { auth: false })
      .then((response) => setPhotographers(response.data))
      .finally(() => setLoading(false));
    setSearchParams(query);
  }, [query, setSearchParams]);

  return (
    <section className="page">
      <div className="split-heading">
        <div>
          <span className="eyebrow">Discovery</span>
          <h1>Search photographers by real booking criteria.</h1>
        </div>
      </div>

      <form className="filter-bar" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Portrait, wedding, studio" />
        </label>
        <label>
          Location
          <input value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })} placeholder="Toronto" />
        </label>
        <label>
          Category
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Max price
          <input type="number" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} placeholder="800" />
        </label>
        <label>
          Min rating
          <select value={filters.minRating} onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}>
            <option value="">Any</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>
        <label>
          Available date
          <input type="date" value={filters.availabilityDate} onChange={(event) => setFilters({ ...filters, availabilityDate: event.target.value })} />
        </label>
        <label>
          Sort
          <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="newest">Newest</option>
            <option value="popularity">Popularity</option>
          </select>
        </label>
        <button className="solid-button compact" type="button">
          <Filter size={16} />
          Filters
        </button>
      </form>

      {loading ? (
        <div className="panel">Loading photographers...</div>
      ) : photographers.length ? (
        <div className="card-grid">
          {photographers.map((photographer) => (
            <PhotographerCard photographer={photographer} key={photographer.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={32} />
          <h2>No photographers matched those filters.</h2>
          <p>Try widening location, price, or availability.</p>
        </div>
      )}
    </section>
  );
}
