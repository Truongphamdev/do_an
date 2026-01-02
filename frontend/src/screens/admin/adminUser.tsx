import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
// component
import { AdminHeader } from '../../components'
// api
import { UserApi, type UserInterface } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'


const AdminStaff = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ users, setUsers ] = useState<UserInterface[]>([]);
  const { success, error, confirm } = useNotify();


  const [ searchText, setSearchText ] = useState("");

  const ROLE_LABEL: Record<UserInterface["role"], string> = {
    waiter: "Phục vụ",
    chef: "Đầu bếp",
    cashier: "Thu ngân",
    customer: "Khách hàng",
  };

  // hàm lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const users = await UserApi.getAll();

      const sorted = [...users].sort(
        (a, b) => 
          new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime()
      );

      setUsers(sorted);
    } catch (err: any) {
      error("Lấy danh sách người dùng thất bại!");
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // hàm render
  const renderItem = ({item, index}: {item: UserInterface, index: number}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {navigation.navigate("UserDetail", { userId: item.id })}}
      activeOpacity={0.7}
    >
      <Text style={styles.serialNumber}>{index + 1}</Text>
      {/* Thông tin */}
      <View style={styles.content}>
        {/* name + is_active */}
        <View style={styles.nameWrapper}>
          <Text style={styles.fullname}>
            {item.first_name} {item.last_name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.is_active ? "#34d418" : "#FCB35E" }
            ]}
          >
            <Text style={styles.statusText}>
              {item.is_active ? "Hoạt động" : "Đã khóa"}
            </Text>
          </View>
        </View>
        {/* username + email */}
        <Text style={styles.subText}>
          @{item.username} | {item.email}
        </Text>
        {/* role + phone */}
        <Text style={styles.metaText}>
          {ROLE_LABEL[item.role] ?? item.role} | {item.phone}
        </Text>
      </View>
      {/* edit + remove */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3a9bfb" }]} onPress={() => {}}>
          <Text style={styles.actionTextButton}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#ff3737" }]} onPress={() => {}}>
          <Text style={styles.actionTextButton}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <>
      <View style={styles.container}>
        <AdminHeader
          title='Quản lý người dùng'
        />

        <View style={styles.boxSearch}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              placeholder='Tìm kiếm'
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => {}} style={styles.clearSearchButton}>
                <Icon name='times-circle' size={16} color="#909090" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => {}} style={styles.searchButton}>
            <Icon name='search' size={16} color="#909090"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={styles.filterButton}>
            <Icon name='filter' size={16} color="#909090"/>
          </TouchableOpacity>
        </View>

        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={{ padding: 5, marginTop: 5, }}
        />
      </View>

      <TouchableOpacity style={styles.fabButton} onPress={() => {navigation.navigate("AdminAddStaff", {})}}>
        <Icon name='plus' size={24} color="#fff" />
      </TouchableOpacity>
    </>
  )
}

export default AdminStaff

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#e1f3f8",
  },
  // input tìm kiếm
  boxSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 42,
    paddingHorizontal: 5,
  },
  searchInputWrapper: {
    flex: 3,
    height: '100%',
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    height: "100%",
  },
  clearSearchButton: {
    paddingHorizontal: 10,
  },
  searchButton: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: "100%",
    elevation: 5,
  },
  filterButton: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    height: "100%",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    elevation: 5,
  },
  
  // fab button
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1ABDBE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 999,
  },

  // list user
  card: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 5,
  },
  serialNumber: {
    width: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  content: {
    flex: 3,
    paddingLeft: 16,
    gap: 2,
  },
  nameWrapper: {
    position: "relative",
    backgroundColor: "#eef7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  fullname: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    position: "absolute",
    top: -8,
    right: -30,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  subText: {
    color: "#707070",
    fontSize: 14,
  },
  metaText: {
    color: "#707070",
    fontSize: 14,
  },
  actionButtons: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  actionButton: {
    padding: 5,
    borderRadius: 3,
  },
  actionTextButton: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  isActive: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 50,
    elevation: 3,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 100,
  },
})