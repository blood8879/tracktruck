import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

type SocialButtonProps = {
  title: string;
  icon: keyof typeof FontAwesome.glyphMap;
  color: string;
  backgroundColor: string;
  onPress: () => void;
};

export default function SocialButton({
  title,
  icon,
  color,
  backgroundColor,
  onPress,
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <FontAwesome name={icon} size={20} color={color} style={styles.icon} />
      <ThemedText style={[styles.text, { color }]}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  icon: {
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
