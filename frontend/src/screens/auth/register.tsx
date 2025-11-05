import { Text, View } from 'react-native'
import React, { useState } from 'react'
import { globalStyles } from '../../styles/style'
import { AppButton, AppInput, AppTextLink, AppDropdown } from '../../components'
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type registerForm } from '../../validation/authValidation'
import { useNotify } from '../../providers/notificationProvider'
import { authApi } from '../../api/auth'

const Register = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<registerForm>({
    resolver: zodResolver(registerSchema),
  });

  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const navigation = useNavigation<AuthNav>();

  const ROLE_OPTIONS = [
    { label: 'Admin', value: 'admin' },
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
      error(err.response?.data?.message || "Đăng ký thất bại!")
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={globalStyles.container_login_register}>
      <Text style={globalStyles.title_login_register}>Đăng ký</Text>
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
      />
      <AppButton title={loading ? "Đang đăng ký" : "Đăng ký"} onPress={handleSubmit(handleRegister)} style={undefined} textStyle={undefined}/>
      <View style={globalStyles.question_login_register}>
        <Text>Bạn đã có tài khoản?</Text>
        <AppTextLink title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  )
}

export default Register