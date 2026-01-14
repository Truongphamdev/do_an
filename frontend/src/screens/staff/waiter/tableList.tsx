import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Dimensions } from 'react-native'
// api
import { TableApi, type TableInterface } from '../../../api/table.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// thông báo
import { useNotify } from '../../../providers/notificationProvider'
// navigation
import { useFocusEffect, useNavigation } from '@react-navigation/native'
// webSocket
import { useWebSocket } from '../../../hooks/useWebsocket'

// with cho card
const SCREEN_WIDTH = Dimensions.get("window").width;
const GAP = 16; // khoảng cách trái phải
const CARD_WIDTH = (SCREEN_WIDTH - GAP * 4) / 3;

const TableList = () => {
  const [allTables, setAllTables] = useState<TableInterface[]>([]);
  const { success, error, confirm } = useNotify();
  const navigation = useNavigation<any>();

  // --- REALTIME TABLE ---
  useWebSocket((message) => {
    console.log("📌 Realtime product:", message);

    switch(message.type) {
      case "TABLE_CREATED":
        setAllTables(prev => [message.table, ...prev]);
        break;
      case "TABLE_UPDATED":
        setAllTables(prev =>
          prev.map(table =>
            table.id === message.table.id
            ? {...table, ...message.table}
            : table
          )
        );
        break;
      case "TABLE_DELETED":
        setAllTables(prev => prev.filter(table => table.id !== message.table.id));
        break;
      default:
        console.log("❓ Unknown table realtime type", message.type);
        break;
    }
  }, 'ws://10.0.2.2:8000/ws/tables/');

  const [ statusFilter, setStatusFilter ] = useState<"all" | "available" | "occupied" | "reserved">("all");

  const statusColor = {
    all: "#0080FF",
    available: "#0fbe15",
    occupied: "#e22320",
    reserved: "#F9A825",
  };
  const statusBorderColor = {
    all: "#84c2ff",
    available: "#90e693",
    occupied: "#f18988",
    reserved: "#fcd79a",
  };
  const tableColor = (status?: string) => {
    switch (status) {
      case "available":
        return "#0fbe15";
      case "occupied":
        return "#e22320";
      case "reserved":
        return "#F9A825";
      default:
        return "#9E9E9E";
    }
  };

  const fetchTables = useCallback(async () => {
    try {
      const data = await TableApi.getList();

      const sorted = [...data].sort(
        (a, b) =>
          new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
      );

      setAllTables(sorted);
    } catch (err: any) {
      error("Lấy dữ liệu bàn thất bại!");
    }
  }, [error]);

  // load ngay khi vào lần đầu
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // reload khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      fetchTables();
    }, [fetchTables])
  );

  // chức năng filter
  const tables = React.useMemo(() => {
    if (statusFilter == "all") return allTables;
    return allTables.filter(prev => prev.status === statusFilter);
  }, [allTables, statusFilter]);

  // cấu hình cho chức năng cập nhật trạng thái của table
  const getNextAction = (table: TableInterface) => {
    if (!table.is_active) return;

    switch (table.status) {
      case "available":
        return { text: "Mở bàn", type: "open" };
      case "occupied":
        return { text: "Đóng bàn", type: "close" };
      case "reserved":
        return { text: "Xử lý", type: "reserved" };
      default:
        return null;
    }
  };

  // chức năng cập nhật trạng thái bàn
  const handlePressTable = (table: TableInterface) => {
    const action = getNextAction(table);
    if (!table.is_active) return;

    // Bàn trống => mở bàn
    if (action?.type === "open") {
      confirm({
        title: "Mở bàn",
        message: `Mở bàn số ${table.number}?`,
        onConfirm: async () => {
          try {
            await TableApi.updateStatus(table.id, "occupied");
            success(`Bàn ${table.number} đã mở.`);
          } catch (err: any) {
            error("Mở bàn thất bại");
          }
        },
      })
    }

    // Bàn đang có khách => đóng bàn
    if (action?.type === "close") {
      confirm({
        title: "Đóng bàn",
        message: `Khách đã thanh toán bàn ${table.number}?`,
        onConfirm: async () => {
          try {
            await TableApi.updateStatus(table.id, "available");
            success(`Bàn ${table.number} đã đóng.`);
          } catch (err: any) {
            error("Đóng bàn thất bại");
          }
        }
      })
    }

    // Bàn đặt trước
    if (action?.type === "reserved") {
      confirm({
        title: "Bàn đặt trước",
        message: `Bàn ${table.number} đã được đặt trước.`,
        confirmText: "Khách đã đến",
        cancelText: "Hủy đặt bàn",
        showClose: true,
        onConfirm: async () => {
          try {
            await TableApi.updateStatus(table.id, "occupied");
            success(`Khách đã vào bàn ${table.number}`);
          } catch (err: any) {
            error("Cập nhật trạng thái thất bại");
          }
        },
        onCancel: async () => {
          try {
            await TableApi.updateStatus(table.id, "available");
            success(`Đã hủy đặt bàn ${table.number}`);
          } catch (err: any) {
            error("Cập nhật trạng thái thất bại");
          }
        },
      })
    }
  }

  const renderItem = ({ item }: { item: TableInterface }) => {
    const bgColor = tableColor(item.status);
    const action = getNextAction(item);

    return (
      <TouchableOpacity
        disabled={!item.is_active}
        onPress={() => {}}
        style={[
          styles.tableCard,
          { backgroundColor: bgColor },
          !item.is_active && { opacity: 0.4 },
        ]}
      >
        <Text style={styles.tableNumber}>Bàn: {item.number}</Text>
        <Text style={styles.tableCapacity}>{item.capacity} chỗ</Text>
        {item.status === "reserved" && (
          <Text style={styles.reserveHint}>⏰ Có đặt trước</Text>
        )}

        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePressTable(item)}
          >
            <Text style={styles.actionText}>{action.text}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tables}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
        contentContainerStyle={{}}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.titleHeader}>Danh sách bàn</Text>

              <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.userIcon}>
                <Icon name='user' size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Lọc theo status */}
            <View style={styles.filterRow}>
              <TouchableOpacity 
                onPress={() => setStatusFilter("all")}
                style={[
                  styles.statusButton,
                  statusFilter === "all" && {
                    borderColor: statusBorderColor.all,
                    borderWidth: 2,
                  },
                  { backgroundColor: statusColor.all },
                ]}
              >
                <Text style={styles.statusTextButton}>Tất cả</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatusFilter("available")}
                style={[
                  styles.statusButton,
                  statusFilter === "available" && {
                    borderColor: statusBorderColor.available,
                    borderWidth: 2,
                  },
                  { backgroundColor: statusColor.available },
                ]}
              >
                <Text style={styles.statusTextButton}>Trống</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatusFilter("occupied")}
                style={[
                  styles.statusButton,
                  statusFilter === "occupied" && {
                    borderColor: statusBorderColor.occupied,
                    borderWidth: 2,
                  },
                  { backgroundColor: statusColor.occupied },
                ]}
              >
                <Text style={styles.statusTextButton}>Có khách</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStatusFilter("reserved")}
                style={[
                  styles.statusButton,
                  statusFilter === "reserved" && {
                    borderColor: statusBorderColor.reserved,
                    borderWidth: 2,
                  },
                  { backgroundColor: statusColor.reserved },
                ]}
              >
                <Text style={styles.statusTextButton}>Đặt trước</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  )
}

export default TableList

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0066cc",
    paddingHorizontal: 12,
  },
  userIcon: {
    position: "absolute",
    right: 12,
  },
  titleHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  filterRow: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eeeeee",
    gap: 10,
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 3,
    alignItems: "center",
    elevation: 5,
  },
  statusTextButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  tableCard: {
    width: CARD_WIDTH,
    height: 110,
    borderRadius: 8,
    elevation: 7,
    alignItems: "center",
    padding: 10,
  },
  tableNumber: {
    width: '100%',
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  tableCapacity: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  reserveHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#fff",
    fontStyle: "italic",
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 3,
},
  actionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },

})