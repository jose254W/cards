import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState({ smartPay: 0, localCurrency: 0 });
  const [transactions, setTransactions] = useState([]);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("SMART_PAY");

  useEffect(() => {
    const fetchData = async () => {
      await fetchBalance();
      await fetchTransactions();
    };
    fetchData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "http://192.168.100.43:3000/api/wallet/transactions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Ensure each transaction has a unique ID and timestamp
      const transactionsWithIds = response.data.transactions.map(
        (transaction) => ({
          ...transaction,
          id:
            transaction.id ||
            transaction._id ||
            `${transaction.timestamp || Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          timestamp: transaction.timestamp || transaction.date || Date.now(),
          date: new Date(
            transaction.timestamp || transaction.date || Date.now()
          ).toLocaleDateString(),
          time: new Date(
            transaction.timestamp || transaction.date || Date.now()
          ).toLocaleTimeString(),
        })
      );

      setTransactions(transactionsWithIds);
    } catch (error) {
      console.error("Error fetching transactions", error);
      Alert.alert(
        "Error",
        "Could not fetch transactions. Please try again later."
      );
    }
  };

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "http://192.168.100.43:3000/api/wallet/balance",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBalance({
        smartPay: response.data.smartPayBalance || 0,
        localCurrency: response.data.localCurrencyBalance || 0, // Fixed typo in property name
      });
    } catch (error) {
      console.error("Error fetching balance", error);
      Alert.alert("Error", "Could not fetch balance. Please try again later.");
    }
  };

  const handleDeposit = async () => {
    try {
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Error", "Please log in to make a deposit.");
        return;
      }

      const timestamp = Date.now();
      const response = await axios.post(
        "http://192.168.100.43:3000/api/wallet/deposit",
        {
          amount: parseFloat(amount),
          currency: selectedCurrency,
          timestamp: timestamp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBalance((prevBalance) => ({
        ...prevBalance,
        smartPay:
          selectedCurrency === "SMART_PAY"
            ? (prevBalance.smartPay || 0) + parseFloat(amount)
            : prevBalance.smartPay,
        localCurrency:
          selectedCurrency === "LOCAL_CURRENCY"
            ? (prevBalance.localCurrency || 0) + parseFloat(amount)
            : prevBalance.localCurrency,
      }));

      // Add new transaction with timestamp
      const newTransaction = {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        transactionType: "Deposit",
        amount: parseFloat(amount),
        timestamp: timestamp,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleTimeString(),
        currency: selectedCurrency,
      };

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);

      setModalVisible(false);
      setAmount("");
      Alert.alert("Success", response.data.msg || "Deposit successful!");
    } catch (error) {
      console.error("Deposit error:", error);
      if (error.response?.status === 404) {
        Alert.alert(
          "Authentication Error",
          "User not found. Please log out and log back in."
        );
      } else if (error.response) {
        Alert.alert(
          "Error",
          error.response.data.msg ||
            "Could not deposit. Please try again later."
        );
      } else if (error.request) {
        Alert.alert("Error", "Network error. Please check your connection.");
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
      }

      const currentBalance =
        selectedCurrency === "SMART_PAY"
          ? balance.smartPay
          : balance.localCurrency;

      if (parseFloat(amount) > currentBalance) {
        Alert.alert("Error", "Insufficient balance");
        return;
      }

      const timestamp = Date.now();
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "http://192.168.100.43:3000/api/wallet/withdraw",
        {
          amount: parseFloat(amount),
          currency: selectedCurrency,
          timestamp: timestamp,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBalance((prevBalance) => ({
        ...prevBalance,
        smartPay:
          selectedCurrency === "SMART_PAY"
            ? (prevBalance.smartPay || 0) - parseFloat(amount)
            : prevBalance.smartPay,
        localCurrency:
          selectedCurrency === "LOCAL_CURRENCY"
            ? (prevBalance.localCurrency || 0) - parseFloat(amount)
            : prevBalance.localCurrency,
      }));

      // Add new transaction with timestamp
      const newTransaction = {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        transactionType: "Withdrawal",
        amount: -parseFloat(amount),
        timestamp: timestamp,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleTimeString(),
        currency: selectedCurrency,
      };

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction,
      ]);

      setModalVisible(false);
      setAmount("");
      Alert.alert("Success", "Withdrawal successful!");
    } catch (error) {
      console.error("Withdraw error", error);
      Alert.alert("Error", "Could not withdraw. Please try again later.");
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    setAmount("");
    setSelectedCurrency("SMART_PAY");
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>{item.transactionType}</Text>
        <Text style={styles.transactionDateTime}>
          {item.date} {item.time}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.amount >= 0 ? "green" : "red" },
        ]}
      >
        ${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  const currencyOptions = [
    { label: "Smart Pay", value: "SMART_PAY" },
    { label: "Local Currency", value: "LOCAL_CURRENCY" },
  ];

  // Placeholder for picker
  const placeholder = {
    label: "Select Currency",
    value: null,
    color: "#9EA0A4",
  };

  return (
    <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.currencyLabel}>Smart Pay:</Text>
            <Text style={styles.balanceAmount}>
              {isBalanceVisible
                ? `$${balance.smartPay ? balance.smartPay.toFixed(2) : "0.00"}`
                : "****"}
            </Text>
          </View>
          <View>
            <Text style={styles.currencyLabel}>Local Currency:</Text>
            <Text style={styles.balanceAmount}>
              {isBalanceVisible
                ? `$${
                    balance.localCurrency
                      ? balance.localCurrency.toFixed(2)
                      : "0.00"
                  }`
                : "****"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
          >
            <Ionicons
              name={isBalanceVisible ? "eye-off" : "eye"}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal("deposit")}
        >
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openModal("withdraw")}
        >
          <Text style={styles.actionButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.transactionTitle}>Recent Transactions</Text>
      <FlatList
        data={[...transactions].reverse()}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => setSelectedCurrency(value)}
                items={currencyOptions}
                value={selectedCurrency}
                placeholder={placeholder}
                style={{
                  ...pickerSelectStyles,
                  iconContainer: {
                    top: Platform.OS === "android" ? 12 : 15,
                    right: 12,
                  },
                }}
                Icon={() => (
                  <Ionicons name="chevron-down" size={24} color="#86939e" />
                )}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={
                  modalType === "deposit" ? handleDeposit : handleWithdraw
                }
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 18,
    color: "#666",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 25,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    color: "#2193b0",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionType: {
    fontSize: 16,
    textTransform: "capitalize",
    color: "#2193b0",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2193b0",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#ff6b6b",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    width: "48%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
  },
  confirmButton: {
    backgroundColor: "#2193b0",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  placeholder: {
    color: "#9EA0A4",
  },
});

export default WalletScreen;
