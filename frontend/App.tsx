/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator } from './src/navigation/authNavigation';
import AdminTabBottoms from './src/navigation/adminNavigation';

function App() {

  return (
    <SafeAreaProvider>
      <AdminTabBottoms/>
    </SafeAreaProvider>
  );
}


export default App;
