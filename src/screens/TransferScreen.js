import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const TransferScreen = ({ navigation }) => {
  const [recipientType, setRecipientType] = useState('smartpay');
  const [recipient, setRecipient] = useState('');
  const [accountNumber, setAccountNumber] = useState(''); // New state for account number
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleTransfer = () => {
    if (!recipient || !amount || !accountNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer $${amount} to ${recipient} (${accountNumber})?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            console.log('Transfer initiated:', { recipientType, recipient, accountNumber, amount, note });
            Alert.alert('Success', 'Transfer initiated successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#6dd5ed', '#2193b0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Transfer Money</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Recipient Type</Text>
          <Picker
            selectedValue={recipientType}
            onValueChange={(itemValue) => setRecipientType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="SmartPay User" value="smartpay" />
            <Picker.Item label="Other Mobile Money" value="mobile_money" />
            <Picker.Item label="Bank Account" value="bank" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Recipient {recipientType === 'smartpay' ? 'Username' : 'Number/Account'}</Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder={`Enter recipient ${recipientType === 'smartpay' ? 'username' : 'number or account'}`}
            placeholderTextColor="#888"
          />
        </View>

        {/* New Account Number Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Account Number / Phone Number</Text>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder={`Enter ${recipientType === 'mobile_money' ? 'phone number' : 'account number'}`}
            placeholderTextColor="#888"
            keyboardType="numeric" // Assuming the input will be numeric
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            multiline
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleTransfer}>
          <Text style={styles.buttonText}>Transfer</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
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
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'rgba(190, 13, 13, 0.9)',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransferScreen;
