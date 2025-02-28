import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';
import colors from '../config/colors';
import { Easing } from 'react-native';
import { Image } from 'expo-image';
import { RootStackParamList } from '../navigation/AppNavigator';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
interface FloatingImageProps {
  source: number; // Para imágenes locales (require)
  size: number;
  top: number;
  left: number;
}
// const floatingImages = [
//   { source: require('../../assets/images/15.png'), size: 60, top: screenHeight * 0.1, left: screenWidth * 0.1 },
//   { source: require('../../assets/images/20.png'), size: 60, top: screenHeight * 0.3, left: screenWidth * 0.67 },
//   { source: require('../../assets/images/25.png'), size: 70, top: screenHeight * 0.28, left: screenWidth * 0.2 },
//   { source: require('../../assets/images/30.png'), size: 100, top: screenHeight * 0.05, left: screenWidth * 0.7 },
//   { source: require('../../assets/images/50.png'), size: 90, top: screenHeight * 0.45, left: screenWidth * 0.10 },
//   { source: require('../../assets/images/15.png'), size: 50, top: screenHeight * 0.45, left: screenWidth * 0.75 }
// ];


// const FloatingImage: React.FC<FloatingImageProps> = ({ source, size, top, left }) => {
//   const translateY = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(translateY, {
//           toValue: 10,
//           duration: 3000,
//           useNativeDriver: true,
//           easing: Easing.ease,
//         }),
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 3000,
//           useNativeDriver: true,
//           easing: Easing.ease,
//         }),
//         Animated.timing(translateY, {
//           toValue: -10,
//           duration: 3000,
//           useNativeDriver: true,
//           easing: Easing.ease,
//         }),
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 3000,
//           useNativeDriver: true,
//           easing: Easing.ease,
//         }),
//       ])
//     ).start();
//   }, []);

//   return (
//     <Animated.Image
//       source={source}
//       style={[styles.floatingImage, { width: size, height: size, top, left, transform: [{ translateY }] }]}
//       resizeMode="contain"
//     />
//   );
// };

const LandingPage: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t, i18n } = useTranslation();
  return (
    <View style={styles.background}>
      {/* {floatingImages.map((img, index) => (
        <FloatingImage key={index} {...img} />
      ))} */}

      <View style={styles.logoContainer}>
        {/* <Image source={require('../../assets/images/KUPZILLA.png')} style={styles.nameImage} /> */}
        <Image source={require('../../assets/images/KUPZILLA.png')} style={styles.logoImage} contentFit="contain"/>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>{t('landing.readyToEnjoy')}</Text>
        <View style={styles.cardTextContainer}>
        <Text style={styles.cardText3}>{t('landing.andTheBest')}</Text>
          <Text style={styles.cardTextGreen4}>{t('landing.promotions')}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>{t('landing.enjoyDiscountsHere')}</Text>
          <Ionicons name="storefront-outline" size={24} color={colors.background_ligth} />
        </TouchableOpacity>
        <View style={styles.buttonLanguage}>
          <LanguageSelector/>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    zIndex:-1,
    top: screenHeight*-0.18,
    width: screenWidth*1.2,
    height: screenHeight*1.135,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  nameImage: {
    marginBottom: 50,
    width: screenWidth * 0.7,
    height: screenWidth * 0.14,
  },
  card: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    alignItems: 'center',
    width: screenWidth,
    position: 'absolute',
    height: screenHeight * 0.25,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTextContainer: {
    width: screenWidth * 0.9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 0,
  },
  cardText: {
    fontSize: screenWidth * 0.06,
    // fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    fontFamily: 'Ice-Cream-Man-DEMO',
    textAlign: 'center',
    color: colors.background_ligth,
    width: screenWidth,
    marginBottom: 0,
  },
  cardText3: {
    fontSize: screenWidth * 0.056,
    // fontWeight: 'bold',
    lineHeight: 30,
    textAlign: 'right',
    color: colors.background_ligth,
    fontFamily: 'Ice-Cream-Man-DEMO',
    width: screenWidth * 0.38,
  },
  cardTextGreen4: {
    fontSize: screenWidth * 0.06,
    fontFamily: 'Ice-Cream-Man-DEMO',
    // fontWeight: Platform.select({ ios: '900', android: '800' }),
    lineHeight: 30,
    marginLeft: 6,
    textAlign: 'left',
    color: colors.background_ligth,
    width: screenWidth * 0.38,
  },
  button: {
    marginTop: 5,
    backgroundColor: colors.orange_color,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '90%',
    minHeight: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: colors.background_ligth,
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
  },
  buttonLanguage:{
    marginBottom:0
  }
});

export default LandingPage;

