import React from 'react';
import AppNavigator from '../src/navigation/AppNavigator';
import { SafeAreaView, StyleSheet,StatusBar } from 'react-native';

export default function App() {

  return (
    
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

      <AppNavigator />
      </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});