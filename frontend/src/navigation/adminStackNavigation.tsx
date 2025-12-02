import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTabBottom from "./adminTabBottom";
import AdminCategory from "../screens/admin/adminCategory";
import AdminAddProduct from "../screens/admin/adminAddProduct";

export type AdminStackParamList = {
    AdminTabBottom: undefined;
    AdminCategory: undefined;
    AdminAddProduct: { productId?: number };
}

const Stack = createNativeStackNavigator();

export const AdminStackNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabBottom" component={AdminTabBottom} />
            <Stack.Screen name="AdminCategory" component={AdminCategory} />
            <Stack.Screen name="AdminAddProduct" component={AdminAddProduct} />
        </Stack.Navigator>
    )
}