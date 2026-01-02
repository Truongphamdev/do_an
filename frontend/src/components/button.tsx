import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

type AppButtonProps = {
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
}

export const AppButton = ({title,  onPress, style, textStyle}: AppButtonProps) => {
    return(
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}> 
            <Text style={[styles.textButton, textStyle]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.color.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    textButton: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '900',
        alignItems: "center",
    },
})