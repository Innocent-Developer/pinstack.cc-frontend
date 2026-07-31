const TOKEN_KEY = 'pinstack_token';
const USER_KEY = 'pinstack_user';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  try {
    void import('./myVotes').then((m) => m.clearMyVotesCache());
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('pinstack-auth'));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Avoid leaking previous user's vote highlights to the next session
  try {
    // Lazy import path avoided - call via dynamic to keep auth free of circular deps if any
    void import('./myVotes').then((m) => m.clearMyVotesCache());
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('pinstack-auth'));
}
