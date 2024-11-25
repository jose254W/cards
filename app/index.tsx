import React from 'react';
import AppNavigator from '../src/navigation/AppNavigator';
import { AppRegistry, SafeAreaView, StyleSheet,StatusBar } from 'react-native';
import appConfig from '../app.json';
export default function App() {

  return (
    
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

      <AppNavigator />
      </SafeAreaView>
  );
}
AppRegistry.registerComponent(appConfig.expo.name, () => App);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});