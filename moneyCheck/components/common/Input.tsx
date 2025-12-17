// Reusable text input component with validation states
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

export function Input({
  value,
  onChangeText,
  placeholder,
  error,
  label,
  secureTextEntry = false,
  keyboardType = 'default',
}: InputProps) {
  const hasError = Boolean(error && error.length > 0);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, hasError ? styles.inputError : null]}
        placeholderTextColor="#9B9A97"
      />
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#787774',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#FFFFFF',
    color: '#37352F',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#E03E3E',
  },
  errorText: {
    color: '#E03E3E',
    fontSize: 12,
    marginTop: 6,
  },
});
