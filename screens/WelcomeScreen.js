import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onLogin, onRegister, onBusinessPortal, theme, onHideTabBar, onShowTabBar }) {
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

  const t = theme || { bg: '#f5f5f5', subText: '#999', darkMode: false };

  return (
    <ScrollView
      style={[styles.container
      {/* SA Suburb Watermark */}
      <View style={{position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",zIndex:0,opacity:0.04,pointerEvents:"none"}}>
        {["Sandton","Soweto","Randburg","Midrand","Centurion","Roodepoort","Benoni","Boksburg","Germiston","Krugersdorp","Alberton","Springs","Kempton Park","Edenvale","Fourways","Bryanston","Rosebank","Melrose","Parktown","Alexandra","Diepsloot","Tembisa","Katlehong","Vosloorus","Lenasia","Eldorado Park","Dobsonville","Meadowlands","Pimville","Morningside","Illovo","Hyde Park","Houghton","Northcliff","Honeydew","Cosmo City","Naturena","Ennerdale","Protea Glen","Orange Farm"].map((s,i)=>(<Text key={i} style={{position:"absolute",top:(i%13)*52+10,left:(i%3)*110+8,fontSize:11,fontWeight:"600",color:"#006400",transform:[{rotate:i%2===0?"-8deg":"4deg"}]}}>{s}</Text>))}
      </View>, { backgroundColor: t.bg }]}
      contentContainerStyle={styles.content}
      onScroll={_handleScroll} scrollEventThrottle={16}>

      {/* Hero */}
      <LinearGradient
        colors={['#003865', '#004f8f', t.darkMode ? '#003865' : '#F5F5F5']}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.themeToggle} onPress={t.toggle}>
          <Text style={styles.themeToggleIcon}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onLogin('home')}>
          <Text style={styles.logo}>
            <Text style={styles.white}>Mzansi</Text>
            <Text style={styles.orange}>way</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.sub}>
          Shop. Earn Benefits. Own your home.
        </Text>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => onLogin('home')}>
          <Text style={styles.btnPrimaryText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { borderColor: '#50C878' }]}
          onPress={() => onRegister('home')}
        >
          <Text style={[styles.btnSecondaryText, { color: '#50C878' }]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
        <Text style={[styles.footerReg, { color: '#888' }]}>Mzansiway NPC · Reg: 2026/211861/08</Text>
        <Text style={[styles.footerReg, { color: '#888' }]}>The South African Way 🇿🇦</Text>
        <Text style={[styles.footerContact, { color: '#888' }]}>admin@mzansiway.co.za · mzansiway.co.za</Text>
      </View>

      <Text style={{ textAlign: 'center', color: '#999', fontSize: 11, marginTop: 8, marginBottom: 4, paddingHorizontal: 16 }}>
        Powered by Blue Label, Checkers and Shoprite
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', paddingBottom: 0 },
  hero: { width: '100%', alignItems: 'center', paddingTop: 80, paddingBottom: 50, paddingHorizontal: 20 },
  themeToggle: { position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  themeToggleIcon: { fontSize: 22 },
  logo: { fontSize: 48, fontWeight: '900', marginBottom: 8 },
  orange: { color: '#FF9800' },
  white: { color: '#FFFFFF' },
  sub: { fontSize: 15, color: '#E0E0E0', textAlign: 'center', lineHeight: 22 },
  goalSection: { width: '90%', marginTop: 20, marginBottom: 8 },
  goalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  goalSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 18 },
  goalRow: { flexDirection: 'row', gap: 12 },
  goalCard: { borderWidth: 2, borderRadius: 14, padding: 16, alignItems: 'center' },
  goalIcon: { fontSize: 32, marginBottom: 10 },
  goalCardTitle: { fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  goalCardDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  btnContainer: { width: '90%', gap: 12, marginTop: 16, marginBottom: 30 },
  btnPrimary: { backgroundColor: '#FF9800', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  btnSecondary: { borderWidth: 2, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnSecondaryText: { fontWeight: '800', fontSize: 16 },
  footer: { width: '100%', alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20, borderTopWidth: 1, backgroundColor: '#003865' },
  footerReg: { fontSize: 11, marginBottom: 4, textAlign: 'center' },
  footerContact: { fontSize: 11, marginTop: 6, textAlign: 'center' },
});

