import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';

export default function PaymentConfirmScreen({ amount, walletBalance, productType, pvEarned, userName, onConfirm, onCancel, userData }) {
  const newBalance = walletBalance - amount;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError('Please enter your password to confirm payment.');
      return;
    }
    setLoading(true);
    setError('');

    // Verify password against backend
    try {
      const response = await fetch('https://mzansiway-backend-production.up.railway.app/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: userData ? userData.memberNumber : '',
          password: password
        })
      });
      const data = await response.json();
      if (data.success) {
        setLoading(false);
        onConfirm();
      } else {
        setLoading(false);
        setError('Incorrect password. Payment blocked for your security.');
        setPassword('');
      }
    } catch (e) {
      // Fallback: check against local userData if network fails
      if (userData && userData.password && password === userData.password) {
        setLoading(false);
        onConfirm();
      } else {
        setLoading(false);
        setError('Could not verify password. Please check your connection.');
      }
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>🔐 Confirm Payment</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.label}>Amount to Pay</Text>
          <Text style={styles.amount}>R{amount.toFixed(2)}</Text>
          <Text style={styles.product}>{productType}</Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method:</Text>
            <Text style={styles.infoValue}>{userName} Cash Wallet</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Balance:</Text>
            <Text style={styles.infoValue}>R{walletBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>New Balance:</Text>
            <Text style={styles.infoValueGreen}>R{newBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>HP You'll Earn:</Text>
            <Text style={styles.infoValueGreen}>+{(pvEarned || 0).toFixed(2)} PV</Text>
          </View>
        </View>

        {/* Password verification */}
        <View style={styles.passwordSection}>
          <Text style={styles.passwordLabel}>🔑 Enter your password to authorise</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your Mzansiway password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Pressable style={[styles.confirmBtn, loading && { opacity: 0.6 }]} onPress={handleConfirm} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#003865" />
            : <Text style={styles.confirmText}>✅ Confirm & Pay</Text>
          }
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Text style={styles.securityNote}>🛡️ Password verification protects you from unauthorised payments</Text>
      
      </View>

      
  </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#082040', width: '92%', maxWidth: 400, borderRadius: 16, padding: 22, borderWidth: 3, borderColor: '#FF9800' },
  title: { fontSize: 22, color: '#FF9800', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  detailsBox: { backgroundColor: '#003865', padding: 18, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  label: { fontSize: 13, color: '#888', marginBottom: 6 },
  amount: { fontSize: 40, color: '#FF9800', fontWeight: 'bold' },
  product: { fontSize: 14, color: '#50C878', marginTop: 6, textAlign: 'center' },
  infoBox: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0d2d50' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },
  infoValueGreen: { fontSize: 13, color: '#50C878', fontWeight: 'bold' },
  passwordSection: { marginBottom: 16 },
  passwordLabel: { fontSize: 13, color: '#50C878', fontWeight: 'bold', marginBottom: 8 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a2545', borderRadius: 10, borderWidth: 2, borderColor: '#FF9800' },
  passwordInput: { flex: 1, padding: 12, color: '#fff', fontSize: 15 },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 18 },
  errorText: { color: '#FF4444', fontSize: 12, marginTop: 6, textAlign: 'center' },
  confirmBtn: { backgroundColor: '#50C878', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  confirmText: { color: '#003865', fontSize: 17, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: 'transparent', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#666', marginBottom: 12 },
  cancelText: { color: '#888', fontSize: 15, textAlign: 'center' },
  securityNote: { fontSize: 11, color: '#666', textAlign: 'center', fontStyle: 'italic' },
});
