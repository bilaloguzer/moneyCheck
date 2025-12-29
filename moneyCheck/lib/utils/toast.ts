// Toast notification utility
// Usage: showSuccessToast('Receipt saved!'), showErrorToast('Failed to save')

import { Alert } from 'react-native';

export const showSuccessToast = (message: string, title?: string) => {
  // Fallback to Alert for now
  // After installing react-native-toast-message, replace with Toast.show()
  Alert.alert(title || 'Success', message);
};

export const showErrorToast = (message: string, title?: string) => {
  Alert.alert(title || 'Error', message);
};

export const showInfoToast = (message: string, title?: string) => {
  Alert.alert(title || 'Info', message);
};

export const showWarningToast = (message: string, title?: string) => {
  Alert.alert(title || 'Warning', message);
};

// Helper to show user-friendly error messages
export const showUserFriendlyError = (error: unknown, fallbackMessage?: string) => {
  let message = fallbackMessage || 'Something went wrong. Please try again.';
  
  if (error instanceof Error) {
    // Map technical errors to user-friendly messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection.';
    } else if (error.message.includes('MISSING_API_KEY')) {
      message = 'Service configuration error. Please contact support.';
    } else if (error.message.includes('database')) {
      message = 'Data error. Please try again.';
    } else if (error.message.includes('permission')) {
      message = 'Permission required. Please check app settings.';
    } else if (error.message) {
      // Use the error message if it looks user-friendly
      const msg = error.message;
      if (msg.length < 100 && !msg.includes('undefined') && !msg.includes('null')) {
        message = msg;
      }
    }
  }
  
  showErrorToast(message);
};
