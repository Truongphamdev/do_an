import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AdminHeader } from '../../components'
import { useNavigation } from '@react-navigation/native'
import type { DrawerNavigationProp } from '@react-navigation/drawer'
import { AdminDrawerParamList } from '../../navigation/adminDrawerNavigation'

type DrawerNav = DrawerNavigationProp<AdminDrawerParamList>;

const AdminDashboard = () => {
  const navigation = useNavigation<DrawerNav>();

  return (
    <View>
      <AdminHeader 
        title='Dashboard'
        showMenuOptions
        onMenuOptions={() => {
          navigation.toggleDrawer();
        }}
        style={styles.iconMenuDrawer}
      />
    </View>
  )
}

export default AdminDashboard

const styles = StyleSheet.create({
  iconMenuDrawer: {
    width: 40,
    height: 40,
  },
})