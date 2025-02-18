import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Toast from "react-native-toast-message";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import Button from "@/components/ui/Button";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

type Menu = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
};

type CurrentOrder = {
  items: OrderItem[];
  total: number;
};

export default function Business() {
  const { foodTruck } = useSupabase();
  const [todayBusiness, setTodayBusiness] = useState<any>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentOrder, setCurrentOrder] = useState<CurrentOrder>({
    items: [],
    total: 0,
  });
  const [lastBusiness, setLastBusiness] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const today = format(new Date(), "yyyy-MM-dd");

  useFocusEffect(
    useCallback(() => {
      if (foodTruck) {
        checkBusinessStatus();
        fetchMenus();
        fetchPendingOrders();
      }
    }, [foodTruck])
  );

  const fetchMenus = async () => {
    const { data } = await supabase
      .from("menu")
      .select()
      .eq("food_truck_id", foodTruck?.id);

    if (data) setMenus(data);
  };

  const fetchPendingOrders = async () => {
    console.log("foodTruck?.id:", foodTruck?.id);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
				id,
				total_amount,
				status,
				created_at,
				orderdetail!orderdetail_order_id_fkey (
						menu_id,
						quantity,
						menu!orderdetail_menu_id_fkey (name)
				)
			`
      )
      .eq("food_truck_id", foodTruck?.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    console.log("pending orders query result:", { data, error });

    if (data) setPendingOrders(data);
    if (error)
      console.error(
        "Error fetching pending orders:",
        JSON.stringify(error, null, 2)
      );
  };

  const checkBusinessStatus = async () => {
    const { data: lastBusinessData } = await supabase
      .from("businessday")
      .select()
      .eq("food_truck_id", foodTruck?.id)
      .order("business_date", { ascending: false })
      .limit(1)
      .single();

    const { data: todayBusinessData } = await supabase
      .from("businessday")
      .select()
      .eq("food_truck_id", foodTruck?.id)
      .eq("business_date", today)
      .single();

    setLastBusiness(lastBusinessData);
    setTodayBusiness(todayBusinessData);
  };

  const addToOrder = (menu: Menu) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.items.find((item) => item.menuId === menu.id);

      if (existingItem) {
        const updatedItems = prev.items.map((item) =>
          item.menuId === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        };
      }

      const newItems = [
        ...prev.items,
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
        },
      ];

      return {
        items: newItems,
        total: newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    });
  };

  const updateQuantity = (menuId: string, change: number) => {
    setCurrentOrder((prev) => {
      const updatedItems = prev.items
        .map((item) => {
          if (item.menuId === menuId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];

      return {
        items: updatedItems,
        total: updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    });
  };

  const completeOrder = async () => {
    if (currentOrder.items.length === 0) return;

    try {
      const activeBusiness =
        lastBusiness?.status === "open" ? lastBusiness : todayBusiness;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            food_truck_id: foodTruck?.id,
            business_day_id: activeBusiness?.id,
            total_amount: currentOrder.total,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: detailError } = await supabase.from("orderdetail").insert(
        currentOrder.items.map((item) => ({
          order_id: order.id,
          menu_id: item.menuId,
          quantity: item.quantity,
          price: item.price,
        }))
      );

      if (detailError) throw detailError;

      Toast.show({
        type: "success",
        text1: "주문이 완료되었습니다.",
        text2: `총액: ${currentOrder.total.toLocaleString()}원`,
      });

      setCurrentOrder({ items: [], total: 0 });
      fetchPendingOrders();
    } catch (error) {
      console.error("주문 처리 실패:", error);
      Toast.show({
        type: "error",
        text1: "주문 처리에 실패했습니다.",
      });
    }
  };

  const startBusiness = async () => {
    const { data: existingBusiness } = await supabase
      .from("businessday")
      .select()
      .eq("food_truck_id", foodTruck?.id)
      .eq("business_date", today)
      .single();

    if (existingBusiness) {
      const { error } = await supabase
        .from("businessday")
        .update({
          status: "open",
          start_time: new Date().toISOString(),
          end_time: null,
        })
        .eq("id", existingBusiness.id);

      if (!error) {
        Toast.show({
          type: "success",
          text1: "영업이 재개되었습니다.",
        });
        await checkBusinessStatus();
      }
    } else {
      const { error } = await supabase.from("businessday").insert([
        {
          food_truck_id: foodTruck?.id,
          business_date: today,
          status: "open",
          start_time: new Date().toISOString(),
        },
      ]);

      if (!error) {
        Toast.show({
          type: "success",
          text1: "영업이 시작되었습니다.",
        });
        await checkBusinessStatus();
      }
    }
  };

  const completeOrderDelivery = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "complete" })
      .eq("id", orderId);

    if (!error) {
      Toast.show({
        type: "success",
        text1: "주문이 완료 처리되었습니다.",
      });
      fetchPendingOrders();
    }
  };

  const renderRightActions = (orderId: string) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.completeAction]}
          onPress={() => completeOrderDelivery(orderId)}
        >
          <Text style={styles.swipeActionText}>완료</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.cancelAction]}
          onPress={() => {
            Alert.alert("주문 취소", "정말 취소하시겠습니까?", [
              { text: "아니오" },
              {
                text: "예",
                onPress: async () => {
                  const { error } = await supabase
                    .from("orders")
                    .update({ status: "cancelled" })
                    .eq("id", orderId);

                  if (!error) {
                    Toast.show({
                      type: "success",
                      text1: "주문이 취소되었습니다.",
                    });
                    fetchPendingOrders();
                  }
                },
              },
            ]);
          }}
        >
          <Text style={styles.swipeActionText}>취소</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>
        {format(new Date(), "yyyy년 MM월 dd일", { locale: ko })}
      </Text>
      {todayBusiness?.status === "open" || lastBusiness?.status === "open" ? (
        <>
          <Text style={styles.status}>
            {lastBusiness?.status === "open" ? (
              <>
                {format(
                  new Date(lastBusiness.business_date),
                  "yyyy년 MM월 dd일"
                )}{" "}
                영업중
              </>
            ) : (
              "영업중"
            )}
          </Text>
          <View style={styles.orderSection}>
            <ScrollView style={styles.menuList}>
              {menus.map((menu) => (
                <TouchableOpacity
                  key={menu.id}
                  style={styles.menuItem}
                  onPress={() => addToOrder(menu)}
                >
                  <Text style={styles.menuName}>{menu.name}</Text>
                  <Text style={styles.menuPrice}>
                    {menu.price.toLocaleString()}원
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.orderSummary}>
              <Text style={styles.orderTitle}>현재 주문</Text>
              {currentOrder.items.map((item) => (
                <View key={item.menuId} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemPrice}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </Text>
                  </View>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.menuId, -1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.menuId, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <Text style={styles.total}>
                총액: {currentOrder.total.toLocaleString()}원
              </Text>
              <Button
                title="주문 완료"
                onPress={completeOrder}
                disabled={currentOrder.items.length === 0}
                style={{ marginBottom: 28 }}
              />
            </ScrollView>
          </View>
          <View style={styles.orderListSection}>
            <Text style={styles.orderListTitle}>대기 주문</Text>
            <ScrollView style={styles.orderList}>
              {pendingOrders.map((order) => (
                <Swipeable
                  key={order.id}
                  renderRightActions={() => renderRightActions(order.id)}
                >
                  <View style={styles.orderListItem}>
                    <View>
                      <Text style={styles.orderListItemTime}>
                        {format(new Date(order.created_at), "HH:mm")}
                      </Text>
                      {order.orderdetail.map((detail: any) => (
                        <Text
                          key={detail.menu_id}
                          style={styles.orderListItemMenu}
                        >
                          {detail.menu.name} ({detail.quantity})
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.orderListItemTotal}>
                      {order.total_amount.toLocaleString()}원
                    </Text>
                  </View>
                </Swipeable>
              ))}
            </ScrollView>
          </View>

          <Button
            title="영업 종료"
            onPress={() => {
              const businessToClose =
                lastBusiness?.status === "open" ? lastBusiness : todayBusiness;
              Alert.alert(
                "영업 종료",
                `${format(
                  new Date(businessToClose.business_date),
                  "yyyy년 MM월 dd일"
                )} 영업을 종료하시겠습니까?`,
                [
                  { text: "취소" },
                  {
                    text: "종료",
                    onPress: async () => {
                      const { error } = await supabase
                        .from("businessday")
                        .update({
                          status: "closed",
                          end_time: new Date().toISOString(),
                        })
                        .eq("id", businessToClose.id);

                      if (!error) {
                        Toast.show({
                          type: "success",
                          text1: "영업이 종료되었습니다.",
                        });
                        checkBusinessStatus();
                      }
                    },
                  },
                ]
              );
            }}
          />
        </>
      ) : (
        <>
          <Text style={styles.status}>영업 전</Text>
          <Button title="영업 시작" onPress={startBusiness} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  date: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  status: {
    fontSize: 18,
    marginBottom: 16,
  },
  orderSection: {
    flex: 1,
    flexDirection: "row",
    paddingBottom: 16,
    gap: 16,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 8,
  },
  menuName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuPrice: {
    fontSize: 14,
    color: "#6b7280",
  },
  orderSummary: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 16,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
  },
  orderItemPrice: {
    fontSize: 14,
    color: "#6b7280",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantity: {
    fontSize: 16,
    minWidth: 24,
    textAlign: "center",
  },
  warning: {
    color: "#ef4444",
    fontSize: 14,
  },
  orderListSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  orderListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  orderList: {
    maxHeight: 200,
  },
  orderListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderListItemTime: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderListItemMenu: {
    fontSize: 16,
  },
  orderListItemTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  swipeActions: {
    flexDirection: "row",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  completeAction: {
    backgroundColor: "#22c55e",
  },
  cancelAction: {
    backgroundColor: "#ef4444",
  },
  swipeActionText: {
    color: "white",
    fontWeight: "bold",
  },
});
