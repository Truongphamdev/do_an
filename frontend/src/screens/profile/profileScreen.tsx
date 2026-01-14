import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
// icon
import Icon from 'react-native-vector-icons/FontAwesome5'
// navigation
import { useNavigation } from '@react-navigation/native'
//auth
import { useAuth } from '../../providers/authProvider'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { UserApi, type UserInterface } from '../../api/user.api'


const Profile = () => {
    const { user, logout, loading } = useAuth();
    const navigation = useNavigation<any>();
    const { success, error, confirm } = useNotify();
    const [ me, setMe ] = useState<UserInterface | null>(null);

    const ROLE_LABEL: Record<UserInterface["role"], string> = {
        waiter: "Phục vụ",
        chef: "Đầu bếp",
        cashier: "Thu ngân",
        customer: "Khách hàng",
    };

    const loadProfile = async () => {
        try {
            const data = await UserApi.getMe();
            setMe(data)
        } catch (err) {
            error("Không lấy được thông tin người dùng")
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])
    
    const handleLogout = async () => {
        confirm({
            title: "Đăng xuát",
            message: "Bạn có chắc chắn muốn đăng xuất?",
            onConfirm: async () => {
                try {
                    await logout();
                    success("Đăng xuất thành công.");
                } catch (err: any) {
                    error("Đăng xuất thất bại.");
                }
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <Icon name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
            </View>

            {/* ===== CONTENT ===== */}
            <View style={styles.content}>
                <View style={styles.avatar}>
                    <Icon name="user" size={40} color="#0066cc" />
                </View>

                <InfoItem label="Tên đăng nhập" value={me?.username} />
                <InfoItem label="Email" value={me?.email} />
                <InfoItem label="Họ tên" value={`${me?.first_name} ${me?.last_name}`} />
                <InfoItem label="Số điện thoại" value={me?.phone} />
                <InfoItem label="Địa chỉ" value={me?.address} />
                <InfoItem label="Vai trò" value={me ? ROLE_LABEL[me.role] : " - "} />

                {/* ===== LOGOUT ===== */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="sign-out-alt" size={16} color="#fff" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
    };

    export default Profile;

    /* ===== COMPONENT HIỂN THỊ THÔNG TIN ===== */
    const InfoItem = ({ label, value }: { label: string; value?: string }) => (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value || "-"}</Text>
        </View>
    );

    /* ===== STYLE ===== */
    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },

    header: {
        height: 56,
        backgroundColor: "#0066cc",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    backIcon: {
        position: "absolute",
        left: 12,
        zIndex: 10,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },

    content: {
        padding: 16,
    },
    avatar: {
        alignSelf: "center",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        elevation: 4,
    },

    infoItem: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    label: {
        fontSize: 13,
        color: "#888",
    },
    value: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 2,
    },

    logoutButton: {
        marginTop: 24,
        backgroundColor: "#e53935",
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        elevation: 4,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
