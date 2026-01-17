import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
// api
import { CartApi, type CartInterface, type CartItemInterface } from '../../../api/cart.api'
// thông báo
import { useNotify } from '../../../providers/notificationProvider'
// navigation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { WaiterStackParamList, WaiterNav } from '../../../navigation/waiterNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// component
import { AppLoadingOverlay } from '../../../components'
import { OrderApi } from '../../../api/order.api'

type WaiterConfirmCartRoute = RouteProp<WaiterStackParamList, "ConfirmCart">;

const ConfirmCart = () => {
    const navigation = useNavigation<WaiterNav>();
    const route = useRoute<WaiterConfirmCartRoute>();
    const cartId = route.params?.cartId;

    const { success, error, confirm } = useNotify();
    const [ cart, setCart ] = useState<CartInterface | null>(null);
    const [ loading, setLoading ] = useState(false);

    // lấy dữ liệu cart
    const fetchCart = useCallback(async (cartId: number) => {
        try {
            const data = await CartApi.getCart(cartId);
            setCart(data);
        } catch (err: any) {
            error("Lấy dữ liệu thất bại!");
        }
    }, [error]);

    useFocusEffect(
        useCallback(() => {
            if (cartId) {
                fetchCart(cartId);
            }
        }, [cartId, fetchCart]),
    );

    // hàm xử lý +
    const increaseQuantity = async (item: CartItemInterface) => {
        setCart(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                cart_items: prev.cart_items.map(ci =>
                    ci.id === item.id
                    ? {
                        ...ci,
                        quantity: ci.quantity + 1,
                        total: (ci.quantity + 1) * ci.product.price,
                    }
                    : ci
                ),
            };
        });

        setLoading(true);
        try {
            await CartApi.updateItem(item.id, {
                quantity: item.quantity + 1,
            });
        } catch (err: any) {
            error("Cập nhật thất bại");
            if (cartId) {
                fetchCart(cartId);
            }
        } finally {
            setLoading(false);
        }
    };

    // hàm xử lý -
    const decreaseQuantity = async (item: CartItemInterface) => {
        setCart(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                cart_items:
                    item.quantity === 1
                        ? prev.cart_items.filter(ci => ci.id !== item.id)
                        : prev.cart_items.map(ci =>
                            ci.id === item.id
                            ? {
                                ...ci,
                                quantity: ci.quantity - 1,
                                total: (ci.quantity - 1) * ci.product.price
                            }
                            : ci,
                        )
            };
        });

        setLoading(true);
        try {
            if (item.quantity === 1) {
                await CartApi.removeItem(item.id);
            } else {
                await CartApi.updateItem(item.id, {
                    quantity: item.quantity - 1,
                });
            }
        } catch (err: any) {
            error("Cập nhật thất bại");
            if (cartId) {
                fetchCart(cartId);
            }
        } finally {
            setLoading(false);
        }
    };

    // tổng tiền
    const totalPrice = cart?.cart_items.reduce((sum, item) => sum + item.total, 0) ?? 0;

    // tạo order
    const handleConfirmOrder = async () => {
        if (!cart || cart.cart_items.length === 0) {
            error("Chưa có món để xác nhận");
            return;
        }

        confirm({
            title: "Xác nhận",
            message: "Bạn đã kiểm tra kĩ các món và xác nhận đặt món?",
            onConfirm: async () => {
                setLoading(true);
                try {
                    const cartItemIds = cart.cart_items.map(item => item.id);

                    const order = await OrderApi.create({
                        table: cart.table,
                        cartitems: cartItemIds,
                    })

                    success("Gọi món thành công");
                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "TableOrderDetail",
                                params: { tableId: cart.table },
                            },
                        ],
                    });
                } catch (err: any) {
                    error("Đặt món thất bại!");
                } finally {
                    setLoading(false);
                }
            }
        })
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                        <Icon name='arrow-left' size={20} color="#fff"  />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Xác nhận gọi món bàn {cart?.table}</Text>
                </View>

                <FlatList
                    data={cart?.cart_items || []}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    renderItem={({ item }) => (
                        <View style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.product.name}</Text>
                                    <Text style={styles.itemQty}>
                                        {item.quantity} ×{' '}
                                        {item.product.price.toLocaleString()} đ
                                    </Text>
                                </View>

                                <View style={{ alignItems: "center", justifyContent: "center", gap: 5,}}>
                                    <View style={styles.quantityControl}>
                                        <TouchableOpacity onPress={() => decreaseQuantity(item)} disabled={loading}>
                                            <Text style={styles.quantityBtn}>-</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.quantityText}>{item.quantity}</Text>

                                        <TouchableOpacity onPress={() => increaseQuantity(item)} disabled={loading}>
                                            <Text style={styles.quantityBtn}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.total}>{item.total.toLocaleString()} đ</Text>
                                </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có món nào</Text>
                    }
                />
                <View style={styles.confirm}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalPrice}>{totalPrice.toLocaleString()} đ</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleConfirmOrder}
                    >
                        <Text style={styles.confirmText}>XÁC NHẬN GỌI MÓN</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <AppLoadingOverlay
                visible={loading}
                title='Đang xử lý'
            />
        </>
    );
}

export default ConfirmCart

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    header: {
        padding: 16,
        backgroundColor: '#0066cc',
    },
    goBackButton: {
        position: "absolute",
        top: 20,
        left: 20,
        height: 50,
        width: 50,
        zIndex: 999,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: "center",
    },

    itemRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 14,
        marginHorizontal: 12,
        marginTop: 8,
        borderRadius: 10,
        elevation: 3,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    itemQty: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    total: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ff0000',
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
    },

    confirm: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff0000',
    },

    confirmBtn: {
        backgroundColor: '#ff7f00',
        paddingVertical: 14,
        borderRadius: 10,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
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
});
