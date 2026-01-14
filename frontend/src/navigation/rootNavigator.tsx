

//---------------------------------
{/** NAVIGATION THEO ROLE */}
//---------------------------------

import React from "react";
import { ActivityIndicator, View } from "react-native";
import AuthNavigator from "./authNavigation";
import { AdminDrawerNavigator } from "./adminDrawerNavigation";
import ChefNavigator from "./chefNavigation";
import WaiterNavigator from "./waiterNavigation";
import CashierNavigator from "./cashierNavigation";
import CustomerNavigation from "./customerNavigation";
import { useAuth, UserRole } from "../providers/authProvider";

const ROLE_NAVIGATORS: Record<UserRole, React.ComponentType<any>> = {
    admin: AdminDrawerNavigator,
    chef: ChefNavigator,
    waiter: WaiterNavigator,
    cashier: CashierNavigator,
    customer: CustomerNavigation,      
};

const RootNavigator = () => {
    const { user, loading } = useAuth();

    console.log("USER:", user);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#000"/>
            </View>
        );
    }

    if (!user) {
        return <AuthNavigator />
    }

    const Navigator = ROLE_NAVIGATORS[user.role];

    return <Navigator />
};

export default RootNavigator