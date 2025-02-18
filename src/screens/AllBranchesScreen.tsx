import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { getMemoizedAllBranches, getMemoizedBranches } from '../redux/selectors/branchSelectors';
import { Branch } from '../redux/types/types';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SemicirclesOverlay from '../components/SemicirclesOverlay';
import { AppDispatch } from '../redux/store/store';
import { fetchAllBranches, fetchBranches } from '../redux/actions/branchActions';
import ErrorModal from '../components/ErrorModal';
import { Image } from 'expo-image';
import { fetchPromotions } from '../redux/actions/promotionsActions';
import colors from '../config/colors';
import { useTranslation } from 'react-i18next';
import Loader from '../components/Loader';


const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RootStackParamList = {
  Branches: undefined;
  BranchDetails: { branch: Branch };
};

const AllBranchesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const branches = useSelector(getMemoizedAllBranches);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>(branches);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [addressFilter, setAddressFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

// console.log("sucursales",branches);
const handleRefresh = async () => {
  setIsRefreshing(true);
  try {
    setIsLoading(true);
    await dispatch(fetchAllBranches());
    // await dispatch(fetchPromotions());
  } catch (error) {
    console.error('Error al recargar las sucursales:', error);
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};
useEffect(() => {
  const loadBranches = async () => {
    // console.log("Carga inicial de sucursales");
    setIsLoading(true);
    await dispatch(fetchAllBranches());
    setIsLoading(false);
  };

  loadBranches();
}, [dispatch]);

useFocusEffect(
  React.useCallback(() => {
    const loadBranches = async () => {
      // console.log("Actualización al enfocar la pantalla");
      setIsLoading(true);
      await dispatch(fetchAllBranches());
      setIsLoading(false);
    };
    loadBranches();
  }, [dispatch])
);

  useEffect(() => {
    let filtered = branches;

    if (nameFilter) {
      if(nameFilter.length > 30){
        setModalErrorMessage(t('allBranches.nameMaxLengthError'))
        setModalErrorVisible(true)
        return
      }
      filtered = filtered.filter(branch =>
        branch.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (addressFilter) {
      if(addressFilter.length > 50){
        setModalErrorMessage(t('allBranches.addressMaxLengthError'))
        setModalErrorVisible(true)
        return
      }
      filtered = filtered.filter(branch =>
        branch.address.toLowerCase().includes(addressFilter.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(branch => branch.status.name === statusFilter);
    }
    setFilteredBranches(filtered);
  }, [nameFilter, addressFilter, statusFilter, branches]);

  const handleBranchPress = (branch: Branch) => {
    // console.log('Branch seleccionado:', branch);
    navigation.navigate('BranchDetails', { branch });
  };

  return (
    <ScrollView style={styles.container}
    refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        colors={[colors.primary]}
      />
    }>
      <SemicirclesOverlay />
      <View style={styles.container2}>
        <View style={styles.filterContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nameFilter}
              onChangeText={(text) => setNameFilter(text)}
              placeholder={t('allBranches.searchByName')}
            />
            <MaterialCommunityIcons name="store-search-outline" size={24} color={colors.inputBorder05} style={styles.inputIcon} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={addressFilter}
              onChangeText={(text) => setAddressFilter(text)}
              placeholder={t('allBranches.searchByAddress')}
            />
            <MaterialCommunityIcons name="store-marker-outline" size={24} color={colors.inputBorder05}  style={styles.inputIcon} />
          </View>
        </View>

        
        <View style={styles.branchesList}>
          {isLoading? <Loader></Loader> : 
          (filteredBranches.length > 0 ? (
            filteredBranches.map(branch => (
              <TouchableOpacity 
                key={branch.branch_id} 
                style={styles.branchItem}
                onPress={() => handleBranchPress(branch)}
              >
                <View style={styles.branchInfo}>
                  <Text style={styles.branchTitle}>{branch.name}</Text>
                {branch.image_url?
                  <Image
                    source={{ uri: `${API_URL}${branch.image_url}` }}
                    style={styles.branchImage}
                    alt={branch.name}
                  />:
                  <Image
                    source={require('../../assets/noimage.png')}
                    style={styles.branchImage}
                    alt={branch.name}
                  />
                }
                </View>
                  <Text style={styles.branchAddress}>{branch.address}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No se encontraron sucursales.</Text>
          ))}
        </View>
      </View>
      <ErrorModal
        visible={modalErrorVisible}
        message={modalErrorMessage}
        onClose={() => setModalErrorVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  container2: {
    padding: 20,
  },
  filterContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    paddingRight: 40,
    borderColor: '#acd0d5',
    borderWidth: 1,
    color: "#000",
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
  },
  branchesList: {
    marginTop: 20,
  },
  branchItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderWidth: 0.6,
    borderColor: colors.inputBorder03,
    minHeight: 90,
    // padding: 5,
    // marginBottom: 10,
    borderRadius: 5,
    width: '100%',
    
    alignSelf:'center',
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 5,
    elevation: 1,

  },
  branchInfo: {
    flex: 1,
    flexDirection:'row',
    width:'100%',
    marginBottom: 10,
  },
  branchTitle: {
    width:'70%',
    fontSize: width*0.05,
    fontWeight: 'bold',
    color:colors.primary
  },
  branchAddress: {
    fontSize: width*0.03,
    color:'#333',
    width:'100%'
    // fontWeight: 'bold',
  },
  branchImage: {
    width:'30%',
    borderRadius:5,
    // width: 70,
    // height: 40,
  },
});

export default AllBranchesScreen;
