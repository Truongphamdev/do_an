import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTabBottom from "./adminTabBottom";
import AdminCategory from "../screens/admin/adminCategory";

export type AdminStackParamList = {
    AdminTabBottom: undefined;
    AdminCategory: undefined;
}

const Stack = createNativeStackNavigator();

export const AdminStackNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabBottom" component={AdminTabBottom} />
            <Stack.Screen name="AdminCategory" component={AdminCategory} />
        </Stack.Navigator>
    )
}