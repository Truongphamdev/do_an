import { TouchableOpacity, Text, View } from 'react-native'
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
        <View>
            {showMenuOptions && (
                <TouchableOpacity onPress={onMenuOptions}>
                    <Icon name='bars' size={24} color="#707070" />
                </TouchableOpacity>
            )}

            {showAdd && (
                <TouchableOpacity>
                    <Icon name='bars' size={24} color="#707070" />
                </TouchableOpacity>
            )}

            {showSearch && (
                <TouchableOpacity>
                    <Icon name='bars' size={24} color="#707070" />
                </TouchableOpacity>
            )}

            {showProfile && (
                <TouchableOpacity>
                    <Icon name='bars' size={24} color="#707070" />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default AdminHeader