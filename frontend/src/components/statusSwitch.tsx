import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Animated } from "react-native";


interface Props {
    value: boolean;
    onToggle: () => void;
    style?: any;
    textStyle?: any;
}

export const AppStatusSwitch = ({ value, onToggle, style, textStyle }: Props) => {
    return(
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.8}
            style={[
                styles.container,
                style,
                { backgroundColor: value ? "#1ABDBE" : "#ccc" }
            ]}
        >
            <View
                style={[
                    styles.thumb,
                    { alignSelf: value ? "flex-end" : "flex-start" }
                ]}
            >
                <Text style={[styles.textSwitch, textStyle]}>{value ? "ON" : "OFF"}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 3,
    },
    thumb: {
        width: '50%',
        borderRadius: 3,
        backgroundColor: "#fff",
    },
    textSwitch: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
    }
})