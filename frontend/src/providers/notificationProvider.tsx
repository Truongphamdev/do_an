import React, { createContext, useContext, useState } from "react";
import { showMessage } from "react-native-flash-message";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../styles/theme";

interface NotifyContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    warm: (message: string) => void;
    info: (message: string) => void;
    confirm: (options: {
        title?: string;
        message: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    }) => void;
}

interface ConfirmOptions {
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const NotifyContext = createContext<NotifyContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ confirmOptions, setConfirmOptions ] = useState<ConfirmOptions | null>(null);

    const notify = {
        success: (message: string) => showMessage({ message, type: "success", icon: "success" }),
        error: (message: string) => showMessage({ message, type: "danger", icon: "danger" }),
        warm: (message: string) => showMessage({ message, type: "warning", icon: "warning" }),
        info: (message: string) => showMessage({ message, type: "info", icon: "info" }),
        confirm: (options: ConfirmOptions) => {
            setConfirmOptions(options);
        },
    };

    const handleConfirm = () => {
        confirmOptions?.onConfirm?.();
        setConfirmOptions(null);
    };

    const handleCancel = () => {
        confirmOptions?.onCancel?.();
        setConfirmOptions(null);
    };

    return (
        <NotifyContext.Provider value={notify}>
            {children}
            
            <Modal visible={!!confirmOptions} transparent animationType="fade">
                <View style={styles.container}>
                    <View style={styles.boxConfirmMessage}>
                        <Text style={styles.title}>{confirmOptions?.title || "Xác nhận"}</Text>
                        <Text style={styles.textMessage}>{confirmOptions?.message}</Text>
                        <View style={styles.containerButton}>
                            <TouchableOpacity onPress={handleCancel} style={[styles.button, { backgroundColor: "#e3e3e3"}]}>
                                <Text style={styles.textButton}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={[styles.button, { backgroundColor: "#FCB35E"}]}>
                                <Text style={[styles.textButton, { color: "#fff" }]}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </NotifyContext.Provider>
    )
};

export const useNotify = () => {
    const context = useContext(NotifyContext);
    if (!context) throw new Error("useNotify must be used inside <NotificationProvider>");
    return context;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    boxConfirmMessage: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#FCB35E",
    },
    textMessage: {
        fontSize: 16,
        textAlign: "center",
    },
    containerButton: {
        flexDirection: "row",
        gap: 64,
        padding: 10,
    },
    button: {
        width: 90,
        padding: 10,
        borderRadius: 5,
        elevation: 5,
    },
    textButton: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});