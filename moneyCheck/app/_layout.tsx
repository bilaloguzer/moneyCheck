// Root layout - wraps entire app with providers, handles initial loading and database setup
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@/contexts/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="receipt/capture" options={{ title: 'Scan Receipt' }} />
        <Stack.Screen name="receipt/preview" options={{ title: 'Preview' }} />
        <Stack.Screen name="receipt/processing" options={{ title: 'Processing...' }} />
        <Stack.Screen name="receipt/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="receipt/[id]/edit" options={{ title: 'Edit Receipt' }} />
        <Stack.Screen name="receipt/[id]/compare" options={{ title: 'Price Comparison' }} />
        <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/kvkk" options={{ title: 'Privacy' }} />
        <Stack.Screen name="onboarding/permissions" options={{ title: 'Permissions' }} />
        <Stack.Screen name="analytics/breakdown" options={{ title: 'Spending Breakdown' }} />
        <Stack.Screen name="settings/data-management" options={{ title: 'Data Management' }} />
      </Stack>
    </DatabaseProvider>
  );
}
