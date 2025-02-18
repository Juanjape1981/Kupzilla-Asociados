import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Modal, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiImageCompressor from './MultiImageCompressor';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedPartner, getMemoizedUserData } from '../redux/selectors/userSelectors';
import { Promotion } from '../redux/types/types';
import CategoryPicker from './CategoryPicker';
import { getMemoizedAllCategories } from '../redux/selectors/categorySelectors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import { AppDispatch } from '../redux/store/store';
import { modifyPromotion } from '../redux/actions/promotionsActions';
import { Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Loader from './Loader';
import ErrorModal from './ErrorModal';
import ExitoModal from './ExitoModal';
import { getMemoizedBranches } from '../redux/selectors/branchSelectors';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';

interface EditPromotionFormProps {
  promotion: Promotion;
  onClose: () => void;
}
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EditPromotionForm: React.FC<EditPromotionFormProps> = ({ promotion, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector(getMemoizedUserData);
  const allCategories = useSelector(getMemoizedAllCategories);
  const partner = useSelector(getMemoizedPartner);
  const branches = useSelector(getMemoizedBranches);
  const [title, setTitle] = useState(promotion.title);
  const [description, setDescription] = useState(promotion.description);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(promotion.discount_percentage || null);
  const [availableQuantity, setAvailableQuantity] = useState<number | null>(promotion.available_quantity || null);
  const [existingImages, setExistingImages] = useState<any>(promotion.images);
  const [newImages, setNewImages] = useState<{ filename: string; data: string }[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isCategoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(promotion.categories.map(category => category.category_id));
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccessVisible, setModalSuccessVisible] = useState(false);
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');

 const handleImagesCompressed = useCallback((images: { filename: string; data: string }[]) => {
  if (images.length <= 6) {
    setNewImages(images);
  } else {
    showErrorModal(t('promotionForm.max_images'));
  }
}, []);

  const handleSelectCategories = (newSelectedCategories: number[]) => {
    setSelectedCategories(newSelectedCategories);
  };
  const handleDeleteImage = (imageId: number) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter((img: any) => img.image_id !== imageId));
  };
  const handleSubmit = () => {
    const activeBranch = branches.find(
      (branch: any) => branch.status?.name === 'active' || branch.status?.name === 'inactive'
    );
    if (!user?.user_id || !activeBranch?.branch_id) {
      showErrorModal(t('editPromotionForm.partnerBranchError'));
      return;
    }
    // console.log("campos vacios?",title,description,discountPercentage);
    
    setIsLoading(true)
    if (!title || discountPercentage === null ) {
      const missingFields = [];
      if (!title) missingFields.push(t('editPromotionForm.Título'));
      if (discountPercentage === null) missingFields.push(t('editPromotionForm.discountPercentage'));

        const errorMessage = `${t('editPromotionForm.requiered')} ${missingFields.join(', ')}.`;
        showErrorModal(errorMessage);
        setIsLoading(false);
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
      category_ids: selectedCategories,
      images: [
        ...newImages
      ]
    };
    const deletedImageIds = imagesToDelete
    // console.log("datos a enviar",promotionData, deletedImageIds);
    if (promotion.promotion_id) {
      dispatch(modifyPromotion(promotion.promotion_id, promotionData, deletedImageIds))
        .then(() => {
          setIsLoading(false)
          setModalSuccessMessage(t('editPromotionForm.promotionUpdated'));
          setModalSuccessVisible(true);
          // // Alert.alert('Éxito', 'La promoción ha sido actualizada correctamente.');
          // onClose();
        })
        .catch((error: any) => {
          setIsLoading(false)

          showErrorModal(t('editPromotionForm.updateError'));
          console.error("Error al actualizar la promoción: ", error);
        });
    } else {
      setIsLoading(false)
      Alert.alert(t('editPromotionForm.Error'), t('editPromotionForm.promotionIdError'));
    }
  };

  const handleStartDateChange = (event: any, date?: Date) => {
    if (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        console.log("datos a comparar",today, selectedDate);
        
        if (endDate && selectedDate > endDate) {
          setShowStartDatePicker(false);
            showErrorModal(t('editPromotionForm.errorStartDateAfterEndDate'));
            return;
        }
        if (selectedDate < today) {
          setShowStartDatePicker(false);
            showErrorModal(t('editPromotionForm.errorStartDateBeforeToday'));
            return;
        }
    }

    if (Platform.OS === 'ios') {
        setStartDate(date || startDate);
    } else {
        if (date) {
            setStartDate(date);
        }
        setShowStartDatePicker(false);
    }
};

  const handleEndDateChange = (event: any, date?: Date) => {
    if (date && startDate && date < startDate ) {
      showErrorModal(t('editPromotionForm.errorEndDateBeforeStartDate'));
      setEndDate(startDate)
      // setShowEndDatePicker(false);
      return;
    }
    if (date && date < new Date()) {
      showErrorModal(t('editPromotionForm.errorEndDateBeforeToday'));
      // setShowStartDatePicker(false);
      return;
    }
    if (Platform.OS === 'ios') {
      setEndDate(date || endDate);
    } else {
      if (date) {
        setEndDate(date);
      }
      setShowEndDatePicker(false);
    }
  };

  const confirmStartDate = () => {
    if (startDate) {
      // const DateChile = adjustDateToChileTime(startDate)
      // console.log("confirmando fecha inicial", startDate);
      
      setStartDate(startDate);
    }
    setShowStartDatePicker(false);
  };

  const confirmEndDate = () => {
    if (endDate) {
      setEndDate(endDate);
    }
    setShowEndDatePicker(false);
  };

  const adjustDateToChileTime = (date: Date): Date => {
    // Obtén la fecha local según la zona horaria de Chile
    const chileDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
    return chileDate;
  };
  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      {isLoading && <Loader />}
      <Text style={styles.texttitle}>*{t('editPromotionForm.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('editPromotionForm.title')}
        value={title}
        onChangeText={(text) => {
          if (text.length <= 45) {
            setTitle(text);
          } else {
            showErrorModal(t('editPromotionForm.errorTitleLength'));
          }
        }}
      />
      <Text style={styles.texttitle}>{t('editPromotionForm.description')}</Text>
      <TextInput
        style={styles.descriptionInput}
        placeholder={t('editPromotionForm.description')}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.texttitle}>{t('editPromotionForm.discountPercentage')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('editPromotionForm.discountPercentage')}
        keyboardType="numeric"
        value={
          discountPercentage !== undefined ? discountPercentage?.toString() : ""
        }
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
        placeholder={t('editPromotionForm.quantity')}
        keyboardType="numeric"
        value={
          availableQuantity !== undefined ? availableQuantity?.toString() : ""
        }
        onChangeText={(text) => {
          if (text === "") {
            setAvailableQuantity(null);
          } else {
            if (text.length > 8) {
              showErrorModal(
                t('promotionForm.available_quantity_limit')
              );
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
      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setCategoriesModalVisible(true)}
      >
        <MaterialIcons name="category" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>{t('promotionForm.selectCategories')}</Text>
      </TouchableOpacity>
      <CategoryPicker
        // categories={allCategories}
        selectedCategories={selectedCategories}
        onSelectCategories={handleSelectCategories}
        isVisible={isCategoriesModalVisible}
        onClose={() => setCategoriesModalVisible(false)}
      />
      {/* Mostrar las imágenes existentes */}
      <MultiImageCompressor
        onImagesCompressed={handleImagesCompressed}
        initialImages={existingImages?.length}
      />
      <Text style={styles.texttitle}>{t('editPromotionForm.currentImages')}</Text>
      <View style={styles.imagesContainer}>
        {existingImages.length > 0 ? (
          existingImages.map((image: any, index: any) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: `${API_URL}${image.image_path}` }}
                style={styles.image}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteImage(image.image_id)}
              >
                <Ionicons name="trash-outline" size={22} color="#e04545" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text>{t('editPromotionForm.noImages')}</Text>
        )}
      </View>

      {/* Mostrar las fechas */}
      <View style={styles.datePickerContainer}>
        {!startDate ? (
          <Text style={styles.textDateActual}>
            {t('editPromotionForm.startDateCurrent')} {formatDateToDDMMYYYY(promotion.start_date)}{" "}
          </Text>
        ) : (
          <Text></Text>
        )}
        {startDate ? (
          <Text style={styles.texttitle}>{t('editPromotionForm.startDate')}</Text>
        ) : (
          <Text></Text>
        )}
        {!showStartDatePicker && (
          <TouchableOpacity
            onPress={() => setShowStartDatePicker(true)}
            style={styles.inputdate}
          >
            <Text style={styles.textDate}>
              {startDate
                ? startDate.toLocaleDateString()
                : t('editPromotionForm.modifyStartDate')}
            </Text>
          </TouchableOpacity>
        )}
        {showStartDatePicker && (
        <Modal
            visible={showStartDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStartDatePicker(false)}
          >
            {Platform.OS === 'ios'?
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerContainerModal}>
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

        )}
      </View>

      <View style={styles.datePickerContainer}>
        {!endDate ? (
          <Text style={styles.textDateActual}>
           {t('editPromotionForm.endDateCurrent')}{" "}
            {formatDateToDDMMYYYY(promotion.expiration_date)}{" "}
          </Text>
        ) : (
          <Text></Text>
        )}
        {endDate ? (
          <Text style={styles.texttitle}>{t('editPromotionForm.endDate')}</Text>
        ) : (
          <Text></Text>
        )}
        {!showEndDatePicker && (
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(true)}
            style={styles.inputdate}
          >
            <Text style={styles.textDate}>
              {endDate
                ? endDate.toLocaleDateString()
                : t('editPromotionForm.modifyEndDate')}
            </Text>
          </TouchableOpacity>
        )}
        {showEndDatePicker && (
          <Modal
          visible={showEndDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEndDatePicker(false)}
        >
          {Platform.OS === 'ios'?
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainerModal}>
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display='spinner'
                onChange={handleEndDateChange}
                minimumDate={startDate || new Date()}
              />
                <TouchableOpacity onPress={confirmEndDate} style={styles.submitButton}>
                  <Text style={styles.submitButtonText}>{t('promotionForm.confirmDate')}</Text>
                </TouchableOpacity>
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
        )}
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{t('editPromotionForm.saveChanges')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.submitButtonText}>{t('editPromotionForm.cancel')}</Text>
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
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  descriptionInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#00abc1',
    padding: 10,
    borderRadius: 25,
    marginTop:10,
    marginBottom: 5,
    width: '80%',
    alignSelf: 'center',

  },
  submitButton: {
    backgroundColor:colors.primary,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputdate: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDate: {
    color:colors.primary,
  },
  textDateActual: {
    color:colors.primary
  },
  datePickerContainer: {
    marginBottom: 10,
  },
  modalOverlay: {
   flex: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainerModal: {
    backgroundColor:Platform.OS === 'ios' ?  '#fff': 'transparent',
    padding: 20,
    borderRadius: 10,
    width: screenWidth*0.8,
    alignItems: 'center',
  },
  imagesContainer: {
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageWrapper: {

    width: '45%',
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 50,
    padding: 2,
  },
  cancelButton: {
    backgroundColor: '#8e8e8e',
    padding: 10,
    borderRadius: 5,
  },
  texttitle: {
    fontSize: 14,
    color: '#707070'
  }
});

export default EditPromotionForm;
