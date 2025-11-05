import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";

import Login from "../screens/auth/login";
import Register from "../screens/auth/register";

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
}

export type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false}} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false}} />
        </Stack.Navigator>
    );
}

export default AuthNavigator