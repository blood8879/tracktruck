import { IconSymbol } from "@/components/ui/IconSymbol";
import { router, Tabs, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function ProtectedLayout() {
  const router = useRouter();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          // headerLeft: () => <Text>트럭변경</Text>,
          // headerRight: () => <Text>123</Text>,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "영업관리",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "메뉴관리",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "매출",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(truck)/register-truck"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
