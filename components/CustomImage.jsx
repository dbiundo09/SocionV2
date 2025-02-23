import { Image, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CustomImage({ source, scale = 1, resizeMode = 'contain' }) {
  return (
    <Image
      source={source}
      style={[
        styles.image,
        {
          width: screenWidth * scale,  
          height: screenHeight * scale,
          resizeMode: resizeMode,
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
}); 