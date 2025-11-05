import React, { createContext, useContext} from "react";
import { showMessage } from "react-native-flash-message";

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

const NotifyContext = createContext<NotifyContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notify = {
        success: (message: string) => showMessage({ message, type: "success", icon: "success" }),
        error: (message: string) => showMessage({ message, type: "danger", icon: "danger" }),
        warm: (message: string) => showMessage({ message, type: "warning", icon: "warning" }),
        info: (message: string) => showMessage({ message, type: "info", icon: "info" }),
        confirm: ({ title, message, onConfirm, onCancel }: any) => {
            import("react-native").then(({ Alert }) => {
                Alert.alert(
                    title || "Xác nhận",
                    message,
                    [
                        { text: "Huỷ", style: "cancel", onPress: onCancel },
                        { text: "OK", onPress: onConfirm },
                    ],
                    { cancelable: true }
                );
            });
        },
    };
    return <NotifyContext.Provider value={notify}>{children}</NotifyContext.Provider>
};

export const useNotify = () => {
    const context = useContext(NotifyContext);
    if (!context) throw new Error("useNotify must be used inside <NotificationProvider>");
    return context;
};