import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, ScrollView, Modal, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store/store';
import RNPickerSelect from 'react-native-picker-select';
import { UserData } from '../redux/types/types';
import { changePasswordAction, updatePartner, updateUserAction } from '../redux/actions/userActions';
import { fetchUserCategories, fetchAllCategories } from '../redux/actions/categoryActions';
import Checkbox from 'expo-checkbox';
import { MaterialIcons } from '@expo/vector-icons';
import { getMemoizedPartner, getMemoizedUserData } from '../redux/selectors/userSelectors';
import { getMemoizedAllCategories, getMemoizedUserCategories } from '../redux/selectors/categorySelectors';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import CountryPicker from '../components/CountrySelect';
import ImageCompressor from '../components/ImageCompressor';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import AntDesign from '@expo/vector-icons/AntDesign';
import { logoutUser } from '../services/authService';
import Loader from '../components/Loader';
import Ionicons from '@expo/vector-icons/Ionicons';
import { KeyboardAvoidingView } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { Keyboard } from 'react-native';
import ErrorModal from '../components/ErrorModal';
import ExitoModal from '../components/ExitoModal';
import { loadData } from '../redux/actions/dataLoader';
import DatePickerInput from '../components/DatePickerInput';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';
import { translateGender } from '../utils/translateGender';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ProfileScreen: React.FC = () => {
  const user = useSelector(getMemoizedUserData) as UserData;
  const categories = useSelector(getMemoizedUserCategories);
  const allCategories = useSelector(getMemoizedAllCategories);
  const partner = useSelector(getMemoizedPartner);
  const dispatch: AppDispatch = useDispatch();
  // console.log("categorias de usuario",categories);
  // console.log("partner en el profile", partner);
  const [selectedCategories, setSelectedCategories] = useState<any>(categories.map(cat => cat.category_id)
  );
  // console.log("categorias seleccionadas",selectedCategories);
  // console.log("allCategories",allCategories);
  useEffect(() => {
    dispatch(loadData());
    if (user?.user_id) {
      dispatch(fetchUserCategories(user.user_id));
    }
    dispatch(fetchAllCategories());
  }, [dispatch, user?.user_id]);

  useEffect(() => {
    setSelectedCategories(categories.map(cat => cat.category_id));
  }, [categories, dispatch]);
  // console.log(user);

  const [formData, setFormData] = useState({
    user_id: user?.user_id || 0,
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    country: user?.country || '',
    city: user?.city || '',
    phone_number: user?.phone_number || '',
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    image_data: `${API_URL}${user?.image_url}` || null,
    subscribed_to_newsletter: user?.subscribed_to_newsletter || false,
    //partner
    address: partner?.address || '',
    contact_info: partner?.contact_info || '',
    business_type: partner?.business_type || '',
  });
  // console.log("datos a cambiar en el perfil y la imagen",formData, formData.image_data);
  const [newPassword, setNewPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCategoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]); // Lista de errores de la contraseña
  const [isPasswordValid, setIsPasswordValid] = useState(false); // Indicador de validez de contraseña
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [modalErrorMessage, setModaErrorlMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // console.log(loading);
  // console.log(formData);
  const handleChangePassword = async () => {
    if (!isPasswordValid) {
      
      showErrorModal(passwordErrors.join('\n')); // Muestra los errores específicos
      return;
    }
  
    if (!confirmPassword) {
      showErrorModal(t('profile.confirm_password_required'));
      return;
    }
  
    if (newPassword !== confirmPassword) {
      showErrorModal(t('profile.passwords_do_not_match'));
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(changePasswordAction(user.user_id, newPassword, currentPassword));
      if (response.status === 200) {
        showSuccessModal(t('profile.password_change_success'));
      } else {
        showErrorModal(t('profile.password_change_error'));
      }
    } catch (error) {
      showErrorModal(t('profile.password_change_error'));
    } finally {
      setLoading(false);
      setNewPassword('');
      setCurrentPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    }
  }

    const handleCancelChangePassword = () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors([]);
      setIsPasswordValid(false);
      setIsChangingPassword(false);
    };

  const handleInputChange = (field: string, value: string) => {

    if ((field === 'first_name' || field === 'last_name') && value.length > 30) {
        showErrorModal(t('profile.input_error_30'))
      return;
    }
    if ((field === 'city' || field === 'address' ) && value.length > 50) {
      showErrorModal(t('profile.input_error_50'))
    return;
  } 
    if ((field === 'business_type' || field === 'contact_info') && value.length > 25) {
      showErrorModal(t('profile.input_error_25'))
    return;
  }
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  useEffect(() => {
    if (formData.birth_date) {
      const [year, month, day] = formData.birth_date.split('-');
      setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
  }, [formData.birth_date]);

  const handleImageCompressed = (uri: string) => {
    // console.log("imagencomprimida");

    handleInputChange('image_data', uri);
  };

  const handleUpdate = async () => {
    console.log("datos en form data", formData);
    if (formData.phone_number) {
      const phoneRegex = /^[+]?[0-9]{7,15}$/;
      if (!phoneRegex.test(formData.phone_number)) {
          showErrorModal(t('profile.phone_number_error'));
          return;
      }
  }
    try {
      setLoading(true)
      const { user_id, address, contact_info, business_type, image_data, ...dataToSend } = formData;
      const updatedDataToSend = {
        ...dataToSend,
        image_data: image_data && image_data.startsWith('http') ? null : image_data,
      };
      // console.log("formulario de actualizacion de usuario, ver imagen", updatedDataToSend);

      const response = await dispatch<any>(updateUserAction({ ...updatedDataToSend, user_id }));
      // console.log("resouesta de la actualizacion del usuario", response);
      // console.log("resouesta de la actualizacion del usuario ver status", response.status);
      if (response.status == 200) {
        const categoriesResponse = await dispatch<any>(updatePartner(user_id, {
          address: address,
          contact_info: contact_info,
          business_type: business_type,
          category_ids: selectedCategories,
        }))
        // console.log("categoriesResponse",categoriesResponse);
        // console.log("categoriesResponse ver status",categoriesResponse.status);
        if (categoriesResponse.status == 200) {
          dispatch(fetchUserCategories(user.user_id))
          setLoading(false)
          showSuccessModal(t('profile.success_update'));
        } else {
          showErrorModal(t('profile.error_update'));
          setLoading(false)
        }
      } else {
        showErrorModal(t('profile.error_update'));
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      showErrorModal(t('profile.error_update'));
    } finally {
      setLoading(false)
      setIsEditing(false)
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prevState: any) => {
      if (prevState.includes(categoryId)) {
        return prevState.filter((id: any) => id !== categoryId);
      } else {
        return [...prevState, categoryId];
      }
    });
  };
  const handleCountryChange = (value: string) => {
    if (value === "") {
      showErrorModal(t('profile.country_required'))
    return;
  } 
    handleInputChange('country', value);
  };
  const handleSaveCategories = () => {
    setCategoriesModalVisible(false);
  };
  const handleLogout = () => {
    dispatch(logoutUser() as any);
    setIsEditing(false)
  };


  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push(t('profile.password_errors.min_length'));
    if (!/[A-Z]/.test(password)) errors.push(t('profile.password_errors.uppercase'));
    if (!/[0-9]/.test(password)) errors.push(t('profile.password_errors.number'));
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push(t('profile.password_errors.special_char'));
    return errors;
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    const errors = validatePassword(text); // Valida la contraseña
    setPasswordErrors(errors); // Actualiza los errores
    setIsPasswordValid(errors.length === 0); // Marca como válida si no hay errores
  };

  const showErrorModal = (message: string) => {
    setModaErrorlMessage(message);
    setModalErrorVisible(true);
  };
  const showSuccessModal = (message: string) => {
    setModalSuccessMessage(message);
    setModalSuccessVisible(true);
  };

  const resetFormData = () => {
    setFormData(
      {
    user_id: user?.user_id || 0,
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    country: user?.country || '',
    city: user?.city || '',
    phone_number: user?.phone_number || '',
    gender: user?.gender || '',
    birth_date: user?.birth_date || '',
    image_data: `${API_URL}${user?.image_url}` || null,
    subscribed_to_newsletter: user?.subscribed_to_newsletter || false,
    //partner
    address: partner?.address || '',
    contact_info: partner?.contact_info || '',
    business_type: partner?.business_type || '',
  })
  };
  const cancelEdit = () => {
    setIsEditing(false)
    resetFormData()
  }

  return (
    <View style={{ flex: 1 }}>
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
    {isChangingPassword ?
      (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.passFormCont2}>
                <View style={styles.passForm}>
                  <Text style={styles.buttonTextpass}>{t('profile.updatePassword')}</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                    style={styles.inputPassword}
                    placeholder={t('profile.current_password')}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showPassword}
                  />
                 <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#acd0d5" />
                  </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={styles.inputPass}
                    placeholder={t('profile.new_password')}
                    value={newPassword}
                    onChangeText={handleNewPasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  
                  {passwordErrors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>
                      {error}
                    </Text>
                  ))}
                  <TextInput
                    style={styles.inputPass}
                    placeholder={t('profile.confirm_new_password')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={[
                      styles.buttonPass,
                      !isPasswordValid && { backgroundColor: '#ccc' }, // Cambia el color cuando está deshabilitado
                    ]}
                    onPress={handleChangePassword}
                    disabled={!isPasswordValid} // Deshabilita el botón si la contraseña no es válida
                  >
                    <Text style={styles.buttonText}>{t('profile.update_password')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonPass} onPress={handleCancelChangePassword}>
                    <Text style={styles.buttonText}>{t('profile.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      ) :
      (<View >
        {loading && <Loader />}
        <SemicirclesOverlay />
        <ScrollView contentContainerStyle={styles.container}>
          <ImageCompressor onImageCompressed={handleImageCompressed} initialImageUri={formData.image_data || undefined} isButtonDisabled={isEditing} />
          <View style={styles.iconContainer}>
            {isEditing?
            <TouchableOpacity
            style={styles.editButton}
            onPress={cancelEdit}
          >
            <AntDesign name="close" size={24} color={colors.primary}  />
          </TouchableOpacity>:
          <><TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <AntDesign name="edit" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color={colors.primary }/>
            </TouchableOpacity>
            </>
            }
          </View>
          {!isEditing && !isChangingPassword &&
            <TouchableOpacity style={styles.passButton} onPress={() => setIsChangingPassword(!isChangingPassword)}>
              <Ionicons name="key-outline" size={26} color="#fff" />
            </TouchableOpacity>
          }
          {isEditing?(
            <>
              <TextInput
                style={styles.input}
                placeholder={t('profile.name')}
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
              />
              <TextInput
                style={styles.input}
                placeholder={t('profile.last_name')}
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
              />
              <TextInput
                style={styles.input}
                placeholder={t('profile.email')}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                editable={false}
              />
              <View style={styles.inputSelect}>
                <CountryPicker
                  selectedCountry={formData.country}
                  onCountryChange={handleCountryChange}
                  estilo={false}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t('profile.city')}
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
              <TextInput
                style={styles.input}
                placeholder={t('profile.phone_number')}
                value={formData.phone_number}
                onChangeText={(value) => handleInputChange('phone_number', value)}
              />
              <TextInput
                style={styles.input}
                placeholder={t('profile.address')}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
              />
              <TextInput   
                style={styles.input}
                placeholder={t('profile.contact_info')}
                value={formData.contact_info}
                onChangeText={(value) => handleInputChange('contact_info', value)}
              />
              <TextInput
                style={styles.input}
                placeholder={t('profile.business_type')}
                value={formData.business_type}
                onChangeText={(value) => handleInputChange('business_type', value)}
              />
              <View style={styles.container}>
                <DatePickerInput selectedDate={selectedDate} onDateChange={handleInputChange} />
              </View>
              {/* <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputdate}>
                <Text style={styles.textDate}>
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Fecha de Nacimiento (DD-MM-YYYY)'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <Modal
                  transparent
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)} // Cerrar con back en Android
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.datePickerContainer}>
                      <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                      />
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity onPress={confirmDate} style={styles.confirmButton}>
                          <Text style={styles.confirmButtonText}>Confirmar fecha</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Modal>
              )} */}
                  <View style={styles.pickerContainer}>
                    <RNPickerSelect
                      onValueChange={(value) => handleInputChange('gender', value)}
                      value={formData.gender}
                      items={[
                        { label: t('profile.male'), value: 'Masculino' },
                        { label: t('profile.female'), value: 'Femenino' },
                        { label: t('profile.other'), value: 'Otro' },
                      ]}
                      placeholder={{ label:t('profile.select_gender'), value: '' }}
                      style={{
                        ...pickerSelectStyles,
                        iconContainer: {
                            position: 'absolute',
                            right: 15,
                            top: '43%',
                            transform: [{ translateY: -12 }],
                          },
                      }}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return <Ionicons name="chevron-down" size={26} color={colors.primary} />;
                      }}
                    />
                  </View>
              <TouchableOpacity
                style={styles.buttonCategories}
                onPress={() => setCategoriesModalVisible(true)}
              >
                <MaterialIcons name="category" size={22} color="white" />
                <Text style={styles.buttonText}>{t('profile.my_categories')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <MaterialIcons name="save" size={22} color="white" />
                <Text style={styles.buttonText}>{t('profile.save')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.Containertext}>
              <Text style={styles.text}>{formData.first_name} {formData.last_name}</Text>
              <Text style={styles.text}>{formData.email}</Text>
              <Text style={styles.text}>{formData.country}, {formData.city}</Text>
              <Text style={styles.text}>{formData.phone_number}</Text>
              <Text style={styles.text}>{formData.address}</Text>
              <Text style={styles.text}>{formData.contact_info}</Text>
              <Text style={styles.text}>{formData.business_type}</Text>
              <Text style={styles.text}>{formData.birth_date ? formatDateToDDMMYYYY(formData.birth_date) : t('profile.date_of_birth')}</Text>
              <Text style={styles.text}>{translateGender(formData.gender)}</Text>
            </View>
          )}
          <Modal visible={isCategoriesModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('profile.edit_categories')}</Text>
                <ScrollView>
                  {allCategories.map((category) => (
                    <View key={category.category_id} style={styles.checkboxContainer}>
                      <Checkbox
                        value={selectedCategories.includes(category.category_id)}
                        onValueChange={() => handleCategoryChange(category.category_id)}
                      />
                      <Text style={styles.label}>{category.name}</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={handleSaveCategories} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>{t('profile.confirm_categories')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCategoriesModalVisible(false)} style={styles.modalButtonCancel}>
                  <Text style={styles.modalButtonText}>{t('profile.cancel_categories')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>)}
 </View>
 )};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 48,
    width:  screenWidth *0.8,
    // maxWidth: screenWidth * 0.8,
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    justifyContent:'center',
    alignSelf: 'center',
  },
  inputAndroid: {
    height: 48,
    width: Platform.OS === 'web' ? '50%' : screenWidth,
    maxWidth: Platform.OS === 'web' ? '30%' : screenWidth * 0.8,
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    alignSelf: 'center',
    paddingRight: 30,
  },
});

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 10,
    width: screenWidth*0.8,
    alignSelf: 'center',
  },
  Containertext:{
    padding:20,
    paddingTop:80
  },
  text:{
    fontSize:15,
    color:colors.primary,
    fontWeight:'600',
    padding:5
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight:20
  },
  iconContainer:{
    position:'absolute',
    top:0
  },
  editButton:{
    position:'absolute',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:25,
    backgroundColor:'rgb(232, 232, 232)',
    top:50,
    right:90,
    height:37,
    width:37
  },
  passFormCont:{
    position:'absolute',
    zIndex:1,
    alignItems:'center',
    paddingTop:screenHeight
    *0.2,
    backgroundColor:'rgba(232, 232, 232,0.9)',
    width:screenWidth,
    height:screenHeight,
    display:'flex',
  },
  passFormCont2:{
    position:'absolute',
    zIndex:1,
    alignItems:'center',
    paddingTop:screenHeight
    *0.02,
    backgroundColor:'rgba(232, 232, 232,0.9)',
    width:screenWidth,
    height:screenHeight,
    display:'flex',
  },
  passwordContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: '90%',
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 0,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputPassword: {
    minHeight:48,
    flex: 1,
    fontSize: 14,
  },
  inputPass:{
    height: 48,
    width: '90%',
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 15,
    marginTop:10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  passForm:{
    display:'flex',
    flexDirection:'column',
    width:screenWidth*0.9,
    justifyContent:'center',
    alignContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:'#fff',
    borderRadius:40
  },
  buttonPass:{
    backgroundColor:colors.primary,
    borderRadius: 25,
    padding: 7,
    alignItems: 'center',
    justifyContent:'center',
    marginTop: 15,
    width:'80%',
    height:48
  },
  exitButton:{
    position:'absolute',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:25,
    backgroundColor:'rgb(232, 232, 232)',
    height:37,
    width:37,
    top:50,
    left:80
  },
  passButton:{
    position:'absolute',
    alignContent:'center',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:25,
    backgroundColor:colors.primary,
    height:48,
    width:48,
    bottom:0,
    right:40,
    // marginTop:20,
    margin:4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  inputSelect: {
    height: 48,
    width: '90%',
    borderRadius: 8,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  input: {
    height: 48,
    width: '90%',
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 5,
    alignSelf: 'center',
    borderColor: 'rgba(0, 122, 140)',
    borderWidth: 1,

  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 5,
  },
  button: {
    height:48,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor:colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 5,
    marginBottom:15,
    alignItems: 'center',
    width: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonCategories: {
    height:48,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: colors.orange_color,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 5,
    marginBottom:15,
    alignItems: 'center',
    width: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextpass:{
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom:20
  },
  selectView: {
    width: screenWidth,
    borderColor: colors.inputBorder03,
    borderWidth: 1,
    borderRadius: 8,
  },
  select: {
    height: 48,
    width: screenWidth,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderColor: colors.inputBorder03,
    fontSize: 16,
    color: '#595959',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    alignContent: 'center'
  },
  modalText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    marginLeft: 8,
  },
  modalButton: {
    minHeight:48,
    justifyContent:'center',
    backgroundColor:colors.primary,
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginVertical: 5,
    marginTop:10
  },
  modalButtonCancel: {
    minHeight:48,
    justifyContent:'center',
    backgroundColor: '#F1AD3E',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalError: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalSuccess: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  confirmButton: {
    minHeight:48,
    justifyContent:'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    width: screenWidth*0.5,
    alignSelf: 'center'
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default ProfileScreen;
