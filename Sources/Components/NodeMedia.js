/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { RNSerialport, definitions, actions } from 'react-native-serialport';
//type Props = {};
class ManualConnection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      servisStarted: false,
      connected: false,
      usbAttached: false,
      output: '',
      outputArray: [],
      baudRate: '115200',
      interface: '-1',
      selectedDevice: null,
      deviceList: [{ name: 'Device Not Found', placeholder: true }],
      sendText: 'HELLO',
      returnedDataType: definitions.RETURNED_DATA_TYPES.HEXSTRING,
    };

    this.startUsbListener = this.startUsbListener.bind(this);
    this.stopUsbListener = this.stopUsbListener.bind(this);
  }

  componentDidMount() {
    this.startUsbListener();
  }

  componentWillUnmount() {
    this.stopUsbListener();
  }

  startUsbListener() {
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STARTED,
      this.onServiceStarted,
      this,
    );
    DeviceEventEmitter.addListener(
      actions.ON_SERVICE_STOPPED,
      this.onServiceStopped,
      this,
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_ATTACHED,
      this.onDeviceAttached,
      this,
    );
    DeviceEventEmitter.addListener(
      actions.ON_DEVICE_DETACHED,
      this.onDeviceDetached,
      this,
    );
    DeviceEventEmitter.addListener(actions.ON_ERROR, this.onError, this);
    DeviceEventEmitter.addListener(
      actions.ON_CONNECTED,
      this.onConnected,
      this,
    );
    DeviceEventEmitter.addListener(
      actions.ON_DISCONNECTED,
      this.onDisconnected,
      this,
    );
    DeviceEventEmitter.addListener(actions.ON_READ_DATA, this.onReadData, this);
    RNSerialport.setReturnedDataType(this.state.returnedDataType);
    RNSerialport.setAutoConnect(false);
    RNSerialport.startUsbService();
  }

  stopUsbListener = async () => {
    DeviceEventEmitter.removeAllListeners();
    const isOpen = await RNSerialport.isOpen();
    if (isOpen) {
      Alert.alert('isOpen', isOpen);
      RNSerialport.disconnect();
    }
    RNSerialport.stopUsbService();
  };

  onServiceStarted(response) {
    this.setState({ servisStarted: true });
    if (response.deviceAttached) {
      this.onDeviceAttached();
    }
  }
  onServiceStopped() {
    this.setState({ servisStarted: false });
    Alert.alert('service stopped');
  }
  onDeviceAttached() {
    this.setState({ usbAttached: true });
    this.fillDeviceList();
  }
  onDeviceDetached() {
    this.setState({ usbAttached: false });
    this.setState({ selectedDevice: null });
    this.setState({
      deviceList: [{ name: 'Device Not Found', placeholder: true }],
    });
  }
  onConnected() {
    this.setState({ connected: true });
  }
  onDisconnected() {
    this.setState({ connected: false });
  }
  onReadData(data) {
    if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
    ) {
      const payload = RNSerialport.intArrayToUtf16(data.payload);
      this.setState({ output: this.state.output + payload });
    } else if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
    ) {
      const payload = RNSerialport.hexToUtf16(data.payload);
      this.setState({ output: this.state.output + payload });
    }
  }

  onError(error) {
    console.error(error);
  }

  handleConvertButton() {
    let data = '';
    if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
    ) {
      data = RNSerialport.hexToUtf16(this.state.output);
    } else if (
      this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
    ) {
      data = RNSerialport.intArrayToUtf16(this.state.outputArray);
    } else {
      return;
    }
    this.setState({ output: data });
  }
  async fillDeviceList() {
    const response = await RNSerialport.getDeviceList();
    console.log({ response });
    this.setState({ deviceList: response });
  }
  // devicePickerItems() {
  //   return this.state.deviceList.map((device, index) =>
  //     !device.placeholder ? (
  //       <Picker.Item key={index} label={device.name} value={device} />
  //     ) : (
  //       <Picker.Item key={index} label={device.name} value={null} />
  //     ),
  //   );
  // }

  handleSendButton() {
    RNSerialport.writeString(this.state.sendText);
  }
  handleClearButton() {
    this.setState({ output: '' });
    this.setState({ outputArray: [] });
  }

  checkSupport() {
    if (
      this.state.selectedDevice.name === undefined ||
      this.state.selectedDevice === null
    )
      return;
    RNSerialport.isSupported(this.state.selectedDevice.name)
      .then(status => {
        alert(status ? 'Supported' : 'Not Supported');
      })
      .catch(error => {
        alert(JSON.stringify(error));
      });
  }

  handleConnectButton = async () => {
    const isOpen = await RNSerialport.isOpen();
    if (isOpen) {
      RNSerialport.disconnect();
    } else {
      if (!this.state.selectedDevice) {
        alert('Please choose device');
        return;
      }
      RNSerialport.setInterface(parseInt(this.state.interface, 10));
      RNSerialport.connectDevice(
        this.state.selectedDevice.name,
        parseInt(this.state.baudRate, 10),
      );
    }
  };

  buttonStyle = status => {
    return status
      ? styles.button
      : Object.assign({}, styles.button, { backgroundColor: '#C0C0C0' });
  };

  onItemPress = async item => {
    await RNSerialport.connectDevice(
      item.name,
      parseFloat(this.state.baudRate),
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.line}>
              <Text style={styles.title}>Service:</Text>
              <Text style={styles.value}>
                {this.state.servisStarted ? 'Started' : 'Not Started'}
              </Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.title}>Usb:</Text>
              <Text style={styles.value}>
                {this.state.usbAttached ? 'Attached' : 'Not Attached'}
              </Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.title}>Connection:</Text>
              <Text style={styles.value}>
                {this.state.connected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          <ScrollView style={styles.output} nestedScrollEnabled={true}>
            <Text style={styles.full}>
              {this.state.output === '' ? 'No Content' : this.state.output}
            </Text>
          </ScrollView>

          <View style={styles.inputContainer}>
            <Text>Send</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={text => this.setState({ sendText: text })}
              value={this.state.sendText}
              placeholder={'Send Text'}
            />
          </View>
          <View style={styles.line2}>
            <TouchableOpacity
              style={this.buttonStyle(this.state.connected)}
              onPress={() => this.handleSendButton()}
              disabled={!this.state.connected}>
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleClearButton()}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleConvertButton()}>
              <Text style={styles.buttonText}>Convert</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.line2}>
            <View style={styles.inputContainer}>
              <Text>Baud Rate</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.setState({ baudRate: text })}
                value={this.state.baudRate}
                placeholder={'Baud Rate'}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text>Interface</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={text => this.setState({ interface: text })}
                value={this.state.interface}
                placeholder={'Interface'}
              />
            </View>
          </View>
          {this.state.deviceList?.map((v, i) => (
            <TouchableOpacity key={i} onPress={() => this.onItemPress(v)}>
              <Text>{v.name}</Text>
              <Text>{v.productId}</Text>
              <Text>{v.vendorId}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.inputContainer}>
            <Text>Device List</Text>
            {/* <Picker
              enabled={
                this.state.deviceList.length > 0 &&
                !this.state.deviceList[0].placeholder
              }
              selectedValue={this.state.selectedDevice}
              onValueChange={(value, index) =>
                this.setState({ selectedDevice: value })
              }>
              {this.devicePickerItems()}
            </Picker> */}
          </View>
          <TouchableOpacity
            style={this.buttonStyle(this.state.selectedDevice)}
            disabled={!this.state.selectedDevice}
            onPress={() => this.handleConnectButton()}>
            <Text style={styles.buttonText}>
              {this.state.connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={this.buttonStyle(this.state.selectedDevice)}
            disabled={!this.state.selectedDevice}
            onPress={() => {
              this.checkSupport();
            }}>
            <Text style={styles.buttonText}>Check Support</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16,
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    //alignItems: "center"
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
  },
  line2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    width: 100,
  },
  value: {
    marginLeft: 20,
  },
  output: {
    marginTop: 10,
    height: 300,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  inputContainer: {
    marginTop: 10,
    borderBottomWidth: 2,
  },
  textInput: {
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#147efb',
    borderRadius: 3,
  },
  buttonText: {
    color: '#FFFFFF',
  },
});

