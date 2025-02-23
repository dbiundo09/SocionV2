import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="home" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
