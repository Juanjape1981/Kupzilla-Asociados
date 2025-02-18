import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Platform, StatusBar, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../services/authService';
import { getMemoizedUserData } from '../redux/selectors/userSelectors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import colors from '../config/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CustomHeader: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useSelector(getMemoizedUserData);
  const [modalVisible, setModalVisible] = useState(false); 
  if (!user) return null;

  const handleLogout = () => {
    setModalVisible(false);
    dispatch(logoutUser() as any);
  };

  const goToProfile = () => {
    const screenPerfil = t("tabs.profile") == 'Profil'? 'Profil'  : t("tabs.profile") == 'Profile'?'Profile':'Perfil'
    setModalVisible(false);
    navigation.navigate('MainAppScreen', {
      screen: 'MainTabs',
      params: { screen:  screenPerfil},
    });
  };
  const goToLanguageScreen = () => {
    setModalVisible(false);
    navigation.navigate('Configuracion');
  };
  return (
    <View style={styles.headerContainer}>
        <Text style={styles.userName}>{t('navBar.greeting')}, {user.first_name}</Text>
        <TouchableOpacity style={styles.imageCont} onPress={() => setModalVisible(true)}>
      <View style={styles.avatarContainer}>
        {user?.image_url ? (
          <Image source={{ uri: `${API_URL}${user?.image_url}`}} style={styles.avatar} />
        ) : (
          <Image
          source={require('../../assets/noImageAvailable.png')}
            style={styles.avatar}
          />
        )}
      </View>
      </TouchableOpacity>
      {/* Modal para el popup */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.popupContainer}>
            <TouchableOpacity  onPress={goToProfile} style={styles.popupOption}>
            <FontAwesome name="user-circle" size={20} color={colors.primary} />
              <Text style={styles.popupText}>{t('navBar.profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToLanguageScreen} style={styles.popupOption}>
              <Ionicons name="language-outline" size={20} color={colors.primary} />
              <Text style={styles.popupText}>{t('language')}</Text> 
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.popupOption}>
            <MaterialCommunityIcons name="logout" size={20} color={colors.primary} />
              <Text style={styles.popupText}>{t('navBar.logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    minWidth:screenWidth*0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-around',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    padding: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    height:screenHeight * 0.11,
  },
  imageCont:{
    width:screenWidth * 0.3,
  },
  avatarContainer: {
    position:'relative',  
    flexDirection: 'row',
    right:0,
    width:45,
    height:45,
    marginLeft:'60%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 25,
  },
  avatar: {
    width: '100%',
    height: 'auto',
    borderRadius: 25,

  },
  nameContainer: {
    width:screenWidth * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContainer: {
    position: 'absolute',
    width:screenWidth*0.35,
    top: 60, 
    right: 20,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  popupOption: {
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-evenly',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  popupText: {
    fontSize: screenWidth*0.045,
    color: colors.primary,
  },
});

export default CustomHeader;
