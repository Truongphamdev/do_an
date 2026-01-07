import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";

import KitchenOrderList from "../screens/staff/chef/kitchenOrderList";
import KitchenOrderDetail from "../screens/staff/chef/kitchenOrderDetail";
import KitchenMenuAvailability from "../screens/staff/chef/kitchenMenuAvailability";

export type ChefStackParamList = {
    KitchenOrderList: undefined;
    KitchenOrderDetail: { orderId: number };
    KitchenMenuAvailability: undefined;
}

export type ChefNav = NativeStackNavigationProp<ChefStackParamList>;

const Stack = createNativeStackNavigator<ChefStackParamList>();

const ChefNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="KitchenOrderList" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="KitchenOrderList" component={KitchenOrderList} options={{ headerShown: false }}/>
            <Stack.Screen name="KitchenOrderDetail" component={KitchenOrderDetail} options={{ headerShown: false }}/>
            <Stack.Screen name="KitchenMenuAvailability" component={KitchenMenuAvailability} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

export default ChefNavigator;