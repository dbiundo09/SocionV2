import { getAuth } from "@react-native-firebase/auth";
import { Alert } from 'react-native';
import { router } from 'expo-router';

export async function handleLogout() {
  const auth = getAuth();
  try {
    await auth.signOut();
    router.replace('/');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

export function handleUnauthorizedError(error: any) {
  if (error.message?.includes('unauthorized') || error.message?.includes('Unauthorized')) {
    Alert.alert(
      'Session Expired',
      'Please log in again to continue.',
      [
        {
          text: 'OK',
          onPress: handleLogout
        }
      ]
    );
    return true;
  }
  return false;
}