import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTabBottom from "./adminTabBottom";
import AdminCategory from "../screens/admin/adminCategory";

import AdminAddProduct from "../screens/addAndEdit/adminAddProduct";
import AdminAddCategory from "../screens/addAndEdit/adminAddCategory";
import AdminAddStaff from "../screens/addAndEdit/adminAddStaff";

import ProductDetail from "../screens/details/productDetail";
import CategoryDetail from "../screens/details/categoryDetail";
import UserDetail from "../screens/details/userDetail";

export type AdminStackParamList = {
    AdminTabBottom: undefined;
    AdminCategory: undefined;

    AdminAddProduct: { productId?: number };
    AdminAddCategory: { categoryId?: number };
    AdminAddStaff: { userId?: number };

    ProductDetail: { productId?: number };
    CategoryDetail: { categoryId?: number };
    UserDetail: { userId?: number };
}

const Stack = createNativeStackNavigator();

export const AdminStackNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabBottom" component={AdminTabBottom} />
            <Stack.Screen name="AdminCategory" component={AdminCategory} />
            
            <Stack.Screen name="AdminAddProduct" component={AdminAddProduct} />
            <Stack.Screen name="AdminAddCategory" component={AdminAddCategory} />
            <Stack.Screen name="AdminAddStaff" component={AdminAddStaff} />

            <Stack.Screen name="ProductDetail" component={ProductDetail} />
            <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
            <Stack.Screen name="UserDetail" component={UserDetail} />
        </Stack.Navigator>
    )
}