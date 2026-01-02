import React, { useState } from 'react'
import { StyleSheet, TextInput, View, TextInputProps } from 'react-native'
import { Control, Controller } from 'react-hook-form'
import { Text } from '@react-navigation/elements'

interface Props extends TextInputProps {
    name: string;
    control: Control<any>;
    error?: string;
    style?: any;

    // bật autoHeight
    autoHeight?: boolean;
}

export const AppTextArea = ({ name, control, error, style, autoHeight = false, ...props}: Props) => {
    const [ height, setHeight ] = useState(200);

    return (
        <View style={styles.containerInput}>
            {error && (
                <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
            )}
            <Controller
                control={control}
                name={name}
                render={({ field: {onChange, onBlur, value} }) => (
                    <TextInput
                        {...props}
                        onChangeText={(text) => onChange(text)}
                        onBlur={onBlur}
                        value={value}

                        multiline
                        textAlignVertical='top'
                        onContentSizeChange={
                            autoHeight
                                ? (event) => {
                                    const newHeight = event.nativeEvent.contentSize.height;
                                    if (newHeight > 200) {
                                        setHeight(newHeight);
                                    }
                                }
                                : undefined
                        }

                        style={[
                            styles.textArea,
                            style,
                            { height: height },
                        ]}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    containerInput: {
        width: '100%',
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#595959",
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
})