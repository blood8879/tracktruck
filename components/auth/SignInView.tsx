import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Text,
} from "react-native";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

type SignInViewProps = {
  loading: boolean;
  onAppleSignIn: () => void;
  onGoogleSignIn: () => void;
  onNaverSignIn: () => void;
  onKakaoSignIn: () => void;
  onEmailSignIn: () => void;
  onSignUp: () => void;
};

const SocialButton = ({
  title,
  icon,
  color,
  backgroundColor,
  onPress,
  disabled,
}: {
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.socialButton, { backgroundColor }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {icon === "apple" && <AntDesign name="apple1" size={24} color={color} />}
    {icon === "google" && <AntDesign name="google" size={24} color={color} />}
    {icon === "naver" && <FontAwesome name="navicon" size={24} color={color} />}
    {icon === "kakao" && (
      <MaterialCommunityIcons name="chat" size={24} color={color} />
    )}
    <Text style={[styles.socialButtonText, { color }]}>{title}</Text>
  </TouchableOpacity>
);

export default function SignInView({
  loading,
  onAppleSignIn,
  onGoogleSignIn,
  onNaverSignIn,
  onKakaoSignIn,
  onEmailSignIn,
  onSignUp,
}: SignInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#ffffff", "#f8f9fa"]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.title}>트럭트랙</Text>
          <Text style={styles.subtitle}>간편하게 로그인하고 시작하세요</Text>
        </View>

        <View style={styles.socialButtonsContainer}>
          {Platform.OS === "ios" && (
            <SocialButton
              title="Apple로 시작하기"
              icon="apple"
              color="#FFFFFF"
              backgroundColor="#000000"
              onPress={onAppleSignIn}
              disabled={loading}
            />
          )}
          <SocialButton
            title="Google로 시작하기"
            icon="google"
            color="#757575"
            backgroundColor="#FFFFFF"
            onPress={onGoogleSignIn}
            disabled={loading}
          />
          <SocialButton
            title="Naver로 시작하기"
            icon="naver"
            color="#FFFFFF"
            backgroundColor="#03C75A"
            onPress={onNaverSignIn}
            disabled={loading}
          />
          <SocialButton
            title="Kakao로 시작하기"
            icon="kakao"
            color="#391B1B"
            backgroundColor="#FEE500"
            onPress={onKakaoSignIn}
            disabled={loading}
          />
        </View>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={onEmailSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.emailButtonText}>이메일로 로그인</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>계정이 없으신가요?</Text>
          <TouchableOpacity onPress={onSignUp} disabled={loading}>
            <Text style={styles.signupButton}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emailButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginBottom: 24,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  signupText: {
    color: "#666666",
  },
  signupButton: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
