import { View, StyleSheet, Dimensions } from 'react-native';
import colors from '../config/colors';

const { width: screenWidth } = Dimensions.get('window');
const SemicirclesOverlay = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.semicircle, styles.semicircle1]} />
      <View style={[styles.semicircle, styles.semicircle2]} />
      <View style={[styles.semicircle, styles.semicircle3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: -1,
    left: 0,
    right: 0,
    height: 200,
    top: -100,
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    backgroundColor: 'transparent',
  },
  semicircle: {
    width: screenWidth,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
  },
  semicircle1: {
    width: '100%',
    backgroundColor: colors.circles1,
    top: 0,
  },
  semicircle2: {
    width: '110%',
    backgroundColor: colors.circles2,
    top: 40,
  },
  semicircle3: {
    width: '115%',
    backgroundColor: colors.circles3,
    top: 80,
  },
});

export default SemicirclesOverlay;