import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";

import TableList from "../screens/staff/waiter/tableList";
import OrderMenu from "../screens/staff/waiter/orderMenu";
import OrderList from "../screens/staff/waiter/orderList";
import StatusOrder from "../screens/staff/waiter/statusOrder";

export type WaiterStackParamList = {
    TableList: undefined;
    OrderMenu: undefined;
    OrderList: undefined;
    StatusOrder: undefined;
}

export type WaiterNav = NativeStackNavigationProp<WaiterStackParamList>;

const Stack = createNativeStackNavigator<WaiterStackParamList>();

const WaiterNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="TableList" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="TableList" component={TableList} options={{ headerShown: false }}/>
            <Stack.Screen name="OrderMenu" component={OrderMenu} options={{ headerShown: false }}/>
            <Stack.Screen name="OrderList" component={OrderList} options={{ headerShown: false }}/>
            <Stack.Screen name="StatusOrder" component={StatusOrder} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

export default WaiterNavigator;