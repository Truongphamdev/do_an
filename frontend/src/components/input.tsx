import React, { useState } from "react"
import { TextInput, View, TouchableOpacity, TextInputProps, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Control, Controller } from "react-hook-form"
import { Text } from "@react-navigation/elements"

interface Props extends TextInputProps {
    style?: any;
    containerStyle?: any;
    name: string;
    control: Control<any>;
    error?: string;
    secureTextEntry?: boolean;
}

export const AppInput = ({ style, containerStyle, name, control, error, secureTextEntry = false, ...props}: Props) => {
    const [ isPasswordVisible, setIsPasswordVisible ] = useState(false);

    return(
        <View style={[styles.containerInput, {position: "relative"}]}>
            {/* Hiển thị lỗi validation */}
            {error && (
                <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
            )}
            <Controller
                control={control}
                name={name}
                render={({ field: {onChange, onBlur, value} }) => (
                    <View>
                        <TextInput
                            {...props}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry={secureTextEntry && !isPasswordVisible}
                            style={[styles.input, style, secureTextEntry && { paddingRight: 40 }]}
                        />

                        {/* icon ẩn/hiện mật khẩu */}
                        {secureTextEntry && (
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{position: "absolute", right: 12, top: 14}}>
                                <Ionicons name = {isPasswordVisible ? "eye" : "eye-off"} size={20} color="#1ABDBE"/>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />            
        </View>
    )
}

const styles = StyleSheet.create({
    containerInput: {
        width: '80%',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: "#707070",
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
})