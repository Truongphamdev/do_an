import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./authNavigation";
import { AdminDrawerNavigator } from "./adminDrawerNavigation";
import ChefNavigator from "./chefNavigation";
import WaiterNavigator from "./waiterNavigation";
import CashierNavigator from "./cashierNavigation";
import { useAuth, UserRole } from "../providers/authProvider";

const ROLE_NAVIGATORS: Record<UserRole, React.ComponentType<any>> = {
    admin: AdminDrawerNavigator,
    chef: ChefNavigator,
    waiter: WaiterNavigator,
    cashier: CashierNavigator,           
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

    const Navigator = user ? ROLE_NAVIGATORS[user.role] : null;

    return (
        <NavigationContainer>
            {Navigator ? <Navigator/> : <AuthNavigator/>}
        </NavigationContainer>
    );
};

export default RootNavigator