import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
// naviagation
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AdminStackParamList, AdminNav } from '../../navigation/adminStackNavigation';
// icon
import Icon from "react-native-vector-icons/FontAwesome5";
// component
import { AppInput, AppTextArea, AppDropdown, AppImageUploader, AppLoadingOverlay } from '../../components';
// thông báo
import { useNotify } from '../../providers/notificationProvider';
// validation
import { ProductSchema, type productForm } from '../../validation/productValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// hooks
import { useCategories } from '../../hooks/useCategories';
// api
import { ProductApi } from '../../api/product.api';
import { ImageApi } from '../../api/image.api';
// utils
import { isLocalImage } from '../../utils/isLocalImage';
import { getBackendErrorMessage } from '../../utils/getBackendError';

type AdminAddProductRoute = RouteProp<AdminStackParamList, 'AdminAddProduct'>;

const AdminAddProduct = () => {
    const { control, handleSubmit, formState: {errors}, setValue } = useForm<productForm>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            category: 0,
            image: undefined,
        }
    });

    const navigation = useNavigation<AdminNav>();
    const { categories } = useCategories();
    const { success, error } = useNotify();
    const [ loading, setLoading ] = useState(false);

    // state cho phần nhận productId
    const route = useRoute<AdminAddProductRoute>();
    const productId = route.params?.productId;
    const isEditting = Boolean(productId);
    const [ imageUrl, setImageUrl ] = useState<string | null>(null);

    useEffect(() => {
        // gọi khi có productId để sửa sản phẩm
        if (productId) {
            loadProductById(productId);
        }
    }, [productId]);

    const loadProductById = async ( id: number ) => {
        setLoading(true);
        try {
            const productById = await ProductApi.getById(id);

            setValue("name", productById.name);
            setValue("description", productById.description);
            setValue("price", productById.price);
            setValue("category", Number(productById.category));

            setImageUrl(productById.image_url ?? null);
        } catch (err: any) {
            error("Không tải đc sản phẩm cần sửa!");
        } finally {
            setLoading(false);
        }
    }
    
    // dữ liệu cho dropdown danh mục
    const CATEGORY_OPTIONS = categories.map(category => ({
        label: category.name,
        value: Number(category.id),
    }));

    const onSubmit = async (data: productForm) => {
        setLoading(true);
        try {
            if (isEditting) {
                // SỬA SẢN PHẨM
                try {
                    if (productId !== undefined) {
                        await ProductApi.update(productId, {
                            name: data.name,
                            description: data.description,
                            price: Number(data.price),
                            category: Number(data.category),
                        });

                        if (isLocalImage(data.image)) {
                            await ImageApi.create(productId, {
                                image: data.image,
                                is_primary: true,
                            })
                        }
                        success("Cập nhật sản phẩm thành công!");
                        navigation.goBack();
                    }
                } catch (err: any) {
                    error(getBackendErrorMessage(err));
                }
            } else {
                // TẠO SẢN PHẨM MỚI
                try {
                    const createdProduct = await ProductApi.create({
                        name: data.name,
                        description: data.description,
                        price: Number(data.price),
                        category: Number(data.category),
                    });

                    if (data.image) {
                        await ImageApi.create(createdProduct.id, {
                            image: data.image,
                            is_primary: true,
                        });
                        success("Tạo sản phẩm thành công!");
                    };
                    navigation.goBack();
                } catch (err: any) {
                    error("Tạo sản phẩm thất bại!");
                }
            }
        } catch (err: any) {
            error("Lưu dữ liệu thất bại!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Icon name='arrow-left' style={styles.iconGoBack}/>
                </TouchableOpacity>

                <Text style={styles.titleHeader}>{isEditting ? "Sửa sản phẩm" : "Thêm sản phẩm"}</Text>
                <AppImageUploader
                    name='image'
                    control={control}
                    imageUrl={imageUrl}
                />

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Tên món:</Text>
                    <AppInput
                        name='name'
                        control={control}
                        error={errors.name?.message}
                        style={styles.input}
                    />
                </View>

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Danh mục món:</Text>
                    <AppDropdown
                        name='category'
                        control={control}
                        options={CATEGORY_OPTIONS}
                        label='chọn danh mục'
                        error={errors.category?.message}
                        style={styles.input}
                    />
                </View>

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Mô tả món:</Text>
                    <AppTextArea
                        name='description'
                        control={control}
                        error={errors.description?.message}
                        multiline={true}
                        autoHeight={true}
                        style={styles.input}
                    />
                </View>

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Giá món:</Text>
                    <AppInput
                        name='price'
                        control={control}
                        error={errors.price?.message}
                        keyboardType='numeric'
                        style={styles.input}
                    />
                </View>

                <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button}>
                    <Text style={styles.textButton}>{isEditting ? "Cập nhật" : "Thêm"}</Text>
                </TouchableOpacity>
                
            </ScrollView>

            <AppLoadingOverlay
                visible={loading}
                title='Đang tải...'
            />
        </>
    )
}

export default AdminAddProduct

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
        backgroundColor: "#fff",
        flexDirection: "column",
        alignItems: "center",
    },
    titleHeader: {
        fontSize: 28,
        fontWeight: "900",
        color: "#1ABDBE",
        textAlign: "center",
        marginBottom: 20,
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

    // Khung nhập thông tin sản phẩm
    boxInput: {
        width: "100%",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 0,
        borderRadius: 3,
        backgroundColor: "#f2f2f2",
    },
    button: {
        backgroundColor: "#1ABDBE",
        width: "50%",
        padding: 12,
        borderRadius: 5,
        marginTop: 10,
    },
    textButton: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
        textAlign: "center",
    },
})