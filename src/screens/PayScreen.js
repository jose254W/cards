import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator 
} from 'react-native';
// Import Camera and BarCodeScanner from expo-camera properly
import { Camera, BarCodeScanner } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const API_URL = "http://192.168.100.43:3000/api/wallet";

// Make sure to define getAuthToken function or import it
const getAuthToken = async () => {
  // Implement your auth token retrieval logic here
  return "your-auth-token";
};

const PayScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SMART_PAY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      setError('Failed to get camera permission');
      Alert.alert('Error', 'Failed to get camera permission');
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    try {
      const [scannedMerchantId, merchantName] = data.split('|');
      setScanned(true);
      setShowScanner(false);
      setMerchantId(scannedMerchantId);
      Alert.alert('Merchant Found', `Name: ${merchantName}\nID: ${scannedMerchantId}`);
    } catch (err) {
      Alert.alert('Error', 'Invalid QR code format');
    }
  };

  const validateInput = () => {
    if (!merchantId.trim()) {
      Alert.alert('Error', 'Please enter a merchant ID');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    return true;
  };

  const handlePay = () => {
    if (!validateInput()) return;

    Alert.alert(
      'Confirm Payment',
      `Are you sure you want to pay ${currency} ${amount} to merchant ${merchantId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: processPayment }
      ]
    );
  };

  const processPayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = await getAuthToken();
      
      const response = await axios.post(
        `${API_URL}/pay`,
        {
          merchantId,
          amount: parseFloat(amount),
          currency
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.msg === 'Payment successful') {
        Alert.alert('Success', 'Payment completed successfully');
        navigation.goBack();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Payment failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#ffafbd', '#ffc3a0']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Pay Merchant</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Merchant ID</Text>
          <TextInput
            style={styles.input}
            value={merchantId}
            onChangeText={setMerchantId}
            placeholder="Enter merchant ID"
            placeholderTextColor="#888"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.scanButton, isLoading && styles.disabledButton]} 
          onPress={() => setShowScanner(true)}
          disabled={isLoading}
        >
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            placeholderTextColor="#888"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyContainer}>
            <TouchableOpacity 
              style={[
                styles.currencyButton,
                currency === 'SMART_PAY' && styles.selectedCurrency
              ]}
              onPress={() => setCurrency('SMART_PAY')}
              disabled={isLoading}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === 'SMART_PAY' && { color: '#fff' }
              ]}>SMART PAY</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.currencyButton,
                currency === 'LOCAL' && styles.selectedCurrency
              ]}
              onPress={() => setCurrency('LOCAL')}
              disabled={isLoading}
            >
              <Text style={[
                styles.currencyButtonText,
                currency === 'LOCAL' && { color: '#fff' }
              ]}>LOCAL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, isLoading && styles.disabledButton]} 
          onPress={handlePay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay</Text>
          )}
        </TouchableOpacity>

        <Modal visible={showScanner} animationType="slide">
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <TouchableOpacity 
              style={styles.closeScannerButton} 
              onPress={() => {
                setShowScanner(false);
                setScanned(false);
              }}
            >
              <Text style={styles.closeScannerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  closeScannerButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    alignItems: 'center',
  },
  closeScannerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedCurrency: {
    backgroundColor: '#007AFF',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PayScreen;