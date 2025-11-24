import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import React from 'react'
import Icon from "react-native-vector-icons/FontAwesome5"
import { theme } from '../styles/theme'

interface AdminHeaderProps {
    title: string;
    showMenuOptions?: boolean;
    showAdd?: boolean;
    showSearch?: boolean;
    showFilter?: boolean;
    showBell?: boolean;
    showProfile?: boolean;
    onMenuOptions?: () => void;
    onAddPress?: () => void;
    onSearchPress?: () => void;
    onFilterPress?: () => void;
    onBellPress?: () => void;
    onProfilePress?: () => void;
}

const AdminHeader = ({title, showMenuOptions, showAdd, showSearch, showFilter, showBell, showProfile, onAddPress, onMenuOptions, onSearchPress, onFilterPress, onBellPress, onProfilePress}: AdminHeaderProps) => {

    return (
        <View style={styles.container}>
            <View style={styles.leftHeader}>
                {showMenuOptions && (
                    <TouchableOpacity onPress={onMenuOptions} style={styles.iconButton}>
                        <Icon name='bars' size={24} color="#707070" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.centerHeader}>
                {title && (
                    <Text style={styles.title}>{title}</Text>
                )}
            </View>

            <View style={styles.rightHeader}>
                {showAdd && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name='plus' size={16} color="#a4a4a4" />
                    </TouchableOpacity>
                )}

                {showSearch && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name='search' size={16} color="#a4a4a4" />
                    </TouchableOpacity>
                )}

                {showFilter && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name='filter' size={16} color="#a4a4a4" />
                    </TouchableOpacity>
                )}

                {showProfile && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name='user' size={16} color="#a4a4a4" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default AdminHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    leftHeader: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    centerHeader: {
        flex: 1,
        alignItems: "center",
    },
    rightHeader: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1ABDBE",
    },
    iconButton: {
        width: 30,
        height: 30,          
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        elevation: 5,
    },
})