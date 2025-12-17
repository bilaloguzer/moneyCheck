// Receipt capture screen - camera with edge detection, capture button, gallery import
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView } from '@/components/camera/CameraView';

export default function ReceiptCaptureScreen() {
  const router = useRouter();

  const handleCapture = (uri: string) => {
    // Navigate to preview screen with the captured image
    router.push({
      pathname: '/receipt/preview',
      params: { imageUri: uri },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} ratio="4:3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
