import { BarChart3, BookOpen, Calendar, Grid3X3, Package, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api, type Booking, type Photographer } from "../../lib/api";
import { AnalyticsPanel } from "./AnalyticsPanel";
import { AvailabilityManager } from "./AvailabilityManager";
import { BookingManager } from "./BookingManager";
import { PortfolioManager } from "./PortfolioManager";
import { ProfileManager } from "./ProfileManager";
import { ServiceManager } from "./ServiceManager";

type Tab = "bookings" | "services" | "portfolio" | "availability" | "analytics" | "profile";

export function PhotographerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    try {
      const [pRes, bRes] = await Promise.all([
        api<Photographer>("/me/photographer"),
        api<Booking[]>("/bookings")
      ]);
      setPhotographer(pRes.data);
      setBookings(bRes.data);
    } catch { /* auth-guarded */ } finally { setLoading(false); }
  }

  async function refreshPhotographer() {
    const res = await api<Photographer>("/me/photographer");
    setPhotographer(res.data);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "bookings", label: "Bookings", icon: <BookOpen size={15} /> },
    { key: "services", label: "Services", icon: <Package size={15} /> },
    { key: "portfolio", label: "Portfolio", icon: <Grid3X3 size={15} /> },
    { key: "availability", label: "Calendar", icon: <Calendar size={15} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
    { key: "profile", label: "Profile", icon: <Settings size={15} /> },
  ];

  if (loading) return <section className="page"><div className="panel">Loading workspace...</div></section>;
  if (!photographer) return <section className="page"><div className="panel">Photographer profile not found.</div></section>;

  return (
    <section className="page">
      <div className="split-heading compact-heading">
        <div>
          <span className="eyebrow">Photographer workspace</span>
          <h1>Welcome back, {user?.name}</h1>
        </div>
      </div>

      <nav className="section-tabs" aria-label="Photographer sections">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" className={`section-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "bookings" && <BookingManager bookings={bookings} photographer={photographer} onRefresh={loadAll} />}
      {activeTab === "services" && <ServiceManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "portfolio" && <PortfolioManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "availability" && <AvailabilityManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "analytics" && <AnalyticsPanel bookings={bookings} photographer={photographer} />}
      {activeTab === "profile" && <ProfileManager photographer={photographer} onRefresh={refreshPhotographer} />}
    </section>
  );
}
