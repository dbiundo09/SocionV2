import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';   
import SIG from '../assets/images/SIG.png';
import CustomImage from '../components/CustomImage';

export default function Index() {
  return (
    <View style={styles.container}>
      <CustomImage source={SIG} scale={.5} />
      <Link href="/home" style={styles.button}>
        Go to Home screen
      </Link>
      <Link href="/register" style={styles.button}>
        Go to Register screen
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
