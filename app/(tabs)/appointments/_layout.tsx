import { Stack } from 'expo-router';

export default function AppointmentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="doctor/[id]" />
      <Stack.Screen name="book" />
    </Stack>
  );
}
