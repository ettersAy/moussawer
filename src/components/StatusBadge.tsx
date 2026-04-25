const tones: Record<string, string> = {
  PENDING: "tone-warning",
  CONFIRMED: "tone-good",
  COMPLETED: "tone-neutral",
  CANCELLED: "tone-danger",
  OPEN: "tone-warning",
  UNDER_REVIEW: "tone-info",
  AWAITING_RESPONSE: "tone-info",
  RESOLVED: "tone-good",
  REJECTED: "tone-danger",
  CLOSED: "tone-neutral",
  ACTIVE: "tone-good",
  SUSPENDED: "tone-warning",
  DISABLED: "tone-danger"
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`status ${tones[value] ?? "tone-neutral"}`}>{value.replaceAll("_", " ").toLowerCase()}</span>;
}
