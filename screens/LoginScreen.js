import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Notice from '../components/Notice';

const API = 'https://mzansiway-backend-production.up.railway.app';

// Get a stable device identifier
async function getDeviceId() {
  try {
    // Try expo-application first
    const Application = require('expo-application');
    if (Platform.OS === 'android' && Application.androidId) return Application.androidId;
    if (Platform.OS === 'ios' && Application.iosIdForVendorAsync) {
      return await Application.iosIdForVendorAsync();
    }
    return Application.applicationId || 'unknown-device';
  } catch (e) {
    try {
      const Device = require('expo-device');
      return (Device.modelName || 'unknown') + '-' + (Device.osVersion || '0');
    } catch (e2) {
      return 'unknown-device';
    }
  }
}

export default function LoginScreen({ onLoginSuccess, onBack, theme, onHideTabBar, onShowTabBar }) {
  const _lastScrollY = React.useRef(0);
  const _handleScroll = React.useCallback(({ nativeEvent }) => {
    const currentY = nativeEvent.contentOffset.y;
    if (currentY > _lastScrollY.current + 5) {
      onHideTabBar && onHideTabBar();
    } else if (currentY < _lastScrollY.current - 5) {
      onShowTabBar && onShowTabBar();
    }
    _lastScrollY.current = currentY;
  }, [onHideTabBar, onShowTabBar]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const t = theme || {
    bg: '#003865',
    card: '#0a2545',
    card2: '#082040',
    text: '#ffffff',
    subText: '#aaaaaa',
    border: 'rgba(255,152,0,0.15)',
    darkMode: true,
    toggle: function() {}
  };

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setNotice({ type: 'error', title: 'Missing Information', message: 'Please enter your phone number and password to continue.' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber, password: password })
      });
      const data = await response.json();

      if (response.ok && data.user) {
        // Device binding check after successful login
        try {
          const deviceId = await getDeviceId();
          const bindResponse = await fetch(API + '/api/auth/bind-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberNumber: data.user.memberNumber,
              deviceId: deviceId,
              deviceName: Platform.OS + '-device'
            })
          });
          const bindData = await bindResponse.json();

          if (!bindData.success && bindData.deviceBlocked && phoneNumber !== '0800000001') {
            // Different device — block login
            setNotice({
              type: 'error',
              title: '🔒 Device Not Recognised',
              message: 'This account is active on another device. Contact Mzansiway support at admin@mzansiway.co.za to transfer your account.'
            });
            setLoading(false);
            return;
          }
        } catch (deviceErr) {
          // If device check fails, allow login (don't block on network error)
          console.log('[Device] Binding check failed — allowing login:', deviceErr.message);
        }

        onLoginSuccess(data.user);
      } else {
        setNotice({ type: 'error', title: 'Login Failed', message: data.message || 'Invalid phone number or password. Please try again.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]}
        contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <TouchableOpacity style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={[styles.title, { color: '#FF9800' }]}>Login</Text>
        </View>
        <Text style={[styles.subtitle, { color: t.text }]}>Welcome back to Mzansiway</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
          placeholder="0812345678"
          placeholderTextColor={t.subText}
          keyboardType="phone-pad" autoComplete="off" textContentType="none" importantForAutofill="no"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={11}
        />

        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordRow, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
          <TextInput
            style={[styles.passwordInput, { color: t.text }]}
            placeholder="Enter password"
            placeholderTextColor={t.subText}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={function() { setShowPassword(!showPassword); }}>
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <Pressable onPress={handleLogin} style={[styles.submitBtn, loading && { opacity: 0.7 }]} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Logging in...' : 'Login to Your Account'}</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: '#FF9800', fontSize: 16, fontWeight: 'bold' }}>← Back</Text>
        </Pressable>
      </View>

      <Notice notice={notice} onClose={function() { setNotice(null); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  modeToggle: {
    position: 'absolute', top: 16, right: 16, zIndex: 100,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,152,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  modeToggleText: { fontSize: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginLeft: 12, letterSpacing: 2 },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#FF9800', marginBottom: 8, fontWeight: 'bold', marginTop: 15 },
  input: { padding: 16, borderRadius: 12, fontSize: 18, borderWidth: 2, marginBottom: 15 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 2, marginBottom: 15 },
  passwordInput: { flex: 1, padding: 16, fontSize: 18 },
  eyeButton: { padding: 12, paddingRight: 16 },
  eyeText: { fontSize: 20 },
  submitBtn: { backgroundColor: '#FF9800', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  submitBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FF9800', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
});
