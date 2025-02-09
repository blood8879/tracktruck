import { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/ui/Button";
import { supabase } from "@/config/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!email || !password || !username) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await supabase.auth.signUp({
        email,
        password,
      });
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      router.replace("/(app)/sign-in");
    } catch (error: any) {
      console.error("회원가입 에러:", error.message);
      alert(
        error.message === "User already registered"
          ? "이미 등록된 이메일입니다."
          : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        회원가입
      </ThemedText>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="사용자 이름"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "가입 중..." : "회원가입"}
          onPress={handleSignUp}
          disabled={loading}
          style={styles.button}
        />

        <Button
          title="로그인 화면으로 돌아가기"
          onPress={() => router.back()}
          style={[styles.button, styles.secondaryButton]}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    gap: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});
