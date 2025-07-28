import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const PlaceSearch = ({ placeholder, onPlaceSelected }) => {
  const [keepResults, setKeepResults] = useState(true);

  return (
    <GooglePlacesAutocomplete
      placeholder={placeholder}
      onPress={(data, details = null) => {
        if (details) {
          onPlaceSelected({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          });

          // 🧠 Once a place is selected, hide suggestions
          setKeepResults(false);
        }
      }}
      minLength={2}
      fetchDetails={true}
      timeout={1000}
      query={{
        key: 'AIzaSyAfyaSB4Rgd0p9PECIrPHz0Z-FVUnkq-FU',
        language: 'en',
      }}
      predefinedPlaces={[]}
      keepResultsAfterBlur={keepResults}
      enablePoweredByContainer={true}
      styles={{
        textInput: styles.input,
      }}
      textInputProps={{
        onFocus: () => {
          // 🧠 When user focuses again, show suggestions
          setKeepResults(true);
        },
        returnKeyType: 'search',
      }}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default PlaceSearch;
