
import "../../global.css";
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { StatusBar } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export default function RootLayout() {
  // console.log( "key" +process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
  
  
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
