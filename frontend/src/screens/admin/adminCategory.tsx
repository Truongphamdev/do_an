import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler'
// navigation
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { CategoryApi, type CategoryInterface } from '../../api/category.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'

// WebSocket
import { useWebSocket } from '../../hooks/useWebsocket'

const AdminCategory = () => {
    const [ showContainerInput, setShowContainerInput ] = useState(false);
    const { success, error, confirm } = useNotify();
    const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
    const [ categories, setCategories ] = useState<CategoryInterface[]>([]);

    // Khi khởi động màn hình app thì gọi các hàm trong useEffect
    useEffect(() => {
        fetchCategories();
    }, []);

    // WebSocket
    useWebSocket((message) => {
        console.log("📌 Realtime message:", message);

        switch(message.type) {
            case "CATEGORY_CREATED":
                setCategories(prev => [message.category, ...prev]);
                break;
            
            case "CATEGORY_UPDATED":
                setCategories(prev => prev.map(item => item.id === message.category.id ? message.category : item));
                break;

            case "CATEGORY_DELETED":
                setCategories(prev => prev.filter(item => item.id !== message.id));
                break;

            default:
                console.log("❓ Unknown realtime type", message.type);
        }
    }, "ws://10.0.2.2:8000/ws/categories/");
    
    // Hàm chức năng lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const categories = await CategoryApi.getAll();

            const sorted = [...categories].sort((a, b) => {
                const ta = Date.parse(a.created_at ?? "") || 0;
                const tb = Date.parse(b.created_at ?? "") || 0;
                return tb - ta;
            });

            setCategories(sorted);
        } catch (err) {
            error("Lấy danh sách danh mục thất bại");
        }
    }

    // Hàm chức năng xóa danh mục
    const handelDelete = async (id: number) => {
        confirm({
            title: "Thông báo",
            message: "Bạn có chắc chắn muốn xóa danh mục này?",
            onConfirm: async () => {
                try {
                    await CategoryApi.remove(id);
                    success("Xóa danh mục thành công!");
                } catch (err) {
                    error("Xóa danh mục thất bại!");
                }
            },
        })
    }

    // Render item danh sách danh mục
    const renderItem = ({ item, index }: { item: CategoryInterface, index: number }) => (
        <TouchableOpacity
            style={styles.itemCategory}
            onPress={() => navigation.navigate("CategoryDetail", { categoryId: item.id })}
            activeOpacity={0.7}
        >
            <Text style={styles.serialNumber}>{index + 1}</Text>
            <Text style={styles.nameCategory}>{item.name}</Text>
            <View style={styles.actionCategoryButtons}>
                <TouchableOpacity onPress={() => navigation.navigate("AdminAddCategory", { categoryId: item.id })} style={[styles.actionCategoryButton, { backgroundColor: "#3a9bfb"}]}>
                    <Text style={styles.actionCategoryTextButton}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handelDelete(item.id)} style={[styles.actionCategoryButton, { backgroundColor: "#ff3737"}]}>
                    <Text style={styles.actionCategoryTextButton}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

    return (
        <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                <Icon name='arrow-left' style={styles.iconGoBack}/>
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.titleHeader}>Quản lý danh mục</Text>

                <View style={{ padding: 5 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminAddCategory', {})} style={styles.addCategoryButton}>
                        <Icon name='plus' size={16} color="#1ABDBE"/>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={{ padding: 5 }}
                />
            </View>
        </>
    )
}

export default AdminCategory

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
        backgroundColor: "#e1f3f8",
    },
    titleHeader: {
        fontSize: 28,
        fontWeight: "900",
        color: "#1ABDBE",
        textAlign: "center",
    },
    goBackButton: {
        position: "absolute",
        left: 20,
        top: 20,
        height: 50,
        width: 50,
        zIndex: 999,
    },
    iconGoBack: {
        fontSize: 20,
        color: "#545454",
    },

    // Nút thêm danh mục
    addCategoryButton: {
        backgroundColor: "#fff",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 48,
        borderRadius: 5,
        elevation: 3,
        marginTop: 20,
    },
    

    // Danh sách danh mục
    itemCategory: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginTop: 10,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 5,
        elevation: 3,
    },
    serialNumber: {
        flex: 0.5,
        fontSize: 16,
        padding: 5,
    },
    nameCategory: {
        flex: 3,
        fontSize: 16,
        padding: 5,
    },
    actionCategoryButtons: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        padding: 5,
    },
    actionCategoryButton: {
        padding: 5,
        borderRadius: 3,

    },
    actionCategoryTextButton: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
})