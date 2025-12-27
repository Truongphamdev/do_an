import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
// navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
// nhập liệu
import { AppInput, AppTextArea } from '../../components'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
// validate
import { categorySchema, type categoryForm } from '../../validation/categoryValidation'
// api
import { CategoryApi } from '../../api/category.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// icon
import Icon from "react-native-vector-icons/FontAwesome5";

type AdminAddCategoryRouteProp = RouteProp<AdminStackParamList, 'AdminAddCategory'>;

const AdminAddCategory = () => {
    const { control, handleSubmit, formState: { errors }, setValue } = useForm<categoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const { success, error } = useNotify();
    const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
    const route = useRoute<AdminAddCategoryRouteProp>();
    const categoryId = route.params?.categoryId;
    const isEditing = Boolean(categoryId);

    useEffect(() => {
        // gọi khi có categoryId để sửa danh mục
        if(categoryId) {
            loadCategoryById(categoryId);
        }
    }, [categoryId]);

    // lấy category theo id
    const loadCategoryById = async ( id: number ) => {
        try {
            const categoryById = await CategoryApi.getById(id);

            setValue("name", categoryById.name);
            setValue("description", categoryById.description);
        } catch (err: any) {
            error("Lấy thông tin danh mục theo id thất bại!");
        }
    }

    // Hàm chức năng thêm/sửa danh mục
    const onSubmit = async (data: categoryForm) => {
        if(isEditing) {
            if (categoryId !== undefined){
                // Sửa
                try {
                    await CategoryApi.update(categoryId, {
                        name: data.name,
                        description: data.description,
                    });
                    success("Cập nhật danh mục thành công!");
                    navigation.goBack();
                } catch (err: any) {
                    error("Cập nhật danh mục thất bại");
                }
            }
        } else {
            try {
                await CategoryApi.create(data);
                success("Tạo danh mục thành công");
                navigation.goBack();
            } catch (err: any) {
                const backendError = err.response?.data;
                if (backendError?.name) {
                    error(backendError.name[0]);
                } else if (backendError?.description) {
                    error(backendError.description[0]);
                } else {
                    error("Thêm danh mục thất bại");
                }
            }
        }
    }

    return (
        <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                <Icon name='arrow-left' style={styles.iconGoBack}/>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{isEditing ? "Sửa danh mục" : "Thêm danh mục"}</Text>

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Tên danh mục:</Text>
                    <AppInput
                        name='name'
                        control={control}
                        error={errors.name?.message}
                        style={styles.input}
                    />
                </View>
                <View style={styles.boxInput}>
                    <Text style={styles.label}>Mô tả danh mục:</Text>
                    <AppTextArea
                        name='description'
                        control={control}
                        error={errors.description?.message}
                        style={styles.input}
                        multiline={true}
                        autoHeight={true}
                    />
                </View>

                <View style={styles.wrapperButton}>
                    <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button}>
                        <Text style={styles.textButton}>{isEditing ? "Sửa" : "Thêm"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    )
}

export default AdminAddCategory

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: "#1ABDBE",
        textAlign: "center",
    },
    goBackButton: {
        position: "absolute",
        left: 20,
        top: 20,
        width: 50,
        height: 50,
        zIndex: 999,
    },
    iconGoBack: {
        fontSize: 20,
        color: "#545454",
    },
    boxInput: {
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 0,
        borderRadius: 3,
        backgroundColor: "#f2f2f2",
        padding: 10,
    },
    wrapperButton: {
        width: "100%",
        alignItems: "center",
    },
    button: {
        width: "40%",
        backgroundColor: "#1ABDBE",
        borderRadius: 3,
        padding: 10,
    },
    textButton: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
})