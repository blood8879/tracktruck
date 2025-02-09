import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";

export default function Contact() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const isAvailable = await MailComposer.isAvailableAsync();

      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ["blood8879@gmail.com"],
          subject: subject,
          body: content,
        });
        router.back();
      } else {
        Alert.alert("오류", "메일 작성을 지원하지 않는 기기입니다.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      Alert.alert("오류", "메일 전송 중 문제가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="제목을 입력하세요"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={content}
            onChangeText={setContent}
            placeholder="문의 내용을 입력하세요"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>보내기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  contentInput: {
    height: 200,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
