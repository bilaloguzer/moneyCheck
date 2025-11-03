// Hook for camera access and permissions management
import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setIsReady(true);
    })();
  }, []);

  return { hasPermission, isReady };
}
