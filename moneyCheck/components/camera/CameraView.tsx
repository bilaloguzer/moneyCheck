import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { useCamera } from '../../lib/hooks/camera/useCamera';
import { MaterialIcons } from '@expo/vector-icons';

interface CameraViewProps {
  onCapture: (uri: string) => void;
  onClose?: () => void;
}

export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const {
    cameraRef,
    permission,
    requestPermission,
    type,
    setType,
    flash,
    setFlash,
    takePicture,
    isReady
  } = useCamera();

  useEffect(() => {
    if (permission === false) {
      // Could show an alert or just rely on the UI to show the permission button
    }
  }, [permission]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
        )}
      </View>
    );
  }

  const handleCapture = async () => {
    const uri = await takePicture();
    if (uri) {
      onCapture(uri);
    }
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const toggleType = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={type}
        flash={flash}
      >
        <View style={styles.controls}>
          <View style={styles.topControls}>
             {onClose && (
              <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                <MaterialIcons name="close" size={30} color="white" />
              </TouchableOpacity>
            )}
             <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                <MaterialIcons name={flash === 'on' ? "flash-on" : "flash-off"} size={30} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleType}>
               <MaterialIcons name="flip-camera-ios" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            
            <View style={styles.spacer} />
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconButton: {
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  spacer: {
      width: 50,
  },
  closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      padding: 10,
  }
});
