import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useState, useCallback } from 'react'
// navigation
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AdminNav } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { TableApi, type TableInterface } from '../../api/table.api'
// component
import { AppStatusSwitch, AppLoadingOverlay } from '../../components'

const AdminTable = () => {
    const navigation = useNavigation<AdminNav>();
    const { success, error, confirm } = useNotify();
    const [ tables, setTables ] = useState<TableInterface[]>([]);

    const [ loading, setLoading ] = useState(false);

    // hàm load danh sách bàn
    const fetchTables = useCallback(async () => {
        try {
            const tables = await TableApi.getList();
            const sorted = [...tables].sort(
                (a, b) =>
                    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
            );

            setTables(sorted);
        } catch (err: any) {
            error("Lấy danh sách bàn thất bại.");
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTables();
        }, [fetchTables])
    );

    // hàm bật/tắt hoạt động của bạn
      const handleToggleSwitch = async (id: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        confirm({
            title: "Xác nhận",
            message: `Bạn có muốn ${newStatus ? "bật" : "tắt"} hoạt động của bàn này không?`,
            onConfirm: async () => {
                setLoading(true);
                try {
                    if (newStatus) {
                        await TableApi.enable(id);
                    } else {
                        await TableApi.disable(id);
                    }
                    setTables(prev =>
                        prev.map(table =>
                            table.id === id
                            ? {...table, is_active: newStatus}
                            : table
                        )
                    );
                    success("Cập nhật thành công.");
                } catch (err: any) {
                    error("Cập nhật thất bại!");
                } finally {
                    setLoading(false);
                }
            }
        })
      }

    const renderItem = ({index, item}: { index: number, item: TableInterface}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("TableDetail", { tableId: item.id })}
            activeOpacity={0.7}
        >
            <Text style={styles.serialNumber}>{index + 1}</Text>
            {/* Thông tin */}
            <View style={styles.content}>
                <View style={styles.numberWrapper}>
                    <Text style={styles.number}>Bàn số: {item.number}</Text>
                    <View  style={[styles.statusBadge, { backgroundColor: item.is_active ? "#34d418" : "#FCB35E" }]}>
                        <Text style={styles.statusText}>{item.is_active ? "Hoạt động" : "Đã khóa"}</Text>
                    </View>
                </View>
                <Text style={styles.capacity}>Sức chứa của bàn: {item.capacity}</Text>
            </View>
            <View style={styles.actionButtons}>
                <View>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3a9bfb" }]} onPress={() => navigation.navigate("AdminAddTable", { tableId: item.id })}>
                        <Icon name="edit" size={16} color="#fff" style={styles.actionIconButton}/>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#ff3737" }]} onPress={() => {}}>
                        <Icon name="trash" size={16} color="#fff" style={styles.actionIconButton}/>
                    </TouchableOpacity> */}
                </View>
                <AppStatusSwitch
                    value={!!item.is_active}
                    onToggle={() => handleToggleSwitch(item.id, !!item.is_active)}
                />
            </View>
        </TouchableOpacity>
    )

    return (
        <>
            <View style={styles.container}>
                <FlatList
                    data={tables}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, padding: 16, }}
                    ListHeaderComponent={
                        <>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                                <Icon name='arrow-left' style={styles.iconGoBack}/>
                            </TouchableOpacity>

                            <Text style={styles.titleHeader}>Quản lý bàn</Text>
                        </>
                    }
                />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('AdminAddTable', {})} style={styles.addTableButton}>
                <Icon name='plus' size={16} color="#fff"/>
            </TouchableOpacity>

            <AppLoadingOverlay
                visible={loading}
                title='Đang tải...'
            />
        </>
    )
}

export default AdminTable

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
    addTableButton: {
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
    content: {
        flex: 1,
        paddingHorizontal: 10,
        justifyContent: "center",
    },
    actionButtons: {
        width: 80,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        gap: 10,
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
    number: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    capacity: {
        color: "#707070",
        fontSize: 14,
    },
    numberWrapper: {
        position: "relative",
        backgroundColor: "#eef7ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    statusBadge: {
        position: "absolute",
        top: -8,
        right: -60,
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
})