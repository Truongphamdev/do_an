import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Animated } from "react-native";


interface Props {
    value: boolean;
    onToggle: () => void;
    style?: any;
}

export const AppStatusSwitch = ({ value, onToggle, style }: Props) => {
    return(
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.8}
            style={[
                styles.container,
                style,
                { backgroundColor: value ? "#34d418" : "#ccc" }
            ]}
        >
            <View
                style={[
                    styles.thumb,
                    { alignSelf: value ? "flex-end" : "flex-start" }
                ]}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: "center",
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#fff",
    },
})