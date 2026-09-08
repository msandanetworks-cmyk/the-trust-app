import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image } from 'react-native';

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => { onFinish(); }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={require('../assets/mzansiway_final_icon.png')} style={styles.logo} resizeMode='contain' />
        <Text style={styles.title}>
          <Text style={styles.white}>Mzansi</Text>
          <Text style={styles.orange}>way</Text>
        </Text>
        <Text style={styles.subtitle}>Housing For All South Africans</Text>
        <View style={styles.line}>
          <View style={styles.lineOrange} />
          <View style={styles.lineWhite} />
        </View>
        <Text style={styles.tagline}>Xosha uMastende</Text>
        <Text style={styles.hashtag}>#FireYourLandlord</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003865', justifyContent: 'center', alignItems: 'center', padding: 30 },
  inner: { alignItems: 'center' },
  logo: { width: 340, height: 340, marginBottom: 20 },
  title: { fontSize: 48, fontWeight: '900', letterSpacing: 2, marginBottom: 10, textAlign: 'center' },
  white: { color: '#FFFFFF' },
  orange: { color: '#FF9800' },
  subtitle: { fontSize: 16, color: '#a0b4c8', marginBottom: 25, textAlign: 'center' },
  line: { flexDirection: 'row', width: 150, height: 4, marginBottom: 30, borderRadius: 2, overflow: 'hidden' },
  lineOrange: { flex: 1, backgroundColor: '#FF9800' },
  lineWhite: { flex: 1, backgroundColor: '#FFFFFF' },
  tagline: { fontSize: 20, color: '#FFFFFF', fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  hashtag: { fontSize: 22, color: '#FF9800', fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
});