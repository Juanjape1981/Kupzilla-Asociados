import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomCallout from '../components/CustomCallout';
import { Ionicons } from '@expo/vector-icons';
import colors from '../config/colors';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MapComponentProps {
  branch: any | null;
  currentPosition: { latitude: number, longitude: number } | null;
  destination: { latitude: number, longitude: number } | null;
  routeSelected: boolean;
  selectedBranch: any;
  onMapPress?: () => void;
  handleGetDirections: () => void;
  setSelectedBranch: (branch: any) => void;
  routeLoading: boolean;
  isEditing?: boolean;
  setRouteLoading: (loading: boolean) => void;
  ratings: any;
  justSee:boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}
const CustomMarker = () => (
  <Svg
    width={40}
    height={50}
    viewBox="0 0 100 125"
  >
    <Path
      d="M50,7.78C34,7.78,21.02,19.26,21.02,36.77c0,24.43,28.99,34.26,28.99,59.26c0-25,28.99-35.35,28.99-59.26C78.99,19.26,66.01,7.78,50,7.78zM68.68,33.5c-0.09,1.16-1.37,2.93-3.09,2.93c-0.29,0-0.44-0.05-0.85,1.17c0,0-0.06,14.22-0.06,15.21c0,0.99-0.74,1.54-1.6,1.54c-5.21,0.01-21.29,0.04-26.3,0.05c-0.85,0-1.49-0.66-1.49-1.59c0-0.94-0.02-15.21-0.02-15.21c-0.41-1.22-0.57-1.18-0.86-1.18c-1.72,0-3.01-1.76-3.1-2.92l-0.04-0.55l0.04,0c0,0-0.01-0.08,0-0.13c0.04-0.11,0.12-0.19,0.21-0.26l4.22-10.91c0.07-0.21,0.26-0.35,0.47-0.35l27.58,0c0.21,0,0.4,0.14,0.47,0.34l4.28,10.96c0.06,0.05,0.11,0.11,0.14,0.19c0.02,0.06,0.01,0.16,0.01,0.16l0.04,0l-0.05,0.55zM60.35,36.43c-1.13,0-2.01-0.76-2.54-1.61c-0.54,0.85-1.47,1.61-2.6,1.61c-1.14,0-2.07-0.76-2.6-1.61c-0.54,0.85-1.47,1.61-2.61,1.61c-1.13,0-2.06-0.76-2.6-1.61c-0.53,0.85-1.46,1.61-2.59,1.61s-2.05-0.76-2.59-1.61c-0.53,0.85-1.44,1.61-2.57,1.61c-1,0-1.93-0.59-2.34-1.31l0,10.11l25.38,0l0-10.11c-0.41,0.72-1.34,1.31-2.34,1.31zM62.47,32.95l-3.08-10.84l-2.95,0l1.85,10.84l4.18,0zM51.36,22.11l-2.83,0l-0.61,10.84l4.03,0l-0.59-10.84zM43.58,22.11l-2.97,0l-3.05,10.84l4.13,0l1.89-10.84z"
      fill={colors.error}
    />
  </Svg>
);

