// src/components/Card.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const Card = ({ cardNumber, cardHolder, expiryDate, cvv }) => {
  const [flip] = useState(new Animated.Value(0));
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    Animated.spring(flip, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const interpolateFront = flip.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const interpolateBack = flip.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
      <Animated.View style={[styles.card, { transform: [{ rotateY: interpolateFront }] }]}>
        <Text style={styles.cardNumber}>{cardNumber}</Text>
        <View style={styles.cardInfo}>
          <View>
            <Text style={styles.label}>Card Holder</Text>
            <Text style={styles.value}>{cardHolder}</Text>
          </View>
          <View>
            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>{expiryDate}</Text>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: interpolateBack }] }]}>
        <View style={styles.cvvStrip} />
        <View style={styles.cvvContainer}>
          <Text style={styles.label}>CVV</Text>
          <Text style={styles.cvv}>{cvv}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 180,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    fontSize: 16,
  },
  cvvStrip: {
    backgroundColor: '#444',
    height: 40,
    marginVertical: 20,
  },
  cvvContainer: {
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  cvv: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Card;