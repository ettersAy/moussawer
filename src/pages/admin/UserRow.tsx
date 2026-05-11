import { BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { shortDate, type User } from "../../lib/api";
import { AvatarThumb } from "../../components/shared/AvatarThumb";

export function UserRow({
  user, isSelected, isExpanded, onToggleSelect, onToggleExpand,
  actionButtons, onRoleChange, onToggleVerified, onDelete, onEdit
}: {
  user: User;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  actionButtons: { label: string; icon: React.ReactNode; onClick: () => void; className?: string }[];
  onRoleChange: (role: string) => void;
  onToggleVerified: (user: User) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const isPhotographer = user.role === "PHOTOGRAPHER";
  const pp = user.photographerProfile;

  return (
    <>
      <tr className={`user-row ${isExpanded ? "expanded" : ""}`}>
        <td className="col-check">
          <input type="checkbox" checked={isSelected} onChange={onToggleSelect} aria-label={`Select ${user.name}`} />
        </td>
        <td className="col-avatar" onClick={onToggleExpand}>
          <AvatarThumb user={user} />
        </td>
        <td className="col-name" onClick={onToggleExpand}>
          <span className="user-name">{user.name}</span>
        </td>
        <td className="col-email">{user.email}</td>
        <td className="col-role">
          <select
            value={user.role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="role-select"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="CLIENT">Client</option>
            <option value="PHOTOGRAPHER">Photographer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </td>
        <td className="col-status">
          <StatusBadge value={user.status} />
        </td>
        <td className="col-joined">{shortDate(user.createdAt)}</td>
        <td className="col-actions">
          <div className="user-actions">
            {isPhotographer && (
              <button
                className={`icon-button compact ${pp?.verified ? "verified-badge" : ""}`}
                onClick={() => onToggleVerified(user)}
                title={pp?.verified ? "Verified — click to unverify" : "Not verified — click to verify"}
              >
                <BadgeCheck size={14} className={pp?.verified ? "verified-icon" : "unverified-icon"} />
              </button>
            )}
            <button className="ghost-button compact" onClick={onEdit} title="Edit user">
              <Pencil size={14} />
            </button>
            {actionButtons.map((btn, i) => (
              <button
                key={i}
                className={`ghost-button compact ${btn.className ?? ""}`}
                onClick={btn.onClick}
                title={btn.label}
              >
                {btn.icon}{btn.label}
              </button>
            ))}
            <button className="ghost-button compact danger" onClick={onDelete} title="Delete user">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="user-detail-row">
          <td colSpan={8}>
            <UserDetail user={user} />
          </td>
        </tr>
      )}
    </>
  );
}

function UserDetail({ user }: { user: User }) {
  const pp = user.photographerProfile;
  const cp = user.clientProfile;

  return (
    <div className="user-detail">
      <div className="detail-header">
        <AvatarThumb user={user} />
        <div>
          <strong className="detail-name">{user.name}</strong>
          <span className="detail-email">{user.email}</span>
          <div className="detail-meta-row">
            <StatusBadge value={user.status} />
            <span className="detail-role-tag">{user.role.toLowerCase()}</span>
            {pp?.verified && <span className="detail-verified">✓ Verified photographer</span>}
          </div>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-section">
          <h4>Account Info</h4>
          <dl>
            <dt>User ID</dt><dd><code>{user.id}</code></dd>
            <dt>Joined</dt><dd>{shortDate(user.createdAt)}</dd>
            <dt>Last updated</dt><dd>{shortDate(user.updatedAt)}</dd>
          </dl>
        </div>
        {cp && (
          <div className="detail-section">
            <h4>Client Profile</h4>
            <dl>
              {cp.location && <><dt>Location</dt><dd>{cp.location}</dd></>}
              {cp.bio && <><dt>Bio</dt><dd>{cp.bio}</dd></>}
              {cp.phone && <><dt>Phone</dt><dd>{cp.phone}</dd></>}
            </dl>
          </div>
        )}
        {pp && (
          <div className="detail-section">
            <h4>Photographer Profile</h4>
            <dl>
              <dt>Slug</dt><dd><code>{pp.slug}</code></dd>
              <dt>City</dt><dd>{pp.city}</dd>
              <dt>Country</dt><dd>{pp.country}</dd>
              <dt>Starting price</dt><dd>${pp.startingPrice}</dd>
              <dt>Rating</dt><dd>{pp.rating} / 5</dd>
              <dt>Published</dt><dd>{pp.isPublished ? "Yes" : "No"}</dd>
              <dt>Verified</dt><dd>{pp.verified ? "Yes" : "No"}</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
