export function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <div><strong>{value}</strong><p>{label}</p></div>
    </article>
  );
}
