import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
// navigation
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AdminNav } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { CategoryApi, type CategoryInterface } from '../../api/category.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'

const AdminCategory = () => {
    const { success, error, confirm } = useNotify();
    const navigation = useNavigation<AdminNav>();
    const [ categories, setCategories ] = useState<CategoryInterface[]>([]);

    // Khi khởi động màn hình app thì gọi các hàm trong useEffect
    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [])
    );

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
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => navigation.navigate("AdminAddCategory", { categoryId: item.id })} style={[styles.actionButton, { backgroundColor: "#3a9bfb"}]}>
                    <Icon name="edit" size={16} color="#fff" style={styles.actionIconButton}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handelDelete(item.id)} style={[styles.actionButton, { backgroundColor: "#ff3737"}]}>
                    <Icon name="trash" size={16} color="#fff" style={styles.actionIconButton}/>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                                <Icon name='arrow-left' style={styles.iconGoBack}/>
                            </TouchableOpacity>

                            <Text style={styles.titleHeader}>Quản lý danh mục</Text>
                        </>
                    }
                />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('AdminAddCategory', {})} style={styles.addCategoryButton}>
                <Icon name='plus' size={16} color="#fff"/>
            </TouchableOpacity>
        </>
    )
}

export default AdminCategory

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        left: 5,
        top: 5,
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
        position: "absolute",
        bottom: 40,
        right: 20,
        backgroundColor: "#1ABDBE",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: 24,
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
    name: {
        flex: 3,
        fontSize: 16,
        padding: 5,
    },
    actionButtons: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        padding: 5,
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