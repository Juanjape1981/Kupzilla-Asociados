import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, message, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#cc1818" style={styles.icon} />
            <Text style={styles.modalTitle}>{t('ErrorModal.errorTitle')}</Text>
          </View>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{t('ErrorModal.closeButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    alignContent:'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cc1818',
  },
  modalMessage: {
    fontSize: 16,
    width:'100%',
    textAlign: 'center',
    marginBottom: 30,
    color:colors.primary
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent:'center',
    height:48
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorModal;