export default ManualConnection;

// import React, { Component } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   DeviceEventEmitter,
// } from 'react-native';
// import { RNSerialport, definitions, actions } from 'react-native-serialport';
// //type Props = {};
// class NodeMedia extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       servisStarted: false,
//       connected: false,
//       usbAttached: false,
//       output: '',
//       outputArray: [],
//       baudRate: '115200',
//       interface: '-1',
//       sendText: 'HELLO',
//       returnedDataType: definitions.RETURNED_DATA_TYPES.HEXSTRING,
//     };

//     this.startUsbListener = this.startUsbListener.bind(this);
//     this.stopUsbListener = this.stopUsbListener.bind(this);
//   }

//   componentDidMount() {
//     this.startUsbListener();
//   }

//   componentWillUnmount() {
//     this.stopUsbListener();
//   }

//   startUsbListener() {
//     DeviceEventEmitter.addListener(
//       actions.ON_CONNECTED,
//       this.onConnected,
//       this,
//     );
//     DeviceEventEmitter.addListener(
//       actions.ON_DISCONNECTED,
//       this.onDisconnected,
//       this,
//     );

//     DeviceEventEmitter.addListener(
//       actions.ON_SERVICE_STARTED,
//       this.onServiceStarted,
//       this,
//     );
//     DeviceEventEmitter.addListener(
//       actions.ON_SERVICE_STOPPED,
//       this.onServiceStopped,
//       this,
//     );
//     DeviceEventEmitter.addListener(
//       actions.ON_DEVICE_ATTACHED,
//       this.onDeviceAttached,
//       this,
//     );
//     DeviceEventEmitter.addListener(
//       actions.ON_DEVICE_DETACHED,
//       this.onDeviceDetached,
//       this,
//     );
//     DeviceEventEmitter.addListener(actions.ON_ERROR, this.onError, this);

