import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

type Props = {
    visible: boolean;
    title: string;
}

export const AppLoadingOverlay = ({ visible, title }: Props) => {
    if (!visible) return null;

    return(
        <View style={styles.overlay}>
            <View style={styles.boxLoading}>
                <ActivityIndicator size="large" color="#1ABDBE" />
                <Text style={{ marginTop: 5, }}>{title}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    boxLoading: {
        width: 200,
        height: 150,
        backgroundColor: "#fff",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    }
});