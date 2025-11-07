import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AdminHeader from '../../components/adminHeader'
import { useNavigation } from '@react-navigation/native'
import type { DrawerNavigationProp } from '@react-navigation/drawer'
import { AdminDrawerParamList } from '../../navigation/adminDrawerNavigator'

type DrawerNav = DrawerNavigationProp<AdminDrawerParamList>;

const AdminDashboard = () => {
  const navigation = useNavigation<DrawerNav>();

  return (
    <View>
      <AdminHeader 
        title='Dashboard'
        showMenuOptions
        onMenuOptions={() => {
          navigation.getParent<DrawerNavigationProp<AdminDrawerParamList>>()?.toggleDrawer();
        }}
      />
    </View>
  )
}

export default AdminDashboard

const styles = StyleSheet.create({})