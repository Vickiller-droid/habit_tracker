/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AuthRole = 'creator' | 'member' | 'guest';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  avatarUrl: string;
  role?: AuthRole;
  accessToken?: string;
  idToken?: string;
  signedInAt: string;
}

/**
 * Whitelist of Creator & Administrator Google account emails
 */
export const ADMIN_EMAILS: string[] = [
  'victordanielgamco@gmail.com'
];

const SESSION_KEY = 'vicfungo_google_user';
const IS_AUTH_KEY = 'vicfungo_is_authenticated';
const CLIENT_ID_KEY = 'vicfungo_google_client_id';
const CREATOR_OVERRIDE_KEY = 'vicfungo_creator_admin_override';

/**
 * Checks if a given email is on the Creator/Admin whitelist
 */
export function isCreatorEmail(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

/**
 * Checks if the Creator Admin toggle override is enabled
 */
export function getCreatorAdminOverride(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CREATOR_OVERRIDE_KEY) === 'true';
}

/**
 * Sets the Creator Admin toggle override
 */
export function setCreatorAdminOverride(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CREATOR_OVERRIDE_KEY, enabled ? 'true' : 'false');
}

/**
 * Determine the user role based on email, authentication status, and override
 */
export function resolveUserRole(email?: string, isAuthenticated: boolean = false): AuthRole {
  if (isCreatorEmail(email) || getCreatorAdminOverride()) {
    return 'creator';
  }
  return isAuthenticated ? 'member' : 'guest';
}

/**
 * Generate a high-contrast, clean avatar URL for the user
 */
export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`;
}

/**
 * Retrieve the active Google user from local storage
 */
export function getStoredGoogleUser(): GoogleUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored Google user session:', e);
    return null;
  }
}

/**
 * Check if the session is authenticated
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const isAuth = localStorage.getItem(IS_AUTH_KEY) === 'true';
  const user = getStoredGoogleUser();
  return isAuth && user !== null;
}

/**
 * Save user session to localStorage
 */
export function saveGoogleUserSession(user: GoogleUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(IS_AUTH_KEY, 'true');
  } catch (e) {
    console.warn('Failed to save Google user session:', e);
  }
}

/**
 * Clear the active session and return to guest state
 */
export function clearGoogleUserSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(IS_AUTH_KEY, 'false');
  } catch (e) {
    console.warn('Failed to clear Google user session:', e);
  }
}

/**
 * Retrieve configured Google Client ID from environment or user preference
 */
export function getGoogleClientId(): string {
  if (typeof window === 'undefined') return '';
  const fromEnv = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  if (fromEnv && fromEnv !== 'YOUR_GOOGLE_CLIENT_ID') {
    return fromEnv;
  }
  return localStorage.getItem(CLIENT_ID_KEY) || '';
}

/**
 * Store user-configured Google Client ID
 */
export function setGoogleClientId(clientId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

/**
 * Decode JWT token returned by Google Identity Services credential response
 */
export function decodeGoogleJwt(token: string): Partial<GoogleUser> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const email = parsed.email || '';
    const role = resolveUserRole(email, true);
    return {
      id: parsed.sub || `google-${Date.now()}`,
      email,
      name: parsed.name || parsed.email?.split('@')[0] || 'Google User',
      givenName: parsed.given_name,
      familyName: parsed.family_name,
      avatarUrl: parsed.picture || generateAvatarUrl(parsed.name || parsed.email || 'Google User'),
      role,
      idToken: token,
      signedInAt: new Date().toISOString()
    };
  } catch (e) {
    console.error('Failed to decode Google JWT token:', e);
    return null;
  }
}
