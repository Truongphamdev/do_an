import { theme } from "./theme";
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    // Đăng nhập
    container_login_register: {
        flex: 1,
        backgroundColor: theme.color.primary,
    },
    background_login_register: {
        flex: 1,
        alignItems: "center",
        paddingTop: 150,
        backgroundColor: '#fff',
        width: "100%",
        height: "100%",
        borderRadius: 40,
        position: 'absolute',
        top: 100,
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

    //Style navigation text chung
    navigation_text: {
        color: '#330066',
        fontWeight: 'bold',
    },

    // Style input chung
    container_input: {
        width: "80%",
    },
    input_global: {
        height: 48,
        borderWidth: 1,
        borderColor: "#707070ff",
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },

    // Style button chung
    button_global: {
        backgroundColor: theme.color.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    button_text_global: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '900',
    },
})