import React from "react";

/**
 * Universal avatar component — shows photo if available, else initial letter.
 * Props:
 *   user: { full_name, avatar_url, email }  OR  name + avatarUrl
 *   size: "xs" | "sm" | "md" | "lg" | "xl"
 *   className: extra classes
 */
const SIZES = {
  xs: "w-6 h-6 text-xs rounded-full",
  sm: "w-8 h-8 text-sm rounded-full",
  md: "w-10 h-10 text-base rounded-xl",
  lg: "w-14 h-14 text-xl rounded-2xl",
  xl: "w-20 h-20 text-3xl rounded-2xl",
};

export default function UserAvatar({ user, name, avatarUrl, size = "md", className = "" }) {
  const displayName = user?.full_name || user?.display_name || name || "?";
  const photo = user?.avatar_url || avatarUrl;
  const initial = displayName?.[0]?.toUpperCase() || "?";
  const sizeClass = SIZES[size] || SIZES.md;

  if (photo) {
    return (
      <img
        src={photo}
        alt={displayName}
        className={`${sizeClass} object-cover border-2 border-background shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold border-2 border-background shrink-0 ${className}`}>
      {initial}
    </div>
  );
}