// Root layout - wraps entire app with providers, handles initial loading and database setup
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF9' }}>
        <ActivityIndicator size="large" color="#37352F" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
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
  );
}

export default function RootLayout() {
  return (
    <LocalizationProvider>
      <DatabaseProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </AuthProvider>
      </DatabaseProvider>
    </LocalizationProvider>
  );
}
