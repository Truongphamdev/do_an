import React from "react";
import { StyleSheet, View } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AdminTabBottoms from "./adminNavigation";
import { useAuth } from "../providers/authProvider";
import { useNotify } from "../providers/notificationProvider";

export type AdminDrawerParamList = {
    AdminTabs: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

function CustomDrawerContent({ navigation}: any) {
    const { logout } = useAuth();
    const notify = useNotify();

    const handleLogout = () => {
        notify.confirm({
            title: "Đăng xuất",
            message: "Bạn có chắc chắn muốn đăng xuất không?",
            onConfirm: async () => {
                await logout();
                navigation.closeDrawer();
            },
            onCancel: () => {
                navigation.closeDrawer();
            },
        });
    };

    return (
        <View style={styles.container}>
            <DrawerContentScrollView>
                <DrawerItem label="Trang chủ" labelStyle={styles.label} onPress={() => {}} />
                <DrawerItem label="Quản lý user" labelStyle={styles.label} onPress={() => {}} />
            </DrawerContentScrollView>

            <View style={styles.bottomMenu}>
                <DrawerItem
                    label='Đăng xuất'
                    icon={() => <Icon name="sign-out-alt" size={16} color='#707070' />}
                    onPress={handleLogout}
                    labelStyle={styles.label}
                />
            </View>
        </View>
    );
}

export const AdminDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            {...({ id: 'AdminDrawer' } as any)}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerStyle: { width: 220 },
            }}
        >
            <Drawer.Screen name="AdminTabs" component={AdminTabBottoms} />
        </Drawer.Navigator>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    bottomMenu: {
        marginTop: "auto",
        borderTopWidth: 1,
        borderTopColor: "#707070",
    },
    label: {
        fontSize: 16,
    },
})