import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/supabase-provider";
import { router } from "expo-router";
import { supabase } from "@/config/supabase";

interface TruckInfo {
  name: string;
  description: string;
}

export default function EditTruck() {
  const { foodTruck, refreshFoodTruck } = useSupabase();
  const [truckInfo, setTruckInfo] = useState<TruckInfo>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (foodTruck) {
      setTruckInfo({
        name: foodTruck.name || "",
        description: foodTruck.description || "",
      });
    }
  }, [foodTruck]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("foodtruck")
        .update({
          name: truckInfo.name,
          description: truckInfo.description,
        })
        .eq("id", foodTruck?.id);

      if (error) throw error;

      await refreshFoodTruck();
      Alert.alert("성공", "트럭 정보가 수정되었습니다.");
      router.back();
    } catch (error) {
      Alert.alert("오류", "트럭 정보 수정에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>트럭 이름</Text>
          <TextInput
            style={styles.input}
            value={truckInfo.name}
            onChangeText={(text) => setTruckInfo({ ...truckInfo, name: text })}
            placeholder="트럭 이름을 입력하세요"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={truckInfo.description}
            onChangeText={(text) =>
              setTruckInfo({ ...truckInfo, description: text })
            }
            placeholder="트럭 설명을 입력하세요"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
