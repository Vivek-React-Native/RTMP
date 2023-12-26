import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePermissions } from '../Hooks';

const Home = ({ navigation }) => {
  const {} = usePermissions();
  const [State, setState] = useState({ url: '' });

  const onPress = () => {
    if (State.url?.length > 0) {
      navigation.navigate('RTMP', {
        url: State.url,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please enter RTMP url here</Text>

      <TextInput
        placeholder={'Enter RTMP Url'}
        placeholderTextColor={'#000'}
        value={State.url}
        onChangeText={v => setState(p => ({ ...p, url: v }))}
        keyboardType={'email-address'}
        style={styles.input}
      />

      <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
        <Text style={styles.buttonText}>Go Live</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    width: '80%',
    marginVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: '#000',
  },
  buttonContainer: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#1d30bf',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Home;
