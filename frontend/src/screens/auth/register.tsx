import { Text, View, StyleSheet } from 'react-native'
import React, { useState } from 'react'
// components
import { AppButton, AppInput, AppTextLink, AppLoadingOverlay } from '../../components'
// navigation
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'
// validate
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type registerForm } from '../../validation/authValidation'
// thông báo
import { useNotify } from '../../providers/notificationProvider'
// api
import { authApi } from '../../api/auth.api'

const Register = () => {
  const { control, handleSubmit, formState: { errors }, setError } = useForm<registerForm>({
    resolver: zodResolver(registerSchema(false)),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "customer",
    },
  });

  const { success, error } = useNotify();
  const [ loading, setLoading ] = useState(false);
  const navigation = useNavigation<AuthNav>();

  // Hàm chức năng đăng ký
  const handleRegister = async (data: registerForm) => {
    try {
      setLoading(true);
      await authApi.register({
        username: data.username!,
        email: data.email,
        password: data.password!,
        first_name: data.first_name,
        last_name: data.last_name,
        role: "customer",
      });
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
      <View style={styles.boxInput}>
        <Text style={styles.title}>Đăng ký</Text>
        <View style={styles.item}>
          <Text style={styles.label}>Tên tài khoản</Text>
          <AppInput
            name='username'
            control={control}
            error={errors.username?.message}
          />
        </View>
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
          <Text>Bạn đã có tài khoản?</Text>
          <AppTextLink title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
        </View>
        <AppButton title={loading ? "Đang đăng ký" : "Đăng ký"} onPress={handleSubmit(handleRegister)} style={styles.registerButton}/>
      </View>

      <AppLoadingOverlay
        visible={loading}
        title='Đang đăng ký'
      />
    </View>
  )
}

export default Register

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
    width: "100%",
  },
  title: {
      marginBottom: 16,
      fontSize: 48,
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
  boxButton: {
    width: '80%',
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  registerButton: {
    backgroundColor: "#1ABDBE",
    width: '100%',
    alignItems: "center",
  },
  question: {
      flexDirection: 'row',
      gap: 8,
  },
});