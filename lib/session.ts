// lib/session.ts (MOBILE)
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "session";

/**
 * Store session token received from backend
 */
export async function createSession(token: string) {
  await AsyncStorage.setItem(SESSION_KEY, token);
}

/**
 * Get raw session token
 */
export async function getSessionToken(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

/**
 * Delete session (logout)
 */
export async function deleteSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Attach Authorization header
 */
export async function getAuthHeader() {
  const token = await getSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
