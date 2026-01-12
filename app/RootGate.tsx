import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { Stack } from "expo-router";

function roleTabsName(role?: string) {
  switch (role as UserRole) {
    case "admin":
      return "(app)/(tabs-admin)";
    case "instructor":
      return "(app)/(tabs-instructor)";
    default:
      return "(app)/(tabs-student)";
  }
}

//From what I understand:
// Stack is well, a  stack, I think of it as browser history
// Tabs is for parallel navigation, and it's like an actual tab on a browser

export default function RootGate() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  const tabsGroup = roleTabsName(user?.role);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name={tabsGroup} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
