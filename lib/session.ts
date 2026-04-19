const TOKEN_KEY = "intermate_token";
const USER_KEY  = "intermate_user";

const isBrowser = typeof window !== "undefined";

export function saveSession(token: string, user: unknown) {
  if (!isBrowser) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
