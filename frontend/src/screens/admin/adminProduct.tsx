import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import AdminHeader from '../../components/adminHeader'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import Icon from "react-native-vector-icons/FontAwesome5"

const AdminProduct = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.ScrollContainer}>
      <AdminHeader
        title='Products'
        showSearch
        showFilter
      />
      <View style={styles.viewCategory}>
        <TouchableOpacity onPress={() => navigation.navigate("AdminCategory")} style={styles.categoryButton}>
          <Text style={styles.categoryTextButton}>Quản lý danh mục</Text>
          <Icon name='caret-right' style={styles.categoryIcon}/>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default AdminProduct

const styles = StyleSheet.create({
  ScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexGrow: 1,
    backgroundColor: "#AFE5E5",
  },
  
  // Category button styles
  viewCategory: {
    display: "flex",
    alignItems: "center",
    marginTop: 16,
  },
  categoryButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    elevation: 10,
  },
  categoryTextButton: {
    color: "#1ABDBE",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoryIcon: {
    fontSize: 16,
    color: "#1ABDBE",
    marginLeft: 20,
  },

  //
})