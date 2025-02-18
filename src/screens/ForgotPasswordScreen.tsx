import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import Modal from 'react-native-modal';
import { sendPasswordResetEmail } from '../services/authService';
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import Loader from '../components/Loader';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

type ForgotPasswordScreenProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenProp>();
  const [email, setEmail] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModaErrorlMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSendResetEmail = async () => {

    if (!isValidEmail(email)) {
      setModaErrorlMessage(t('forgotPassword.invalidEmail'));
      setModalErrorVisible(true);
      return;
    }
    if (email.length < 6 || email.length > 320) {
      setModaErrorlMessage(t('forgotPassword.emailLengthError'));
      setModalErrorVisible(true);
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setModalSuccessMessage(t('forgotPassword.successMessage'));
      setModalSuccessVisible(true)
      setTimeout(() => {
        setModalSuccessVisible(false);
        navigation.navigate('Login');
      }, 3000);
    } catch (error) {
      setModaErrorlMessage(t('forgotPassword.errorMessage'));
      setModalErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader/>}
      <SemicirclesOverlay />
      <Image source={require('../../assets/images/logo.png')} style={styles.logoHome} contentFit="contain" />
      <Text style={styles.title}>{t('forgotPassword.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('forgotPassword.emailPlaceholder')}
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendResetEmail}>
        <Text style={styles.buttonText}>{t('forgotPassword.sendButton')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{t('forgotPassword.cancelButton')}</Text>
      </TouchableOpacity>
      {/* <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}
      <ErrorModal
        visible={modalErrorVisible}
        message={modalErrorMessage}
        onClose={() => setModalErrorVisible(false)}
      />
      <ExitoModal
        visible={modalSuccessVisible}
        message={modalSuccessMessage}
        onClose={() => {setModalSuccessVisible(false)}}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    marginTop: 25,
    color: colors.primary,
  },
  logoHome: {
    width: screenWidth*0.4,
    height: screenWidth*0.4
  },
  input: {
    height: 48,
    width: '80%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '50%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 48,
    justifyContent:'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#fff',
    color: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: "70%",
    alignSelf: 'center'
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
    color: colors.primary,
    textAlign:'center',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems:'center',
    justifyContent:'center',
    minHeight: 48,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '50%',
    alignItems:'center',
    justifyContent:'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
    minHeight: 48,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
