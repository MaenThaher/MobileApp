import { API_BASE_URL } from "@/lib/config";
import { createSession, deleteSession, getSessionToken } from "@/lib/session";
import { AxiosAPIError, Profile } from "@/types";

import axios from "axios";

export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/token`, {
      email,
      password,
    });

    const loginResponse = response.data;

    await createSession(loginResponse.token);

    return loginResponse.token;
  } catch (error: any) {
    if (error.response?.data) {
      const apiError: AxiosAPIError = error.response.data;
      throw new Error(apiError.error || "Failed to login");
    }
    if (error.message) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}

export async function signup(
  email: string,
  password: string,
  fullName: string,
  role: "student" | "teacher" | "instructor"
): Promise<string> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/authentication/signup/email`,
      {
        email,
        password,
        fullName,
        role,
      }
    );

    const signupResponse = response.data;

    await createSession(signupResponse.token);

    return signupResponse.token;
  } catch (error: any) {
    if (error.response?.data) {
      const apiError: AxiosAPIError = error.response.data;
      throw new Error(apiError.error || "Failed to signup");
    }
    if (error.message) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const token = await getSessionToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers,
    });

    return response.data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function googleAuth(idToken: string): Promise<string> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/authentication/google`,
      {
        idToken,
      }
    );

    const authResponse = response.data;

    await createSession(authResponse.token);

    return authResponse.token;
  } catch (error: any) {
    if (error.response?.data) {
      const apiError: AxiosAPIError = error.response.data;
      throw new Error(apiError.error || "Failed to authenticate with Google");
    }
    if (error.message) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}

export async function logout(): Promise<void> {
  try {
    const token = await getSessionToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await axios.post(
      `${API_BASE_URL}/api/authentication/logout`,
      {},
      {
        headers,
      }
    );
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    await deleteSession();
  }
}
