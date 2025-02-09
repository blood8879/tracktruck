import { useState } from "react";
import { useRouter } from "expo-router";
import SignInView from "@/components/auth/SignInView";
import { Platform, Alert } from "react-native";
import { supabase } from "@/config/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as WebBrowser from "expo-web-browser";

// import KakaoLogin from "@react-native-seoul/kakao-login";
import {
  login,
  KakaoOAuthToken,
  getProfile,
  KakaoProfile,
} from "@react-native-seoul/kakao-login";

// 개발 환경에서만 동적으로 임포트
let statusCodes: any;

// if (!__DEV__ && Platform.OS !== "web") {
const GoogleSignInModule = require("@react-native-google-signin/google-signin");
statusCodes = GoogleSignInModule.statusCodes;
// }

// 컴포넌트 최상단에 Google Sign-In 초기화
GoogleSignin.configure({
  webClientId:
    "263134244594-81a5t9neb1g6gdo2vvqjq6bpebj31kcp.apps.googleusercontent.com", // Google Cloud Console에서 생성한 웹 클라이언트 ID
  offlineAccess: true,
});

export default function SignInContainer() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAppleSignIn = async () => {
    console.log("Apple sign in");
  };

  const handleGoogleSignIn = async () => {
    // Expo Go 또는 개발 환경
    // if (__DEV__ || !GoogleSignin) {
    //   console.log("Development environment - using Supabase OAuth flow");
    //   try {
    //     const { data, error } = await supabase.auth.signInWithOAuth({
    //       provider: "google",
    //       options: {
    //         redirectTo: "exp://localhost:8081",
    //         skipBrowserRedirect: true,
    //       },
    //     });
    //     if (error) throw error;
    //     return data;
    //   } catch (error) {
    //     console.error("OAuth error:", error);
    //   }
    //   return;
    // }

    // 프로덕션 환경 - 네이티브 Google Sign-In
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signIn(); // user 정보는 사용하지 않으므로 구조분해 제거
      const { accessToken, idToken } = await GoogleSignin.getTokens();
      // console.log("Google Sign-In tokens:", { accessToken, idToken });

      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });
        if (error) throw error;
        // console.log("Supabase auth success:", data);
      }
    } catch (error: any) {
      console.error("Google sign in error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      Alert.alert(
        "로그인 실패",
        error.message || "Google 로그인 중 오류가 발생했습니다."
      );
    }
  };

  const handleNaverSignIn = async () => {
    console.log("Naver sign in");
  };

  const handleKakaoSignIn = async () => {
    console.log("✅ handleKakaoSignIn 함수 실행됨");

    try {
      console.log("🔄 카카오 로그인 시도 중...");

      let token;
      try {
        token = await login();
        console.log("🔥 token:", token);
      } catch (error) {
        console.error("🔥 login() 내부에서 에러 발생:", error);
        throw error;
      }

      // console.log("✅ 카카오 로그인 성공:", token);

      if (!token || !token.accessToken) {
        throw new Error("카카오 로그인 실패: 액세스 토큰이 없음");
      }

      console.log("🔄 카카오 프로필 가져오는 중...");
      const kakaoProfile: KakaoProfile = await getProfile();
      console.log("✅ Kakao profile:", kakaoProfile);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "kakao",
        token: token.idToken,
      });

      if (error) {
        console.error("❌ Supabase 로그인 오류:", error);
        Alert.alert("로그인 실패", "Supabase 로그인 중 오류 발생.");
        return;
      }

      // console.log("✅ Supabase 로그인 성공:", data);
      // router.push("/(app)/home"); // 로그인 후 이동
    } catch (error: any) {
      console.error("❌ Kakao sign-in error (전체):", error);
      Alert.alert(
        "로그인 실패",
        error.message || "카카오 로그인 중 오류가 발생했습니다."
      );
    } finally {
      await WebBrowser.coolDownAsync();
    }
  };

  const handleEmailSignIn = () => {
    router.push("/(app)/sign-in-email");
  };

  const handleSignUp = () => {
    router.push("/(app)/sign-up");
  };

  return (
    <SignInView
      loading={loading}
      onAppleSignIn={handleAppleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onNaverSignIn={handleNaverSignIn}
      onKakaoSignIn={handleKakaoSignIn}
      onEmailSignIn={handleEmailSignIn}
      onSignUp={handleSignUp}
    />
  );
}
