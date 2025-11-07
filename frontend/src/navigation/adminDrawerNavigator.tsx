import React from "react";
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
        <DrawerContentScrollView>
            <DrawerItem
                label='Đăng xuất'
                icon={() => <Icon name="sign-out-alt" size={16} color='#707070' />}
                onPress={handleLogout}
            />
        </DrawerContentScrollView>
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