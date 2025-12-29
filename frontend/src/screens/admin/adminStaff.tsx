import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
// component
import { AdminHeader } from '../../components'
// api
import { UserApi } from '../../api/user.api'


const AdminStaff = () => {
  return (
    <View>
      <AdminHeader 
        title='Staffs'
      />
    </View>
  )
}

export default AdminStaff

const styles = StyleSheet.create({

})