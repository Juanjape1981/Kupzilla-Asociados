import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { userLogIn } from '../redux/actions/userActions';
import Loader from '../components/Loader';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';
import AppVersionChecker from '../components/checkAppVersion';
import colors from '../config/colors';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const appVersion = Constants.expoConfig?.version;
type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<LoginScreenProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  // const toggleModal = () => {
  //   setModalVisible(!isModalVisible);
  // };

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const lowerCaseEmail = email.trim().toLowerCase();


    if (!isEmailValid(lowerCaseEmail)) {
      setError(t('login.errorAlert.invalidEmailError'));
      setModalMessage(t('login.errorAlert.invalidEmailMessage'));
      setErrorModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch<any>(userLogIn(lowerCaseEmail, password));
      // console.log("Respuesta en la función handleLogin", response);

      // Validación del estado del usuario
      if (response.user.status.name !== 'active') {
        setModalMessage(t('login.errorAlert.inactiveAcconut'));
        setErrorModalVisible(true);
        return;
      }

      // Validación del rol del usuario
      const hasAssociatedRole = response.user.roles.some(
        (role: { role_name: string }) => role.role_name === 'associated'
      );
      if (!hasAssociatedRole) {
        setModalMessage(t('login.errorAlert.invalidRol'));
        setErrorModalVisible(true);
        return;
      }

      // Si pasa todas las validaciones
      setError(null);
      // setModalMessage('Bienvenido ' + response.user.first_name + '!');
      // toggleModal();
      setEmail('');
      setPassword('');
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate('MainAppScreen');
      }, 1500);
    } catch (err: any) {
      if (err.message == "No existe el usuario") {
        // "errorUserNotFound": "Användaren finns inte",
        // "errorInvalidPassword":
        setError(t('login.errorUserNotFound'));
        setModalMessage(t('login.errorUserNotFound'));
        setErrorModalVisible(true);
      }else if (err.message == "Contraseña inválida") {
        setError(t('login.errorInvalidPassword'));
        setModalMessage(t('login.errorInvalidPassword'));
        setErrorModalVisible(true);
      }else{
        setError(err.message);
        setModalMessage(err.message);
        setErrorModalVisible(true);
      }
      setEmail('');
      setPassword('');
      //ERR: modificar para que revise codigos devueltos por el backend, al asociar con texto depende de la traducción
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, '#f6f6f6']}
      style={styles.container}
    >
      <View style={styles.card}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logoLog} contentFit="contain" />
        <TextInput
          style={styles.input}
          placeholder={t('login.emailPlaceholder')}
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.circles2} />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.forgotPasswordButton}
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t('login.login')}</Text>
        </TouchableOpacity>
        <View style={styles.asociadosCont} >
          {/* <Image source={require('../../assets/images/adaptive-icon.png')} style={styles.logoAsociados} contentFit="contain"  /> */}
          <Text style={styles.asociadostext} >{t('login.associates')}</Text>

        </View>
        {loading && <Loader />}
      </View>
      <AppVersionChecker />
      {/* <Text  style={styles.versionText} >Version {appVersion}</Text> */}
      {/* <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}
      {/* Modales */}
      <ErrorModal
        visible={errorModalVisible}
        message={modalMessage}
        onClose={() => setErrorModalVisible(false)}
      />
      <ExitoModal
        visible={successModalVisible}
        message={modalMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f6f6f6',
    padding: 20,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',

    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  logoLog: {
    height: screenWidth * 0.45,
    width: screenWidth * 0.45,
    marginBottom: 5,
  },
  asociadosCont: {
    // position:'relative',
    display: 'flex',
    flexDirection: 'column',
    height: 50,
    width: screenWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoAsociados: {
    height: 120,
    width: 100,

  },
  asociadostext: {
    position: 'absolute',
    height: 50,
    fontFamily: 'Ice-Cream-Man-DEMO',
    color: colors.primary,
    fontSize: 18,
  },
  input: {
    minHeight: 48,
    width: '100%',
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: '100%',
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 0,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputPassword: {
    minHeight: 48,
    flex: 1,
    fontSize: 14,
  },
  error: {
    alignSelf: 'flex-end',
    marginRight: 10,
    color: '#e00d0d',
    marginTop: 5,
    fontSize: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter-Regular-400',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    fontFamily: 'Inter-Regular-400',
  },
  buttonSecondary: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Regular-400',
  },
  forgotPasswordButton: {

    marginTop: 20,
    width: '95%',
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    alignItems: 'flex-end'
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular-400',
  },
  modalContent: {
    backgroundColor: 'rgba(246, 246, 246, 0.9)',
    color: 'white',
    display: 'flex',
    alignSelf: 'center',
    flexDirection: 'column',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '70%',
    height: '30%',
    justifyContent: 'space-evenly'
  },
  modalMessage: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  modalButton: {
    minHeight: 48,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  versionText: {
    marginTop: 20,
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular-400',
    color: colors.primary,
    fontWeight: '400'
  }
});

export default LoginScreen;