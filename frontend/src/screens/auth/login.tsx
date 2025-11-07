import { Text, View, StyleSheet } from 'react-native'
import React, { useState} from 'react'
import { theme } from '../../styles/theme'
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
  const { control, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
      console.log("❌ Lỗi API:", err.response?.data);
      const data = err.response?.data;

      if (data?.email?.[0]) setError("email", { message: data.email[0] });
      if (data?.password?.[0]) setError("password", { message: data.password[0] });
      if (data?.non_field_errors?.[0]) {
        const msg = data.non_field_errors[0];
        if (msg.toLowerCase().includes("email")) setError("email", { message: msg });
        else setError("password", { message: msg });
      }
      else if (data?.message) error(data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
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
      <View style={styles.question}>
        <Text>Bạn chưa có tài khoản?</Text>
        <AppTextLink title="Đăng ký" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
      marginBottom: 16,
      fontSize: 48,
      fontWeight: "900",
      color: theme.color.primary,
  },
  question: {
      flexDirection: 'row',
      gap: 8,
  },
});