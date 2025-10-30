import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/FontAwesome5"
import { theme } from "../styles/theme"

import AdminProduct from "../screens/admin/adminProduct"
import AdminStaff from "../screens/admin/adminStaff"
import { View } from "react-native"

const Tab = createBottomTabNavigator();

export const AdminTabBottoms = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({route}) => ({
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        elevation: 5,
                        height: 60,
                        paddingTop: 10,
                    },

                    tabBarIcon: ({focused, color, size}) => {
                        let iconName: string = "";
                        if (route.name === "AdminProduct") iconName ="utensils";
                        else if (route.name === "AdminStaff") iconName = "users";

                        return (
                            <View style={{ alignItems: "center"}}>
                                {focused && (
                                    <View style={{
                                        width: 32,
                                        height: 3,
                                        backgroundColor: theme.color.secondary,
                                        borderRadius: 2,
                                        position: "absolute",
                                        top: -10,
                                    }}/>
                                )}
                                <Icon name={iconName} size={24} color={focused ? theme.color.secondary : "#989898"} style={{ marginTop: 6 }}/>;
                            </View>
                        )
                    },
                })}
            >
                <Tab.Screen name="AdminProduct" component={AdminProduct} />
                <Tab.Screen name="AdminStaff" component={AdminStaff} />
            </Tab.Navigator>
        </NavigationContainer>
    )
}

export default AdminTabBottoms