import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [balance, setBalance] = useState(0); // Set initial balance to 0
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardData = {
    cardNumber: "4111 1111 1111 1111",
    cardHolder: "JOSEPH NJERI",
    expiryDate: "12/25",
    cvv: "123",
  };

  useEffect(() => {
    // Fetch balance and transactions from the API
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        
        // Fetch transactions from the API
        const transactionsResponse = await fetch(
          "http://192.168.100.43:3000/api/wallet/transactions",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const transactionsData = await transactionsResponse.json();

        // Check if transactionsData is valid
        if (!transactionsData || !transactionsData.transactions) {
          setBalance(0); // Set balance to 0 if no data
          return;
        }

        // Debugging: Log transactions data to see the structure

        // Calculate balance from the transactions
        const calculatedBalance = transactionsData.transactions.reduce(
          (acc, transaction) => {
            // Check if transactionType exists
            if (transaction.transactionType === "DEPOSIT") {
              return acc + transaction.amount; // Add deposits
            } else if (transaction.transactionType === "WITHDRAW") {
              return acc - Math.abs(transaction.amount); // Subtract withdrawals
            }
            return acc; // Return the accumulator unchanged if no valid transaction type
          },
          0
        );

        // Debugging: Log the calculated balance

        setBalance(calculatedBalance); // Set calculated balance
        setTransactions(transactionsData.transactions); // Set transactions data
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LinearGradient colors={["#6dd5ed", "#2193b0"]} style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#2193b0" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SmartPay</Text>
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
                {loading
                  ? "Loading..."
                  : showBalance
                  ? `$${
                      balance !== undefined ? balance.toFixed(2) : "0.00"
                    }`
                  : "****"}
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Transfer")}
            >
              <Text style={styles.actionButtonText}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Pay")}
            >
              <Text style={styles.actionButtonText}>Pay</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.additionalContent}>
            <Text style={styles.additionalText}>Recent Transactions</Text>
            {loading ? (
              <Text style={styles.placeholderText}>Loading transactions...</Text>
            ) : transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <Text style={styles.transactionText}>
                    {transaction.transactionType === "WITHDRAW"
                      ? "Withdraw"
                      : transaction.transactionType === "DEPOSIT"
                      ? "Deposit"
                      : "Unknown Transaction"}
                  </Text>
                  <Text style={styles.transactionText}>
                    Amount: ${Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.transactionText}>
                    Status: {transaction.status}
                  </Text>
                  <Text style={styles.transactionText}>
                    Currency: {transaction.currency}
                  </Text>
                  <Text style={styles.transactionText}>
                    {transaction.senderType} to {transaction.receiverType}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.transactionPlaceholder}>
                <Text style={styles.placeholderText}>
                  No transactions available
                </Text>
              </View>
            )}
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#2c3e50",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  blurText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 18,
    color: "#fff",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2193b0",
  },
  additionalContent: {
    marginTop: 40,
    width: "100%",
  },
  additionalText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    width: "100%",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 18,
    color: "#aaa",
  },
  transactionPlaceholder: {
    alignItems: "center",
    marginTop: 20,
  },
});

export default HomeScreen;
