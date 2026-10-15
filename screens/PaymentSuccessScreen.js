import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentSuccessScreen({ route, navigation }) {
  const {
    amount,
    recipient,
    reference,
    transactionId,
    memberName,
    date,
  } = route?.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    recordTransaction();
  }, []);

  const recordTransaction = async () => {
    try {
      const existing = await AsyncStorage.getItem('transactions');
      const transactions = existing ? JSON.parse(existing) : [];
      const newTx = {
        id: transactionId || Date.now().toString(),
        amount,
        recipient,
        reference,
        memberName,
        date: date || new Date().toISOString(),
        type: 'payment',
      };
      transactions.unshift(newTx);
      await AsyncStorage.setItem('transactions', JSON.stringify(transactions.slice(0, 100)));
    } catch (e) {
      console.warn('Could not save transaction:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <View style={styles.successCard}>
        <Animated.View
          style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.checkmark}>✓</Text>
        </Animated.View>
        <Animated.View style={{ opacity: opacityAnim }}>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successSubtitle}>Your payment has been processed</Text>
        </Animated.View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Transaction Details</Text>
        {amount !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>R {Number(amount).toFixed(2)}</Text>
          </View>
        )}
        {recipient ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>{recipient}</Text>
          </View>
        ) : null}
        {reference ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={styles.detailValue}>{reference}</Text>
          </View>
        ) : null}
        {transactionId ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={[styles.detailValue, styles.mono]}>{transactionId}</Text>
          </View>
        ) : null}
        {date ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {new Date(date).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.secondaryBtnText}>View History</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#50C878',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#50C878',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmark: {
    fontSize: 52,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 60,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F4F7FB',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#8BA8C8',
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#132240',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E3A6E',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A6E',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8BA8C8',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#F4F7FB',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1628',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E3A6E',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8BA8C8',
  },
});
