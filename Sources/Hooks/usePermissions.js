import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

const CAMERA_PERMISSION = PermissionsAndroid.PERMISSIONS.CAMERA;
const AUDIO_PERMISSION = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

function usePermissions() {
  const [IsGranted, setIsGranted] = useState(false);

  useEffect(() => {
    getPermissions();
  }, []);

  async function getPermissions() {
    if (Platform.OS !== 'android') {
      setIsGranted(true);
      return;
    }

    const cameraPermission = await PermissionsAndroid.check(CAMERA_PERMISSION);
    const audioPermission = await PermissionsAndroid.check(AUDIO_PERMISSION);

    if (cameraPermission && audioPermission) {
      return setIsGranted(true);
    }

    const hasPermissions = await PermissionsAndroid.requestMultiple([
      CAMERA_PERMISSION,
      AUDIO_PERMISSION,
    ]);

    if (hasPermissions) {
      return setIsGranted(true);
    }
  }

  return { IsGranted };
}

export default usePermissions;
