import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
// api
import { CartApi } from '../../../api/cart.api'
import { ProductApi, type ProductInterface } from '../../../api/product.api'
import { CategoryApi, type CategoryInterface } from '../../../api/category.api'
// navigation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { WaiterNav, WaiterStackParamList } from '../../../navigation/waiterNavigation'
// thông báo
import { useNotify } from '../../../providers/notificationProvider'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"

type MenuProductWaiterRoute = RouteProp<WaiterStackParamList, "MenuProductWaiter">;

const MenuProductWaiter = () => {
  const navigation = useNavigation<WaiterNav>();
  const route = useRoute<MenuProductWaiterRoute>();
  const { tableId, cartId } = route.params;

  const [ categories, setCategories ] = useState<CategoryInterface[]>([])
  const [ expandedCategoryId, setExpandedCategoryId ] = useState<number | null>(null);
  const [ productsByCategory, setProductsByCategory ] = useState<Record<number, ProductInterface[]>>({});
  const [ cartQuantities, setCartQuantities ] = useState<Record<number, {
    cartItemId: number;
    quantity: number;
  }>>({});

  const { error } = useNotify();

  
  // lấy dữ liệu giỏ hàng
  const fetchCart = useCallback(async () => {
    if (!cartId) return;
    
    try {
      const cart = await CartApi.getCart(cartId);
      
      const quantities: Record<number, { cartItemId: number, quantity: number }> = {};
      
      cart.cart_items.forEach((item: any) => {
        quantities[item.product.id] = {
          cartItemId: item.id,
          quantity: item.quantity,
        };
      });
      
      setCartQuantities(quantities);
    } catch (err: any) {
      error("Lấy dữ liệu giỏ hàng thất bại!");
    }
  }, [cartId, error]);
  
  //
  useEffect(() => {
    fetchCategories();
  }, []);

  //
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );
  
  // lấy dữ liệu danh mục
  const fetchCategories = async () => {
    try {
      const data = await CategoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      error("Lấy dữ liệu danh mục thất bại.");
    }
  }

  // lấy dữ liệu sản phẩm
  const fetchProductsByCategory = async (categoryId: number) => {
    if (productsByCategory[categoryId]) return;

    try {
      const data = await ProductApi.getList({ category: categoryId });
      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: data,
      }));
    } catch (err: any) {
      error("Lấy dữ liệu sản phẩm thất bại.");
    }
  }

  // xử lý khi nhấn danh mục sổ sản phẩm
  const handleToggleCategory = async (categoryId: number) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(categoryId);
      await fetchProductsByCategory(categoryId);
    }
  };

  // thêm sản phẩm vào cart
  const addToCart = async (product: ProductInterface) => {
    try {
      const res = await CartApi.createItem({
        cart: cartId,
        product: product.id,
        quantity: 1,
      })

      setCartQuantities(prev =>({
        ...prev,
        [product.id]: {
          cartItemId: res.id,
          quantity: 1,
        }
      }));
    } catch (err: any) {
      error("Thêm thất bại.");
    }
  }

  // hàm xử lý +
  const increaseQuantity = async (productId: number) => {
    const item = cartQuantities[productId];
    if (!item) return;

    const oldQuantity = item.quantity;
    const newQuantity = item.quantity + 1;

    setCartQuantities(prev => ({
      ...prev,
      [productId]: {
        ...item,
        quantity: newQuantity,
      },
    }));

    try {
      await CartApi.updateItem(item.cartItemId, {
        quantity: newQuantity,
      });
    } catch (err: any) {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: { ...item, quantity: oldQuantity }
      }));
      error("Cập nhật thất bại");
    }
  };

  // hàm xử lý -
  const decreaseQuantity = async (productId: number) => {
    const item = cartQuantities[productId];
    if (!item) return;

    const oldQuantity = item.quantity;

    // Xóa món
    if (item.quantity === 1) {
      setCartQuantities(prev => {
        const clone = {...prev};
        delete clone[productId];
        return clone;
      });

      try {
        await CartApi.removeItem(item.cartItemId);
      } catch (err: any) {
        setCartQuantities(prev => ({
          ...prev,
          [productId]: item,
        }));
        error("Xóa món thất bại");
      }
      return;
    }

    setCartQuantities(prev => ({
      ...prev,
      [productId]: {
        ...item,
        quantity: item.quantity - 1,
      },
    }));

    try {
      await CartApi.updateItem(item.cartItemId, {
        quantity: item.quantity - 1,
      });
    } catch (err: any) {
      setCartQuantities(prev => ({
        ...prev,
        [productId]: { ...item, quantity: oldQuantity },
      }));
      error("Cập nhật thất bại");
    }
  };

  // hàm tính tổng tất cả số lượng
  const totalQuantity = Object.values(cartQuantities)
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Icon name='arrow-left' size={20} color="#fff"  />
        </TouchableOpacity>
        <Text style={styles.titleHeader}>Gọi món</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, }}
        renderItem={({ item }) => {
          const isExpanded = expandedCategoryId === item.id;
          const products = productsByCategory[item.id] || [];

          return (
            <View style={styles.categoryBlock}>
              {/* CATEGORY */}
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  isExpanded && styles.categoryActive,
                ]}
                onPress={() => handleToggleCategory(item.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isExpanded && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>

                <Text style={{ color: isExpanded ? '#fff' : '#666' }}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

                {/* PRODUCTS SỔ XUỐNG */}
                {isExpanded && (
                  <View style={styles.productList}>
                    {products.map(product => (
                      <View key={product.id} style={styles.productItem}>
                        <View>
                          <Text style={styles.productName}>{product.name}</Text>
                          <Text style={styles.productPrice}>{product.price.toLocaleString()} VNĐ</Text>
                        </View>

                        {cartQuantities[product.id] ? (
                          <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => decreaseQuantity(product.id)}>
                              <Text style={styles.quantityBtn}>-</Text>
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>
                              {cartQuantities[product.id].quantity}
                            </Text>

                            <TouchableOpacity onPress={() => increaseQuantity(product.id)}>
                              <Text style={styles.quantityBtn}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => addToCart(product)}
                          >
                            <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
            </View>
          )
        }}
      />

      <View style={styles.confirmCart}>
        <TouchableOpacity style={styles.iconCartButton} onPress={() => {navigation.navigate("ConfirmCart", { cartId }); setExpandedCategoryId(null)}}>
          <Icon name='shopping-cart' size={24} color="#fff" />

          {totalQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalQuantity}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmCartButton} onPress={() => {navigation.navigate("ConfirmCart", { cartId }); setExpandedCategoryId(null)}}>
          <Text style={styles.confirmCartText}>Xác nhận món</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

export default MenuProductWaiter

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    backgroundColor: "#0066cc",
    position: "relative",
    padding: 10,
    marginBottom: 16,
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

  categoryBlock: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
  },
  categoryItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryActive: {
    backgroundColor: '#0066cc',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productList: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 4,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#222',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: '#fb3737',
    marginTop: 4,
  },

  // button - +
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff7f00',
    backgroundColor: '#fff',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f2f2f2',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ff7f00',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmCart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    right: 20,
    gap: 10,
  },
  iconCartButton: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff7f00",
    padding: 6,
    borderRadius: 8,
    elevation: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff0000',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 999,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmCartButton: {
    width: 230,
    padding: 5,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ff7f00",
    borderRadius: 8,
    elevation: 5,
  },
  confirmCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff7f00",
    textAlign: "center",
  },
});

