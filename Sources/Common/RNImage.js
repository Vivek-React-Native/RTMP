import React from 'react';
import { Image } from 'react-native';

const RNImage = ({ source, resizeMode, style }) => {
  return (
    <Image
      source={source}
      resizeMode={resizeMode || 'contain'}
      style={[{ width: '100%', height: '100%' }, style]}
    />
  );
};

export default RNImage;
