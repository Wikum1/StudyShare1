/**
 * In development, empty base uses CRA proxy (package.json → port 5000).
 * For production, set REACT_APP_API_URL (e.g. https://api.example.com).
 */
export const API_BASE = (() => {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") return "";
  return "http://localhost:5000";
})();

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
