import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image, Alert, TextInput, TouchableWithoutFeedback } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useDispatch, useSelector } from 'react-redux';
import { Promotion, UserData } from '../redux/types/types';
import { getMemoizedAccessToken, getMemoizedUserData } from '../redux/selectors/userSelectors';
import { fetchPartnerById, getUserInfo, logOutUser } from '../redux/actions/userActions';
import { AppDispatch } from '../redux/store/store';
import { fetchConsumedPromotions, fetchPromotions, submitConsumption } from '../redux/actions/promotionsActions';
import { getMemoizedConsumedPromotions, getMemoizedPromotions } from '../redux/selectors/promotionSelectors';
import { loadData } from '../redux/actions/dataLoader';
import { fetchBranches } from '../redux/actions/branchActions';
import Feather from '@expo/vector-icons/Feather';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import { Modal } from 'react-native';
import { getMemoizedStates } from '../redux/selectors/globalSelectors';
import ConsumedPromotionsModal from '../components/ConsumedPromotionsModalProps ';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import TermsModal from '../components/TermsModal';
import Loader from '../components/Loader';
import ExitoModal from '../components/ExitoModal';
import ErrorModal from '../components/ErrorModal';
import { ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from '@expo/vector-icons/Feather';
import { KeyboardAvoidingView, Platform, Keyboard,Touchable } from 'react-native';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
type homeScreenProp = StackNavigationProp<RootStackParamList>;
const API_URL = process.env.EXPO_PUBLIC_API_URL;
interface ScanData {
  type: string;
  data: string;
}

const QRScanButton = () => {
  const user = useSelector(getMemoizedUserData) as UserData;
  const statuses = useSelector(getMemoizedStates);
  const accessToken = useSelector(getMemoizedAccessToken);
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const lineAnimation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<homeScreenProp>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const promotions = useSelector(getMemoizedPromotions);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedEmail, setScannedEmail] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [scannedUser, setScannedUser] = useState<string | null>(null);
  const [quantityConsumed, setQuantityConsumed] = useState('');
  const [amountSpent, setAmountSpent] = useState('');
  const [description, setDescription] = useState('');
  const currentDate = new Date();
  const promotionsConsumed = useSelector(getMemoizedConsumedPromotions);
  const [modalConsumedVisible, setModalConsumedVisible] = useState<boolean>(false);
  const [isModalTermsVisible, setModalTermsVisible] = useState(false);
  const [currentTerms, setCurrentTerms] = useState<any>(undefined);
  const [isloading, setIsLoading] = useState(false);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  // console.log("access token",accessToken);
  // console.log("terminos actuales",currentTerms);
  // console.log("promotions",promotions.length);
  // console.log("statuses",statuses);
  // console.log("promotions consumidas",promotionsConsumed);
  const filteredPromotions = promotions.filter(promotion => {
    const startDate = new Date(promotion.start_date);
    const expirationDate = new Date(promotion.expiration_date);
    return promotion.status?.name === 'active' && currentDate >= startDate && currentDate <= expirationDate;
  });
  // console.log("filteredPromotions",filteredPromotions);
  // console.log("promocion seleccionada",selectedPromotion);
  useEffect(() => {
    dispatch(loadData());
    fetchCurrentTerms();
    if (user) {
      dispatch(fetchPartnerById(user.user_id));
      dispatch(fetchPromotions(user.user_id));
      dispatch(fetchBranches(user.user_id));
      dispatch(fetchConsumedPromotions(user.user_id));

    }
    // Solicitar permiso de la cámara si no está concedido
    if (!permission) {
      requestPermission();
    } else if (!permission.granted) {
      Alert.alert(
        t('qrScanner.permissionAlert.title'),
        t('qrScanner.permissionAlert.message'),
        [
          {
            text:  t('qrScanner.permissionAlert.requestPermission'),
            onPress: requestPermission,
          },
          {
            text: t('qrScanner.permissionAlert.cancel'),
            style: "cancel",
          },
        ]
      );
    } else {
      setHasPermission(permission.granted);
    }
  }, [permission]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    startLineAnimation();
  }, [cameraVisible]);

  const fetchCurrentTerms = async () => {
    try {
      const response = await axios.get(`${API_URL}/terms`);
      // console.log("respuesta del back", response);

      setCurrentTerms(response.data);
    } catch (error) {
      console.error('Error al obtener los términos:', error);
    }
  };

  useEffect(() => {
    if (user?.terms && currentTerms !== undefined && user.terms?.version !== currentTerms?.version) {
      setModalTermsVisible(true);
    }
    if (user?.terms === null) {
      setModalTermsVisible(true);
    }
  }, [user, currentTerms]);

  const handleAcceptTerms = async () => {
    try {
      setIsLoading(true)
      await axios.put(`${API_URL}/users/${user.user_id}/accept-terms`);
      await dispatch(getUserInfo(accessToken))
      setModalTermsVisible(false);
      setIsLoading(false)
      showSuccessModal(t('qrScanner.termsModal.termsAcceptedMessage'));
    } catch (error) {
      console.error('Error al aceptar los términos:', error);
    }
  };
  const handleCancelTerms = async () => {
    await dispatch(logOutUser());
    setModalTermsVisible(false);
    showErrorModal(t('qrScanner.termsModal.termsNotAcceptedMessage'));
    navigation.navigate('Login');
  };

  const isFormValid = () => {
    return (
      selectedPromotion &&
      parseInt(quantityConsumed, 10) > 0 &&
      parseFloat(amountSpent) > 0
    );
  };

  const startLineAnimation = () => {
    Animated.sequence([
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(lineAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const translateY = lineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 185], // Ajusta este valor para controlar el recorrido de la línea
  });

  const handleQRScan = () => {
    if (hasPermission) {
      setCameraVisible(true);
      timeoutRef.current = setTimeout(() => {
        setCameraVisible(false);
      }, 10000);
    } else {
      showErrorModal(t('qrScanner.permissionAlert.goToSettings'));
    }
  };

  const handleBarCodeScanned = ({ type, data }: ScanData) => {
    console.log('Scanned QR Code:', data);
    setCameraVisible(false);
    const [userId, email] = data.split('-');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!userId || !email || !emailRegex.test(email)) {
    showErrorModal(t('qrScanner.invalidUser'));
    return;
  }
    setScannedUser(userId);
    setScannedEmail(email)
    setModalVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  const handlePromotionSelect = (promotionId: number) => {
    const selectedPromotion = filteredPromotions.find(promo => promo.promotion_id == promotionId);
    if (selectedPromotion) {
      setSelectedPromotion(selectedPromotion);
    } else {
      setSelectedPromotion(null); 
    }
  };

  const handleConfirm = async () => {

    if (!isFormValid()) {
      showErrorModal(t('qrScanner.errorAlert.field'));
      return;
    }
    
    const status = statuses.find(status => status.name === 'active');

    if (!selectedPromotion || !quantityConsumed || !amountSpent) {
      showErrorModal(t('qrScanner.errorAlert.field'));
      return;
    }

    const data = {
      user_id: scannedUser && parseInt(scannedUser, 10),
      promotion_id: selectedPromotion?.promotion_id,
      status_id: status?.id,
      quantity_consumed: parseInt(quantityConsumed, 10),
      consumption_date: new Date().toISOString(),
      description,
      amount_consumed: parseFloat(amountSpent),
    };

    // console.log("datos de la consumition",data);

    try {
      const result = await dispatch(submitConsumption(data));
      if (result?.status == 200) {
        await dispatch(fetchPromotions(user.user_id));
        await dispatch(fetchConsumedPromotions(user.user_id));
        setSelectedPromotion(null);
        setQuantityConsumed('');
        setAmountSpent('');
        setDescription('');
        setScannedUser(null);
        setScannedEmail(null);
        showSuccessModal(t('qrScanner.successAlert.message'));
      } else {
        showErrorModal(t('qrScanner.errorAlert.message'));
      }
    } catch (error) {
      showErrorModal(t('qrScanner.errorAlert.message'));
    }

    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedPromotion(null);
    setQuantityConsumed('');
    setAmountSpent('');
    setDescription('');
    setScannedUser(null);
    setScannedEmail(null);
  };
  const handleCloseCamera = () => {
    setCameraVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  const handleQuantityChange = (text: string) => {
    const quantity = parseInt(text, 10);
    if (text.length > 10) {
      showErrorModal(t('qrScanner.errorAlert.dig'));
      return;
    }
    if (selectedPromotion && selectedPromotion.available_quantity && quantity > selectedPromotion.available_quantity) {
      showErrorModal(`${t('qrScanner.errorAlert.dig')} ${selectedPromotion.available_quantity} ${t('qrScanner.errorAlert.dig')}`);
      return;
    }
    setQuantityConsumed(text);
  };
  const handleDescriptionChange = (text: string) => {
    if (text.length > 255) {
      showErrorModal(t('qrScanner.errorAlert.desc'));
      return;
    }
    setDescription(text);
  };
  const openConsumedPromotionsModal = () => {
    setModalConsumedVisible(true);
  };
  const handleAmountChange = (text: string) => {
    const formattedText = text.replace(/[^0-9]/g, '');
    if (formattedText.length <= 15) {
      setAmountSpent(formattedText);
    } else {
      Alert.alert("Error", t('qrScanner.errorAlert.dig15'));
    }
  };
  // Función para cerrar el modal
  const closeConsumedPromotionsModal = () => {
    setModalConsumedVisible(false);
  };

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalErrorVisible(true);
  };
  const showSuccessModal = (message: string) => {
    setModalSuccessMessage(message);
    setModalSuccessVisible(true);
  };
  const ScannerFrame = () => (
    <View style={styles.frameContainer}>
      <View style={styles.frameCornerTopLeft} />
      <View style={styles.frameCornerTopRight} />
      <View style={styles.frameCornerBottomLeft} />
      <View style={styles.frameCornerBottomRight} />
    </View>
  );

  if (cameraVisible && hasPermission) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <ScannerFrame />
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseCamera}>
          <Feather name="camera-off" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }
  const promotionsActiv = filteredPromotions.map((promotion: any) => ({
    label: promotion.title,
    value: promotion.promotion_id.toString(),
  }));
  return (
    <View style={styles.container}>
      {isloading && <Loader />}
      <ExitoModal
      visible={modalSuccessVisible}
      message={modalSuccessMessage}
      onClose={() => {
        setModalSuccessVisible(false);
      }}
    />
    <ErrorModal
        visible={modalErrorVisible}
        message={modalMessage}
        onClose={() => setModalErrorVisible(false)}
      />

      <View style={styles.containercircle}>
        <SemicirclesOverlay />
      </View>
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/images/QR-Scan.png')} style={styles.icon} />
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [{ translateY }],
              opacity: opacity,
            },
          ]}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleQRScan}>
        <Text style={styles.buttonText}>{t('qrScanner.scanQRButton')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonconsumidas}
        onPress={() => setModalConsumedVisible(true)}
      >
        <Text style={styles.buttonTextconsum}>{t('qrScanner.consumptionsButton')}</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollViewContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContainer}>
                <View style={styles.userName}>
                  <Text style={styles.userText}>{t('qrScanner.clientLabel')}</Text>
                  {scannedEmail ? (
                    <Text style={styles.userText2}>{scannedEmail}</Text>
                  ) : (
                    <Text style={styles.quantityTextError}>{t('qrScanner.noUserDetected')}</Text>
                  )}
                </View>
                <View style={styles.line} />
                <Text style={styles.modalTitle}>{t('qrScanner.selectPromotion')}</Text>
                <View style={styles.pickerContainer}>
                  {filteredPromotions && filteredPromotions.length ? (
                    <RNPickerSelect
                      onValueChange={(itemValue) => handlePromotionSelect(itemValue)}
                      value={selectedPromotion?.promotion_id}
                      items={promotionsActiv}
                      placeholder={{ label:t('qrScanner.selectPromotionPlaceholder'), value: '' }}
                      style={{
                        inputIOS: styles.picker,
                        inputAndroid: styles.picker,
                        iconContainer: {
                          position: 'absolute',
                          right: 15,
                          top: '50%',
                          transform: [{ translateY: -12 }],
                        },
                      }}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => <Icon name="chevron-down" size={26} color={colors.primary} />}
                    />
                  ) : (
                    <Text>No tienes promociones disponibles o en curso</Text>
                  )}
                </View>
                {selectedPromotion && (
                  <View style={styles.quantity}>
                    <Text style={styles.quantityText}>{t('qrScanner.availableQuantity')}</Text>
                    <Text style={styles.quantityText2}>
                      {selectedPromotion.available_quantity
                        ? selectedPromotion.available_quantity
                        : t('qrScanner.noLimit')}
                    </Text>
                  </View>
                )}
                <TextInput
                  style={styles.input}
                  placeholder={t('qrScanner.quantityInputPlaceholder')}
                  keyboardType="numeric"
                  value={quantityConsumed}
                  onChangeText={handleQuantityChange}
                  editable={!!selectedPromotion}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('qrScanner.amountInputPlaceholder')}
                  keyboardType="numeric"
                  value={amountSpent}
                  onChangeText={handleAmountChange}
                  editable={!!selectedPromotion}
                />
                <TextInput
                  style={styles.descriptionInput}
                  placeholder={t('qrScanner.descriptionInputPlaceholder')}
                  value={description}
                  onChangeText={handleDescriptionChange}
                  editable={!!selectedPromotion}
                  multiline={true}
                />
                <View style={styles.btnsFormcons}>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[
                      styles.confirmButton,
                      !isFormValid() && styles.disabledButton,
                    ]}
                    disabled={!selectedPromotion}
                  >
                    <Text style={styles.confirmButtonText}>{t('qrScanner.confirmButton')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>{t('qrScanner.cancelButton')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>  

      {/* Modal para aceptar los términos y condiciones */}
      {currentTerms &&
        <View style={styles.Terms}>
          <TermsModal
            isVisible={isModalTermsVisible}
            toggleModal={() => setModalTermsVisible(false)}
            acceptTerms={handleAcceptTerms}
            termsText={currentTerms?.content}
            onCancel={handleCancelTerms}
            newTerms={true}
          />
        </View>}
      <ConsumedPromotionsModal
        visible={modalConsumedVisible}
        onClose={closeConsumedPromotionsModal}
        consumedPromotions={promotionsConsumed}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height:screenHeight,
    display:'flex',
    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent:'center'
  },
  containercircle:{
    position:'absolute',
    top:-20,
    height:screenHeight *0.2,
    width:screenWidth
  },
  iconContainer: {
    marginBottom: 20,
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    width: 200,
    height: 200, 
  },
  scanLine: {
    position: 'absolute',
    width: 166,
    height: 1,
    backgroundColor: colors.inputBorder05,
    top: 0,
  },
  button: {
    minHeight: 48,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:colors.primary,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 1
  },
  buttonconsumidas:{
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#fff',
    // borderWidth:1,
    // borderColor: '#acd1d6',
    color:colors.primary,
    minHeight: 48,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1
    
  },
  buttonTextconsum: {
    color:colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    backgroundColor: '#275d8e', 
    transform: [{ scale: 0.98 }],
  },
  frameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Esquina superior izquierda
  frameCornerTopLeft: {
    position: 'absolute',
    top: 170,
    left: 70,
    width: 35,
    height: 35,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#acd0d5',
    borderStyle: 'solid',
    borderTopLeftRadius: 10,
  },
  // Esquina superior derecha
  frameCornerTopRight: {
    position: 'absolute',
    top: 170,
    right: 70,
    width: 35,
    height: 35,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#acd0d5',
    borderStyle: 'solid',
    borderTopRightRadius: 10,
  },
  // Esquina inferior izquierda
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 150,
    left: 70,
    width: 35,
    height: 35,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#acd0d5',
    borderStyle: 'solid',
    borderBottomLeftRadius: 10,
  },
  // Esquina inferior derecha
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 150,
    right: 70,
    width: 35,
    height: 35,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#acd0d5',
    borderStyle: 'solid',
    borderBottomRightRadius: 10,
  },
  closeButton: {
    minHeight: 48,
    minWidth:48,
    position: 'absolute',
    bottom: 50,
    left: screenWidth*0.45,
    padding: 10,
    backgroundColor: 'rgb(246, 246, 246)',
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1, // Ocupa toda la pantalla
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: screenWidth * 0.9, // Ajusta el ancho según tus necesidades
    maxHeight: screenHeight * 0.9, // Limita la altura máxima
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    width:screenWidth *0.8,
    textAlign:'center',
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: screenWidth * 0.04,
  },
  promotionItem: {
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  promotionText: {
    color: '#fff',
    marginTop:screenWidth *0.01,
    fontWeight: 'bold',
  },
  input: {
    minHeight: 48,
    width:screenWidth *0.8,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: screenWidth * 0.04,
    marginVertical: 8,
    borderColor: '#acd1d6',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  descriptioninput:{
    height: screenHeight*0.25,
    width:screenWidth *0.8,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: screenWidth * 0.04,
    borderColor: '#acd1d6',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    marginVertical: 8,
    justifyContent:'flex-start',
    alignContent:'flex-start',
    alignItems:'flex-start',
    textAlignVertical:'top'
  },
  btnsFormcons:{
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  confirmButton: {
    backgroundColor:colors.primary,
    padding: 10,
    marginHorizontal: 5,
    width:screenWidth *0.35,
    marginTop:screenWidth *0.04,
    minHeight: 48,
    borderRadius: 25,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    alignContent:'center',
  },
  disabledButton: {
    opacity: 0.5, 
  },
  confirmButtonText: {
    textAlign:'center',
    color: '#fff',
    fontSize: screenWidth *0.04,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#686868',
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 5,
    width:screenWidth *0.35,
    marginTop:screenWidth *0.04,
    minHeight: 48,
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    alignContent:'center',
  },
  cancelButtonText: {
    
    textAlign:'center',
    color: '#fff',
    fontSize: screenWidth *0.04,
    fontWeight: 'bold',
  },
  pickerContainer: {
    width:screenWidth *0.8,
    fontSize: screenWidth * 0.02,
    backgroundColor:'#fff',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    borderWidth: 1,
    borderColor: colors.inputBorder03,
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
  },
  picker: {
    fontSize: screenWidth * 0.04,
    height: 45,
    width:screenWidth *0.7,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical: 12,
    paddingHorizontal:10
  },
  pickerItem:{
    fontSize: screenWidth * 0.04,
    color:'#336749',
  },
  quantity:{
    display:'flex',
    flexDirection:'row',
    alignContent:'center',
    width:screenWidth * 0.78,
  },
  quantityText:{
    fontSize: screenWidth * 0.04,
    width:screenWidth*0.24,
    color:'#336749',
  },
  quantityText2:{
    fontWeight:'600',
    fontSize: screenWidth * 0.04,
    color:colors.primary,
    width:screenWidth*0.6,
  },
  quantityTextError:{
    fontWeight:'600',
    fontSize: screenWidth * 0.04,
    color:'rgb(193, 34, 34)',
    width:screenWidth*0.6,
  },
  userName:{
    display:'flex',
    flexDirection:'row',
    alignContent:'center',
    justifyContent:'center',
    width:screenWidth * 0.78,
    marginVertical:screenWidth * 0.03,
  },
  userText:{
    fontSize: screenWidth * 0.04,
    width:screenWidth*0.18,
    color:'#336749',
  },
  userText2:{
    fontWeight:'600',
    fontSize: screenWidth * 0.04,
    color:colors.primary,
    width:screenWidth*0.6,
  },
  line: {
    height: 1, 
    backgroundColor: '#acd0d5', 
    marginVertical: 10, 
    width:screenWidth * 0.78,
  },
  Terms:{
    borderRadius:10,
    // flex:1,
    // height:screenHeight,
  },
  descriptionInput: {
    height: 100, 
    borderColor: '#acd1d6',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top', 
  },
});

export default QRScanButton;