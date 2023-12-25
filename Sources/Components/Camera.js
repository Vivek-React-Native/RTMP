import React, { useRef, useState } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { usePermissions } from '../Hooks';
import NoCameraPermission from './NoCameraPermission';
import { RNImage } from '../Common';
import { Images } from '../Constants';

const CameraView = () => {
  const [State, setState] = useState({ deviceType: 'front' });
  const { IsGranted } = usePermissions();
  const device = useCameraDevice(State.deviceType);
  const cameraRef = useRef();
  console.log({ device });

  const onCameraChange = () => {
    // const AvailableDevices = Camera.getAvailableCameraDevices();
    // console.log(
    //   'AvailableDevices -> ',
    //   JSON.stringify(
    //     AvailableDevices.find(v => v.position === 'back'),
    //     null,
    //     2,
    //   ),
    // );
    setState(p => ({
      ...p,
      deviceType: p.deviceType === 'back' ? 'front' : 'back',
    }));
  };

  return IsGranted ? (
    <View style={styles.container}>
      {device && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          onError={e => console.log({ e })}
          video={true}
        />
      )}
      <View style={{ flex: 1 }} />

      <View style={styles.Overlay}>
        <TouchableOpacity style={styles.buttonContainer}></TouchableOpacity>

        <TouchableOpacity
          onPress={onCameraChange}
          style={styles.buttonContainer}>
          <RNImage source={Images.cameraSwitch} style={styles.button} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer}></TouchableOpacity>
      </View>
    </View>
  ) : (
    <NoCameraPermission />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f00',
  },
  Overlay: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '75%',
    height: '75%',
    tintColor: '#fff',
  },
});

export default CameraView;
