import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const NoCameraPermission = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Please give camera permission to use device camera.
      </Text>
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
  text: {
    paddingHorizontal: 20,
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
});

export default NoCameraPermission;
