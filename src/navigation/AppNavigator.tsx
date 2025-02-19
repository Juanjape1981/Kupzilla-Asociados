import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import MainAppScreen from '../screens/MainAppScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomHeader from '../components/CustomHeader';
import { useSelector } from 'react-redux';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PromotionDetailScreen from '../screens/PromotionDetailScreen';
import { Promotion, TouristPoint } from '../redux/types/types';
import { getMemoizedAccessToken } from '../redux/selectors/userSelectors';
import BranchDetails from '../screens/BranchDetails ';
import LandingPage from '../screens/LandingPage';
import colors from '../config/colors';
import SettingsScreen from '../screens/SettingsScreen';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';



export type RootStackParamList = {
  MainAppScreen?: { screen: 'MainTabs'; params: { screen: keyof MainTabsParamList } };
  MainTabs: undefined;
  Landing: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  FavoritesScreen: undefined;
  PromotionsScreen: undefined;
  ResetPassword: undefined;
  PromotionDetail: { promotion: Promotion };
  TouristDetailScreen: { touristPoint: TouristPoint };
  BranchDetails: undefined;
  Configuracion: undefined;
};
export type MainTabsParamList = {
  Perfil: undefined;
  Profile:undefined;
  Profil:undefined;
  // OtroTab: undefined;
};
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const accessToken = useSelector(getMemoizedAccessToken);
  const isAuthenticated = !!accessToken;
  const { t } = useTranslation();

  return (
    // <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "MainAppScreen" : "Landing"} screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainAppScreen"
              component={MainAppScreen}
              options={{
                headerShown: true,
                header: () => <CustomHeader />
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
                headerTitle: 'Perfil',
                headerStyle: { backgroundColor:colors.primary },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="PromotionDetail"
              component={PromotionDetailScreen}
              options={{
                headerShown: false,
                headerTitle: "Detalles",
                headerStyle: { backgroundColor:colors.primary },
                headerTintColor: '#fff',
              }} />
              <Stack.Screen
              name="BranchDetails"
              component={BranchDetails}
              options={{
                headerShown: true,
                header: () => <CustomHeader />
              }}
              />
              <Stack.Screen
              name="Configuracion"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: t('branchDetails.goBack') ,
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontSize: screenWidth*0.05,
                  fontWeight: 'bold',
                },
              }}
            />
            
          </>
        )}
      </Stack.Navigator>
    // </NavigationContainer>
  );
};

export default AppNavigator;

