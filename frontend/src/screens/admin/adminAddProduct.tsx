import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/adminStackNavigation';
import Icon from "react-native-vector-icons/FontAwesome5";
import { AppInput, AppDropdown, AppImageUploader } from '../../components';
import { useNotify } from '../../providers/notificationProvider';
import { ProductSchema, type productForm } from '../../validation/productValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCategories } from '../../hooks/useCategories';
import { ProductApi } from '../../api/product.api';
import { ImageApi } from '../../api/image.api';

const AdminAddProduct = () => {
    const { control, handleSubmit, formState: {errors}, setValue, reset } = useForm<productForm>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            category_id: 7,
            image: undefined,
        }
    });
    
    const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
    const { categories, loading } = useCategories();
    const { success, error } = useNotify();
    
    // dữ liệu cho dropdown danh mục
    const CATEGORY_OPTIONS = categories.map(category => ({
        label: category.name,
        value: String(category.id),
    }));

    const onSubmit = async (data: productForm) => {
        try {
            const createdProduct = await ProductApi.create({
                name: data.name,
                description: data.description,
                price: Number(data.price),
                category: Number(data.category_id),
            });
            success("Tạo sản phẩm thành công!");

            if (data.image) {
                await ImageApi.create(createdProduct.id, {
                    image: data.image,
                    is_primary: true,
                });
                success("Tải ảnh lên thành công!");
            };
            navigation.goBack();
        } catch (err: any) {
            error("Thêm sản phẩm thất bại!");
        }
    }

    return (
        <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                <Icon name='arrow-left' style={styles.iconGoBack}/>
            </TouchableOpacity>

            <View style={styles.container}>

                <View style={styles.containerAddProduct}>
                    <Text style={styles.titleHeader}>Thêm sản phẩm</Text>
                    <AppImageUploader
                        name='image'
                        control={control}
                    />

                    <View style={styles.box}>
                        <Text>Tên món</Text>
                        <AppInput
                            name='name'
                            control={control}
                            error={errors.name?.message}
                        />
                    </View>

                    <View style={styles.box}>
                        <Text>Danh mục món</Text>
                        <AppDropdown
                            name='category_id'
                            control={control}
                            options={CATEGORY_OPTIONS}
                            label='chọn danh mục'
                            error={errors.category_id?.message}
                        />
                    </View>

                    <View style={styles.box}>
                        <Text>Mô tả món</Text>
                        <AppInput
                            name='description'
                            control={control}
                            error={errors.description?.message}
                            style={{ height: 120 }}
                            multiline={true}
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.box}>
                        <Text>Giá món</Text>
                        <AppInput
                            name='price'
                            control={control}
                            error={errors.price?.message}
                            keyboardType='numeric'
                        />
                    </View>

                    <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button}>
                        <Text style={styles.textButton}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </>
    )
}

export default AdminAddProduct

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flexGrow: 1,
        backgroundColor: "#AFE5E5",
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
        left: 30,
        top: 30,
        width: 50,
        height: 50,
        zIndex: 999,
    },
    iconGoBack: {
        fontSize: 20,
        color: "#545454",
    },

    // Khung nhập thông tin sản phẩm
    containerAddProduct: {
        backgroundColor: "#fff",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 5,
        elevation: 5,
    },
    box: {
        width: "80%",
    },
    button: {
        backgroundColor: "#0080FF",
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