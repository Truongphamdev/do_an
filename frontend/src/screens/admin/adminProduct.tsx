import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, TextInput, Animated, Easing } from 'react-native'
import React, { useState, useCallback } from 'react'
// componet tái sử dụng
import { AppStatusSwitch } from '../../components'
// navigation
import { AdminNav } from '../../navigation/adminStackNavigation'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { ProductApi, type ProductInterface } from '../../api/product.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// hook
import { useCategories } from '../../hooks/useCategories'

// ảnh mặc định khi ko lấy được dữ liệu ảnh
const placeholderImageProduct = require("../../assets/images/placeholderProduct.png");

const AdminProduct = () => {
  const navigation = useNavigation<AdminNav>();
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

      const sorted = [...productWithImages].sort(
        (a, b) => 
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );

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

  // Chức năng xóa sản phẩm
  const handleDelete = async (id: number) => {
    confirm({
      title: "Thông báo",
      message: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      onConfirm: async () => {
        try {
          await ProductApi.remove(id);

          setProducts(prev => prev.filter(product => product.id !== id));
          success("Xóa sản phẩm thành công!");
        } catch (err: any) {
          error("Xóa sản phẩm thất bại!");
        }
      },
    });
  };


  // Chức năng cập nhật trạng thái sản phẩm
  const handleToggleStatus = async (id: number) => {
    const product = products.find(prev => prev.id === id);
    if (!product) return;

    const newStatus = product.status === "available" ? "unavailable" : "available";

    confirm({
      title: "Xác nhận",
      message: `Bạn muốn ${newStatus === "available" ? "bật" : "tắt"} sản phẩm này?`,
      onConfirm: async () => {
        try {
          await ProductApi.updateStatus(id, newStatus);

          setProducts(prev =>
            prev.map(product =>
              product.id === id
              ? {...product, status: newStatus}
              : product
            )
          );

          success("Cập nhật thành công!");
        } catch (err: any) {
          error("Cập nhật trạng thái sản phẩm thất bại!");
        }
      }
    })
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
      }),
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




  // hàm render item cho flatlist
  const renderItem = ({ item, index}: { item: ProductInterface, index: number}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
      activeOpacity={0.7}
    >
      <Text style={styles.serialNumber}>{index + 1}</Text>
      {/* image */}
      <View style={styles.imageWrapper}>
        <Image source={ item.image ? { uri: item.image } : placeholderImageProduct} style={styles.image}/>
      </View>
      {/* Thông tin */}
      <View style={styles.content}>
        {/* name + status */}
        <View style={styles.nameProductWrapper}>
          <Text style={styles.nameProduct}>
            {item.name}
          </Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.status === "available" ? "#34d418" : "#FCB35E" }
            ]}
          >
            <Text style={styles.statusText}>{item.status === "available" ? "Hiển thị" : "Đã ẩn"}</Text>
          </View>
        </View>
        {/* category */}
        <Text style={styles.subText}>
          {item.category_name}
        </Text>
        {/* price */}
        <Text style={styles.metaText}>
          {Number(item.price).toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
      {/* action button */}
      <View style={styles.actionButtons}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3a9bfb" }]} onPress={() => navigation.navigate("AdminAddProduct", { productId: item.id })}>
            <Icon name="edit" size={16} color="#fff" style={styles.actionIconButton}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#ff3737" }]} onPress={() => handleDelete(item.id)}>
            <Icon name="trash" size={16} color="#fff" style={styles.actionIconButton}/>
          </TouchableOpacity>
        </View>

        <AppStatusSwitch
          value={item.status === "available"}
          onToggle={() => handleToggleStatus(item.id)}
        />
      </View>
    </TouchableOpacity>
  )




  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80, padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>

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
            </>
          }

          ListEmptyComponent={
            <View style={styles.noProduct}>
              <Text style={styles.noProductContent}>Không tìm thấy sản phẩm phù hợp</Text>

              <TouchableOpacity onPress={handleResetFilter} style={styles.noProductButton} >
                <Text style={{ color: "#0066cc", fontWeight: "bold" }}>Bỏ lọc</Text>
              </TouchableOpacity>
            </View>
          }
        />
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
          {/* Thêm sản phẩm */}
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Thêm sản phẩm</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#ffb92d" }]} onPress={() => { closeMenuFab(); navigation.navigate('AdminAddProduct', {}) }}>
              <Icon name='utensils' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Quản lý danh mục */}
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Quản lý danh mục</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#0080FF" }]} onPress={() => { closeMenuFab(); navigation.navigate('AdminCategory') }}>
              <Icon name='th-large' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Quản lý bàn */}
          <View style={styles.itemFab}>
            <Text style={styles.itemFabLabel}>Quản lý bàn</Text>
            <TouchableOpacity style={[styles.itemFabButton, { backgroundColor: "#66CC00" }]} onPress={() => { closeMenuFab(); navigation.navigate('AdminTable') }}>
              <Icon name='chair' size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {filterOpen && (
        <>
          {/* MENU FILTER */}
          {/* OVERLAY */}
          <Animated.View style={[ styles.overlayFilter, { opacity: filterFade }]} pointerEvents={filterOpen ? "auto" : "none"}>
            <TouchableOpacity style={{ flex: 1, }} activeOpacity={1} onPress={closeFilter} />
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
            <Text style={styles.filterOptionTitle}>Danh mục</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedCategory === null && styles.filterActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.filterTextOption,
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
                      styles.filterOption,
                      selectedCategory === cate.id && styles.filterActive
                    ]}
                    onPress={() => setSelectedCategory(cate.id)}
                  >
                    <Text
                      style={[
                        styles.filterTextOption,
                        selectedCategory === cate.id && { color: "#fff", fontWeight: "bold" }
                      ]}
                    >
                      {cate.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* filter theo vùng giá */}
            <Text style={styles.filterOptionTitle}>Khoảng giá</Text>
            <View style={styles.filterOptions}>
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

            <View style={styles.filterOptions}>
                {PRICE_RANGE.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.filterOption,
                      selectedPriceRange === index && styles.filterActive
                    ]}
                    onPress={() => handleSelectedPriceRange(index)}
                  >
                    <Text
                      style={[
                        styles.filterTextOption,
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
                <Text style={styles.filterActionTextButton}>Bỏ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterActionButton, { backgroundColor: "#FCB35E" }]} onPress={() => {applySearchFilter(); closeFilter();}}>
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
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0066cc",
    marginBottom: 20,
    textAlign: "center",
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
    backgroundColor: "#0066cc",
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
    zIndex: 998,
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
    width: 300,
    zIndex: 999,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 28,
    padding: 10,
    fontWeight: "900",
    color: "#fff",
    backgroundColor: "#0066cc",
  },
  filterOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
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
  filterActive: {
    backgroundColor: "#0066cc",
    borderColor: "#0066cc",
  },
  filterTextOption: {
    fontSize: 16,
    color: "#333",
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
  noProduct: {
    flex: 1,
    width: "100%",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  noProductContent: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  noProductButton: {
    padding: 5,
    borderColor: "#0066cc",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 12,
  },

  // style cho từng item product
  card:{
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
    paddingVertical: 5,
    fontSize: 16,
  },
  // hình ảnh
  imageWrapper: {
    width: 60,
    justifyContent: "center",
  },
  image: {
    width: 50,
    height: 50,
  },
  // thông tin
  content: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  nameProductWrapper: {
    position: "relative",
    backgroundColor: "#eef7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  nameProduct: {
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
    fontSize: 14,
    color: "#707070",
  },
  metaText: {
    fontSize: 16,
    color: "#ff5500",
    fontWeight: "bold",
  },
  // nút sửa + xóa + switch
  actionButtons: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 5,
    borderRadius: 3,
  },
  actionIconButton: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
})