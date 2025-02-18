import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../config/colors';

const Loader: React.FC = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={colors.circles2} />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
});

export default Loader;