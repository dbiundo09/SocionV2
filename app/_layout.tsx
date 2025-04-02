import { Stack, useRouter, useSegments } from 'expo-router';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';




export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const router = useRouter();
  const segments = useSegments();


  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === "auth";


    if (user && !inAuthGroup) {
      router.replace('/auth/classes');
    } else if (!user && inAuthGroup) {
      router.replace('/');
    }


    setInitializing(false);
  }, [user, initializing]) 


  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, (user: FirebaseAuthTypes.User | null) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);


  if (initializing) {
    return <ActivityIndicator size="large" color="#0000ff" />; 
  }
  return (
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen name="auth" options={{headerShown: false}}  />
      </Stack>
  );
}
