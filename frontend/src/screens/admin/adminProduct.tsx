import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, TextInput, Animated, Easing } from 'react-native'
import React, { useState, useCallback } from 'react'
// componet tái sử dụng
import { AppStatusSwitch, AdminHeader } from '../../components'
// navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { ProductApi, type ProductInterface } from '../../api/product.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// hook
import { useCategories } from '../../hooks/useCategories'
// webSocket
import { useWebSocket } from '../../hooks/useWebsocket'

// ảnh mặc định khi ko lấy được dữ liệu ảnh
const placeholderImageProduct = require("../../assets/images/placeholderProduct.png");


const AdminProduct = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ products, setProducts ] = useState<ProductInterface[]>([]);
  const { success, error, confirm } = useNotify();
  const { categories } = useCategories();

  const [ searchText, setSearchText ] = useState("");
  const [ selectedCategory, setSelectedCategory ] = useState<number | null>(null);
  const [ minPrice, setMinPrice ] = useState<string>("");
  const [ maxPrice, setMaxPrice ] = useState<string>("");
  const [ selectedPriceRange, setSelectedPriceRange ] = useState<number >(0);

  const [ query, setQuery ] = useState({
    search: "",
    category: null as number | null,
    minPrice: "",
    maxPrice: "",
  });
  const DEFAULT_QUERY = {
    search: "",
    category: null as number | null,
    minPrice: "",
    maxPrice: "",
  };

  // Hàm lấy danh sách sản phẩm
  const fetchProducts = useCallback(async () => {
    try {
      const products = await ProductApi.getList({
        search: query.search || undefined,
        category: query.category ?? undefined,
        min_price: query.minPrice ? Number(query.minPrice) : undefined,
        max_price: query.maxPrice ? Number(query.maxPrice) : undefined,
      }); 
      
      const productWithImages = products.map(product => ({
        ...product,
        image: product.image_url ?? "https://via.placeholder.com/40x30"
      }));

      const sorted = [...productWithImages].sort((a, b) => {
        const ta = Date.parse(a.created_at ?? "") || 0;
        const tb = Date.parse(b.created_at ?? "") || 0;
        return tb - ta;
      });

      setProducts(sorted);
    } catch (err: any) {
      error("Lấy danh sách sản phẩm thất bại!");
    }
  }, [query]);

  // Khi khởi động màn hình app thì gọi các hàm trong useEffect
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  // --- REALTIME PRODUCT ---
  useWebSocket((message) => {
    console.log("📌 Realtime product:", message);

    switch(message.type) {
      case "PRODUCT_CREATED":
        setProducts(prev => [
          {
            ...message.product,
            image: message.product.image_url ?? "https://via.placeholder.com/40x30"
          },
          ...prev,
        ]);
        break;
        
      case "PRODUCT_UPDATED":
        setProducts(prev =>
          prev.map(item =>
            item.id === message.product.id
            ? {
                ...message.product,
                image: message.product.image_url ?? "https://via.placeholder.com/40x30"
              }
            : item
          )
        );
        break;

      case "PRODUCT_DELETED":
        setProducts(prev => prev.filter(item => item.id !== message.id));
        break;

      default:
        console.log("❓ Unknown realtime type", message.type);
    }
  }, 'ws://10.0.2.2:8000/ws/products/');

  // --- REALTIME IMAGE UPDATE ---
  useWebSocket((message) => {
    console.log("📌 Realtime image:", message);

    if (message.type === "IMAGE_UPDATED" || message.type === "IMAGE_CREATED") {
      setProducts(prev =>
        prev.map(item =>
          item.id === message.product_id
          ? {
              ...item,
              image: message.image_url ?? "https://via.placeholder.com/40x30"
            }
          : item
        )
      );
    }
    if (message.type === "IMAGE_DELETED") {
      setProducts(prev =>
        prev.map(item =>
          item.id === message.product_id
          ? {
            ...item,
            image: message.was_primary ? "https://via.placeholder.com/40x30" : item.image
          }
          : item
        )
      )
    }
  }, 'ws://10.0.2.2:8000/ws/images/');


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


  // Chức năng cập nhật trạng thái sản phẩm
  const handleToggleStatus = async (id: number) => {
    try {
      const product = products.find(prev => prev.id === id);
      if (!product) return;

      const newStatus = product.status === "available" ? "unavailable" : "available";

      await ProductApi.updateStatus(id, newStatus);
    } catch (err: any) {
      error("Cập nhật trạng thái sản phẩm thất bại!");
    }
  }
  // Mảng khoảng giá
  const PRICE_RANGE = [
    { id: 0, label: "Tất cả", min: null, max: null },
    { id: 1, label: "< 100.000đ", min: 0, max: 100000 },
    { id: 2, label: "100.000đ - 200.000đ", min: 100000, max: 200000 },
    { id: 3, label: "200.000đ - 300.000đ", min: 200000, max: 300000 },
    { id: 4, label: "> 300.000đ", min: 300000, max: null },
  ];
  // hàm chọn khoảng giá
  const handleSelectedPriceRange = (index: number) => {
    const range = PRICE_RANGE[index];
    setSelectedPriceRange(index);

    if (range.min === null && range.max === null) {
      setMinPrice("");
      setMaxPrice("");
    } else {
      setMinPrice(range.min !== null ? String(range.min) : "");
      setMaxPrice(range.max !== null ? String(range.max) : "");
    }
  }
  // hàm confirm search + filter
  const applySearchFilter = () => {
    setQuery({
      search: searchText.trim(),
      category: selectedCategory,
      minPrice,
      maxPrice,
    });
  };
  // hàm reset phần filter
  const handleResetFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory(null);
    setSelectedPriceRange(0);
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



  // --- STATE VÀ ANIMATION FAB ---
  // state dành cho menu FAB
  const [ fabOpen, setFabOpen ] = useState(false);
  const fabFade = useState(new Animated.Value(0))[0];
  const fabAnim = useState(new Animated.Value(50))[0];
  // Chức năng mở menu FAB
  const openMenuFab = () => {
    setFabOpen(true);
    Animated.parallel([
      Animated.timing(fabFade, {
        toValue: 1,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };
  // hàm đóng menu FAB
  const closeMenuFab = () => {
    Animated.parallel([
      Animated.timing(fabFade, {
        toValue: 0,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fabAnim, {
        toValue: 50,
        duration: 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {setFabOpen(false);});
  };

  // --- STATE VÀ ANIMATION MENU FILTER ---
  // state dành cho menu filter
  const [ filterOpen, setFilterOpen ] = useState(false);
  const filterAnim = useState(new Animated.Value(300))[0]; // từ ngoài màn
  const filterFade = useState(new Animated.Value(0))[0];
  // chức năng mở menu filter
  const openMenuFilter = () => {
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
      }),
    ]).start();
  };
  // chức năng đóng menu filter
  const closeMenuFilter = () => {
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




  // hàm render item cho flatlist
  const renderItem = ({ item, index}: { item: ProductInterface, index: number}) => (
    <TouchableOpacity
      style={styles.itemProduct}
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      activeOpacity={0.7}
    >
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
        <View style={styles.addAndEditButton}>
          <TouchableOpacity style={[styles.actionProductButton, { backgroundColor: "#3a9bfb" }]} onPress={() => navigation.navigate("AdminAddProduct", { productId: item.id })}>
            <Text style={styles.actionProductTextButton}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionProductButton, { backgroundColor: "#ff3737" }]} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionProductTextButton}>Xóa</Text>
          </TouchableOpacity>
        </View>
        <AppStatusSwitch
          onToggle={() => handleToggleStatus(item.id)}
          value={item.status === "available"}
          style={styles.swithButton}
          textStyle={{ color: item.status === "available" ? "#1ABDBE" : "#6d6d6d" }}
        />
      </View>
    </TouchableOpacity>
  )




  return (
    <>
      <View style={styles.container}>
        <AdminHeader
          title='Quản lý sản phẩm'
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
          <TouchableOpacity onPress={openMenuFilter} style={styles.filterButton}>
            <Icon name='filter' size={16} color="#909090"/>
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
      
      
      {/* MUNE BUTTON FAB */}
      {/* Nút FAB */}
      <TouchableOpacity style={styles.fabButton} onPress={() => (fabOpen ? closeMenuFab() : openMenuFab() )}>
        <Icon name={fabOpen ? 'times' : 'plus'} size={24} color='#fff'/>
      </TouchableOpacity>

      {/* --- OVERLAY --- */}
      <Animated.View style={[ styles.overlayFab, { opacity: fabFade }]} pointerEvents={fabOpen ? "auto" : "none"}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeMenuFab}/>
      </Animated.View>

      {/* --- MENU TRƯỢT LÊN --- */}
      {/* Menu các lựa chon khi nhấn nút FAB (nút +) */}
      <View style={styles.containerMenuFab} pointerEvents={fabOpen ? "auto" : "none"}>
        <Animated.View style={{
              opacity: fabFade,
              transform: [{ translateY: fabAnim }],
            }}
        >
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Thêm sản phẩm</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#ffb92d" }]} onPress={() => { closeMenuFab(); navigation.navigate('AdminAddProduct', {}) }}>
              <Icon name='utensils' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Quản lý danh mục</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#0080FF" }]} onPress={() => { closeMenuFab(); navigation.navigate('AdminCategory') }}>
              <Icon name='th-large' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {filterOpen && (
        <>
          {/* MENU FILTER */}
          {/* OVERLAY */}
          <Animated.View style={[ styles.overlayFilter, { opacity: filterFade }]} pointerEvents={filterOpen ? "auto" : "none"}>
            <TouchableOpacity style={{ flex: 1, }} activeOpacity={1} onPress={closeMenuFilter} />
          </Animated.View>
          
          {/* --- MENU TRƯỢT TỪ PHẢI SANG --- */}
          <Animated.View
            style={[
              styles.containerMenuFilter,
              {
                opacity: filterFade,
                transform: [{ translateX: filterAnim }],
              }
            ]}
          >
            <Text style={styles.filterTitle}>Lọc</Text>
            {/* filter theo category */}
            <Text style={styles.filterOptionTitle}>Lọc theo danh mục</Text>
            <View style={styles.filterCategoryList}>
              <TouchableOpacity
                style={[
                  styles.filterCategoryItem,
                  selectedCategory === null && styles.filterCategoryActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.filterCategoryText,
                    selectedCategory === null && { color: "#fff", fontWeight: "bold" }
                  ]}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>

                {categories.map(cate => (
                  <TouchableOpacity
                    key={cate.id}
                    style={[
                      styles.filterCategoryItem,
                      selectedCategory === cate.id && styles.filterCategoryActive
                    ]}
                    onPress={() => setSelectedCategory(cate.id)}
                  >
                    <Text
                      style={[
                        styles.filterCategoryText,
                        selectedCategory === cate.id && { color: "#fff", fontWeight: "bold" }
                      ]}
                    >
                      {cate.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* filter theo vùng giá */}
            <Text style={styles.filterOptionTitle}>Lọc theo giá</Text>
            <View style={styles.filterPrice}>
              <View style={styles.filterPriceItem}>
                <Text style={styles.filterPriceLabel}>Từ:</Text>
                <TextInput
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={(text) => {
                    setMinPrice(text);
                    setSelectedPriceRange(-1);
                  }}
                  style={styles.filterPriceValue}
                />
              </View>
              <View style={styles.filterPriceItem}>
                <Text style={styles.filterPriceLabel}>Đến:</Text>
                <TextInput
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={(text) => {
                    setMaxPrice(text);
                    setSelectedPriceRange(-1);
                  }}
                  style={styles.filterPriceValue}
                />
              </View>
            </View>

            <View style={styles.filterPriceRange}>
                {PRICE_RANGE.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.filterPriceRangeItem,
                      selectedPriceRange === index && styles.filterPriceRangeActive
                    ]}
                    onPress={() => handleSelectedPriceRange(index)}
                  >
                    <Text
                      style={[
                        styles.filterPriceRangeText,
                        selectedPriceRange === index && { color: "#fff", fontWeight: "bold" }
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.filterActionButtons}>
              <TouchableOpacity style={[styles.filterActionButton, { backgroundColor: "#909090" }]} onPress={handleResetFilter}>
                <Text style={styles.filterActionTextButton}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterActionButton, { backgroundColor: "#FCB35E" }]} onPress={() => {applySearchFilter(); closeMenuFilter();}}>
                <Text style={styles.filterActionTextButton}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </>
  )
}

export default AdminProduct

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexGrow: 1,
    backgroundColor: "#e1f3f8",
  },

  // input tìm kiếm
  boxSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 42,
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
  overlayFab: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(235, 229, 229, 0.4)",
    zIndex: 900,
  },
  containerMenuFab: {
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

  // style filter
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
  filterCategoryList: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterCategoryItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#909090",
  },
  filterCategoryActive: {
    backgroundColor: "#1ABDBE",
    borderColor: "#1ABDBE",
  },
  filterCategoryText: {
    fontSize: 16,
    color: "#333",
  },
  filterPrice: {
    padding: 10,
    flexDirection: "row",
    gap: 8,
  },
  filterPriceItem: {
    width: '48%',
  },
  filterPriceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  filterPriceValue: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#909090",
    fontSize: 16,
  },
  filterPriceRange: {
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPriceRangeItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#909090",
  },
  filterPriceRangeActive: {
    backgroundColor: "#1ABDBE",
    borderColor: "#1ABDBE",
  },
  filterPriceRangeText: {
    fontSize: 16,
    color: "#333",
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
    width: 50,
    height: 50,
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
    flex: 1.6,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  addAndEditButton: {
    flexDirection: "row",
    gap: 6,
  },
  actionProductButton: {
    width: '45%',
    padding: 5,
    borderRadius: 3,
  },
  actionProductTextButton: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  swithButton: {
    width: '100%',
    padding: 5,
  },
})