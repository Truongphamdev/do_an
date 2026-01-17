import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useCallback } from 'react'
// api
import { TableApi, type TableInterface } from '../../../api/table.api'
import { CartApi } from '../../../api/cart.api'
import { OrderApi, type OrderInterface } from '../../../api/order.api'
// navigation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { WaiterNav, WaiterStackParamList } from '../../../navigation/waiterNavigation'
// thông báo
import { useNotify } from '../../../providers/notificationProvider'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// Ws
import { useWebSocket } from '../../../hooks/useWebsocket'

type WaiterTableOrderDetailProp = RouteProp<WaiterStackParamList, "TableOrderDetail">;

const TableOrderDetail = () => {
  const navigation = useNavigation<WaiterNav>();
  const route = useRoute<WaiterTableOrderDetailProp>();
  const tableId = route.params?.tableId;
  const [ table, setTable ] = useState<TableInterface>();
  const { success, error, confirm } = useNotify();
  const [ orders, setOrders ] = useState<OrderInterface[]>([]);

  const fetchTable = useCallback(async (id: number) => {
    try {
      const data = await TableApi.getById(id);
      setTable(data);
    } catch (err: any) {
      error("Lấy dữ liệu bàn thất bại.");
    }
  }, []);

  // --- REALTIME ORDER ---
  useWebSocket((message) => {
    console.log("📌 Realtime order:", message);

    switch(message.type) {
      case "ORDER_CREATED":
        setOrders(prev => [message.order, ...prev]);
        break;
      case "ORDER_UPDATED":
        setOrders(prev =>
          prev.map(order =>
            order.id === message.order.id
            ? {...order, ...message.order}
            : order
          )
        );
        break;
      default:
        console.log("❓ Unknown table realtime type", message.type);
        break;
    }
  }, 'ws://10.0.2.2:8000/ws/orders/');

  // lấy dữ liệu khi có order
  const fetchOrders = async () => {
    try {
      const data = await OrderApi.getOrders();
      setOrders(data);
    } catch (err: any) {
      error("Lấy dữ liệu order thất bại.");
    }
  };

  // gọi mỗi lần quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      if (tableId) {
        fetchTable(tableId);
        fetchOrders();
      }
    }, [fetchTable])
  );

  // hàm tạo cart
  const handleOpenCart = async () => {
    try {
      // kiểm tra cart
      let cart = await CartApi.getCart(tableId!);
      // nếu chưa có cart => tạo cart
      if (!cart) {
        cart = await CartApi.createCart(tableId!);
      }

      navigation.navigate("MenuProductWaiter", {
        tableId,
        cartId: cart.id,
      });
    } catch (err: any) {
      error("Không thể mở gọi món")
    }
  };


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TableList")} style={styles.goBackButton}>
          <Icon name='arrow-left' size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Chi tiết bàn {table?.number}</Text>
      </View>

      {table && (
        <>
          {/* THÔNG TIN BÀN */}
          <View style={styles.card}>
            <Text style={styles.tableTitle}>Bàn {table.number}</Text>
            <Text style={styles.subText}>{table.capacity} chỗ · Trạng thái: Có khách</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleOpenCart}>
              <Icon name="plus" size={14} color="#fff" />
              <Text style={styles.addButtonText}>Gọi món</Text>
            </TouchableOpacity>
          </View>


          {/* DANH SÁCH ORDER */}
          <View style={styles.cardOrders}>
            <Text style={styles.sectionTitle}>Danh sách đơn</Text>

            {orders.length === 0 && (
              <Text>Chưa có order nào</Text>
            )}

            {orders.map(order => (
              <View key={order.id} style={{ marginBottom: 16 }}>
                
                <View style={{ marginBottom: 6 }}>
                  <Text>Order #{order.id}</Text>
                  <Text>Trạng thái: {order.status}</Text>
                  {order.created_at && (
                    <Text>Thời gian: {order.created_at}</Text>
                  )}
                </View>

                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <View>
                      <Text style={styles.orderName}>
                        {item.product.name} x {item.quantity}
                      </Text>
                      {item.description && (
                        <Text>{item.description}</Text>
                      )}
                    </View>

                    <Text style={styles.orderPrice}>
                      {item.price}
                    </Text>
                  </View>
                ))}

                <View style={{ marginTop: 6 }}>
                  <Text>Tổng tiền: {order.total_amount}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.totalContent}>
              <Text style={styles.totalText}>Tổng tiền</Text>
              <Text style={styles.totalPrice}>0đ</Text>
            </View>
            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payText}>Yêu cầu thanh toán</Text>
            </TouchableOpacity>
          </View>

        </>
      )}
    </ScrollView>
  )
}

export default TableOrderDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#0066cc",
    position: "relative",
    padding: 10,
  },
  titleHeader: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  goBackButton: {
    position: "absolute",
    top: 20,
    left: 20,
    height: 50,
    width: 50,
    zIndex: 999,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subText: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0066cc",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  cardOrders: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  // trạng thái
  pending: {
    color: "#999",
    fontSize: 13,
  },
  cooking: {
    color: "#F9A825",
    fontSize: 13,
  },
  done: {
    color: "#0fbe15",
    fontSize: 13,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    width: '100%',
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    gap: 5,
    elevation: 3,
  },
  totalContent: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e22320",
  },
  payButton: {
    width: '100%',
    backgroundColor: "#ff7f00",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  payText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})