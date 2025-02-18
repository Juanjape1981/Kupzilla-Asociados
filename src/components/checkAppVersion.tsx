import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, Modal, TouchableOpacity, Linking } from 'react-native';
import axios from 'axios';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';
const { width: screenWidth } = Dimensions.get('window');

const AppVersionChecker: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateData, setUpdateData] = useState<{ isRequired: boolean; downloadUrl: string } | null>(null);
  const { t } = useTranslation();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const currentVersion = process.env.EXPO_PUBLIC_API_VERSION ?? '0.0.0';

  useEffect(() => {
    const checkAppVersion = async () => {
      const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';

      try {
        const { data } = await axios.get(
          `${API_URL}/versions/active/${platform}?app_type=associated`
        );
        // console.log("data de la version", data);
        
        const latestVersion = data.version_number;
        const downloadUrl = data.download_url;
        const isRequired = data.is_required;

        if (isVersionOutdated(currentVersion, latestVersion)) {
          setUpdateData({ isRequired, downloadUrl });
          setIsModalVisible(true);
        }
      } catch (error) {
        console.error('Error al comprobar la versión de la app:', error);
      }
    };

    checkAppVersion();
  }, []);

  const isVersionOutdated = (current: string, latest: string): boolean => {
    const parseVersion = (version: string) => version.split('.').map(Number);
    const [currentMajor, currentMinor, currentPatch] = parseVersion(current);
    const [latestMajor, latestMinor, latestPatch] = parseVersion(latest);

    return (
      latestMajor > currentMajor ||
      (latestMajor === currentMajor && latestMinor > currentMinor) ||
      (latestMajor === currentMajor &&
        latestMinor === currentMinor &&
        latestPatch > currentPatch)
    );
  };

  const openAppStore = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Error al abrir la tienda de aplicaciones:', err)
    );
  };

  const handleUpdate = () => {
    if (updateData) {
      openAppStore(updateData.downloadUrl);
    }
  };

  const closeModal = () => {
    if (updateData?.isRequired) return;
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('login.version')}: {currentVersion}</Text>
      
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
           {updateData?.isRequired?
           <Feather name="alert-triangle" size={28} color="#f9d400" />:
           <Feather name="alert-octagon" size={28} color="#cc0000" />
           }
            <Text style={styles.modalTitle}>{t('update.available')}</Text>
            <Text style={styles.modalMessage}>
              {updateData?.isRequired
                ? t('update.message_required')
                : t('update.message_optional')}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>{t('update.update_button')}</Text>
              </TouchableOpacity>
              {!updateData?.isRequired && (
                <TouchableOpacity style={styles.laterButton} onPress={closeModal}>
                  <Text style={styles.laterButtonText}>{t('update.later_button')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular-400',
    color: colors.primary,
    fontWeight: '400',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: screenWidth*0.05,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: colors.primary,
  },
  modalMessage: {
    fontSize: screenWidth*0.04,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  updateButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 25,
    marginRight: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  laterButton: {
    flex: 1,
    backgroundColor: '#eaeaea',
    padding: 10,
    borderRadius: 25,
    marginLeft: 5,
    alignItems: 'center',
  },
  laterButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default AppVersionChecker;
