import { Text, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
// components
import { AppButton, AppDropdown, AppInput, AppLoadingOverlay } from '../../components'
// navigation
import { AdminStackParamList } from '../../navigation/adminStackNavigation'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
// validate
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addStaffSchema, editStaffSchema, registerSchema, type registerForm } from '../../validation/authValidation'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { authApi } from '../../api/auth.api'
import { UserApi } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"

type AdminAddStaffRouteProp = RouteProp<AdminStackParamList, "AdminAddStaff">;

const AdminAddStaff = () => {
  
  const ROLE_OPTIONS = [
    { label: "Thu ngân", value: "cashier" },
    { label: "Đầu bếp", value: "chef" },
    { label: "Phục vụ", value: "waiter" },
  ]
  
  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  
  const route = useRoute<AdminAddStaffRouteProp>();
  const userId = route.params?.userId;
  const isEditing = Boolean(userId);
  
  const form = useForm<any>({
    resolver: zodResolver(isEditing ? editStaffSchema : addStaffSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
      phone: "",
      address: "",
    },
  });

  const { control, handleSubmit, formState: {errors}, setError, setValue, } = form;
  
  // Hàm chức năng tạo tài khoản
  const handleSubmitForm = async (data: registerForm) => {
    try {
      setLoading(true);

      if (isEditing) {

      } else {
        await authApi.register(data);
        success("Tạo tài khoản thành công!");
      }

      navigation.goBack();
    } catch (err: any) {
      // Thông báo lỗi
      console.log("❌ Lỗi API:", err.response?.data);
      const data = err.response?.data;

      if (data?.email?.[0]) setError("email", { message: data.email[0] });
      if (data?.non_field_errors?.[0]) setError("email", { message: data.non_field_errors[0] });
      else if (data?.message) error(data.message);
    } finally {
      setLoading(false);
    }
  }

  // hàm lấy thông tin user theo id
  const loadUserById = async (id: number) => {
    setLoading(true);
    try {
      const userById = await UserApi.getById(id);

      setValue("first_name", userById.first_name);
      setValue("last_name", userById.last_name);
      setValue("phone", userById.phone);
      setValue("address", userById.address);

    } catch (err: any) {
      error("Lấy thông tin người dùng thất bại!");
    } finally {
      setLoading(false);
    }
  }

  // load khi mở màn hình
  useEffect(() => {
    if (userId) {
      loadUserById(userId);
    }
  }, [userId]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
        <Icon name='arrow-left' style={styles.iconGoBack}/>
      </TouchableOpacity>
      <View style={styles.boxInput}>
        <Text style={styles.title}>{isEditing ? "Cập nhật thông tin nhân viên" : "Thêm tài khoản nhân viên"}</Text>
        {!isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Tên tài khoản</Text>
            <AppInput
              name='username'
              control={control}
              error={errors.username?.message as string | undefined}
            />
          </View>
        )}
        <View style={styles.item}>
          <Text style={styles.label}>Họ</Text>
          <AppInput
            name='first_name'
            control={control}
            error={errors.first_name?.message as string | undefined}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Tên</Text>
          <AppInput
            name='last_name'
            control={control}
            error={errors.last_name?.message as string | undefined}
          />
        </View>
        {!isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Chức vụ</Text>
            <AppDropdown
              name='role'
              control={control}
              options={ROLE_OPTIONS}
              label='Chọn chức vụ'
              error={errors.role?.message as string | undefined}
            />
          </View>
        )}
        {!isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Email</Text>
            <AppInput
              name='email'
              control={control}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message as string | undefined}
            />
          </View>
        )}
        <View style={styles.item}>
          <Text style={styles.label}>Số điện thoại</Text>
          <AppInput
            name='phone'
            control={control}
            keyboardType='phone-pad'
            placeholder="VD: 0901234567"
            error={errors.phone?.message as string | undefined}
            onChangeText={(text: string) =>
              text.replace(/[^0-9+]/g, "")
            }
          />
        </View>
        {isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Địa chỉ</Text>
            <AppInput
              name='address'
              control={control}
              error={errors.address?.message as string | undefined}
            />
          </View>
        )}
        {!isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Mật khẩu</Text>
            <AppInput
              name='password'
              control={control}
              secureTextEntry={true}
              error={errors.password?.message as string | undefined}
            />
          </View>
        )}
      </View>

      <AppButton
        title={isEditing ? "Cập nhật thông tin" : "Tạo tài khoản"}
        onPress={handleSubmit(handleSubmitForm)}
        style={styles.registerButton}
      />

      <AppLoadingOverlay
        visible={loading}
        title={isEditing ? "Đang cập nhật thông tin" : "Đang tạo tài khoản"}
      />
    </ScrollView>
  )
}

export default AdminAddStaff

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    flexGrow: 1,
  },
  goBackButton: {
    width: 50,
    height: 50,
    zIndex: 999,
  },
  iconGoBack: {
    fontSize: 20,
    color: "#545454",
  },
  boxInput: {
    flex: 1,
    alignItems: 'center',
    width: "100%",
  },
  title: {
    marginBottom: 16,
    fontSize: 32,
    fontWeight: "900",
    color: "#1ABDBE",
  },
  item: {
    width: '100%',
    gap: 5,
  },
  label: {
    fontSize: 16,
    color: "#909090",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#1ABDBE",
    width: '100%',
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
});