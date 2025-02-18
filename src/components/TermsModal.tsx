import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, Dimensions, View } from 'react-native';
// import RenderHtml from 'react-native-render-html';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from '../config/colors';
import WebView from 'react-native-webview';
type TermsModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  acceptTerms: () => void;
  termsText: string;
  onCancel?: () => void;
  newTerms: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const tagsStyles = {
    h1: { fontSize: 18, marginBottom: 5, color:'#336749' },
    h2: { fontSize: 18, marginBottom: 8,color:'#336749' },
    p: { fontSize: 14, lineHeight: 20 }
  };
const TermsModal: React.FC<TermsModalProps> = ({ isVisible, toggleModal, acceptTerms, termsText, onCancel, newTerms  }) => {
  const htmlWithStyles = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            flex:1;
            color: #333;
            padding: 10px;
            background-color:rgba(246, 246, 246, 1);
            margin-bottom:50px;
          }
          h1 {
            font-size: 45px;
            color: #336749;
            margin-bottom: 10px;
          }
          h2 {
          font-size: 40px;
            color: #336749;
            margin-bottom: 10px;
          }
          p {
            font-size: 35px;
            line-height: 1.5;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        ${termsText} <!-- Aquí se inserta el contenido HTML que recibes -->
      </body>
    </html>
  `;
 
  return (
    <Modal isVisible={isVisible}>
      <ScrollView contentContainerStyle={styles.modalContent}>
        {newTerms?
        <View style={styles.modalTitleNew}>
            <Ionicons name="information-circle-outline" size={30} color='#336749' />
            <Text style={styles.titlenew}>Nuevos términos y Condiciones </Text>
        </View>
            
        : <Text style={styles.modalTitle}>Términos y Condiciones</Text> }
        <View style={styles.separator} />
        {/* <RenderHtml
          contentWidth={screenWidth * 0.8}
          source={{ html: termsText }}
          tagsStyles={tagsStyles} 
        /> */}
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlWithStyles }}
          style={styles.webview}
        />
        <TouchableOpacity style={styles.modalButton} onPress={acceptTerms}>
          <Text style={styles.modalButtonText}>Aceptar</Text>
        </TouchableOpacity>
        {onCancel && 
        <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
        <Text style={styles.modalButtonText}>Cancelar</Text>
      </TouchableOpacity>}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    width: screenWidth * 0.9,
    backgroundColor: 'rgba(246, 246, 246, 1)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#336749',
    fontSize: screenWidth*0.05,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titlenew: {
    marginTop:10,
    color: '#336749',
    fontSize: screenWidth*0.05,
    fontWeight: 'bold',
  },
  modalTitleNew: {
    color: '#336749',
    width:screenWidth,
    display:'flex',
    // flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    alignContent:'space-evenly',
    fontSize: screenWidth*0.05,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  separator: {
    height: 0.5, 
    width: '100%',
    backgroundColor: colors.inputBorder03,
    marginVertical: 5,
  },
  modalButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    width: '80%',
    textAlign: 'center',
  },
  modalCancelButton:{
    backgroundColor: '#8e8e8e',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    width: '80%',
    textAlign: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webview: {
    width: screenWidth * 0.8, 
    height: "100%",
    marginVertical: 10,
  },
});

export default TermsModal;
