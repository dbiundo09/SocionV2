import { Image, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomImageProps {
  source: ImageSourcePropType;
  scale?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export default function CustomImage({ 
  source, 
  scale = 1, 
  resizeMode = 'contain' 
}: CustomImageProps) {
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