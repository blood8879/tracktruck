import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";

import { LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useSupabase } from "@/context/supabase-provider";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { supabase } from "@/config/supabase";
import { useFocusEffect } from "@react-navigation/native";

import { router } from "expo-router";

import { DateBottomSheet } from "@/components/DateBottomSheet";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";

const screenWidth = Dimensions.get("window").width;

type SalesData = {
  date: string;
  total: number;
};

type MenuSalesData = {
  menuName: string;
  total: number;
  quantity: number;
};

// type SalesDetailItem = {
// 	id: string;
// 	created_at: string;
// 	total_amount: number;
// 	orderdetail: {
// 		quantity: number;
// 		price: number;
// 		menu: { name: string };
// 	}[];
// };

export default function Sales() {
  const { foodTruck } = useSupabase();
  const [periodType, setPeriodType] = useState<"daily" | "monthly" | "yearly">(
    "daily"
  );
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [menuSales, setMenuSales] = useState<MenuSalesData[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // const [salesDetails, setSalesDetails] = useState<SalesDetailItem[]>([]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentCallback, setCurrentCallback] = useState<
    (index: number) => void
  >(() => {});

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: new Date(selectedYear, selectedMonth, 0).getDate() },
    (_, i) => i + 1
  );

  const showDatePicker = (
    options: string[],
    onSelect: (index: number) => void
  ) => {
    setCurrentOptions(options);
    setCurrentCallback(() => onSelect);
    bottomSheetRef.current?.snapToIndex(0);
  };

  useFocusEffect(
    useCallback(() => {
      if (foodTruck) {
        fetchSalesData();
        fetchMenuSales();
      }
    }, [selectedYear, selectedMonth, selectedDay, periodType, foodTruck])
  );

  const fetchSalesData = async () => {
    let startDate, endDate;

    switch (periodType) {
      case "daily":
        const endDateTime = new Date(
          selectedYear,
          selectedMonth - 1,
          selectedDay
        );
        const startDateTime = new Date(endDateTime);
        startDateTime.setDate(startDateTime.getDate() - 6);

        startDate = format(startDateTime, "yyyy-MM-dd");
        endDate = format(endDateTime, "yyyy-MM-dd");
        break;
      case "monthly":
        startDate = format(
          new Date(selectedYear, selectedMonth - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(
          new Date(selectedYear, selectedMonth, 0),
          "yyyy-MM-dd"
        );
        break;
      case "yearly":
        startDate = `${selectedYear}-01-01`;
        endDate = `${selectedYear}-12-31`;
        break;
    }

    const { data } = await supabase
      .from("orders")
      .select(
        `
				created_at,
				total_amount
			`
      )
      .eq("food_truck_id", foodTruck?.id)
      .eq("status", "complete")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    if (data) {
      const groupedData = data.reduce(
        (acc: Record<string, number>, curr: any) => {
          const date = format(
            new Date(curr.created_at),
            periodType === "daily"
              ? "yyyy-MM-dd"
              : periodType === "monthly"
              ? "yyyy-MM"
              : "yyyy"
          );
          acc[date] = (acc[date] || 0) + curr.total_amount;
          return acc;
        },
        {}
      );

      if (periodType === "daily") {
        const filledData: Record<string, number> = {};
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
          const dateStr = format(currentDate, "yyyy-MM-dd");
          filledData[dateStr] = groupedData[dateStr] || 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const formattedData = Object.entries(filledData)
          .map(([date, total]) => ({ date, total }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setSalesData(formattedData);
      } else {
        const formattedData = Object.entries(groupedData)
          .map(([date, total]) => ({ date, total }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setSalesData(formattedData);
      }
    }
  };

  const fetchMenuSales = async () => {
    let startDate, endDate;

    switch (periodType) {
      case "daily":
        startDate = format(
          new Date(selectedYear, selectedMonth - 1, selectedDay),
          "yyyy-MM-dd"
        );
        endDate = format(
          new Date(selectedYear, selectedMonth - 1, selectedDay),
          "yyyy-MM-dd"
        );
        break;
      case "monthly":
        startDate = format(
          new Date(selectedYear, selectedMonth - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(
          new Date(selectedYear, selectedMonth, 0),
          "yyyy-MM-dd"
        );
        break;
      case "yearly":
        startDate = `${selectedYear}-01-01`;
        endDate = `${selectedYear}-12-31`;
        break;
    }

    console.log("Fetching menu sales for:", { startDate, endDate, periodType });

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
				id,
				created_at,
				orderdetail!orderdetail_order_id_fkey (
					quantity,
					price,
					menu!orderdetail_menu_id_fkey (
						name
					)
				)
			`
      )
      .eq("food_truck_id", foodTruck?.id)
      .eq("status", "complete")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    console.log("Menu sales data:", data, "error:", error);

    if (data && data.length > 0) {
      const menuStats = data.reduce(
        (acc: Record<string, MenuSalesData>, order: any) => {
          order.orderdetail.forEach((detail: any) => {
            const menuName = detail.menu?.name || "알 수 없음";
            if (!acc[menuName]) {
              acc[menuName] = { menuName, total: 0, quantity: 0 };
            }
            acc[menuName].total += detail.quantity * detail.price;
            acc[menuName].quantity += detail.quantity;
          });
          return acc;
        },
        {}
      );

      setMenuSales(Object.values(menuStats));
    } else {
      setMenuSales([]);
    }
  };

  // const fetchSalesDetails = async (date: string) => {
  // 	const { data } = await supabase
  // 		.from("orders")
  // 		.select(
  // 			`
  // 			id,
  // 			created_at,
  // 			total_amount,
  // 			orderdetail!orderdetail_order_id_fkey (
  // 				quantity,
  // 				price,
  // 				menu!orderdetail_menu_id_fkey (
  // 					name
  // 				)
  // 			)
  // 		`,
  // 		)
  // 		.eq("food_truck_id", foodTruck?.id)
  // 		.eq("status", "complete")
  // 		.gte("created_at", `${date}T00:00:00`)
  // 		.lte("created_at", `${date}T23:59:59`)
  // 		.order("created_at", { ascending: false });

  // 	if (data) {
  // 		setSalesDetails(
  // 			data.map((item) => ({
  // 				id: item.id,
  // 				created_at: item.created_at,
  // 				total_amount: item.total_amount,
  // 				orderdetail: item.orderdetail.map((detail) => ({
  // 					quantity: detail.quantity,
  // 					price: detail.price,
  // 					// @ts-ignore
  // 					menu: { name: detail.menu.name },
  // 				})),
  // 			})),
  // 		);
  // 	}
  // };

  const chartData = {
    labels: salesData.map((d) =>
      format(
        new Date(d.date),
        periodType === "daily"
          ? "MM/dd"
          : periodType === "monthly"
          ? "yyyy/MM"
          : "yyyy"
      )
    ),
    datasets: [
      {
        data:
          salesData.length > 0
            ? salesData.map((d) => d.total || 0) // null/undefined 처리
            : [0], // 데이터가 없을 경우 기본값
      },
    ],
  };

  const pieChartData = menuSales
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((item, index) => ({
      name: item.menuName,
      population: item.total,
      color: [`#FF6384`, `#36A2EB`, `#FFCE56`, `#4BC0C0`, `#9966FF`][index],
      legendFontColor: "#7F7F7F",
    }));

  const handleSearch = () => {
    let searchDate;

    switch (periodType) {
      case "monthly":
        // 선택된 연/월의 첫날을 기준으로 라우팅
        searchDate = format(
          new Date(selectedYear, selectedMonth - 1, 1),
          "yyyy-MM"
        );
        break;
      case "yearly":
        // 선택된 연도의 첫날을 기준으로 라우팅
        searchDate = format(new Date(selectedYear, 0, 1), "yyyy");
        break;
      case "daily":
      default:
        // 일별 조회의 경우 선택된 특정 날짜로 라우팅
        searchDate = format(
          new Date(selectedYear, selectedMonth - 1, selectedDay),
          "yyyy-MM-dd"
        );
        break;
    }

    router.push({
      pathname: "/sales/salesModal",
      params: {
        date: searchDate,
        periodType: periodType,
        foodTruckId: foodTruck?.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>매출 현황</Text>
        <SegmentedControl
          values={["일별", "월별", "연별"]}
          selectedIndex={["daily", "monthly", "yearly"].indexOf(periodType)}
          onChange={(event) => {
            setPeriodType(
              ["daily", "monthly", "yearly"][
                event.nativeEvent.selectedSegmentIndex
              ] as any
            );
          }}
        />

        <View style={styles.dateSearchContainer}>
          <View style={styles.dateSelectors}>
            <TouchableOpacity
              style={[styles.dateSelector, styles.yearSelector]}
              onPress={() => {
                showDatePicker(
                  years.map((year) => `${year}년`),
                  (index) => setSelectedYear(years[index])
                );
              }}
            >
              <Text style={styles.dateSelectorText}>{selectedYear}년</Text>
              <Ionicons name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>

            {periodType !== "yearly" && (
              <>
                <View style={styles.dateSeparator} />
                <TouchableOpacity
                  style={[styles.dateSelector, styles.monthSelector]}
                  onPress={() => {
                    showDatePicker(
                      months.map((month) => `${month}월`),
                      (index) => setSelectedMonth(months[index])
                    );
                  }}
                >
                  <Text style={styles.dateSelectorText}>{selectedMonth}월</Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </>
            )}

            {periodType === "daily" && (
              <>
                <View style={styles.dateSeparator} />
                <TouchableOpacity
                  style={[styles.dateSelector, styles.daySelector]}
                  onPress={() => {
                    showDatePicker(
                      days.map((day) => `${day}일`),
                      (index) => setSelectedDay(days[index])
                    );
                  }}
                >
                  <Text style={styles.dateSelectorText}>{selectedDay}일</Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>상세 조회</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>기간별 매출 추이</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={true}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>메뉴별 매출 비중 (Top 5)</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.chartTitle}>메뉴별 상세 통계</Text>
          {menuSales.map((item) => (
            <View key={item.menuName} style={styles.statItem}>
              <Text style={styles.menuName}>{item.menuName}</Text>
              <View>
                <Text style={styles.statText}>
                  총 매출: {item.total.toLocaleString()}원
                </Text>
                <Text style={styles.statText}>판매량: {item.quantity}개</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <DateBottomSheet
        options={currentOptions}
        onSelect={currentCallback}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chartContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  chart: {
    borderRadius: 10,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuName: {
    fontSize: 16,
    fontWeight: "500",
  },
  statText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  salesListContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  salesListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  salesListDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  salesListTotal: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  detailsContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  orderItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderTime: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  orderDetail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  searchSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 16,
    gap: 8,
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
    minWidth: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dateSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,

    paddingTop: 12,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  dateSelectors: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateSelectorText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dateSeparator: {
    fontSize: 16,
    color: "#6b7280",
    marginHorizontal: 2,
  },
  yearSelector: {
    flex: 1,
  },
  monthSelector: {
    flex: 1,
  },
  daySelector: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
