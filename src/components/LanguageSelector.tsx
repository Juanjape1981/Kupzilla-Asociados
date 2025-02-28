import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import i18n from '../utils/i18n';
import { useTranslation } from 'react-i18next';
import colors from '../config/colors';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LanguageSelector: React.FC = () => {
  const currentLanguage = i18n.language;
  const { t } = useTranslation();
const [NewLanguage, setNewLanguage] = useState(false);

  const changeLanguageSelect = (lng: string) => {
    i18n.changeLanguage(lng);
  };
const widthFlag = Platform.OS == 'android'? 40 : 50
const heightFlag = Platform.OS == 'android'? 40 : 50
const widthNotFlag = Platform.OS == 'android'? 30 : 40
const heightNotFlag = Platform.OS == 'android'? 30: 40

  const getFlagStyle = (lng: string) => {
    return {
      width: currentLanguage === lng  ? widthFlag : widthNotFlag,
      height: currentLanguage === lng ? heightFlag : heightNotFlag,
    };
  };

  return (
    <View style={NewLanguage? styles.btnNewLang:styles.btnLang}>
        {NewLanguage? 
        <>
      <TouchableOpacity style={{ height:40}} onPress={() => changeLanguageSelect('es')}>
        <Image 
          source={require('../../assets/images/es_flag.png')} 
          style={getFlagStyle('es')} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={{ height:40}} onPress={() => changeLanguageSelect('en')}>
        <Image 
          source={require('../../assets/images/en_flag.png')} 
          style={getFlagStyle('en')} 
        />
      </TouchableOpacity>
      <TouchableOpacity style={{ height:40}} onPress={() => changeLanguageSelect('sv')}>
        <Image 
          source={require('../../assets/images/sv_flag.png')} 
          style={getFlagStyle('sv')} 
        />
      </TouchableOpacity></>:
      <TouchableOpacity  style={{ height:48, width:screenWidth*0.4, flexDirection:'row', display:'flex', justifyContent:'space-around',alignItems:'center'}} onPress={() => setNewLanguage(true)}>
        <MaterialIcons name="language" size={24} color="#fff" />
      <Text style={styles.Text}>{t('languageSelector.chooseLanguage')}</Text>
    </TouchableOpacity>
}
    </View>
  );
};
const styles = StyleSheet.create({
    Text:{
        color: colors.background_ligth,
        fontSize: 14,
        fontWeight:"bold",
        fontFamily: 'Inter-Regular-400',
    },
    btnLang:{
      flexDirection: 'row',
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      borderRadius:20,
      padding:10, 
      height:48, 
      marginBottom:10,
      backgroundColor: colors.primary
    },
    btnNewLang:{
      marginBottom:10,
      flexDirection: 'row',
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      borderRadius:20,
      padding:10, 
      height:48, 
      backgroundColor: 'transparent'
    }
});
export default LanguageSelector;