import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const HomeScreen = ({ navigation }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState(true);
  const balance = 1000; // Placeholder value
  const cardData = {
    cardNumber: '4111 1111 1111 1111',
    cardHolder: 'JOSEPH NJERI',
    expiryDate: '12/25',
    cvv: '123',
  };

  return (
    <LinearGradient colors={['#6dd5ed', '#2193b0']} style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#2193b0" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SmartPay</Text>
          {/* 
           */}
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.welcome}>Welcome to SmartPay</Text>

          <View style={styles.cardContainer}>
            <Card {...cardData} />
            {showCardDetails && (
              <BlurView intensity={80} style={styles.blurOverlay}>
                <Text style={styles.blurText}>Card details hidden</Text>
              </BlurView>
            )}
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCardDetails(!showCardDetails)}
            >
              <Ionicons
                name={showCardDetails ? "eye-off-outline" : "eye-outline"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                {showBalance ? `$${balance.toFixed(2)}` : '****'}
              </Text>
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowBalance(!showBalance)}
              >
                <Ionicons
                  name={showBalance ? "eye-off-outline" : "eye-outline"}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Transfer')}>
              <Text style={styles.actionButtonText}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Pay')}>
              <Text style={styles.actionButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.additionalContent}>
            <Text style={styles.additionalText}>Recent Transactions</Text>
            <View style={styles.transactionPlaceholder}>
              <Text style={styles.placeholderText}>No transactions available</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  blurText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#fff',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    color: '#2193b0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  additionalContent: {
    width: '100%',
    marginTop: 30,
    alignItems: 'center',
  },
  additionalText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  transactionPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  placeholderText: {
    color: '#2193b0',
  },
});

export default HomeScreen;
