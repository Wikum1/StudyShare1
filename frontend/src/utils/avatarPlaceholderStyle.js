/**
 * Styles for letter avatars when no photo — uses optional user.avatarColor (hex).
 */

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function normalizeHex(hex) {
  if (!hex || typeof hex !== "string") return null;
  const c = hex.trim();
  if (!HEX.test(c)) return null;
  if (c.length === 4) {
    const [, r, g, b] = c;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return c;
}

function darkenHex(hex, amount = 0.2) {
  const full = normalizeHex(hex);
  if (!full) return null;
  const n = parseInt(full.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amount));
  const g = Math.round(((n >> 8) & 255) * (1 - amount));
  const b = Math.round((n & 255) * (1 - amount));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * @param {{ avatarColor?: string | null } | null | undefined} authorOrUser
 * @returns {React.CSSProperties | undefined}
 */
export function avatarPlaceholderStyle(authorOrUser) {
  const full = normalizeHex(authorOrUser?.avatarColor);
  if (!full) return undefined;
  const d = darkenHex(full, 0.2) || full;
  return {
    background: `linear-gradient(145deg, ${full} 0%, ${d} 100%)`,
    color: "#fff",
  };
}
