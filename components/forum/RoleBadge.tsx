"use client";

interface RoleBadgeProps {
  roleName: string | null;
  roleColor?: string | null;
  roleIcon?: string | null;
}

export function RoleBadge({ roleName, roleColor, roleIcon }: RoleBadgeProps) {
  if (!roleName) return null;

  const color = roleColor || "#C2185B";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}1A`,
        color,
      }}
    >
      <span aria-hidden="true">{roleIcon || "🏷️"}</span>
      {roleName}
    </span>
  );
}
