import { Text, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
// components
import { AppButton, AppDropdown, AppInput, AppLoadingOverlay } from '../../components'
// navigation
import { AdminStackParamList, AdminNav } from '../../navigation/adminStackNavigation'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
// validate
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type registerForm, registerSchema } from '../../validation/authValidation'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { authApi } from '../../api/auth.api'
import { UserApi } from '../../api/user.api'
// icon
import Icon from "react-native-vector-icons/FontAwesome5"

type AdminAddStaffRoute = RouteProp<AdminStackParamList, "AdminAddStaff">;

const AdminAddStaff = () => {
  
  const ROLE_OPTIONS = [
    { label: "Thu ngân", value: "cashier" },
    { label: "Đầu bếp", value: "chef" },
    { label: "Phục vụ", value: "waiter" },
  ]
  
  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const navigation = useNavigation<AdminNav>();
  
  const route = useRoute<AdminAddStaffRoute>();
  const userId = route.params?.userId;
  const isEditing = Boolean(userId);
  
  const { control, handleSubmit, formState: {errors}, setError, setValue, } = useForm<registerForm>({
    resolver: zodResolver(registerSchema(isEditing)),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      ...(isEditing
        ? {}
        : {
          username: "",
          email: "",
          password: "",
          role: undefined,
        }
      ),
    },
  });
  
  // Hàm chức năng tạo tài khoản
  const handleSubmitForm = async (data: registerForm) => {
    console.log("🔥 SUBMIT FORM DATA:", data);
    try {
      setLoading(true);

      if (isEditing) {
        await UserApi.updateStaff(userId!, {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
        });
        success("Cập nhật thông tin nhân viên thành công!");
      } else {
        await authApi.register({
          email: data.email!,
          username: data.username!,
          password: data.password!,
          role: data.role!,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
        });
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
      setValue("phone", userById.phone ?? "");
      setValue("address", userById.address ?? "");

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
              error={errors.username?.message}
            />
          </View>
        )}
        <View style={styles.item}>
          <Text style={styles.label}>Họ</Text>
          <AppInput
            name='first_name'
            control={control}
            error={errors.first_name?.message}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Tên</Text>
          <AppInput
            name='last_name'
            control={control}
            error={errors.last_name?.message}
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
              error={errors.role?.message}
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
              error={errors.email?.message}
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
            error={errors.phone?.message}
            onChangeText={(text: string) =>
              text.replace(/[^0-9+]/g, "")
            }
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Địa chỉ</Text>
          <AppInput
            name='address'
            control={control}
            error={errors.address?.message}
          />
        </View>
        {!isEditing && (
          <View style={styles.item}>
            <Text style={styles.label}>Mật khẩu</Text>
            <AppInput
              name='password'
              control={control}
              secureTextEntry={true}
              error={errors.password?.message}
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
    color: "#0066cc",
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
    backgroundColor: "#0066cc",
    width: '100%',
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
});