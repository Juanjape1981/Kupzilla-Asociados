import  { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Provider } from 'react-redux';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import store from '@/src/redux/store/store';
import AppNavigator from '@/src/navigation/AppNavigator';
import colors from '@/src/config/colors';

interface TextWithDefaultProps extends Text {
  defaultProps?: { allowFontScaling?: boolean };
}

interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { allowFontScaling?: boolean };
}


((Text as unknown) as TextWithDefaultProps).defaultProps = ((Text as unknown) as TextWithDefaultProps).defaultProps || {};
((Text as unknown) as TextWithDefaultProps).defaultProps!.allowFontScaling = false;
((TextInput as unknown) as TextInputWithDefaultProps).defaultProps = ((TextInput as unknown) as TextInputWithDefaultProps).defaultProps || {};
((TextInput as unknown) as TextInputWithDefaultProps).defaultProps!.allowFontScaling = false;

SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  // Carga de fuentes
  const [fontsLoaded] = useFonts({
    'Inter-Regular-400': require('../assets/fonts/Inter-Regular-400.otf'),
    'Ice-Cream-Man-DEMO': require('../assets/fonts/Ice-Cream-Man.otf'),
  });
  console.log(fontsLoaded ? 'Fuente cargada' : 'Fuente NO cargada');
  useEffect(() => {
    const prepareApp = async () => {
      // Aseguramos que el splash dure al menos 2 segundos
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Una vez cargadas las fuentes y pasado el tiempo, ocultamos el splash
      if (fontsLoaded) {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [fontsLoaded]);

  if (!isReady) {
    return null;
  }


  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.primary}/>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;