/**
 * Safe reads for auth data in localStorage (avoids JSON.parse(null) / crashes).
 */

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  const u = getStoredUser();
  return u?.token || localStorage.getItem("token") || null;
}
