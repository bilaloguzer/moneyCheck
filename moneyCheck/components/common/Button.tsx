// Reusable button component with variants (primary, secondary, danger)
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, containerStyle }: ButtonProps) {
  const getColors = () => {
    if (variant === 'primary') {
      return { bg: '#37352F', text: '#FFFFFF', border: '#37352F' };
    } else if (variant === 'danger') {
      return { bg: '#E03E3E', text: '#FFFFFF', border: '#E03E3E' };
    } else {
      return { bg: '#FFFFFF', text: '#37352F', border: '#E9E9E7' };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        containerStyle,
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
