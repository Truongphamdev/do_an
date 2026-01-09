import { StyleSheet, Text, ScrollView, TouchableOpacity, View, FlatList, Image, useWindowDimensions } from 'react-native'
import React, { useState, useCallback } from 'react'
// navigation
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native'
import { AdminStackParamList, AdminNav } from '../../navigation/adminStackNavigation'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { ProductApi, type ProductInterface } from '../../api/product.api'
import { ImageApi, type ImageInterface } from '../../api/image.api'
// datetime
import { formatDateTime } from '../../utils/date'
// component
import { AppLoadingOverlay, AppStatusSwitch } from '../../components'

type AdminProductDetailRoute = RouteProp<AdminStackParamList, "ProductDetail">;

const ProductDetail = () => {
  const navigation = useNavigation<AdminNav>();
  const route = useRoute<AdminProductDetailRoute>();
  const productId = route.params?.productId;

  const [ product, setProduct ] = useState<ProductInterface | null>(null);
  // state cho phần ảnh
  const [ images, setImages ] = useState<ImageInterface[]>([]);
  const [ selectedImageId, setSelectedImageId ] = useState<number | null>(null);

  const { success, error, confirm } = useNotify();
  const [ loading, setLoading ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (productId) {
        loadProductById(productId);
        loadImageByProduct(productId);
      }
    }, [productId])
  );

  // hàm lấy dữ liệu sản phẩm theo id
  const loadProductById = async (id: number) => {
    setLoading(true);
    try {
      const data = await ProductApi.getById(id);
      setProduct(data);
    } catch (err: any) {
      error("Lấy thông tin sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  }
  // hàm lấy tất cả ảnh theo sản phẩm
  const loadImageByProduct = async (id: number) => {
    try {
      const data = await ImageApi.getByProduct(id);
      setImages(data);
    } catch (err: any) {
      error("Lấy ảnh sản phẩm thất bại!");
    }
  }

  // xử lý chọn ảnh
  const selectedImage =
    images.find(img => img.id === selectedImageId) ||
    images.find(img => img.is_primary) ||
    images[0]

  // hàm xoá
  const handleDelete = async (id: number) => {
    confirm({
      title: "Thông báo",
      message: "Bạn có chắc chắn muốn xoá sản phẩm này?",
      onConfirm: async () => {
        try {
          await ProductApi.remove(id);
          success("Xoá sản phẩm thành công!");
          navigation.goBack();
        } catch (err: any) {
          error("Xoá sản phẩm thất bại!");
        }
      }
    })
  }

  // hàm xoá ảnh
  const handleDeleteImage = async (productId: number, id: number) => {
    confirm({
      title: "Thông báo",
      message: "Bạn có chắc chắn muốn xoá ảnh này!",
      onConfirm: async () => {
        try {
          await ImageApi.remove(productId, id);
          success("Xoá ảnh thành công!");
          loadImageByProduct(productId);
        } catch (err: any) {
          error("Xoá ảnh thất bại!");
        }
      }
    })
  }

  // hàm thay đổi trạng thái
  const handleStatusUpdate = async (id: number) => {
    try {
      if(!product?.status) return;

      const newStatus = product.status === "available" ? "unavailable" : "available";
      await ProductApi.updateStatus(id, newStatus);
      loadProductById(product.id);
    } catch (err: any) {
      error("Cập nhật trạng thái sản phẩm thất bại!");
    }
  }

  // hàm render images
  const renderImages = ({item}: { item: ImageInterface } ) => {
    const active = item.id === selectedImage?.id;
    return(
      <TouchableOpacity
        style={[
          styles.thumbnailWrapper,
          { width: THUMB_WIDTH },
          active && styles.thumbnailActive
        ]}
        onPress={() => setSelectedImageId(item.id)}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.thumbnail}
        />
        {/* icon ảnh chính */}
        {item.is_primary && (
          <Icon
            name="star"
            size={12}
            solid
            color="#facc15"
            style={{ position: "absolute", top: 4, right: 4, }}
          />
        )}

        {/* icon nút xoá */}
        {!item.is_primary && (
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => handleDeleteImage(productId!, item.id)}
          >
            <Icon name="times" size={12} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  // tính kích thước ảnh nhỏ
  const { width: screenWidth } = useWindowDimensions();
  const GAP = 10;
  const COUNT = 3;
  const MAIN_WIDTH = screenWidth * 0.7;
  const THUMB_WIDTH = (MAIN_WIDTH - (COUNT - 1) * GAP) / COUNT;
 
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <Icon name='arrow-left' style={styles.iconGoBack}/>
        </TouchableOpacity>
        {!product ? (
          <View style={styles.screenNotProduct}>
            <Text>Không tìm thấy thông tin sản phẩm!</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.titleHeader}>Chi tiết sản phẩm</Text>

            {/* ẢNH TO */}
            {selectedImage && (
              <View style={{ marginBottom: 12, }}>
                <View style={styles.mainImageWrapper}>
                  <Image
                    source={{ uri: selectedImage.image_url }}
                    style={styles.mainImage}
                  />
                </View>

                {!selectedImage.is_primary && (
                  <TouchableOpacity
                    style={styles.mainImageButton}
                    onPress={async () => {
                      setLoading(true);
                      try {
                        await ImageApi.update(productId!, selectedImage.id, {
                          is_primary: true,
                        })
                        success("Đã đặt làm ảnh chính!");
                        loadImageByProduct(productId!);
                      } catch (err: any) {
                        error("Không thể đặt làm ảnh chính!");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    >
                      <Text style={styles.mainImageTextButton}>Đặt làm ảnh chính</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ẢNH NHỎ */}
            <FlatList
              data={images}
              horizontal
              showsHorizontalScrollIndicator={true}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ gap: 10, marginBottom: 12, }}
              renderItem={renderImages}
            />

            <View style={styles.item}>
              <Text style={styles.label}>* Tên sản phẩm:</Text>
              <Text style={styles.value}>{product.name}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>* Mô tả sản phẩm:</Text>
              <Text style={styles.value}>{product.description}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>* Danh mục:</Text>
              <Text style={styles.value}>{product.category_name}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>* Giá sản phẩm:</Text>
              <Text style={styles.value}>{Number(product.price).toLocaleString("vi-VN")} VNĐ</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>* Ngày tạo:</Text>
              <Text style={styles.value}>{formatDateTime(product.created_at)}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>* Ngày sửa:</Text>
              <Text style={styles.value}>{formatDateTime(product.updated_at)}</Text>
            </View>
            <View style={[styles.item, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", }]}>
              <View>
                <Text style={styles.label}>* Trạng thái:</Text>
                <Text style={styles.value}>{product.status === "available" ? "Hiển thị sản phẩm" : "Ẩn sản phẩm"}</Text>
              </View>
              <AppStatusSwitch
                onToggle={() => handleStatusUpdate(product.id)}
                value={product.status === "available"}
                style={styles.swithButton}
              />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#3a9bfb"} ]} onPress={() => navigation.navigate("AdminAddProduct", { productId: product.id })}>
                <Text style={styles.textButton}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#ff3737"} ]} onPress={() => handleDelete(product.id)}>
                <Text style={styles.textButton}>Xoá</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      <AppLoadingOverlay
        visible={loading}
        title='Đang tải...'
      />
    </>
  )
}

export default ProductDetail

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  goBackButton: {
    position: "absolute",
    left: 20,
    top: 20,
    width: 50,
    height: 50,
    zIndex: 999,
  },
  iconGoBack: {
    fontSize: 20,
    color: "#545454",
  },
  screenNotProduct: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: "#1ABDBE",
    textAlign: "center",
    marginBottom: 10,
  },

  // Xử lý ảnh
  // ảnh to
  mainImageWrapper: {
    width: "100%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#b2b2b2",
  },
  mainImage: {
    width: "70%",
    aspectRatio: 1, // 👉 vuông
    borderRadius: 5,
  },
  mainImageButton: {
    backgroundColor: "#1ABDBE",
    padding: 5,
  },
  mainImageTextButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  // ảnh nhỏ
  thumbnailWrapper: {
    aspectRatio: 1,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailActive: {
    borderWidth: 3,
    borderColor: "#facc15",
    borderRadius: 3,
  },
  deleteIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,0,0,0.8)",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  // thông tin
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
  swithButton: {
    
  },
})