// app/auth.tsx - Authentication Screen (Sign In / Sign Up)
import {
  background,
  border,
  card,
  destructive,
  foreground,
  input,
  muted,
  mutedForeground,
  primary,
  primaryForeground,
  radius,
  secondary,
} from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { login, signup, googleLogin, isLoading, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "",
    scopes: ["openid", "profile", "email"],
  });

  // Sync auth error from context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleAuth(id_token);
      }
    } else if (response?.type === "error") {
      setIsGoogleLoading(false);
      setError("Google authentication failed. Please try again.");
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setError("");
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      // Role is hardcoded to "student" as per design inspiration
      await signup(email, password, name, "student");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleGoogleAuth = async (idToken: string) => {
    try {
      setIsGoogleLoading(true);
      setError("");
      await googleLogin(idToken);
    } catch (err: any) {
      setError(
        err.message || "Failed to authenticate with Google. Please try again."
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");
      await promptAsync();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError("Failed to initiate Google sign-in. Please try again.");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Feather name="cpu" size={48} color={primary} />
        <Text style={styles.title}>CircuitAI</Text>
        <Text style={styles.subtitle}>
          Intelligent Circuit Simulation & Analysis
        </Text>
      </View>

      <View style={styles.panel}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "login" && styles.tabActive]}
            onPress={() => {
              setActiveTab("login");
              resetForm();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "login" && styles.tabTextActive,
              ]}
            >
              Log in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "signup" && styles.tabActive]}
            onPress={() => {
              setActiveTab("signup");
              resetForm();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "signup" && styles.tabTextActive,
              ]}
            >
              Create account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="info" size={16} color={destructive} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Login Form */}
        {activeTab === "login" && (
          <View style={styles.form}>
            <View style={styles.groupStack}>
              <View style={styles.fieldStack}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@najah.edu"
                    placeholderTextColor={muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.fieldStack}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="lock"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={primaryForeground} />
              ) : (
                <>
                  <Text style={styles.actionButtonText}>Log in</Text>
                  <Feather
                    name="arrow-right"
                    size={18}
                    color={primaryForeground}
                  />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                // TODO: Implement forgot password
              }}
            >
              <Text style={styles.linkButtonText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (isLoading || isGoogleLoading || !request) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || !request}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={foreground} />
              ) : (
                <>
                  <Image
                    source={{
                      uri: "https://www.google.com/favicon.ico",
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.secondaryButtonText}>Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <View style={styles.form}>
            <View style={styles.groupStack}>
              <View style={styles.fieldStack}>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="user"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ahmed Gharib"
                    placeholderTextColor={muted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.fieldStack}>
                <Text style={styles.label}>University email</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="mail"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@najah.edu"
                    placeholderTextColor={muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.helperText}>
                  Use your An-Najah email if possible
                </Text>
              </View>

              <View style={styles.fieldStack}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="lock"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.fieldStack}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="lock"
                    size={18}
                    color={mutedForeground}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={muted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={primaryForeground} />
              ) : (
                <>
                  <Text style={styles.actionButtonText}>Create account</Text>
                  <Feather
                    name="arrow-right"
                    size={18}
                    color={primaryForeground}
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (isLoading || isGoogleLoading || !request) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || !request}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={foreground} />
              ) : (
                <>
                  <Image
                    source={{
                      uri: "https://www.google.com/favicon.ico",
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.secondaryButtonText}>Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CircuitAI is currently available to An-Najah engineering students
            and instructors as a graduation project.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: background,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: mutedForeground,
    textAlign: "center",
    fontWeight: "400",
  },
  panel: {
    backgroundColor: card,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 32,
    backgroundColor: secondary,
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: mutedForeground,
  },
  tabTextActive: {
    color: foreground,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: radius,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    color: destructive,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  form: {
    gap: 24,
  },
  groupStack: {
    gap: 20,
  },
  fieldStack: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: foreground,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: background,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: input,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontSize: 14,
    color: foreground,
  },
  helperText: {
    fontSize: 12,
    color: mutedForeground,
    marginTop: 4,
    marginLeft: 2,
  },
  actionButton: {
    backgroundColor: primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  actionButtonText: {
    color: primaryForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
  },
  linkButtonText: {
    color: mutedForeground,
    fontSize: 13,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: mutedForeground,
    paddingHorizontal: 12,
    textTransform: "uppercase",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: border,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  secondaryButtonText: {
    color: foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  googleIcon: {
    width: 20,
    height: 20,
    opacity: 0.8,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: border,
  },
  footerText: {
    fontSize: 12,
    color: mutedForeground,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.8,
  },
});
