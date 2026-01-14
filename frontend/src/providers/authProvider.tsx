import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "admin" | "chef" | "waiter" | "cashier" | "customer";

interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    address: string;
    phone: string;
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (user: User, access: string, refresh: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const userInfo = await AsyncStorage.getItem("user_info");
            if (userInfo) setUser(JSON.parse(userInfo));
            setLoading(false);
        }
        loadUser();
    }, []);

    const login = async (user: User, access: string, refresh: string) => {
        await AsyncStorage.setItem("access_token", access);
        await AsyncStorage.setItem("refresh_token", refresh);
        await AsyncStorage.setItem("user_info", JSON.stringify(user));
        setUser(user);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        await AsyncStorage.removeItem("user_info");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};