const MapSingle: React.FC<MapComponentProps> = ({
  ratings,
  branch,
  currentPosition,
  destination,
  routeSelected,
  selectedBranch,
  onMapPress,
  handleGetDirections,
  setSelectedBranch,
  routeLoading,
  isEditing,
  setRouteLoading,
  initialRegion,
  justSee
}) => {
  const [searchLocation, setSearchLocation] = useState({
    latitude: branch?.latitude || initialRegion?.latitude,
    longitude: branch?.longitude || initialRegion?.longitude,
    address: branch?.address || '',
    latitudeDelta: 0.035,
    longitudeDelta: 0.02,
  });
  // console.log(" branch",branch);
  // console.log("ubicacion branch",branch?.latitude, branch?.longitude);
  // console.log("region inicial ene el componente map",initialRegion);
  useEffect(() => {
    if(branch?.latitude && branch?.longitude)
    setSearchLocation({ ...searchLocation, latitude:branch?.latitude , longitude:branch?.longitude })
  }, [branch?.latitude, branch?.longitude, branch]);

  // Actualizar searchLocation cuando cambie initialRegion
  useEffect(() => {
    if (initialRegion?.latitude && initialRegion?.longitude) {
      setSearchLocation({
        ...searchLocation,
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      });
    }
  }, [initialRegion]);
  const handleMapPress = (e: any) => {
    // console.log("funcion pressmap", e.nativeEvent);
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSearchLocation({ ...searchLocation, latitude, longitude, latitudeDelta: 0.02,longitudeDelta: 0.02, });
    setSelectedBranch({ ...branch, latitude, longitude });
  };
  // console.log("selected branch", selectedBranch);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating <= 0.5 ? 'star-half' : 'star-outline'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={{
          latitude: searchLocation.latitude,
          longitude: searchLocation.longitude,
          latitudeDelta: searchLocation.latitudeDelta,
          longitudeDelta: searchLocation.longitudeDelta,
        }}
        onPress={isEditing? handleMapPress: onMapPress}
        scrollEnabled={isEditing}
      >
        {branch && (
          <Marker
            coordinate={{ latitude: searchLocation.latitude, longitude: searchLocation.longitude }}
            onPress={() => setSelectedBranch(branch)}
          >
            <CustomMarker />
            {/* <MaterialCommunityIcons name="storefront" size={35} color={colors.orange_color} /> */}
            {Platform.OS === 'ios' && (
              <Callout style={routeSelected ? styles.calloutContainerHide : styles.calloutContainerIos} tooltip>
                <View style={styles.callout}>
                  <View style={styles.calloutImageContainer}>
                    <Image source={{ uri: `${API_URL}${branch.image_url}`}} style={styles.calloutImage} />
                  </View>
                  <Text style={styles.calloutTitle}>{branch.name}</Text>
                  <View style={styles.divider}></View>
                  <View style={styles.ratingContainer}>{renderStars(ratings.average_rating)}</View>
                  <Text style={styles.calloutDescription}>{branch.description}</Text>
                  <Text style={styles.calloutDescription}>{branch.address}</Text>
                  <TouchableOpacity style={styles.calloutButton} >
                    <Text style={styles.calloutButtonText}>Cómo llegar?</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            )}
          </Marker>
        )}
        {currentPosition&& (
         <Marker coordinate={currentPosition} pinColor="blue">
         <MaterialCommunityIcons name="map-marker-account" size={40} color={colors.orange_color} />
         <Callout>
           <View style={{ padding: 5, width:screenWidth*0.3}}>
             <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.primary }}>
               Mi ubicación
             </Text>
           </View>
         </Callout>
       </Marker>
        )}
      </MapView>
      {routeLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.circles2} />
        </View>
      )}
      {selectedBranch && !routeSelected && Platform.OS === 'android' && (
        <View style={isEditing?  styles.calloutContainer:styles.calloutContainerPrev}>
         {isEditing? <Text style={styles.labelMap}>Ejemplo de marcador</Text>:<></>} 
          <CustomCallout branch={selectedBranch} setbranch={setSelectedBranch} handleRoutePress={handleGetDirections}  prevSee={justSee}/>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    padding: 1,
  },
  map: {
    width: '100%',
    height: screenHeight * 0.5,
    marginTop: 20,
  },
  labelMap: {
    textAlign:'center',
    marginTop: 30,
    marginBottom: -20,
    color: colors.primary,
    alignSelf: 'center'
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  calloutContainerHide: {
    display: 'none',
  },
  calloutContainerIos: {
    width: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  callout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calloutImageContainer: {
    width: 120,
    height: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutImage: {
    width: 130,
    height: 80,
    borderRadius: 5,
    marginBottom: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  calloutButton: {
    backgroundColor: colors.primary,
    marginTop: 10,
    padding: 5,
    borderRadius: 5,
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'gray',
    opacity: 0.5,
    marginVertical: 5,
  },
  calloutDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: 'gray',
    marginBottom: 0,
  },
  calloutContainer: {
    width: 200,
    alignItems: 'center',
  },
  calloutContainerPrev:{
    width: screenWidth*0.5,
    // alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '45%',
  },
});

export default MapSingle;
