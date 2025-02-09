import { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/ui/Button";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
export default function SignInScreen() {
	const { signInWithPassword } = useSupabase();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSignIn = async () => {
		try {
			setLoading(true);
			await signInWithPassword(email, password);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<ThemedText type="title">로그인</ThemedText>
			<TextInput
				style={styles.input}
				placeholder="이메일"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
			/>
			<TextInput
				style={styles.input}
				placeholder="비밀번호"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<Button
				title={loading ? "로그인 중..." : "로그인"}
				onPress={handleSignIn}
				disabled={loading}
				style={styles.button}
			/>
			<Button
				title="회원가입"
				onPress={() => router.push("/(app)/sign-up")}
				style={styles.button}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 10,
		borderRadius: 5,
		marginVertical: 5,
	},
	button: {
		marginTop: 10,
	},
});
