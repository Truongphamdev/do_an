import React, { useState } from "react";
import { TextInput, View, TouchableOpacity, TextInputProps } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { globalStyles } from "../styles/style";

type Props = TextInputProps & {
    style?: any;
    containerStyle?: any;
    secureTextEntry?: boolean;
}

export const AppInput = ({ style, containerStyle, secureTextEntry = false, ...props}: Props) => {
    const [ isPasswordVisible, setIsPasswordVisible ] = useState(false);

    return(
        <View style={[globalStyles.container_input, {position: "relative"}]}>
            <TextInput
                {...props}
                secureTextEntry={secureTextEntry && !isPasswordVisible}
                style={[globalStyles.input_global, style, secureTextEntry && { paddingRight: 40 }]}
            />

            {/* Nếu là input mật khẩu thì hiển thị*/}
            {secureTextEntry && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{position: "absolute", right: 12, top: 14}}>
                    <Ionicons name = {isPasswordVisible ? "eye" : "eye-off"} size={20} color="#014D57"/>
                </TouchableOpacity>
            )}
        </View>
    )
}