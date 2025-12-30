import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Icon from "react-native-vector-icons/FontAwesome5"
import { theme } from "../styles/theme"

import AdminDashboard from "../screens/admin/adminDashboard"
import AdminProduct from "../screens/admin/adminProduct"
import AdminUser from "../screens/admin/adminUser"
import AdminOrder from "../screens/admin/adminOrder"
import { View } from "react-native"

const Tab = createBottomTabNavigator();

export const AdminTabBottom = () => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    elevation: 15,
                    height: 60,
                    paddingTop: 10,
                },

                tabBarIcon: ({focused, color, size}) => {
                    let iconName: string = "";
                    if (route.name === "AdminDashboard") iconName ="home";
                    else if (route.name === "AdminProduct") iconName = "utensils";
                    else if (route.name === "AdminUser") iconName = "users";
                    else if (route.name === "AdminOrder") iconName = "receipt";

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
                            <Icon name={iconName} size={24} color={focused ? theme.color.secondary : "#989898"} style={{ marginTop: 6 }}/>
                        </View>
                    )
                },
            })}
        >   
            <Tab.Screen name="AdminDashboard" component={AdminDashboard} />
            <Tab.Screen name="AdminProduct" component={AdminProduct} />
            <Tab.Screen name="AdminUser" component={AdminUser} />
            <Tab.Screen name="AdminOrder" component={AdminOrder} />
        </Tab.Navigator>
    )
}

export default AdminTabBottom