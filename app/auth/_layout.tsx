import {Stack} from 'expo-router';

export default function Layout() {
  return (
    <Stack>
        <Stack.Screen name="home" options={{headerShown: false}} />
        <Stack.Screen name="classes" options={{headerShown: false}} />
        <Stack.Screen name="create-class" options={{headerShown: false}} />
        <Stack.Screen name="admin-view" options={{headerShown: false}} />
        <Stack.Screen name="exercise-details" options={{headerShown: false}} />
        <Stack.Screen name="view-exercises/[id]" options={{headerShown: false}} />
        <Stack.Screen name="admin-exercise-details" options={{headerShown: false}} />
        <Stack.Screen name="student-list" options={{headerShown: false}} />
    </Stack>
  );
}