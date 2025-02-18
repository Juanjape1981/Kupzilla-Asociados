import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiImageCompressor from './MultiImageCompressor';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedPartner, getMemoizedUserData } from '../redux/selectors/userSelectors';
import CategoryPicker from './CategoryPicker';
import { getMemoizedAllCategories } from '../redux/selectors/categorySelectors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppDispatch } from '../redux/store/store';
import { createPromotion, fetchPromotions } from '../redux/actions/promotionsActions';
import Loader from './Loader';
import ErrorModal from './ErrorModal';
import ExitoModal from './ExitoModal';
import { getMemoizedBranches } from '../redux/selectors/branchSelectors';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';

interface PromotionFormProps {
  onClose: () => void;
}
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PromotionForm: React.FC<PromotionFormProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector(getMemoizedUserData);
  const allCategories = useSelector(getMemoizedAllCategories);
  const partner = useSelector(getMemoizedPartner);
  const branches = useSelector(getMemoizedBranches);
  // console.log("partner actual", branches);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [availableQuantity, setAvailableQuantity] = useState<number | null>(null);
  const [imagePaths, setImagePaths] = useState<{ filename: string; data: string }[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isCategoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');
// console.log("fecha inicial", startDate,"fecha finalizacion", endDate);
// console.log("todas las categorias",allCategories);
// console.log("imagenes",imagePaths.length);

  const handleImagesCompressed = useCallback((images: { filename: string; data: string }[]) => {
    if (images.length <= 6) {
    setImagePaths(images);
  }else{
    setImagePaths([]);
      showErrorModal(t('promotionForm.max_images'));
    }
  }, []);
  const handleSelectCategories = (newSelectedCategories: number[]) => {
    // console.log("categorias seleccionadas", newSelectedCategories);
    setSelectedCategories(newSelectedCategories);
  };

  const handleSubmit = async () => {
    // console.log(title, description, startDate?.toISOString().split('T')[0], endDate?.toISOString().split('T')[0], discountPercentage, availableQuantity, selectedCategories, imagePaths.length);
    setLoading(true)
    const activeBranch = branches.find(
      (branch: any) => branch.status?.name === 'active' || branch.status?.name === 'inactive'
    );
    // console.log("sucursal activa o inactiva",activeBranch);
    
    if (!user?.user_id || !activeBranch?.branch_id) {
      showErrorModal(t('promotionForm.partnerBranchError'));
      return;
    }
    if (!title || !startDate || !endDate || discountPercentage === null || !selectedCategories.length) {
      // Validar campos y construir mensaje de error específico
      const missingFields = [];
      if (!title) missingFields.push(t('promotionForm.Título'));
      if (discountPercentage === null) missingFields.push(t('promotionForm.discountPercentagePlaceholder'));
      if (!startDate) missingFields.push(t('promotionForm.startDate'));
      if (!endDate) missingFields.push(t('promotionForm.endDate'));
      if (!selectedCategories.length) missingFields.push(t('promotionForm.categories'));

      const errorMessage = `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`;
      showErrorModal(errorMessage);
      setLoading(false);
      return;

    }
    const promotionData = {
      branch_id: activeBranch.branch_id,
      title,
      description,
      start_date: startDate?.toISOString().split('T')[0],
      expiration_date: endDate?.toISOString().split('T')[0],
      discount_percentage: discountPercentage,
      available_quantity: availableQuantity,
      partner_id: user?.user_id || 0,
      status_id:activeBranch.status.id,
      category_ids: selectedCategories,
      images: imagePaths
    };
    // console.log("informacion de la promocion____________________",promotionData);


    await dispatch(createPromotion(promotionData))
      .then(() => {
        setLoading(false)
        dispatch(fetchPromotions(user?.user_id))
        setModalSuccessMessage(t('promotionForm.success'));
        setModalSuccessVisible(true);
    
      })
      .catch((error: any) => {
        showErrorModal(t('promotionForm.createError'));
        setLoading(false)
        console.error("Error al crear la promoción: ", error);
      });
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    
    if (Platform.OS === 'ios' && date) {
      setShowStartDatePicker(true);
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date) {
        setStartDate(date);
        setEndDate(null);
      }
      setShowStartDatePicker(false);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    console.log("fecha de finalizacion",date);
    
    if (Platform.OS === 'ios'&& date) {
      if (date && startDate && date <= startDate) {
        showErrorModal(t('promotionForm.enddatepost'));
        setShowEndDatePicker(true) 
        return;
      }
      setShowEndDatePicker(true);
      setEndDate(date);
    }
    else {
      if (date && startDate && date <= startDate) {
        showErrorModal(t('promotionForm.enddatepost'));
        setShowEndDatePicker(false)
        return;
      }
      if (date) {setEndDate(date);
      }
      setShowEndDatePicker(false);
    }
  };

  const confirmStartDate = () => {
    // console.log("fecha de inicio confirmada", startDate);
    if (startDate) {
      setStartDate(startDate);
    }
    setShowStartDatePicker(false);
  };

  const confirmEndDate = () => {
    if (endDate && startDate && endDate <= startDate) {
      showErrorModal(t('promotionForm.enddatepost'));
      setEndDate(startDate)
      setShowEndDatePicker(false)
      return;
    }
    if (endDate) {
      setEndDate(endDate);
    }
    setShowEndDatePicker(false);
  };

  const ShowDatePicker = (show:string) => {
    if(show == "init"){
      setShowStartDatePicker(true);
      setShowEndDatePicker(false);
    }else{
      setShowStartDatePicker(false);
      setShowEndDatePicker(true);
    }
  }

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  return (
    
    <ScrollView contentContainerStyle={styles.formContainer}>
      {loading&& <Loader/>}
      <TextInput
        style={styles.input}
        placeholder="* Título"
        value={title}
        onChangeText={(text) => {
          if (text.length <= 45) {
            setTitle(text);
          } else {
            showErrorModal(t('promotionForm.title_length'));
          }
        }}
      />
      <TextInput
        style={styles.descriptionInput}
        placeholder={t('promotionForm.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        multiline
      />
         <TextInput
        style={styles.input}
        placeholder={t('promotionForm.discountPercentagePlaceholder')}
        keyboardType="numeric"
        value={discountPercentage !== undefined ? discountPercentage?.toString() : ''}
        onChangeText={(text) => {
          const value = Number(text);
          if (value >= 0 && value <= 99) {
            setDiscountPercentage(value);
          } else {
            showErrorModal(t('promotionForm.discount_percentage_error'));
          }
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Cantidad disponible"
        keyboardType="numeric"
        value={availableQuantity !== undefined ? availableQuantity?.toString() : ''}
        onChangeText={(text) => {
          if (text === '') {
            setAvailableQuantity(null);
          } else {
            if (text.length > 8) {
              showErrorModal(t('promotionForm.available_quantity_limit'));
            } else {
              const value = Number(text);
              if (value > 0) {
                setAvailableQuantity(value);
              } else {
                showErrorModal(t('promotionForm.quantity_greater_than_zero'));
              }
            }
          }
        }}
      />
      {/* Agregar lógica para seleccionar categorías */}
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setCategoriesModalVisible(true)}
      >
        <MaterialIcons name="category" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>{t('promotionForm.selectCategories')}</Text>
      </TouchableOpacity >
      <CategoryPicker
        // categories={allCategories}
        selectedCategories={selectedCategories}
        onSelectCategories={handleSelectCategories}
        isVisible={isCategoriesModalVisible}
        onClose={() => setCategoriesModalVisible(false)}
      />
      <MultiImageCompressor onImagesCompressed={handleImagesCompressed} />

      <View style={styles.datePickerContainer}>
  {!showStartDatePicker && (
    <TouchableOpacity onPress={() => ShowDatePicker("init")} style={styles.inputdate}>
      {startDate ? <Text style={styles.textDate}>* {t('promotionForm.start')}</Text> : <Text></Text>}
      <Text style={styles.textDate}>
        {startDate ? startDate.toLocaleDateString() : t('promotionForm.startDate')}
      </Text>
    </TouchableOpacity>
  )}

  <Modal
    visible={showStartDatePicker}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowStartDatePicker(false)}
  >
  {Platform.OS === 'ios'?
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display='spinner'
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
          <TouchableOpacity onPress={confirmStartDate} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>{t('promotionForm.confirmDate')}</Text>
          </TouchableOpacity>
      </View>
      </View>:
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display= 'default'
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />}
    
  </Modal>
</View>
<View style={styles.datePickerContainer}>
  {!showEndDatePicker && (
    <TouchableOpacity
      onPress={() => ShowDatePicker("end")}
      style={[styles.inputdate, !startDate && { opacity: 0.5 }]}
      disabled={!startDate}
    >
      {endDate ? <Text style={styles.textDate}>* {t('promotionForm.end')}</Text> : <Text></Text>}
      <Text style={styles.textDate}>
        {endDate ? endDate.toLocaleDateString() : t('promotionForm.endDate')}
      </Text>
    </TouchableOpacity>
  )}

  <Modal
    visible={showEndDatePicker}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowEndDatePicker(false)}
  >
    {Platform.OS === 'ios'?
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display='spinner'
          onChange={handleEndDateChange}
          minimumDate={startDate || new Date()}
        />
        {Platform.OS === 'ios' && (
          <TouchableOpacity onPress={confirmEndDate} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>{t('promotionForm.confirmDate')}</Text>
          </TouchableOpacity>
        )}
      </View>
      </View>:
      <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display='default'
          onChange={handleEndDateChange}
          minimumDate={startDate || new Date()}
        />}
    
  </Modal>
</View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{t('promotionForm.createPromotion')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>{t('promotionForm.cancel')}</Text>
      </TouchableOpacity>
      <ErrorModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
      <ExitoModal
        visible={modalSuccessVisible}
        message={modalSuccessMessage}
        onClose={() => {
          setModalSuccessVisible(false);
          onClose();
        }}
        />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contTextSucursal:{
    width: '100%',
    height:'80%',
    display:'flex',
    justifyContent:'center',
    alignContent:'center',
    textAlign:'center',
    alignItems:'center',
    backgroundColor: 'rgba(172, 208, 213,0.5)'
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexGrow: 1,
    paddingBottom: 40,
  },
  input: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    padding: 10,
  },
  descriptionInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    padding: 10,
    height: 100, // Ajusta la altura según sea necesario
    textAlignVertical: 'top',
  },
  inputdate: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    padding: 10,
    minHeight: 48,
  },
  textDate: {
    color: '#888',
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    minHeight: 48,
    alignItems:'center',
    justifyContent:'center'
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#8e8e8e',
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    minHeight: 48,
    alignItems:'center',
    justifyContent:'center'
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  categoryButton: {
    backgroundColor: colors.primary,
    width: '80%',
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    minHeight: 48,
  },
  datePickerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center'
  },
  modalContainer: {
    flex: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor:Platform.OS === 'ios' ?  '#fff': 'transparent',
    padding: 20,
    borderRadius: 10,
    width: screenWidth*0.8,
    alignItems: 'center',
  },
});

export default PromotionForm;
