import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, TouchableOpacity, Linking, AppState } from 'react-native';
import Notice from '../components/Notice';
import MzansiLogo from './MzansiLogo';

const AMOUNTS = [50, 100, 200, 500, 1000, 2000];
const API_BASE = 'https://mzansiway-backend-production.up.railway.app';

export default function WalletTopUpScreen({ userData, onBack, theme }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [balance, setBalance] = useState(userData.cashWallet);
  const [notice, setNotice] = useState(null);

  const awaitingPaymentRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const t = theme || {
    bg: '#121212',
    card: '#1A1A1A',
    card2: '#1E1E1E',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };

  // Auto-refresh when user comes back to the app from the browser
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        awaitingPaymentRef.current
      ) {
        setTimeout(() => handleRefreshBalance(true), 1500);
      }
      appStateRef.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Handle deep link return from PayGate browser
  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      if (!url || !url.includes('payment-return')) return;
      const status = url.includes('status=success') ? 'success'
        : url.includes('status=cancelled') ? 'cancelled'
        : url.includes('status=declined') ? 'declined'
        : 'unknown';

      if (status === 'success' && awaitingPaymentRef.current) {
        setTimeout(() => handleRefreshBalance(true), 1500);
      } else if (status === 'cancelled') {
        setAwaitingPayment(false);
        awaitingPaymentRef.current = false;
        setNotice({ type: 'info', title: 'Payment Cancelled', message: 'Your payment was cancelled. Your wallet was not charged.' });
      } else if (status === 'declined') {
        setAwaitingPayment(false);
        awaitingPaymentRef.current = false;
        setNotice({ type: 'error', title: 'Payment Declined', message: 'Your bank declined the payment. No money left your account. Please try again or use a different card.' });
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleTopUp = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount < 10) {
      setNotice({ type: 'error', title: 'Invalid Amount', message: 'Please select or enter an amount (minimum R10).' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/paygate/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberNumber: userData.memberNumber, amount: amount, email: userData.email })
      });
      const data = await response.json();
      if (data.success && data.redirectUrl) {
        Linking.openURL(data.redirectUrl);
        setAwaitingPayment(true);
        awaitingPaymentRef.current = true;
        setNotice({
          type: 'info',
          title: 'Complete Your Payment',
          message: 'A secure PayGate payment page has opened. Complete the R' + amount.toFixed(2) + ' payment — the app will update automatically when done.'
        });
      } else {
        setNotice({ type: 'error', title: 'Top-Up Unavailable', message: data.message || 'Could not start the payment. Please try again shortly.' });
      }
    } catch (err) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Could not reach the server. Please check your connection and try again.' });
    }
    setLoading(false);
  };

  const handleRefreshBalance = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/user/' + userData.memberNumber);
      const data = await response.json();
      const fresh = data.cashWallet !== undefined ? data.cashWallet : (data.user && data.user.cashWallet);
      if (fresh !== undefined) {
        const changed = fresh !== balance;
        setBalance(fresh);
        userData.cashWallet = fresh;
        if (changed) {
          setAwaitingPayment(false);
          awaitingPaymentRef.current = false;
          setPaymentSuccess(fresh);
        } else if (!silent) {
          setNotice({ type: 'info', title: 'No Change Yet', message: 'Payment not confirmed yet. If you completed payment, wait a few seconds and refresh again.' });
        }
      }
    } catch (err) {
      if (!silent) {
        setNotice({ type: 'error', title: 'Connection Error', message: 'Could not refresh balance. Please try again.' });
      }
    }
    if (!silent) setLoading(false);
  };

  if (paymentSuccess !== null) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 80 }}>
          <Text style={{ fontSize: 64 }}>??</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50', marginTop: 16, textAlign: 'center' }}>Uxishiwe uMastende!</Text>
          <Text style={{ fontSize: 16, color: t.text, marginTop: 8, textAlign: 'center' }}>Your wallet has been topped up successfully.</Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFA500', marginTop: 16 }}>New Balance: R{paymentSuccess.toFixed(2)}</Text>
          <Pressable onPress={onBack} style={{ marginTop: 40, backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 48 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Pressable style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
        <View style={styles.logoRow}>
          <MzansiLogo size={40} />
          <Text style={styles.title}>Top Up Wallet</Text>
        </View>
        <Text style={[styles.subtitle, { color: t.text }]}>Add funds to your Mzansiway wallet</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.currentBalance, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#002147' : '#a0c4ff' }]}>
          <Text style={[styles.balanceLabel, { color: t.text }]}>Current Balance</Text>
          <Text style={styles.balanceAmount}>R{balance.toFixed(2)}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.darkMode ? '#1A2F1A' : '#e8fff0' }]}>
          <Text style={[styles.infoText, { color: t.text }]}>Secure card payment via PayGate • No commission charged</Text>
        </View>

        {awaitingPayment && (
          <View style={[styles.noteCard, { backgroundColor: t.darkMode ? '#2A2410' : '#fff8e0', borderColor: '#FF9800' }]}>
            <Text style={[styles.noteText, { color: t.text }]}>Payment in progress — complete it in the browser. The app will update automatically when done.</Text>
          </View>
        )}

        <Text style={styles.label}>Select Amount to Add</Text>
        <View style={styles.amountsGrid}>
          {AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              style={[
                styles.amountCard,
                { backgroundColor: selectedAmount === amount ? '#1A2F1A' : (t.darkMode ? '#1E1E1E' : '#ffffff') },
                { borderColor: selectedAmount === amount ? '#50C878' : (t.darkMode ? '#2A2A2A' : '#dddddd') },
                { borderWidth: selectedAmount === amount ? 3 : 2 }
              ]}
              onPress={() => { setSelectedAmount(amount); setCustomAmount(''); }}
            >
              <Text style={[styles.amountValue, { color: t.text }]}>R{amount}</Text>
              <Text style={styles.amountLabel}>Add funds</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Or Enter Custom Amount</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]}
          placeholder="e.g., 150"
          placeholderTextColor={t.subText}
          keyboardType="numeric"
          value={customAmount}
          onChangeText={(text) => { setCustomAmount(text); setSelectedAmount(null); }}
        />

        <TouchableOpacity
          style={[styles.topUpButton, { backgroundColor: loading ? '#2A5A3A' : '#50C878', opacity: loading ? 0.6 : 1 }]}
          onPress={loading ? null : handleTopUp}
          disabled={loading}
        >
          <Text style={styles.topUpButtonText}>{loading ? 'Processing...' : 'Top Up Wallet'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.refreshButton, { opacity: loading ? 0.6 : 1 }]}
          onPress={loading ? null : () => handleRefreshBalance(false)}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>Refresh Balance</Text>
        </TouchableOpacity>
      </View>

      <Notice notice={notice} onClose={function() { setNotice(null); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, paddingHorizontal: 20, position: 'relative', alignItems: 'center' },
  backBtn: { position: 'absolute', left: 20, top: 22, zIndex: 10, padding: 4 },
  backText: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle: { position: 'absolute', right: 20, top: 22, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  modeToggleText: { fontSize: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 24, color: '#50C878', fontWeight: 'bold', letterSpacing: 1, marginLeft: 12 },
  subtitle: { fontSize: 12, marginTop: 6 },
  content: { padding: 20 },
  currentBalance: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 15, borderWidth: 2 },
  balanceLabel: { fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 36, color: '#FF9800', fontWeight: 'bold' },
  infoCard: { padding: 12, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#50C878' },
  infoText: { fontSize: 12, textAlign: 'center' },
  label: { fontSize: 14, color: '#50C878', marginBottom: 8, fontWeight: 'bold', marginTop: 10 },
  input: { padding: 16, borderRadius: 12, fontSize: 18, borderWidth: 2, marginBottom: 20 },
  noteCard: { padding: 12, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  noteText: { fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  amountsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  amountCard: { width: '48%', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  amountValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  amountLabel: { fontSize: 13, color: '#50C878' },
  topUpButton: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  topUpButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  refreshButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40, borderWidth: 2, borderColor: '#50C878', backgroundColor: 'transparent' },
  refreshButtonText: { color: '#50C878', fontSize: 16, fontWeight: 'bold' },
});
