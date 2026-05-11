import type { User } from "../../lib/api";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarThumb({ user, size }: { user: Pick<User, "name" | "avatarUrl">; size?: number }) {
  const s = size ?? 32;
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className="user-avatar-thumb" style={{ width: s, height: s }} />;
  }
  return <span className="user-avatar-fallback" style={{ width: s, height: s, fontSize: s * 0.4 }}>{getInitials(user.name)}</span>;
}
