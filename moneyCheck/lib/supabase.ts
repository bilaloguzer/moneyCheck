import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get environment variables from either process.env or Expo Constants
const supabaseUrl = 
  process.env.EXPO_PUBLIC_SUPABASE_URL || 
  Constants.expoConfig?.extra?.supabaseUrl || 
  '';

const supabaseAnonKey = 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_KEY || // Support both variable names
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Please add these to your .env file:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=https://rtzicegldsutoeasdjcy.supabase.co');
  console.error('EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here');
  console.error('\nThen restart with: npm start -- --clear');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

