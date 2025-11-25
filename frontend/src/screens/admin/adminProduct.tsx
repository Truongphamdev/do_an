import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import AdminHeader from '../../components/adminHeader'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import Icon from "react-native-vector-icons/FontAwesome5"
import { ProductApi, type Product } from '../../api/product.api'
import { useNotify } from '../../providers/notificationProvider'

const AdminProduct = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [ search, setSearch ] = useState("");
  const [ products, setProducts ] = useState<Product[]>([]);
  const { success, error } = useNotify();

  // Khi khởi động màn hình app thì gọi các hàm trong useEffect
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const data = await ProductApi.getAll();
      setProducts(data);
    } catch (err: any) {
      error("Lấy danh sách sản phẩm thất bại!");
    }
  }

  const renderItem = ({ item, index}: { item: Product, index: number}) => (
    <View>
      <Text>{index + 1}</Text>
      <Image source={{ uri: item.image }} style={styles.image}/>
    </View>
  )

  return (
    <>
      <View style={styles.container}>
        <AdminHeader
          title='Quản lý sản phẩm'
          showBell
          style={styles.iconBell}
        />

        <View style={styles.containerSearch}>
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder='Tìm kiếm'
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={undefined} style={styles.searchButton}>
            <Icon name='search' size={16} color="#fff"/>
          </TouchableOpacity>
        </View>

        <View style={styles.containerCategory}>
          <TouchableOpacity onPress={() => navigation.navigate("AdminCategory")} style={styles.categoryButton}>
            <Text style={styles.categoryTextButton}>Danh mục</Text>
            <Icon name='caret-right' style={styles.categoryIcon}/>
          </TouchableOpacity>
        </View>

        <Text style={styles.titleListProduct}>Danh sách sản phẩm</Text>

        {products ? (
          <View>
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        ) : (
          <View style={styles.listNoProduct}>
            <Icon name='utensils' size={80} color="#1ABDBE"/>
            <Text style={styles.textListNoProduct}>Hiện tại chưa có sản phẩm. Vui lòng thêm sản phẩm!</Text>
          </View>
        )}

      </View>

      <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('AdminAddProduct')}>
        <Icon name='plus' size={24} color='#fff'/>
      </TouchableOpacity>
    </>
  )
}

export default AdminProduct

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  
  // Category button styles
  containerCategory: {
    display: "flex",
    alignItems: "center",
    marginTop: 16,
    elevation: 5,
  },
  categoryButton: {
    flexDirection: "row",
    backgroundColor: "#1ABDBE",
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  categoryTextButton: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoryIcon: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 20,
  },

  // icon thông báo
  iconBell: {
    color: "#b1b1b1",
  },

  // input tìm kiếm
  containerSearch: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 42,
    elevation: 5,
  },
  searchInput: {
    flex: 3,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: "100%",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 2,
    borderColor: "#1ABDBE",
  },
  searchButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1ABDBE",
    height: "100%",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 2,
    borderColor: "#1ABDBE",
  },

  // FAB button
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1ABDBE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 999,
  },

  // style list product
  titleListProduct: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 24,
    color: "#1ABDBE",
    fontWeight: "bold",
  },
  listNoProduct: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textListNoProduct: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },

  image: {
    width: 40,
    height: 30,
  }
})