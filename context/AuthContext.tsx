import React, { createContext, useContext, useEffect, useState } from "react";
import { emailSignIn, emailSignUp, getCurrentUser, logout } from "../services/authService";
import { Profile } from "../types/index2";

type AuthContextType = {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from session (replace with RN-compatible API)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser(); // your RN auth service
        if (currentUser) setUser(currentUser);
      } catch (err) {
        console.error("Failed to initialize user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailSignIn(email, password);
      const currentUser = await getCurrentUser();
      if (currentUser) setUser(currentUser);
      else throw new Error("User not found");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailSignUp(email, password, fullName, role);
      const currentUser = await getCurrentUser();
      if (currentUser) setUser(currentUser);
      else throw new Error("User not found");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, signup, logout: logoutAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export { AuthProvider, useAuth };

