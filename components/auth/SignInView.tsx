import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import SocialButton from "@/components/auth/SocialButton";

type SignInViewProps = {
  loading: boolean;
  onAppleSignIn: () => void;
  onGoogleSignIn: () => void;
  onNaverSignIn: () => void;
  onKakaoSignIn: () => void;
  onEmailSignIn: () => void;
  onSignUp: () => void;
};

export default function SignInView({
  loading,
  onAppleSignIn,
  onGoogleSignIn,
  onNaverSignIn,
  onKakaoSignIn,
  onEmailSignIn,
  onSignUp,
}: SignInViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <ThemedText type="title" style={styles.title}>
          트럭트랙
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          간편하게 로그인하고 시작하세요
        </ThemedText>
      </View>

      <View style={styles.socialButtonsContainer}>
        {/* <SocialButton
					title="애플로 시작하기"
					icon="apple"
					color="#FFFFFF"
					backgroundColor="#000000"
					onPress={onAppleSignIn}
				/> */}
        <SocialButton
          title="구글로 시작하기"
          icon="google"
          color="#FFFFFF"
          backgroundColor="#4285F4"
          onPress={onGoogleSignIn}
        />
        {/* <SocialButton
          title="Naver로 시작하기"
          icon="comment"
          color="#FFFFFF"
          backgroundColor="#03C75A"
          onPress={onNaverSignIn}
        /> */}
        <SocialButton
          title="카카오톡으로 시작하기"
          icon="comment"
          color="#FFFFFF"
          backgroundColor="#FEE500"
          onPress={onKakaoSignIn}
        />
        <TouchableOpacity style={styles.emailButton} onPress={onEmailSignIn}>
          <ThemedText style={styles.emailButtonText}>
            이메일로 로그인하기
          </ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          계정이 없으신가요?{" "}
          <ThemedText style={styles.signUpLink} onPress={onSignUp}>
            회원가입
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 40,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  signUpLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
  emailButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  emailButtonText: {
    fontSize: 16,
    color: "#666",
    textDecorationLine: "underline",
  },
});
