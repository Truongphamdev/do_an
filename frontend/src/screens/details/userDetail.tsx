import { StyleSheet, Text, View, ScrollView, TouchableOpacity, } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
// navifation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { AdminStackParamList, AdminNav } from '../../navigation/adminStackNavigation'
// component
import { AppLoadingOverlay, AppStatusSwitch } from '../../components'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { UserApi, type UserInterface, type staffRole } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// utils
import { formatDateTime } from '../../utils/date'


type AdminUserDetailRoute = RouteProp<AdminStackParamList, "UserDetail">;

const UserDetail = () => {
  const navigation = useNavigation<AdminNav>();
  const route = useRoute<AdminUserDetailRoute>();
  const userId = route.params?.userId;

  const [ user, setUser ] = useState<UserInterface>();
  const [ loading, setLoading ] = useState(false);
  const { success, error, confirm } = useNotify();

  const [ roleModalVisible, setRoleModalVisible ] = useState(false);

  const ROLE_LABEL: Record<UserInterface["role"], string> = {
    waiter: "Phục vụ",
    chef: "Đầu bếp",
    cashier: "Thu ngân",
    customer: "Khách hàng",
  }

  const loadUserById = async (id: number) => {
    setLoading(true);
    try {
      const data = await UserApi.getById(id);
      setUser(data);
    } catch (err: any) {
      error("Lấy thông tin người dùng thất bại!");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadUserById(userId);
      }
    }, [userId])
  );

  // hàm cập nhập trạng thái tài khoản
  const handleToggleSwitch = async (id: number) => {
    if (!user) return;
    
    const newStatus = !user.is_active;

    confirm({
      title: "Xác nhận",
      message: `Bạn có muốn ${newStatus ? "mở khóa" : "khóa"} tài khoản nay không?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          if (user.is_active) {
            await UserApi.disable(id);
          } else {
            await UserApi.enable(id);
          }

          setUser(prev => prev ? { ...prev, is_active: newStatus} : prev);

          success("Cập nhật trạng thái thành công!");
        } catch (err: any) {
          error("Cập nhật thất bại!");
        } finally {
          setLoading(false);
        }
      },
    });
  }

  // chức năng đổi role
  const STAFF_ROLE: staffRole[] = ["waiter", "cashier", "chef"];

  const getAvailableRoles = (currentRole: staffRole) => {
    return STAFF_ROLE.filter((role) => role !== currentRole);
  };

  const handleChangeRole = async (id: number, newRole: staffRole) => {
    if (!user) return;

    const oldRole = user.role;
    setUser({ ...user, role: newRole});

    setLoading(true);
    try {
      await UserApi.changeRole(id, newRole);
      success("Đổi vai trò thành công!");
    } catch (err: any) {
      setUser({ ...user, role: oldRole});
      error("Đổi vai trò thất bại!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Icon name='arrow-left' style={styles.iconGoBack}/>
        </TouchableOpacity>

        {!user ? (
          <View style={styles.screenNotUser}>
            <Text>Không tìm thấy thông tin sản phẩm!</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.titleHeader}>Thông tin người dùng</Text>

            <View style={styles.item}>
              <Text style={styles.label}>* Họ và tên:</Text>
              <Text style={styles.value}>{user.first_name} {user.last_name}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Tên tài khoản:</Text>
              <Text style={styles.value}>{user.username}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Số điện thoại:</Text>
              <Text style={styles.value}>{user.phone}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Địa chỉ:</Text>
              <Text style={styles.value}>{user.address}</Text>
            </View>

            <View style={[styles.item, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
              <View>
                <Text style={styles.label}>* Vai trò:</Text>
                <Text style={styles.value}>{ROLE_LABEL[user.role] ?? user.role}</Text>
              </View>
              <TouchableOpacity style={styles.roleChangeButton} onPress={() => setRoleModalVisible(true)}>
                <Text style={styles.roleChangeTextButton}>Đổi vai trò</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.item, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
              <View>
                <Text style={styles.label}>* Trạng thái tài khoản:</Text>
                <Text style={styles.value}>{user.is_active ? "Hoạt động" : "Đã khóa"}</Text>
              </View>
              <AppStatusSwitch
                value={user.is_active}
                onToggle={() => handleToggleSwitch(user.id)}
              />
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Ngày tạo:</Text>
              <Text style={styles.value}>{formatDateTime(user.date_joined)}</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#3a9bfb"} ]} onPress={() => navigation.navigate("AdminAddStaff", { userId: user.id })}>
                <Text style={styles.textButton}>Sửa</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        <AppLoadingOverlay
          visible={loading}
          title='Đang tải...'
        />
      </ScrollView>

      {roleModalVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
            onPress={() => setRoleModalVisible(false)}
          />
          <View style={styles.roleModal}>
            {getAvailableRoles(user!.role as staffRole).map((role) => (
              <TouchableOpacity
                key={role}
                style={styles.roleOption}
                onPress={() => {
                  handleChangeRole(user!.id, role);
                  setRoleModalVisible(false);
                }}
              >
                <Text style={styles.roleOptionText}>{ROLE_LABEL[role]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.roleCancel} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.roleCancelText}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  )
}

export default UserDetail

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  goBackButton: {
    position: "absolute",
    left: 20,
    top: 20,
    width: 50,
    height: 50,
    zIndex: 999,
  },
  iconGoBack: {
    fontSize: 20,
    color: "#545454",
  },

  // list user
  screenNotUser: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: "#1ABDBE",
    textAlign: "center",
    marginBottom: 10,
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

  // role button
  roleChangeButton: {
    backgroundColor: "#FCB35E",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    elevation: 5,
  },
  roleChangeTextButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // role modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  roleModal: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    zIndex: 9999,
  },
  roleOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  roleCancel: {
    marginTop: 15,
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  roleCancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})