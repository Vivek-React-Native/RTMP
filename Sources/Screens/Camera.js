import React, { useRef, useState } from 'react';
import { StyleSheet, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { RNImage } from '../Common';
import { Images } from '../Constants';

const Camera = ({ route }) => {
  const [State, setState] = useState({ isPlayed: false });
  const NodeRef = useRef();
  const url = route?.params?.url;

  const onPlayPause = async () => {
    if (!State.isPlayed) {
      await NodeRef.current?.start();

      ToastAndroid.showWithGravityAndOffset(
        'Start',
        ToastAndroid.LONG,
        ToastAndroid.TOP,
        0,
        250,
      );
    } else {
      await NodeRef.current?.stop();
      ToastAndroid.showWithGravityAndOffset(
        'Stop',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }
    setState(p => ({ ...p, isPlayed: !State.isPlayed }));
  };

  const onCameraChange = () => {
    NodeRef.current?.switchCamera();
  };

  return (
    <View style={styles.container}>
      {url && (
        <NodeCameraView
          ref={NodeRef}
          style={{ flex: 1 }}
          outputUrl={url}
          camera={{ cameraId: 1, cameraFrontMirror: true }}
          audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
          video={{
            preset: 12,
            bitrate: 400000,
            profile: 1,
            fps: 15,
            videoFrontMirror: false,
          }}
          bufferTime={300}
          scaleMode={'ScaleAspectFit'}
          maxBufferTime={1000}
          autoplay={true}
          autopreview={true}
          onStatus={(code, msg) => console.log({ code, msg })}
        />
      )}

      {/* <TouchableOpacity onPress={onCameraChange} style={styles.backContainer}>
        <RNImage source={Images.LeftArrow} style={styles.button} />
      </TouchableOpacity> */}

      <View style={styles.overlay}>
        <View style={styles.flexRowHorizontal}>
          <View style={styles.buttonContainer} />
          <TouchableOpacity
            onPress={onPlayPause}
            style={styles.buttonContainer}>
            <RNImage
              source={State.isPlayed ? Images.pause : Images.play}
              style={styles.button}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCameraChange}
            style={styles.buttonContainer}>
            <RNImage source={Images.cameraSwitch} style={styles.button} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  flexRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  box: {
    width: 10,
    height: 10,
    backgroundColor: '#f00',
    zIndex: 1000,
  },
  backContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 15,
    left: 15,
  },
});

export default Camera;
