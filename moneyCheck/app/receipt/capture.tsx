// Receipt capture screen - camera with edge detection, capture button, gallery import
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ReceiptCaptureScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="camera" size={64} color="#64748B" />
        <Text style={styles.placeholderText}>Camera will be implemented here</Text>
        <Text style={styles.placeholderSubtext}>
          This will use expo-camera for receipt scanning
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="images" size={24} color="#2563EB" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/receipt/preview')}
        >
          <Ionicons name="flash" size={24} color="#2563EB" />
          <Text style={styles.buttonText}>Flash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  button: {
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#37352F',
  },
});
