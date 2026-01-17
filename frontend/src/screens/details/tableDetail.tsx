import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useCallback } from 'react'
// navigation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { AdminNav, AdminStackParamList } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { TableApi, type TableInterface } from '../../api/table.api'
// notify
import { useNotify } from '../../providers/notificationProvider'
// utils
import { formatDateTime } from '../../utils/date'
// component
import { AppLoadingOverlay, AppStatusSwitch } from '../../components'

type AdminTableDetailRoute = RouteProp<AdminStackParamList, "TableDetail">;

const TableDetail = () => {
  const navigation = useNavigation<AdminNav>();
  const route = useRoute<AdminTableDetailRoute>();
  const tableId = route.params?.tableId;

  const { success, error, confirm } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const [table, setTable] = useState<TableInterface | null>(null);

  const loadTableById = async (id: number) => {
    try {
      const data = await TableApi.getById(id);
      setTable(data);
    } catch (err: any) {
      error("Lấy thông tin bàn theo ID thất bại!");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (tableId) {
        loadTableById(tableId);
      }
    }, [tableId])
  );

  // const handleDelete = (id: number) => {
  //   confirm({
  //     title: "Thông báo",
  //     message: "Bạn có chắc chắn muốn xóa bàn này?",
  //     onConfirm: async () => {
  //       try {
  //         await TableApi.remove(id);
  //         success("Xóa bàn thành công!");
  //         navigation.goBack();
  //       } catch {
  //         error("Xóa bàn thất bại!");
  //       }
  //     }
  //   });
  // };

  const renderStatus = (status?: string) => {
    switch (status) {
      case "available":
        return "Trống";
      case "occupied":
        return "Đang sử dụng";
      case "reserved":
        return "Đã đặt";
      default:
        return "Không xác định";
    }
  };

  // hàm bật/tắt hoạt động của bạn
  const handleToggleSwitch = async (id: number) => {
    if (!table) return;

    const newStatus = !table.is_active;

    confirm({
      title: "Xác nhận",
      message: `Bạn có muốn ${newStatus ? "bật" : "tắt"} hoạt động của bàn này không?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          if (table.is_active) {
            await TableApi.disable(id);
          } else {
            await TableApi.enable(id);
          }
          setTable(prev => prev ? {...prev, is_active: newStatus} : prev);
          success("Cập nhật thành công.");
        } catch (err: any) {
          error("Cập nhật thất bại!");
        } finally {
          setLoading(false);
        }
      }
    })
  }

  return (
    <>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
        <Icon name="arrow-left" style={styles.iconGoBack} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.titleHeader}>Chi tiết bàn</Text>

        {!table ? (
          <View style={styles.screenNotFound}>
            <Text>Không tìm thấy thông tin bàn!</Text>
          </View>
        ) : (
          <View style={styles.screenDetail}>

            <View style={styles.item}>
              <Text style={styles.label}>* Số bàn:</Text>
              <Text style={styles.value}>{table.number}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Sức chứa:</Text>
              <Text style={styles.value}>{table.capacity} người</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Trạng thái:</Text>
              <Text style={styles.value}>{renderStatus(table.status)}</Text>
            </View>

            <View style={[styles.item, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
              <View>
                <Text style={styles.label}>* Hoạt động:</Text>
                <Text style={styles.value}>
                  {table.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
                </Text>
              </View>
              <AppStatusSwitch
                value={!!table?.is_active}
                onToggle={() => handleToggleSwitch(table.id)}
              />
            </View>

            {table.created_at && (
              <View style={styles.item}>
                <Text style={styles.label}>* Ngày tạo:</Text>
                <Text style={styles.value}>
                  {formatDateTime(table.created_at)}
                </Text>
              </View>
            )}

            {table.updated_at && (
              <View style={styles.item}>
                <Text style={styles.label}>* Ngày cập nhật:</Text>
                <Text style={styles.value}>
                  {formatDateTime(table.updated_at)}
                </Text>
              </View>
            )}

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#3a9bfb" }]}
                onPress={() =>
                  navigation.navigate("AdminAddTable", { tableId: table.id })
                }
              >
                <Text style={styles.textButton}>Sửa</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ff3737" }]}
                onPress={() => handleDelete(table.id)}
              >
                <Text style={styles.textButton}>Xóa</Text>
              </TouchableOpacity> */}
            </View>

          </View>
        )}
      </View>

      <AppLoadingOverlay
        visible={loading}
        title='Đang tải...'
      />
    </>
  );
};

export default TableDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  titleHeader: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: "#0066cc",
  },
  goBackButton: {
    position: "absolute",
    top: 20,
    left: 20,
    height: 50,
    width: 50,
    zIndex: 999,
  },
  iconGoBack: {
    fontSize: 20,
    color: "#545454",
  },

  screenNotFound: {
    padding: 5,
  },
  screenDetail: {
    padding: 5,
  },
  item: {
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#a4a4a4",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    marginTop: 5,
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 5,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  textButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
