import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NodeCameraView } from 'react-native-nodemediaclient';
import { RNImage } from '../Common';
import { Images } from '../Constants';

const RTMP_Key = `rtmp://a.rtmp.youtube.com/live2/zqsp-041v-3axy-vc19-7dr9`;

const NodeMedia = () => {
  const [State, setState] = useState({ isPlayed: false });
  const NodeRef = useRef();

  const onPlayPause = async () => {
    if (!State.isPlayed) {
      await NodeRef.current?.start();
    } else {
      await NodeRef.current?.stop();
    }
    setState(p => ({ ...p, isPlayed: !State.isPlayed }));
  };

  const onCameraChange = () => {
    NodeRef.current?.switchCamera();
  };

  return (
    <View style={styles.container}>
      <NodeCameraView
        ref={NodeRef}
        style={{ flex: 1 }}
        outputUrl={RTMP_Key}
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
    backgroundColor: '#fff',
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
});

export default NodeMedia;
