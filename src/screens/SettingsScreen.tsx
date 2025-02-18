import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import colors from '../config/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SettingsScreen = () => {
    const { t } = useTranslation();
  return (
    <View style={styles.container}>
        <SemicirclesOverlay />
      <Text style={styles.title}>{t('sidebar.settings')}</Text>
      <View style={styles.btnSelectlang}>
        <LanguageSelector />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop:30,
    // backgroundColor: '#fff',
    alignItems:'center'
  },
  title: {
   color:colors.background_ligth,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 55,
  },
  btnSelectlang:{
    marginTop:screenWidth*0.2,
    // borderRadius:20,
    // display:'flex',
    // justifyContent:'center',
    // alignItems:'center',
    // alignContent:'center',
    // textAlign:'center',
    // width: screenWidth*0.45,
    // height:48,
    // backgroundColor:colors.primary,
  }
});

export default SettingsScreen;