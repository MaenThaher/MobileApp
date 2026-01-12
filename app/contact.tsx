import {
  background,
  border,
  card,
  foreground,
  mutedForeground,
  primary,
  primaryForeground,
  radius,
} from "@/constants/colors";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.formColumn}>
          <Text style={styles.pageTitle}>Contact us</Text>

          <Text style={styles.introText}>
            Questions, feedback, or interested in using CircuitAI in your
            course? Send us a message.
          </Text>

          {submitted ? (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                Thanks! we well get back to you soon.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.formField}>
                <Text style={styles.label}>Name</Text>
                <TextInput placeholder="Your full name" style={styles.input} />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="your.email@najah.edu"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleContainer}>
                  {["Student", "Professor", "Admin", "Other"].map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[
                        styles.roleButton,
                        role === r && styles.roleButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          role === r && styles.roleTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  placeholder="Tell us what you're thinking..."
                  multiline
                  numberOfLines={6}
                  style={[styles.input, styles.textarea]}
                />
              </View>

              <Pressable style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Send message</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: background,
    flexGrow: 1,
    justifyContent: "center",
  },
  formColumn: {
    padding: 30,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: foreground,
    marginBottom: 12,
  },
  card: {
    backgroundColor: card,
    borderRadius: radius * 1.33,
    padding: 24,
  },
  introText: {
    fontSize: 16,
    color: mutedForeground,
    marginBottom: 24,
  },
  formField: {
    marginBottom: 18,
  },
  label: {
    color: foreground,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: background,
    borderColor: border,
    borderWidth: 1,
    borderRadius: radius * 0.83,
    padding: 12,
    color: foreground,
  },
  successMessage: {
    padding: 20,
    backgroundColor: card, // Simplified - CSS would use transparent primary
    borderWidth: 1,
    borderColor: primary,
    borderRadius: radius,
  },
  successText: {
    color: primary,
    fontWeight: "600",
    textAlign: "center",
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  roleText: {
    color: mutedForeground,
  },
  roleTextActive: {
    color: primaryForeground,
    fontWeight: "600",
  },
  roleButotnActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  roleButtonActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 12,
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: "center",
  },
  buttonText: {
    color: primaryForeground,
    fontWeight: "600",
    fontSize: 16,
  },
});
