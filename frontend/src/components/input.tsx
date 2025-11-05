import React, { useState } from "react"
import { TextInput, View, TouchableOpacity, TextInputProps } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Control, Controller } from "react-hook-form"
import { globalStyles } from "../styles/style"
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
        <View style={[globalStyles.container_input, {position: "relative"}]}>
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
                            style={[globalStyles.input_global, style, secureTextEntry && { paddingRight: 40 }]}
                        />

                        {/* icon ẩn/hiện mật khẩu */}
                        {secureTextEntry && (
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{position: "absolute", right: 12, top: 14}}>
                                <Ionicons name = {isPasswordVisible ? "eye" : "eye-off"} size={20} color="#014D57"/>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />            
        </View>
    )
}