//     DeviceEventEmitter.addListener(actions.ON_READ_DATA, this.onReadData, this);

//     RNSerialport.setReturnedDataType(this.state.returnedDataType);
//     RNSerialport.setAutoConnectBaudRate(parseInt(this.state.baudRate, 10));
//     RNSerialport.setInterface(parseInt(this.state.interface, 10));
//     RNSerialport.setAutoConnect(true);
//     RNSerialport.startUsbService();
//   }

//   stopUsbListener = async () => {
//     DeviceEventEmitter.removeAllListeners();
//     const isOpen = await RNSerialport.isOpen();
//     if (isOpen) {
//       Alert.alert('isOpen', isOpen);
//       RNSerialport.disconnect();
//     }
//     RNSerialport.stopUsbService();
//   };

//   onServiceStarted(response) {
//     console.log('onServiceStarted -> ', response);
//     this.setState({ servisStarted: true });
//     if (response.deviceAttached) {
//       this.onDeviceAttached(response.deviceAttached);
//     }
//   }
//   onServiceStopped(response) {
//     console.log('onServiceStopped -> ', response);
//     this.setState({ servisStarted: false });
//   }
//   onDeviceAttached(response) {
//     console.log('onDeviceAttached -> ', response);
//     this.setState({ usbAttached: true });
//   }
//   onDeviceDetached(response) {
//     console.log('onDeviceDetached -> ', response);
//     this.setState({ usbAttached: false });
//   }
//   onConnected(response) {
//     console.log('onConnected -> ', response);
//     this.setState({ connected: true });
//   }
//   onDisconnected(response) {
//     console.log('onDisconnected -> ', response);
//     this.setState({ connected: false });
//   }
//   onReadData(data) {
//     console.log('onReadData -> ', data);
//     if (
//       this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
//     ) {
//       const payload = RNSerialport.intArrayToUtf16(data.payload);
//       this.setState({ output: this.state.output + payload });
//     } else if (
//       this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
//     ) {
//       const payload = RNSerialport.hexToUtf16(data.payload);
//       this.setState({ output: this.state.output + payload });
//     }
//   }

//   onError(error) {
//     console.error(error);
//   }

//   handleConvertButton() {
//     let data = '';
//     if (
//       this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.HEXSTRING
//     ) {
//       data = RNSerialport.hexToUtf16(this.state.output);
//     } else if (
//       this.state.returnedDataType === definitions.RETURNED_DATA_TYPES.INTARRAY
//     ) {
//       data = RNSerialport.intArrayToUtf16(this.state.outputArray);
//     } else {
//       return;
//     }
//     this.setState({ output: data });
//   }

//   handleClearButton() {
//     this.setState({ output: '' });
//     this.setState({ outputArray: [] });
//   }

//   buttonStyle = status => {
//     return status
//       ? styles.button
//       : Object.assign({}, styles.button, { backgroundColor: '#C0C0C0' });
//   };

//   render() {
//     return (
//       <ScrollView style={styles.body}>
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <View style={styles.line}>
//               <Text style={styles.title}>Service:</Text>
//               <Text style={styles.value}>
//                 {this.state.servisStarted ? 'Started' : 'Not Started'}
//               </Text>
//             </View>
//             <View style={styles.line}>
//               <Text style={styles.title}>Usb:</Text>
//               <Text style={styles.value}>
//                 {this.state.usbAttached ? 'Attached' : 'Not Attached'}
//               </Text>
//             </View>
//             <View style={styles.line}>
//               <Text style={styles.title}>Connection:</Text>
//               <Text style={styles.value}>
//                 {this.state.connected ? 'Connected' : 'Not Connected'}
//               </Text>
//             </View>
//           </View>
//           <ScrollView style={styles.output} nestedScrollEnabled={true}>
//             <Text style={styles.full}>
//               {this.state.output === '' ? 'No Content' : this.state.output}
//             </Text>
//           </ScrollView>

