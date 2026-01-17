import { Text, View, StyleSheet } from 'react-native'
import React, { useState} from 'react'
// component
import { AppButton, AppInput, AppTextLink, AppLoadingOverlay } from '../../components'
// navigation
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'
// validate
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginForm } from '../../validation/authValidation'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { authApi } from '../../api/auth.api'
// auth
import { useAuth, UserRole } from '../../providers/authProvider'

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

      const { user, access, refresh } = response;
      // Thông báo
      success("Đăng nhập thành công!");
      // gọi AuthContext để xử lý
      await login({...user, role: user.role as UserRole}, access, refresh);

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
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.boxInput}>
        <Text style={styles.title}>Đăng nhập</Text>
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
        <View style={styles.item}>
          <Text style={styles.label}>Mật khẩu</Text>
          <AppInput
            name='password'
            control={control}
            secureTextEntry={true}
            error={errors.password?.message}
          />
        </View>
      </View>
      <View style={styles.boxButton}>
        <View style={styles.question}>
          <Text>Bạn chưa có tài khoản?</Text>
          <AppTextLink title="Đăng ký" onPress={() => navigation.navigate('Register')} />
        </View>
        <AppButton title={loading ? "Đang đăng nhập" : "Đăng nhập"} onPress={handleSubmit(handleLogin)} style={styles.loginButton}/>
      </View>

      <AppLoadingOverlay
        visible={loading}
        title='Đang đăng nhập...'
      />
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  boxInput: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  title: {
      marginBottom: 16,
      fontSize: 48,
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
  boxButton: {
    width: '80%',
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#0066cc",
    width: '100%',
    alignItems: "center",
  },
  question: {
      flexDirection: 'row',
      gap: 8,
  },
});