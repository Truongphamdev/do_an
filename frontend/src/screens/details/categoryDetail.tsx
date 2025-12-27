import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
// navigation
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// api
import { CategoryApi, type CategoryInterface } from '../../api/category.api'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// utils
import { formatDateTime } from '../../utils/date'

type CategoryDetailRouteProp = RouteProp<AdminStackParamList, 'CategoryDetail'>;

const CategoryDetail = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ category, setCategory ] = useState<CategoryInterface | null>(null);
  const { confirm, success, error } = useNotify();
  
  const route = useRoute<CategoryDetailRouteProp>();
  const categoryId = route.params?.categoryId;

  useEffect(() => {
    if(categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId]);

  const fetchCategory = async (id: number) => {
    try {
      const data = await CategoryApi.getById(id);
      setCategory(data);
    } catch (err: any) {
      error("Lấy danh mục theo ID thất bại!");
    }
  }

  // hàm xoá
  const handleDelete = async (id: number) => {
    confirm({
      title: "Thông báo",
      message: "Bạn có chắc chắn muốn xóa danh mục này?",
      onConfirm: async () => {
        try {
          await CategoryApi.remove(id);
          success("Xoá danh mục thành công!");
          navigation.goBack();
        } catch (err: any) {
          error("Xoá danh mục thất bại!");
        }
      }
    })
  }

  return (
    <>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
        <Icon name='arrow-left' style={styles.iconGoBack} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.titleHeader}>Chi tiết danh mục</Text>

        {!category ? (
          <View style={styles.screenNotCategory}>
            <Text>Không tìm thấy danh mục!</Text>
          </View>
        ) : (
          <View style={styles.screenCategory}>
            <View style={styles.item}>
              <Text style={styles.label}>* Tên danh mục:</Text>
              <Text style={styles.value}>{category.name}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Mô tả danh mục:</Text>
              <Text style={[styles.value, { textAlign: 'justify' }]}>{category.description}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Ngày tạo:</Text>
              <Text style={styles.value}>{formatDateTime(category.created_at)}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>* Ngày sửa:</Text>
              <Text style={styles.value}>{formatDateTime(category.updated_at)}</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#3a9bfb"} ]} onPress={() => navigation.navigate("AdminAddCategory", { categoryId: category.id })}>
                <Text style={styles.textButton}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#ff3737"} ]} onPress={() => handleDelete(category.id)}>
                <Text style={styles.textButton}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  )
}

export default CategoryDetail

const styles = StyleSheet.create({
    container: {
      padding: 16,
      flexGrow: 1,
      backgroundColor: "#fff",
    },
    titleHeader: {
      fontSize: 28,
      fontWeight: "900",
      textAlign: "center",
      color: "#1ABDBE",
    },
    goBackButton: {
      position: "absolute",
      top: 20,
      left: 20,
      height: 50,
      width: 50,
      zIndex: 999,
    },
    iconGoBack: {
      fontSize: 20,
      color: "#545454",
    },

    screenNotCategory: {
      padding: 5,
    },
    screenCategory: {
      padding: 5,
    },
    item: {
      marginTop: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderColor: "#a4a4a4",
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
    },
    value: {
      marginTop: 5,
      fontSize: 14,
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
      paddingHorizontal: 5,
    },
    button: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 3,
    },
    textButton: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#fff",
    },
})