//           <View style={styles.inputContainer}>
//             <Text>Send</Text>
//             <TextInput
//               style={styles.textInput}
//               onChangeText={text => this.setState({ sendText: text })}
//               value={this.state.sendText}
//               placeholder={'Send Text'}
//             />
//           </View>
//           <View style={styles.line2}>
//             <TouchableOpacity
//               style={this.buttonStyle(this.state.connected)}
//               onPress={() => this.handleSendButton()}
//               disabled={!this.state.connected}>
//               <Text style={styles.buttonText}>Send</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => this.handleClearButton()}>
//               <Text style={styles.buttonText}>Clear</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => this.handleConvertButton()}>
//               <Text style={styles.buttonText}>Convert</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   full: {
//     flex: 1,
//   },
//   body: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     marginTop: 20,
//     marginLeft: 16,
//     marginRight: 16,
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'center',
//     //alignItems: "center"
//   },
//   line: {
//     display: 'flex',
//     flexDirection: 'row',
//   },
//   line2: {
//     display: 'flex',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   title: {
//     width: 100,
//   },
//   value: {
//     marginLeft: 20,
//   },
//   output: {
//     marginTop: 10,
//     height: 300,
//     padding: 10,
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//   },
//   inputContainer: {
//     marginTop: 10,
//     borderBottomWidth: 2,
//   },
//   textInput: {
//     paddingLeft: 10,
//     paddingRight: 10,
//     height: 40,
//   },
//   button: {
//     marginTop: 16,
//     marginBottom: 16,
//     paddingLeft: 15,
//     paddingRight: 15,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#147efb',
//     borderRadius: 3,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//   },
// });

// export default NodeMedia;

// import React, { useRef, useState } from 'react';
// import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import { NodeCameraView } from 'react-native-nodemediaclient';
// import { RNImage } from '../Common';
// import { Images } from '../Constants';

// const RTMP_Key = `rtmp://a.rtmp.youtube.com/live2/zqsp-041v-3axy-vc19-7dr9`;

// const NodeMedia = () => {
//   const [State, setState] = useState({ isPlayed: false });
//   const NodeRef = useRef();

//   const onPlayPause = async () => {
//     if (!State.isPlayed) {
//       await NodeRef.current?.start();
//     } else {
//       await NodeRef.current?.stop();
//     }
//     setState(p => ({ ...p, isPlayed: !State.isPlayed }));
//   };

//   const onCameraChange = () => {
//     NodeRef.current?.switchCamera();
//   };

//   return (
//     <View style={styles.container}>
//       <NodeCameraView
//         ref={NodeRef}
//         style={{ flex: 1 }}
//         outputUrl={RTMP_Key}
//         camera={{ cameraId: 1, cameraFrontMirror: true }}
//         audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
//         video={{
//           preset: 12,
//           bitrate: 400000,
//           profile: 1,
//           fps: 15,
//           videoFrontMirror: false,
//         }}
//         bufferTime={300}
//         scaleMode={'ScaleAspectFit'}
//         maxBufferTime={1000}
//         autoplay={true}
//         autopreview={true}
//         onStatus={(code, msg) => console.log({ code, msg })}
//       />

//       <View style={styles.overlay}>
//         <View style={styles.flexRowHorizontal}>
//           <View style={styles.buttonContainer} />
//           <TouchableOpacity
//             onPress={onPlayPause}
//             style={styles.buttonContainer}>
//             <RNImage
//               source={State.isPlayed ? Images.pause : Images.play}
//               style={styles.button}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={onCameraChange}
//             style={styles.buttonContainer}>
//             <RNImage source={Images.cameraSwitch} style={styles.button} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   overlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//   },
//   flexRowHorizontal: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   buttonContainer: {
//     width: 50,
//     height: 50,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   button: {
//     width: '75%',
//     height: '75%',
//     tintColor: '#fff',
//   },
//   box: {
//     width: 10,
//     height: 10,
//     backgroundColor: '#f00',
//     zIndex: 1000,
//   },
// });

// export default NodeMedia;
