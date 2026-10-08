import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Share, Clipboard, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Notice from '../components/Notice';

export default function ReferralScreen({ userData, onBack, theme, onHideTabBar, onShowTabBar }) {
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

  const [notice, setNotice] = useState(null);

  const t = theme || {
    bg: '#003865',
    card: '#0a2545',
    card2: '#082040',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };

  const referralPhone = (userData.phone || userData.phoneNumber || '').replace(/\D/g, '').slice(0, 10);
  const referralUrl = 'https://mzansiway.co.za/register?ref=' + referralPhone;

  const handleCopyCode = () => {
    if (!referralPhone) {
      setNotice({ type: 'error', title: 'No Number Available', message: 'Your referral number is not yet available. Please try again later.' });
      return;
    }
    Clipboard.setString(referralPhone);
    setNotice({ type: 'success', title: 'Number Copied!', message: 'Your referral number "' + referralPhone + '" has been copied. Share it with friends to earn commission on their purchases.' });
  };

  const handleShare = async () => {
    if (!referralPhone) {
      setNotice({ type: 'error', title: 'No Number Available', message: 'Your referral number is not yet available.' });
      return;
    }
    const message = 'Join Mzansiway and get housing! Use my number to register: ' + referralPhone + '\n\nRegister here: ' + referralUrl;
    try {
      await Share.share({
        message: message,
        title: 'Join Mzansiway',
      });
    } catch (error) {
      // Fallback to clipboard if Share fails
      Clipboard.setString(message);
      setNotice({ type: 'success', title: 'Message Copied!', message: 'Share message copied to clipboard. Paste it into WhatsApp or SMS.' });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]}
        contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <TouchableOpacity style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? 'â˜€ï¸' : 'ðŸŒ™'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ðŸŽ¯ Referral Program</Text>
        <Text style={styles.subtitle}>Earn commission on all referral purchases</Text>
      </View>

      <View style={[styles.codeCard, { backgroundColor: t.card2 }]}>
        <Text style={[styles.codeLabel, { color: t.subText }]}>Your Referral Number</Text>
        <Text style={styles.codeText}>{referralPhone || 'N/A'}</Text>

        <View style={styles.qrContainer}>
          <QRCode
            value={referralUrl || 'https://mzansiway.co.za'}
            size={200}
            backgroundColor="white"
            color="#003865"
          />
          <Text style={styles.qrLabel}>Scan to register with your referral</Text>
        </View>

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Text style={styles.copyButtonText}>ðŸ“‹ Copy My Number</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Share via WhatsApp / SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shareButton, {backgroundColor:'#01875f',marginTop:10}]} onPress={() => require('react-native').Linking.openURL('https://play.google.com/store/apps/details?id=com.mzansiway.app')}>
          <Text style={styles.shareButtonText}>📱 Download on Google Play</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shareButton, {backgroundColor:'#000000',marginTop:10}]} onPress={() => require('react-native').Linking.openURL('https://apps.apple.com/za/app/mzansiway/id6738943975')}>
          <Text style={styles.shareButtonText}> Download on App Store</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: t.card2 }]}>
          <Text style={styles.statNumber}>{userData.totalReferrals || 0}</Text>
          <Text style={[styles.statLabel, { color: t.subText }]}>Total Referrals</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.card2 }]}>
          <Text style={styles.statNumber}>R{(userData.cashWallet || 0).toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: t.subText }]}>Wallet Balance</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: t.darkMode ? '#1A2F1A' : '#e8fff0' }]}>
        <Text style={styles.infoTitle}>ðŸ† How It Works</Text>
        <Text style={[styles.infoText, { color: t.text }]}>â€¢ Share your cell number or QR code</Text>
        <Text style={[styles.infoText, { color: t.text }]}>â€¢ Friend registers using your number</Text>
        <Text style={[styles.infoText, { color: t.text }]}>â€¢ When they purchase, you earn commission</Text>
        <Text style={[styles.infoText, { color: t.text }]}>â€¢ Commission goes to your Cash Wallet</Text>
        <Text style={[styles.infoText, { color: t.text }]}>â€¢ Spend Cash Wallet to earn PV points!</Text>
      </View>

      <View style={[styles.exampleCard, { backgroundColor: t.card2 }]}>
        <Text style={styles.exampleTitle}>ðŸ’° Example Earnings</Text>
        <View style={[styles.exampleRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
          <Text style={[styles.exampleText, { color: t.subText }]}>Referral buys R1000 groceries</Text>
          <Text style={styles.exampleAmount}>You earn commission</Text>
        </View>
        <View style={[styles.exampleRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
          <Text style={[styles.exampleText, { color: t.subText }]}>10 referrals buying monthly</Text>
          <Text style={styles.exampleAmount}>Passive income every month</Text>
        </View>
      </View>

      <Notice notice={notice} onClose={function() { setNotice(null); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 30, position: 'relative' },
  modeToggle: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,152,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleText: { fontSize: 18 },
  title: { fontSize: 32, color: '#FF9800', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#50C878', marginTop: 5, textAlign: 'center', paddingHorizontal: 20 },
  codeCard: { margin: 20, padding: 25, borderRadius: 16, alignItems: 'center', borderWidth: 3, borderColor: '#FF9800' },
  codeLabel: { fontSize: 14, marginBottom: 10 },
  codeText: { fontSize: 36, color: '#FF9800', fontWeight: 'bold', letterSpacing: 4, marginBottom: 20 },
  qrContainer: { alignItems: 'center', marginVertical: 20, padding: 15, backgroundColor: '#FFF', borderRadius: 12 },
  qrLabel: { fontSize: 12, color: '#666', marginTop: 10, textAlign: 'center' },
  copyButton: { backgroundColor: '#FF9800', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, marginBottom: 12, width: '100%', alignItems: 'center' },
  copyButtonText: { color: '#003865', fontSize: 16, fontWeight: 'bold' },
  shareButton: { backgroundColor: '#50C878', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, width: '100%', alignItems: 'center' },
  shareButtonText: { color: '#003865', fontSize: 16, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 15 },
  statCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center' },
  statNumber: { fontSize: 32, color: '#FF9800', fontWeight: 'bold' },
  statLabel: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  infoCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 16, borderWidth: 2, borderColor: '#50C878' },
  infoTitle: { fontSize: 20, color: '#50C878', fontWeight: 'bold', marginBottom: 15 },
  infoText: { fontSize: 14, marginVertical: 4, lineHeight: 22 },
  exampleCard: { marginHorizontal: 20, marginBottom: 30, padding: 20, borderRadius: 16 },
  exampleTitle: { fontSize: 18, color: '#FF9800', fontWeight: 'bold', marginBottom: 15 },
  exampleRow: { marginVertical: 8, paddingVertical: 8, borderBottomWidth: 1 },
  exampleText: { fontSize: 14, marginBottom: 5 },
  exampleAmount: { fontSize: 16, color: '#50C878', fontWeight: 'bold' },
});

