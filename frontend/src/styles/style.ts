import { theme } from "./theme";
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    // Đăng nhập
    container_login_register: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title_login_register: {
        marginBottom: 16,
        fontSize: 48,
        fontWeight: "900",
        color: theme.color.primary,
    },
    question_login_register: {
        flexDirection: 'row',
        gap: 8,
    },

})