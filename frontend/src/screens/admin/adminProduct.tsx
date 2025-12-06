import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, TextInput, Animated, Easing } from 'react-native'
import React, { useState, useEffect } from 'react'
import AdminHeader from '../../components/adminHeader'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import Icon from "react-native-vector-icons/FontAwesome5"
import { ProductApi, type ProductInterface } from '../../api/product.api'
import { useNotify } from '../../providers/notificationProvider'

// ảnh mặc định khi ko lấy được dữ liệu ảnh
const placeholderImageProduct = require("../../assets/images/placeholderProduct.png");


const AdminProduct = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ search, setSearch ] = useState("");
  const [ products, setProducts ] = useState<ProductInterface[]>([]);
  const { success, error, confirm } = useNotify();

  // Khi khởi động màn hình app thì gọi các hàm trong useEffect
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const data = await ProductApi.getAll();
      
      const productWithImages = data.map(product => ({
        ...product,
        image: product.image_url ?? "https://via.placeholder.com/40x30"
      }));

      setProducts(productWithImages);
    } catch (err: any) {
      error("Lấy danh sách sản phẩm thất bại!");
    }
  }

  // --- STATE VÀ ANIMATION FAB ---
  // state dành cho menu FAB
  const [ isOpen, setIsOpen ] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  // Chức năng mở menu FAB
  const openMenu = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };
  // hàm đóng menu FAB
  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {setIsOpen(false);});
  };

  // Chức năng xóa sản phẩm
  const handleDelete = async (id: number) => {
    confirm({
      title: "Thông báo",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      onConfirm: async () => {
        try {
          await ProductApi.remove(id);
          success("Xóa sản phẩm thành công!");
        } catch (err: any) {
          error("Xóa sản phẩm thất bại!");
        }
      },
    });
  };

  // hàm render item cho flatlist
  const renderItem = ({ item, index}: { item: ProductInterface, index: number}) => (
    <View style={styles.itemProduct}>
      <Text style={styles.serialNumber}>{index + 1}</Text>
      <View style={styles.imageProductWrapper}>
        <Image source={ item.image ? { uri: item.image } : placeholderImageProduct} style={styles.image}/>
      </View>
      <View style={styles.informationProduct}>
        <Text style={styles.itemInformationProduct}>{item.name}</Text>
        <Text style={styles.itemInformationProduct}>{item.category_name}</Text>
        <Text style={styles.itemInformationProduct}>{Number(item.price).toLocaleString("vi-VN")} VNĐ</Text>
      </View>
      <View style={styles.actionProductButtons}>
        <TouchableOpacity style={[styles.actionProductButton, { backgroundColor: "#3a9bfb" }]} onPress={() => navigation.navigate("AdminAddProduct", { productId: item.id })}>
          <Text style={styles.actionProductTextButton}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionProductButton, { backgroundColor: "#ff3737" }]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionProductTextButton}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <View style={styles.container}>
        <AdminHeader
          title='Quản lý sản phẩm'
          showBell
          style={styles.iconBell}
        />

        <View style={styles.containerSearch}>
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder='Tìm kiếm'
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={undefined} style={styles.searchButton}>
            <Icon name='search' size={16} color="#fff"/>
          </TouchableOpacity>
        </View>
        
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            style={{ padding: 5, marginTop: 5, }}
          />
        ) : (
          <View style={styles.listNoProduct}>
            <Icon name='utensils' size={80} color="#1ABDBE"/>
            <Text style={styles.textListNoProduct}>Hiện tại chưa có sản phẩm. Vui lòng thêm sản phẩm!</Text>
          </View>
        )}

      </View>
      
      

      {/* Nút FAB */}
      <TouchableOpacity style={styles.fabButton} onPress={() => (isOpen ? closeMenu() : openMenu() )}>
        <Icon name={isOpen ? 'times' : 'plus'} size={24} color='#fff'/>
      </TouchableOpacity>

      {/* --- OVERLAY --- */}
      <Animated.View style={[ styles.overlay, { opacity: fadeAnim }]} pointerEvents={isOpen ? "auto" : "none"}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeMenu}/>
      </Animated.View>

      {/* --- MENU TRƯỢT LÊN --- */}
      {/* Menu các lựa chon khi nhấn nút FAB (nút +) */}
      <View style={styles.containerMenuOptionFab} pointerEvents={isOpen ? "auto" : "none"}>
        <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
        >
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Thêm sản phẩm</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#ffb92d" }]} onPress={() => { closeMenu(); navigation.navigate('AdminAddProduct', {}) }}>
              <Icon name='utensils' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Thêm danh mục</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#0080FF" }]} onPress={() => { closeMenu(); navigation.navigate('AdminCategory') }}>
              <Icon name='th-large' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </>
  )
}

export default AdminProduct

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexGrow: 1,
    backgroundColor: "#CEE1E6",
  },

  // icon thông báo
  iconBell: {
    color: "#b1b1b1",
  },

  // input tìm kiếm
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 42,
    elevation: 5,
  },
  searchInput: {
    flex: 3,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: "100%",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 2,
    borderColor: "#1ABDBE",
  },
  searchButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1ABDBE",
    height: "100%",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 2,
    borderColor: "#1ABDBE",
  },

  // style FAB button + menu option
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
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(235, 229, 229, 0.4)",
    zIndex: 900,
  },
  containerMenuOptionFab: {
    position: "absolute",
    bottom: 90,
    right: 24,
    zIndex: 999,
  },
  itemFab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  itemFabLabel: {
    marginRight: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 16,
    elevation: 1,
  },
  itemFabButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },

  // style list product
  listNoProduct: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textListNoProduct: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },

  // style cho từng item product
  itemProduct:{
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 5,
  },
  serialNumber: {
    flex: 0.7,
    paddingVertical: 5,
    fontSize: 16,
  },
  imageProductWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: 45,
    height: 45,
  },
  informationProduct: {
    flex: 3,
    paddingLeft: 10,
    justifyContent: "center",
  },
  itemInformationProduct: {
    fontSize: 16,
  },
  actionProductButtons: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  actionProductButton: {
    padding: 5,
    borderRadius: 3,
  },
  actionProductTextButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

})