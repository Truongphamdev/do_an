import { Text, View } from 'react-native'
import React, { useState} from 'react'
import { globalStyles } from '../../styles/style'
import { AppButton, AppInput, AppTextLink } from '../../components'
import { AuthNav } from '../../navigation/authNavigation'
import { useNavigation } from '@react-navigation/native'



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const navigation = useNavigation<AuthNav>();

  // Hàm chức năng đăng nhập
  const handleLogin = () => {

  }

  return (
    <View style={globalStyles.container_login_register}>
      <View style={globalStyles.background_login_register}>
        <Text style={globalStyles.title_login_register}>Đăng nhập</Text>
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
        <AppButton title='Đăng nhập' onPress={handleLogin} style={undefined} textStyle={undefined}/>
        <View style={globalStyles.question_login_register}>
          <Text>Bạn chưa có tài khoản?</Text>
          <AppTextLink title="Đăng ký" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </View>
  )
}

export default Login