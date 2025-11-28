import { StyleSheet, View, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { launchImageLibrary, launchCamera, Asset} from "react-native-image-picker";
import { RNfile } from '../../api/image.api';
import Icon from "react-native-vector-icons/FontAwesome5";

interface ImageProps {
    name: string;
    value: RNfile | null;
    onChange: (file: RNfile | null) => void;
    style?: any;
}

export const ImageUploader: React.FC<ImageProps> = ({ name, value, onChange, style }) => {
    const selectedImage = value;

    // Hàm chọn ảnh từ thư viên
    const PickImage = async () => {
        const result = await launchImageLibrary({ mediaType: "photo" });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            if (!asset.uri) return;

            const file: RNfile = {
                uri: asset.uri!,
                fileName: asset.fileName,
                type: asset.type,
            };
            onChange(file);
        }
    };

    // Hàm hủy chọn ảnh
    const RemoveImage = () => onChange(null);

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={!selectedImage ? PickImage : undefined}
            activeOpacity={0.8}
        >
            {selectedImage ? (
                <View style={styles.image}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.preview} resizeMode='contain'/>
                    <TouchableOpacity onPress={RemoveImage} style={styles.removeButton}>
                        <Icon name='times' size={24} color="#a5a5a5" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholder}>
                    <Icon name="image" size={48} color="#a5a5a5"/>
                </View>
            )}
        </TouchableOpacity>
    )
}

export default ImageUploader

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: 200,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    preview: {
        width: 250,
        height: 200,
        borderRadius: 10,
    },
    removeButton: {
        position: "absolute",
        top: 5,
        right: 5,
    },
    image: {
        borderWidth: 1,
        padding: 5,
        borderRadius: 5,
    },
    placeholder: {
        width: 250,
        height: 200,
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
})