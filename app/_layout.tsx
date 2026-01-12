import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

function RootStack() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated && user?.role === "admin"}>
          <Stack.Screen name="(app)/(tabs-admin)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && user?.role === "instructor"}>
          <Stack.Screen name="(app)/(tabs-instructor)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && user?.role === "student"}>
          <Stack.Screen name="(app)/(tabs-student)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/index" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
