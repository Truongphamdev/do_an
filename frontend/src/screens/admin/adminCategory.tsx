import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import Icon from "react-native-vector-icons/FontAwesome5"
import { useNotify } from '../../providers/notificationProvider'
import { categorySchema, type categoryForm } from '../../validation/categoryValidation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CategoryApi, type CategoryInterface } from '../../api/category.api'
import { AppInput } from '../../components'
import { FlatList } from 'react-native-gesture-handler'

const AdminCategory = () => {
    const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<categoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const [ showContainerInput, setShowContainerInput ] = useState(false);
    const { success, error, confirm } = useNotify();
    const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
    const [ categories, setCategories ] = useState<CategoryInterface[]>([]);
    const [ editingCategory, setEditingCategory] = useState<CategoryInterface | null>(null);

    // Khi khởi động màn hình app thì gọi các hàm trong useEffect
    useEffect(() => {
        fetchCategories();
    }, []);
    
    // Hàm chức năng lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const categories = await CategoryApi.getAll();
            setCategories(categories);
        } catch (err) {
            error("Lấy danh sách danh mục thất bại");
        }
    }

    // Hàm chức năng thêm/sửa danh mục
    const onSubmit = async (data: categoryForm) => {
        if (editingCategory?.id !== undefined) {
            // Sửa
            try {
                const updatedCategory = await CategoryApi.update(editingCategory.id, data);
                setCategories(prev => prev.map(category => category.id === updatedCategory.id ? updatedCategory : category));
                success("Cập nhật danh mục thành công!");
            } catch (err) {
                error("Cập nhật danh mục thất bại!");
            }
        } else {
            // Thêm
            try {
                const newCategory = await CategoryApi.create(data);
                setCategories(prev => [newCategory, ...prev]);
                success("Thêm danh mục thành công!");
            } catch (err) {
                error("Thêm danh mục thất bại!");
            }
        }
        reset({ name: '', description: '' });
        setShowContainerInput(false);
        setEditingCategory(null);
    }

    // Hàm bổ sung chức năng sửa
    const handleEdit = (category: CategoryInterface) => {
        setEditingCategory(category);
        setShowContainerInput(true);

        setValue('name', category.name);
        setValue('description', category.description);
    }

    // Hàm chức năng xóa danh mục
    const handelDelete = async (id: number) => {
        confirm({
            title: "Thông báo",
            message: "Bạn có chắc chắn muốn xóa danh mục này?",
            onConfirm: async () => {
                try {
                    await CategoryApi.remove(id);

                    setCategories(prev => prev.filter(category => category.id !== id));
                    success("Xóa danh mục thành công!");
                } catch (err) {
                    error("Xóa danh mục thất bại!");
                }
            },
        })
    }

    // Render item danh sách danh mục
    const renderItem = ({ item, index }: { item: CategoryInterface, index: number }) => (
        <View style={styles.itemCategory}>
            <Text style={styles.serialNumber}>{index + 1}</Text>
            <Text style={styles.nameCategory}>{item.name}</Text>
            <View style={styles.actionCategoryButtons}>
                <TouchableOpacity onPress={() => {handleEdit(item)}} style={[styles.actionCategoryButton, { backgroundColor: "#3a9bfbff"}]}>
                    <Text style={styles.actionCategoryTextButton}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handelDelete(item.id)} style={[styles.actionCategoryButton, { backgroundColor: "#ff3737ff"}]}>
                    <Text style={styles.actionCategoryTextButton}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                <Icon name='arrow-left' style={styles.iconGoBack}/>
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.titleHeader}>Quản lý danh mục</Text>

                {!showContainerInput && (
                    <View style={styles.containerAddCategoryButton}>
                        <TouchableOpacity onPress={() => setShowContainerInput(true)} style={styles.addCategoryButton}>
                            <Text style={styles.addCategoryTextButton}>Thêm danh mục</Text>
                            {/* <Icon name='plus' size={16} color="#1ABDBE"/> */}
                        </TouchableOpacity>
                    </View>
                )}

                {showContainerInput && (
                    <View style={styles.boxInput}>
                        <Text style={styles.boxInputTitle}>{editingCategory ? 'Cập nhật thông tin danh mục' : 'Nhập thông tin danh mục'}</Text>
                        <AppInput
                            name='name'
                            control={control}
                            placeholder='Tên danh mục'
                            error={errors.name?.message}
                            style={styles.appInput}
                        />
                        <AppInput
                            name='description'
                            control={control}
                            placeholder='Mô tả danh mục'
                            error={errors.description?.message}
                            style={[styles.appInput, { height: 120 }]}
                            multiline={true}
                            numberOfLines={4}
                        />
                        <View style={styles.boxInputButtons}>
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowContainerInput(false);
                                    setEditingCategory(null);
                                    reset({ name: "", description: "" })
                                }}
                                style={[styles.boxInputButton, { backgroundColor: "#d9eef4ff"}]}>
                                <Text style={[styles.boxInputTextButton, { color: "#1ABDBE" }]}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit(onSubmit)} style={[styles.boxInputButton, { backgroundColor: "#FCB35E"}]}>
                                <Text style={[styles.boxInputTextButton, { color: "#fff" }]}>{editingCategory ? 'Cập nhật' : 'Thêm'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {categories && (
                    <View style={styles.listCategory}>
                        <Text style={styles.titleListCategory}>Danh sách danh mục</Text>
                        <FlatList
                            data={categories}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    </View>
                )}
            </View>
        </>
    )
}

export default AdminCategory

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
        backgroundColor: "#CEE1E6",
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
        color: "#fff",
    },

    // Nút thêm danh mục
    containerAddCategoryButton: {
        display: 'flex',
        alignItems: "center",
        marginTop: 20,
    },
    addCategoryButton: {
        backgroundColor: "#fff",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: 10,
        borderRadius: 5,
        gap: 5,
        elevation: 5,
    },
    addCategoryTextButton: {
        color: "#1ABDBE",
        fontSize: 20,
        fontWeight: "900",
    },

    // Khung nhập liệu
    boxInput: {
        flexDirection: "column",
        alignItems: "center",
        marginTop: 20,
        borderRadius: 5,
        padding: 15,
        elevation: 5,
        backgroundColor: "#fff",
    },
    boxInputTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#1ABDBE",
    },
    appInput: {
        borderColor: "#1ABDBE",
    },
    boxInputButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 100,
        marginTop: 10,
    },
    boxInputButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        elevation: 5,
    },
    boxInputTextButton: {
        fontSize: 16,
        fontWeight: "900",
    },

    // Danh sách danh mục
    listCategory: {
        flexDirection: "column",
        width: "100%",
        marginTop: 16,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 5,
        elevation: 5,
    },
    titleListCategory: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1ABDBE",
        textAlign: "center",
        marginBottom: 10,
    },
    itemCategory: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginTop: 5,
        backgroundColor: "#eeeeeeff",
        borderRadius: 5,
        padding: 5,
    },
    serialNumber: {
        flex: 0.5,
        fontSize: 16,
        padding: 5,
    },
    nameCategory: {
        flex: 2,
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