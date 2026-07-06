import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import type { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import TareasScreen from './src/screens/TareasScreen';
import ListadoScreen from './src/screens/ListadoScreen';
import MarcasScreen from './src/screens/MarcasScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="Tareas" component={TareasScreen} />
            <Stack.Screen name="Listado" component={ListadoScreen} />
            <Stack.Screen name="Marcas" component={MarcasScreen} options={{ title: 'Marcas' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
      <StatusBar style="auto" />
    </Provider>
  );
}
