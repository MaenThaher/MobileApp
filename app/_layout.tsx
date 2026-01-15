import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { background } from "@/constants/colors";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

function RootStack() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

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

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screen - only available when NOT authenticated */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/login" />
        </Stack.Protected>

        {/* Role-based protected screens */}
        <Stack.Protected guard={isAuthenticated && user?.role === "admin"}>
          <Stack.Screen name="(app)/(tabs-admin)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && user?.role === "instructor"}>
          <Stack.Screen name="(app)/(tabs-instructor)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && user?.role === "student"}>
          <Stack.Screen name="(app)/(tabs-student)" />
        </Stack.Protected>

        {/* Modal - only available when authenticated */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack.Protected>

        {/* Public screens */}
        <Stack.Screen name="About" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="index" />
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
