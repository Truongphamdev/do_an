import { Text, View } from 'react-native'
import React, { useState} from 'react'
import { globalStyles } from '../../styles/style'
import { AppButton, AppInput, AppTextLink } from '../../components'
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginForm } from '../../validation/authValidation'
import { useNotify } from '../../providers/notificationProvider'
import { authApi } from '../../api/auth'
import { useAuth } from '../../providers/authProvider'

const Login = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  
  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<AuthNav>();

  // Hàm chức năng đăng nhập
  const handleLogin = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await authApi.login(data);

      const { user, access, refresh } = response.data;
      // Thông báo
      success("Đăng nhập thành công!");
      // gọi AuthContext để xử lý
      await login(user, access, refresh);

    } catch (err: any) {
      // Thông báo lỗi
      error(err.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={globalStyles.container_login_register}>
      <Text style={globalStyles.title_login_register}>Đăng nhập</Text>
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
      <AppButton title={loading ? "Đang đăng nhập" : "Đăng nhập"} onPress={handleSubmit(handleLogin)} style={undefined} textStyle={undefined}/>
      <View style={globalStyles.question_login_register}>
        <Text>Bạn chưa có tài khoản?</Text>
        <AppTextLink title="Đăng ký" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  )
}

export default Login