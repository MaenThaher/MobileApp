// Almost a carbon copy of the web version
import {
  getCurrentUser,
  googleAuth,
  login,
  logout,
  signup,
} from "@/services/authService";
import { Profile } from "@/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "teacher" | "instructor"
  ) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error("Auth check error:", err);
      setError(err.message || "Failed to check authentication");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      // After successful login, fetch user data
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || "Failed to login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (
    email: string,
    password: string,
    fullName: string,
    role: "student" | "teacher" | "instructor"
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await signup(email, password, fullName, role);
      // After successful signup, fetch user data
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || "Failed to signup");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await googleAuth(idToken);
      // After successful Google auth, fetch user data
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to logout");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error("Error refreshing user:", err);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    signup: handleSignup,
    googleLogin: handleGoogleLogin,
    logout: handleLogout,
    refreshUser,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
