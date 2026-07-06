import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { colors } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import TareasScreen from './src/screens/TareasScreen';
import ListadoScreen from './src/screens/ListadoScreen';
import MarcasScreen from './src/screens/MarcasScreen';
import CatalogoScreen from './src/screens/CatalogoScreen';
import ModelosScreen from './src/screens/ModelosScreen';
import InfoScreen from './src/screens/InfoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: colors.primaryDark },
              headerTintColor: colors.onPrimary,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
            <Stack.Screen name="Tareas" component={TareasScreen} />
            <Stack.Screen name="Listado" component={ListadoScreen} />
            <Stack.Screen name="Marcas" component={MarcasScreen} options={{ title: 'Marcas' }} />
            <Stack.Screen name="Catalogo" component={CatalogoScreen} options={{ title: 'Marcas en vivo' }} />
            <Stack.Screen
              name="Modelos"
              component={ModelosScreen}
              options={({ route }) => ({ title: route.params.marca })}
            />
            <Stack.Screen name="Info" component={InfoScreen} options={{ title: 'Cómo funciona' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
      <StatusBar style="light" />
    </Provider>
  );
}
