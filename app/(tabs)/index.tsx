import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function AuthenticationScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="hardware-chip-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>CircuitAI</Text>
        <Text style={styles.subtitle}>
          Intelligent Circuit Simulation & Analysis
        </Text>
      </View>

      {/* Panel */}
      <View style={styles.panel}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "login" && styles.tabActive,
            ]}
            onPress={() => {
              setActiveTab("login");
              setError("");
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
            style={[
              styles.tabButton,
              activeTab === "signup" && styles.tabActive,
            ]}
            onPress={() => {
              setActiveTab("signup");
              setError("");
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

        {/* Messages */}
        {error !== "" && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success !== "" && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Login */}
        {activeTab === "login" && (
          <View>
            <Input
              icon="mail-outline"
              placeholder="your.email@najah.edu"
            />
            <Input
              icon="lock-closed-outline"
              placeholder="Password"
              secureTextEntry
            />

            <PrimaryButton
              label={loading ? "Logging in..." : "Log in"}
              loading={loading}
            />

            <TouchableOpacity>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Signup */}
        {activeTab === "signup" && (
          <View>
            <Input icon="person-outline" placeholder="Full name" />
            <Input icon="mail-outline" placeholder="University email" />
            <Input icon="school-outline" placeholder="Role (Student / Instructor)" />
            <Input
              icon="lock-closed-outline"
              placeholder="Password"
              secureTextEntry
            />
            <Input
              icon="lock-closed-outline"
              placeholder="Confirm password"
              secureTextEntry
            />

            <PrimaryButton
              label={loading ? "Creating account..." : "Create account"}
              loading={loading}
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        CircuitAI is currently available to An-Najah engineering students and
        instructors as a graduation project.
      </Text>
    </ScrollView>
  );
}

/* ------------------ Components ------------------ */

function Input(props: any) {
  return (
    <View style={styles.inputGroup}>
      <Icon name={props.icon} size={20} color="#6B7280" />
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}

function PrimaryButton({
  label,
  loading,
}: {
  label: string;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.button} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Text style={styles.buttonText}>{label}</Text>
          <Icon name="arrow-forward-outline" size={18} color="#fff" />
        </>
      )}
    </TouchableOpacity>
  );
}

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    borderColor: "#4F46E5",
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 48,
    marginLeft: 8,
    color: "#111827",
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    color: "#4F46E5",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  successBox: {
    backgroundColor: "#E0E7FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  successText: {
    color: "#3730A3",
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },
});
