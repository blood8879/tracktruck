import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

interface DateBottomSheetProps {
  options: string[];
  onSelect: (index: number) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
}

export const DateBottomSheet = ({
  options,
  onSelect,
  bottomSheetRef,
}: DateBottomSheetProps) => {
  const snapPoints = useMemo(() => ["100%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "white" }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.scrollViewContent}>
        {options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={() => {
              onSelect(index);
              bottomSheetRef.current?.close();
            }}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.optionItem, styles.cancelButton]}
          onPress={() => bottomSheetRef.current?.close()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  optionText: {
    fontSize: 16,
    color: "#1f2937",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    fontWeight: "600",
  },
});
