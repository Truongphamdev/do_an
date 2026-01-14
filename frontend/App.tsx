/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/rootNavigator';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import { NotificationProvider } from './src/providers/notificationProvider';
import { AuthProvider } from './src/providers/authProvider';

function App() {

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigator/>
            </NavigationContainer>
            <FlashMessage position="top"/>
          </NotificationProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


export default App;
