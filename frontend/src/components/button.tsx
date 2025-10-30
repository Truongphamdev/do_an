import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../styles/style';

type AppButtonProps = {
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
}

export const AppButton = ({title,  onPress, style, textStyle}: AppButtonProps) => {
    return(
        <TouchableOpacity style={[globalStyles.button_global, style]} onPress={onPress}> 
            <Text style={[globalStyles.button_text_global, textStyle]}>{title}</Text>
        </TouchableOpacity>
    )
}