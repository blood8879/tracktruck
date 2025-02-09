import "react-native-reanimated";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { SupabaseProvider } from "@/context/supabase-provider";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SupabaseProvider>
        <Slot />
      </SupabaseProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
