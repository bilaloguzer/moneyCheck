import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables - Expo loads from .env automatically
// @ts-ignore - process.env is injected by Expo at build time
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
// @ts-ignore
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Only log warning if truly missing (not during initial import)
if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configuration loaded successfully');
} else if (supabaseUrl || supabaseAnonKey) {
  console.warn('⚠️ Partial Supabase configuration detected');
  console.warn('URL:', supabaseUrl ? '✓' : '✗');
  console.warn('Key:', supabaseAnonKey ? '✓' : '✗');
}

// Create client with fallback empty strings to prevent immediate crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

