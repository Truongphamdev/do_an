import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, FlatList, Animated } from 'react-native'
import React, { useState, useCallback } from 'react'
// component
import { AdminHeader } from '../../components'
// api
import { UserApi, type UserInterface, type userRole } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import { opacity } from 'react-native-reanimated/lib/typescript/Colors'


const AdminStaff = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ users, setUsers ] = useState<UserInterface[]>([]);
  const { error } = useNotify();


  const [ searchText, setSearchText ] = useState("");
  const [ selectedRole, setSelectedRole ] = useState<userRole | undefined>(undefined);
  const [ selectedActive, setSelectedActive ] = useState<boolean | undefined>(undefined);

  const DEFAULT_QUERY = {
    search: "",
    role: undefined as userRole | undefined,
    is_active: undefined as boolean | undefined,
  };
  const [ query, setQuery ] = useState<typeof DEFAULT_QUERY>(DEFAULT_QUERY);

  const ROLE_LABEL: Record<UserInterface["role"], string> = {
    waiter: "Phục vụ",
    chef: "Đầu bếp",
    cashier: "Thu ngân",
    customer: "Khách hàng",
  };
  const ROLE_OPTIONS: { label: string; value?: userRole }[] = [
    { label: "Tất cả", value: undefined },
    { label: "Phục vụ", value: "waiter" },
    { label: "Đầu bếp", value: "chef" },
    { label: "Thu ngân", value: "cashier" },
    { label: "Khách hàng", value: "customer" },
  ];
  const ACTIVE_OPTIONS: { label: string; value: boolean | undefined }[] = [
    { label: "Tất cả", value: undefined },
    { label: "Hoạt động", value: true },
    { label: "Đã khóa", value: false },
  ];

  // hàm lấy danh sách người dùng
  const fetchUsers = useCallback(async () => {
    try {
      const users = await UserApi.getList({
        search: query.search || undefined,
        role: query.role,
        is_active: query.is_active,
      });

      const sorted = [...users].sort(
        (a, b) => 
          new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime()
      );

      setUsers(sorted);
    } catch (err: any) {
      error("Lấy danh sách người dùng thất bại!");
    }
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );


  // --- STATE VÀ ANIMATION MENU FILTER ---
  // state dành cho menu filter
  const [ filterOpen, setFilterOpen ] = useState(false);
  const filterAnim = useState(new Animated.Value(300))[0];
  const filterFade = useState(new Animated.Value(0))[0];
  // chức năng mở menu filter
  const openFilter = () => {
    setFilterOpen(true);
    Animated.parallel([
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(filterFade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  };
  // chức năng đóng menu filter
  const closeFilter = () => {
    Animated.parallel([
      Animated.timing(filterAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(filterFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setFilterOpen(false));
  };



  // hàm cofirm search + filter
  const applySearchFilter = () => {
    setQuery({
      search: searchText.trim(),
      role: selectedRole,
      is_active: selectedActive,
    });
  };
  // hàm reset filter
  const handleResetFilter = () => {
    setSelectedRole(undefined);
    setSelectedActive(undefined);
    setQuery(DEFAULT_QUERY);
    setFilterOpen(false);
  }
  // hàm reset search
  const handleClearSearch = () => {
    setSearchText("");
    setQuery(prev => ({
      ...prev,
      search: "",
    }));
  };


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
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3a9bfb" }]} onPress={() => navigation.navigate("AdminAddStaff", { userId: item.id })}>
          <Text style={styles.actionTextButton}>Sửa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchButton}>
                <Icon name='times-circle' size={16} color="#909090" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={applySearchFilter} style={styles.searchButton}>
            <Icon name='search' size={16} color="#909090"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={openFilter} style={styles.filterButton}>
            <Icon name='filter' size={16} color="#909090"/>
          </TouchableOpacity>
        </View>

        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={{ padding: 5, marginTop: 5, }}
        />
      </ScrollView>

      {/* FILTER */}
      {filterOpen && (
        <>
          <Animated.View style={[ styles.overlayFilter, { opacity: filterFade}]} pointerEvents={filterOpen ? "auto" : "none"}>
            <TouchableOpacity style={{ flex: 1, }} activeOpacity={1} onPress={closeFilter} />
          </Animated.View>

          <Animated.View style={[
              styles.containerMenuFilter,
              {
                opacity: filterFade,
                transform: [{ translateX: filterAnim }],
              }
            ]}
          >
            <Text style={styles.filterTitle}>Lọc</Text>
            {/* Role filter */}
            <Text style={styles.filterOptionTitle}>Vai trò:</Text>
            <View style={styles.filterOptions}>
              {ROLE_OPTIONS.map((role) => {
                const isActive = selectedRole === role.value;

                return (
                  <TouchableOpacity
                    key={role.label}
                    style={[
                      styles.filterOption,
                      isActive && styles.filterActive
                    ]}
                    onPress={() => setSelectedRole(role.value)}
                  >
                    <Text
                      style={[
                      styles.filterTextOption,
                      isActive && { color: "#fff", fontWeight: "bold" }
                    ]}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* active filter */}
            <Text style={styles.filterOptionTitle}>Trạng thái hoạt động:</Text>
            <View style={styles.filterOptions}>
              {ACTIVE_OPTIONS.map((option) => {
                const isActive = selectedActive === option.value;

                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.filterOption,
                      isActive && styles.filterActive
                    ]}
                    onPress={() => setSelectedActive(option.value)}
                  >
                    <Text
                      style={[
                        styles.filterTextOption,
                        isActive && { color: "#fff", fontWeight: "bold" }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View style={styles.filterActionButtons}>
              <TouchableOpacity style={[styles.filterActionButton, { backgroundColor: "#909090" }]} onPress={handleResetFilter}>
                <Text style={styles.filterActionTextButton}>Bỏ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterActionButton, { backgroundColor: "#FCB35E" }]} onPress={() => {applySearchFilter(); closeFilter();}}>
                <Text style={styles.filterActionTextButton}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

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


  // FILTER STYLE
  overlayFilter: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 900,
  },
  containerMenuFilter: {
    position: "absolute",
    backgroundColor: "#fff",
    top: 0,
    right: 0,
    width: 260,
    zIndex: 999,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 28,
    padding: 10,
    fontWeight: "900",
    color: "#fff",
    backgroundColor: "#1ABDBE",
  },
  filterOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1ABDBE",
    marginTop: 8,
    marginLeft: 10,
  },
  filterOptions: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#909090",
  },
  filterTextOption: {
    fontSize: 16,
    color: "#333",
  },
  filterActive: {
    backgroundColor: "#1ABDBE",
    borderColor: "#1ABDBE",
  },
  filterActionButtons: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  filterActionButton: {
    width: '40%',
    borderRadius: 3,
    padding: 5,
  },
  filterActionTextButton: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
})