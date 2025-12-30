import { StyleSheet, Text, View, ScrollView, TouchableOpacity, } from 'react-native'
import React, { useState, useEffect } from 'react'
// navifation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
// component
import { AppLoadingOverlay, AppStatusSwitch } from '../../components'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { UserApi, type UserInterface } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// utils
import { formatDateTime } from '../../utils/date'


type AdminUserDetailRouteProp = RouteProp<AdminStackParamList, "UserDetail">;

const UserDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const route = useRoute<AdminUserDetailRouteProp>();
  const userId = route.params?.userId;

  const [ user, setUser ] = useState<UserInterface>();
  const [ loading, setLoading ] = useState(false);
  const { success, error, confirm } = useNotify();

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

  useEffect(() => {
    if (userId) {
      loadUserById(userId);
    }
  }, [userId]);

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

            <View style={styles.item}>
              <Text style={styles.label}>* Chức vụ:</Text>
              <Text style={styles.value}>{ROLE_LABEL[user.role] ?? user.role}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Trạng thái tài khoản:</Text>
              <Text style={styles.value}>{user.is_active ? "Hoạt động" : "Đã khóa"}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Ngày tạo:</Text>
              <Text style={styles.value}>{formatDateTime(user.date_joined)}</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#3a9bfb"} ]} onPress={() => {}}>
                <Text style={styles.textButton}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#ff3737"} ]} onPress={() => {}}>
                <Text style={styles.textButton}>Xoá</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        <AppLoadingOverlay
          visible={loading}
          title='Đang tải...'
        />
      </ScrollView>
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

})