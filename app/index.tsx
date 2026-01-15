import { background } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: background,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Initial routing decision - Stack.Protected handles route security
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Redirect authenticated users to their role-based screen
  if (user?.role === "admin") {
    return <Redirect href="/(app)/(tabs-admin)" />;
  } else if (user?.role === "instructor") {
    return <Redirect href="/(app)/(tabs-instructor)" />;
  } else if (user?.role === "student") {
    return <Redirect href="/(app)/(tabs-student)" />;
  }

  // Fallback
  return <Redirect href="/login" />;
}
