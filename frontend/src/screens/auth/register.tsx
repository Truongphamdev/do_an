import { Text, View } from 'react-native'
import React, { useState } from 'react'
import { globalStyles } from '../../styles/style'
import { AppButton, AppInput, AppTextLink } from '../../components'
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation<AuthNav>();

  // Hàm chức năng đăng ký
  const handleRegister = () => {

  }

  return (
    <View style={globalStyles.container_login_register}>
      <View style={globalStyles.background_login_register}>
        <Text style={globalStyles.title_login_register}>Đăng ký</Text>
        <AppInput
          value={username}
          onChangeText={setUsername}
          placeholder="Tên tài khoản"
        />
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          secureTextEntry={true}
        />
        <AppButton title='Đăng ký' onPress={handleRegister} style={undefined} textStyle={undefined}/>
        <View style={globalStyles.question_login_register}>
          <Text>Bạn đã có tài khoản?</Text>
          <AppTextLink title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </View>
  )
}

export default Register