import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";

import TableList from "../screens/staff/waiter/tableList";
import MenuProductWaiter from "../screens/staff/waiter/menuProduct";
import OrderList from "../screens/staff/waiter/orderList";
import TableOrderDetail from "../screens/staff/waiter/tableOrderDetail";
import Profile from "../screens/profile/profileScreen";
import ConfirmCart from "../screens/staff/waiter/confirmCart";

export type WaiterStackParamList = {
    TableList: undefined;
    MenuProductWaiter: { tableId: number, cartId: number };
    OrderList: undefined;
    TableOrderDetail: { tableId: number };
    Profile: undefined;
    ConfirmCart: { cartId: number }
}

export type WaiterNav = NativeStackNavigationProp<WaiterStackParamList>;

const Stack = createNativeStackNavigator<WaiterStackParamList>();

const WaiterNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="TableList" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="TableList" component={TableList} options={{ headerShown: false }}/>
            <Stack.Screen name="MenuProductWaiter" component={MenuProductWaiter} options={{ headerShown: false }}/>
            <Stack.Screen name="OrderList" component={OrderList} options={{ headerShown: false }}/>
            <Stack.Screen name="TableOrderDetail" component={TableOrderDetail} options={{ headerShown: false }}/>
            <Stack.Screen name="ConfirmCart" component={ConfirmCart} options={{ headerShown: false }}/>
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

export default WaiterNavigator;