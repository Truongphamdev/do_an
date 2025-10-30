import React from "react";
import { Pressable, Text } from "react-native";
import { globalStyles } from "../styles/style";

/**
 * AppTextLink - Component hiển thị text có thể nhấn
 * 
 * @param {string} title - nội dung text hiển thị
 * @param {function} onPress - Hàm xử lý khi nhấn
 * @param {object} style - tuỳ chọn style bổ sung
 * @param {boolean} underline - có gạch chân text hay ko
 */

type AppTextLinkProps = {
    title: any;
    onPress?: () => void;
    style?: any;
    underline?: boolean;
}

export const AppTextLink = ({ title, onPress, style, underline = false}: AppTextLinkProps) => {
    return (
        <Pressable onPress={onPress}>
            {({ pressed }) => (
                <Text style={[globalStyles.navigation_text, { textDecorationLine: underline ? 'underline' : 'none', opacity: pressed ? 0.6 : 1, }, style]}>
                    {title}
                </Text>
            )}
        </Pressable>
    )
}

export default AppTextLink