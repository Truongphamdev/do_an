import { Text, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { theme } from '../../styles/theme'
import { AppButton, AppInput, AppTextLink, AppDropdown } from '../../components'
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type registerForm } from '../../validation/authValidation'
import { useNotify } from '../../providers/notificationProvider'
import { authApi } from '../../api/auth.api'

const Register = () => {
  const { control, handleSubmit, formState: { errors }, setError } = useForm<registerForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const navigation = useNavigation<AuthNav>();

  const ROLE_OPTIONS = [
    { label: 'Thu ngân', value: 'cashier' },
    { label: 'Đầu bếp', value: 'chef' },
    { label: 'Phục vụ', value: 'waiter' },
  ]

  // Hàm chức năng đăng ký
  const handleRegister = async (data: registerForm) => {
    try {
      setLoading(true);
      const response = await authApi.register(data);
      // Thông báo
      success("Tạo tài khoản thành công!");
      // Điều hướng
      navigation.navigate("Login");

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

  return (
    <View style={styles.container}>
      <View style={styles.registerBox}>
        <Text style={styles.title}>Đăng ký</Text>
        <AppInput
          name='username'
          control={control}
          placeholder='Tên tài khoản'
          error={errors.username?.message}
        />
        <AppInput
          name='first_name'
          control={control}
          placeholder='Họ'
          error={errors.first_name?.message}
        />
        <AppInput
          name='last_name'
          control={control}
          placeholder='Tên'
          error={errors.last_name?.message}
        />
        <AppInput
          name='email'
          control={control}
          placeholder='Email'
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />
        <AppInput
          name='password'
          control={control}
          placeholder='Mật khẩu'
          secureTextEntry={true}
          error={errors.password?.message}
        />
        <AppDropdown
          name='role'
          control={control}
          options={ROLE_OPTIONS}
          label='Chọn vai trò'
          error={errors.role?.message}
        />
        <AppButton title={loading ? "Đang đăng ký" : "Đăng ký"} onPress={handleSubmit(handleRegister)} style={styles.registerButton}/>
        <View style={styles.question}>
          <Text>Bạn đã có tài khoản?</Text>
          <AppTextLink title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </View>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  registerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
      marginBottom: 16,
      fontSize: 48,
      fontWeight: "900",
      color: "#1ABDBE",
  },
  registerButton: {
    backgroundColor: "#1ABDBE",
  },
  question: {
      flexDirection: 'row',
      gap: 8,
  },
});