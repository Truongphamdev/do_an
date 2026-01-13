import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import AdminTabBottom from "./adminTabBottom";
import AdminCategory from "../screens/admin/adminCategory";
import AdminTable from "../screens/admin/adminTable";

import AdminAddProduct from "../screens/addAndEdit/adminAddProduct";
import AdminAddCategory from "../screens/addAndEdit/adminAddCategory";
import AdminAddStaff from "../screens/addAndEdit/adminAddStaff";
import AdminAddTable from "../screens/addAndEdit/adminAddTable";

import ProductDetail from "../screens/details/productDetail";
import CategoryDetail from "../screens/details/categoryDetail";
import UserDetail from "../screens/details/userDetail";
import TableDetail from "../screens/details/tableDetail";

export type AdminStackParamList = {
    AdminTabBottom: undefined;
    AdminCategory: undefined;
    AdminTable: undefined;

    AdminAddProduct: { productId?: number };
    AdminAddCategory: { categoryId?: number };
    AdminAddStaff: { userId?: number };
    AdminAddTable: { tableId?: number };

    ProductDetail: { productId?: number };
    CategoryDetail: { categoryId?: number };
    UserDetail: { userId?: number };
    TableDetail: { tableId?: number };
}

export type AdminNav = NativeStackNavigationProp<AdminStackParamList>;

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStackNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabBottom" component={AdminTabBottom} />
            <Stack.Screen name="AdminCategory" component={AdminCategory} />
            <Stack.Screen name="AdminTable" component={AdminTable} />

            <Stack.Screen name="AdminAddProduct" component={AdminAddProduct} />
            <Stack.Screen name="AdminAddCategory" component={AdminAddCategory} />
            <Stack.Screen name="AdminAddStaff" component={AdminAddStaff} />
            <Stack.Screen name="AdminAddTable" component={AdminAddTable} />

            <Stack.Screen name="ProductDetail" component={ProductDetail} />
            <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
            <Stack.Screen name="UserDetail" component={UserDetail} />
            <Stack.Screen name="TableDetail" component={TableDetail} />
        </Stack.Navigator>
    )
}