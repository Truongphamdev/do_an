import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./authNavigation";
import { AdminDrawerNavigator } from "./adminDrawerNavigation";
import { useAuth } from "../providers/authProvider";

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

    return (
        <NavigationContainer>
            {user ?(
                user.role === "admin" ? <AdminDrawerNavigator/> : <AuthNavigator/>
            ) : (
                <AuthNavigator/>
            )}
        </NavigationContainer>
    );
};

export default RootNavigator