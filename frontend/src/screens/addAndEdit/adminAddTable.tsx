import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
// navigation
import { AdminNav, AdminStackParamList } from '../../navigation/adminStackNavigation'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// component
import { AppInput } from '../../components'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
// validate
import { TableSchema, type TableFormInput, type TableFormOutput } from '../../validation/tableValidation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { TableApi } from '../../api/table.api'


type AdminAddTableRoute = RouteProp<AdminStackParamList, "AdminAddTable">;

const AdminAddTable = () => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<TableFormInput, any, TableFormOutput>({
        resolver: zodResolver(TableSchema),
        defaultValues: {
            number: "",
            capacity: "",
        }
    });

    const navigation = useNavigation<AdminNav>();
    const route = useRoute<AdminAddTableRoute>();
    const tableId = route.params?.tableId;
    const isEditing = Boolean(tableId);

    const { success, error, confirm } = useNotify();

    useEffect(() => {
        if (tableId) {
            loadTableById(tableId);
        } else {
            reset({
                number: "",
                capacity: "",
            })
        }
    }, [tableId]);

    // hàm load dữ liệu bàn theo id
    const loadTableById = async (id: number) => {
        try {
            const tableById = await TableApi.getById(id);
            
            reset({
                number: String(tableById.number),
                capacity: String(tableById.capacity),
            });
        } catch (err: any) {
            error("Lấy thông tin bàn theo id thất bại.");
        }
    }

    // Hàm chức năng thêm/sửa danh mục
    const onSubmit = async (data: TableFormOutput) => {
        if (isEditing && tableId !== undefined) {
            // Sửa
            try {
                await TableApi.update(tableId, {
                    number: Number(data.number),
                    capacity: Number(data.capacity),
                });
                success("Cập nhật bàn thành công.");
                navigation.goBack();
            } catch (err: any) {
                error("Cập nhật bàn thất bại.");
            }
        } else {
            // Thêm
            try {
                await TableApi.create({
                    number: Number(data.number),
                    capacity: Number(data.capacity),
                });
                success("Thêm bàn mới thành công.");
                navigation.goBack();
            } catch (err: any) {
                const backendError = err.response?.data;
                if (backendError?.number) {
                    error(backendError.number[0]);
                } else if (backendError?.capacity) {
                    error(backendError.capacity[0]);
                } else {
                    error("Thêm bàn mới thất bại.");
                }
            }
        }
    }

    return (
        <>  
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                <Icon name='arrow-left' style={styles.iconGoBack}/>
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.titleHeader}>{isEditing ? "Cập nhật bàn" : "Thêm bàn mới"}</Text>

                <View style={styles.boxInput}>
                    <Text style={styles.label}>Số bàn:</Text>
                    <AppInput
                        name='number'
                        control={control}
                        error={errors.number?.message}
                        keyboardType='numeric'
                        style={styles.input}
                    />
                </View>
                <View style={styles.boxInput}>
                    <Text style={styles.label}>Sức chứa của bàn:</Text>
                    <AppInput
                        name='capacity'
                        control={control}
                        error={errors.capacity?.message}
                        keyboardType='numeric'
                        style={styles.input}
                    />
                </View>
                <View style={styles.wrapperButton}>
                    <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button}>
                        <Text style={styles.textButton}>{isEditing ? "Sửa" : "Thêm"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default AdminAddTable

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
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