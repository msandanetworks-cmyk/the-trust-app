import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, Platform, Image as RNImage, View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import Notice from '../components/Notice';

const SUCCESS_SOUND_HTML = '<!DOCTYPE html><html><body><script>var ctx=new(window.AudioContext||window.webkitAudioContext)();function p(f,s,d){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";g.gain.setValueAtTime(0,ctx.currentTime+s);g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+s+0.05);g.gain.linearRampToValueAtTime(0,ctx.currentTime+s+d);o.start(ctx.currentTime+s);o.stop(ctx.currentTime+s+d+0.1);}p(523.25,0,0.15);p(659.25,0.18,0.15);p(783.99,0.36,0.3);<\/script></body></html>';

// Success message in member's home language
// APPROVED MOTIVATIONAL MESSAGES — Mzansiway NPC
// Source: Mzansiway_Multilingual_Payment_Messages_v4.pdf
// Varies by language AND residence type (FREE / RENT / BOND)
// OWN = no message shown
const FREE_MESSAGES = {
  'isiZulu':    'Ngizowuthola owami umuzi',
  'isiXhosa':   'Ndizobanalo ikhaya lam',
  'Afrikaans':  'Ek sal my eie huis kry.',
  'English':    'I will get my own home.',
  'Sepedi':     'Ke tla reka motse Waka',
  'Setswana':   'Ke tla NNA le ntlo ya ka.',
  'Sesotho':    'Ke haha waka motse.',
  'Xitsonga':   'Nita xava ya mina yindlo',
  'siSwati':    'Ngitawutfola likhaya lami',
  'Tshivenda':  'Ndido wana nndu yanga.',
  'isiNdebele': 'Ngizowuthola umuzi uthi mina no nofana wami',
};
const RENT_MESSAGES = {
  'isiZulu':    'Ziyaphela izinsuku zikamastende',
  'isiXhosa':   'Intsuku zika masandi zibaliwe',
  'Afrikaans':  'Die verhuurder se dae is getel.',
  'English':    "The landlord's days are numbered.",
  'Sepedi':     'Matsatsi aka agoba le landlord a kgauswi le go fela.',
  'Setswana':   'Matsatsi a go patela Landlord a Fela.',
  'Sesotho':    "A ke satla ba le kamano efeng le Mong’antlo kapa ho ba mohiri.",
  'Xitsonga':   'Masiku ya mastende ya hlayiwini',
  'siSwati':    'Tinsuku temninidlu wendzawo tibaliwe',
  'Tshivenda':  'Maduvha a vhahirisi o vhaliwa',
  'isiNdebele': 'Kuyaphela ukuqatjha maduze',
};
const BOND_MESSAGES = {
  'isiZulu':    'Sizophuma ebugqileni be bond',
  'isiXhosa':   'Ndizaygqiba le-bond ngenye imini',
  'Afrikaans':  'Ons sal ontsnap om die verband te betaal.',
  'English':    'We will escape the bondage of the bond.',
  'Sepedi':     'Re tla ikhutsa morwalo wa bond.',
  'Setswana':   'Re tla tswa Mo kgatellong ya bond.',
  'Sesotho':    'Ha ke sale lekhoba la kadimo ea ntlo.',
  'Xitsonga':   'Hita hambana naku bohiwa hi bond',
  'siSwati':    'Sitawuphunyuka ebugcilini sesibopho',
  'Tshivenda':  'Ridobva vhupulini ha zwikolodo zwa haya.',
  'isiNdebele': 'Sidlula ekubhadeleni abanye iinkolodo zabo',
};
function getSuccessMessage(homeLanguage, name, residenceType) {
  if (!residenceType || residenceType === 'own' || residenceType === 'OWN') return null;
  let messages;
  if (residenceType === 'free' || residenceType === 'FREE') messages = FREE_MESSAGES;
  else if (residenceType === 'rent' || residenceType === 'RENT' || residenceType === 'renting') messages = RENT_MESSAGES;
  else if (residenceType === 'bond' || residenceType === 'BOND') messages = BOND_MESSAGES;
  else messages = RENT_MESSAGES;
  return messages[homeLanguage] || messages['English'];
}



const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const NETWORKS = [
  { name: 'MTN', apiId: 'mtn', color: '#FFCB05', textColor: '#000000', logo: require('../assets/MTN_logo.png'), svgLogo: null },
  { name: 'Vodacom', apiId: 'vodacom', color: '#E60000', textColor: '#FFFFFF', logo: null, svgLogo: null },
  { name: 'Cell C', apiId: 'cellc', color: '#000000', textColor: '#FFFFFF', logo: null },
  { name: 'Telkom', apiId: 'telkom', color: '#0077C8', textColor: '#FFFFFF', logo: null, svgLogo: null },
];

const AMOUNTS = [10, 20, 29, 50, 100, 200];

export default function BluelabelAirtimeScreen({userData, onBack, theme, onHideTabBar, onShowTabBar}) {
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const [showSound, setShowSound] = useState(false);  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [sendToOther, setSendToOther] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
  const [stage, setStage] = useState('entry');
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [notice, setNotice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [pendingCard, setPendingCard] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const t = theme || {
    bg: '#003865',
    card: '#0a2545',
    card2: '#082040',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };

  const getAmount = function() {
    return selectedAmount || parseFloat(customAmount);
  };

  const handleToggleSendToOther = function() {
    const newToggle = !sendToOther;
    setSendToOther(newToggle);
    if (newToggle) {
      setPhoneNumber('');
    } else {
      setPhoneNumber(userData.phoneNumber || '');
    }
  };

  const doAirtimePurchase = async (amount) => {
    setPurchasing(true);
    try {
      const response = await fetch(API_URL + '/api/bluelabel/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: userData.memberNumber,
          network: selectedNetwork.apiId,
          amount: amount,
          phoneNumber: phoneNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        setPurchaseResult({
          network: selectedNetwork.name,
          amount: amount,
          phoneNumber: phoneNumber,
          transactionId: data.transactionId,
          vendorReference: data.vendorReference,
          newBalance: data.newBalance,
          pvEarned: data.pvEarned
        });
        setStage('success'); setShowSound(true);
            } else if (data.poolDepleted) {
        setNotice({ type: 'error', title: 'System Error', message: "Don't panic! Your money is safe in your wallet. Please retry this transaction in 30 minutes." });
      } else {
        setNotice({ type: 'error', title: 'Purchase Unavailable', message: "We couldn't process this purchase right now. Please try a different network or amount, or contact support." });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async () => {
    const amount = getAmount();
    if (!selectedNetwork) {
      setNotice({ type: 'error', title: 'No Network Selected', message: 'Please select a network to continue.' });
      return;
    }
    if (!amount || amount < 5) {
      setNotice({ type: 'error', title: 'Invalid Amount', message: 'Please select or enter an amount (minimum R5).' });
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setNotice({ type: 'error', title: 'Invalid Number', message: 'Please enter a valid 10-digit phone number.' });
      return;
    }
    if (paymentMethod === 'wallet') {
      if (paymentMethod === 'wallet' && userData.cashWallet < amount) {
        setNotice({ type: 'error', title: 'Insufficient Funds', message: 'Your wallet balance is R' + userData.cashWallet.toFixed(2) + '. You need R' + amount.toFixed(2) + ' for this purchase. Please top up or pay by card.' });
        return;
      }
      await doAirtimePurchase(amount);
    } else {
      setPurchasing(true);
      try {
        const res = await fetch(API_URL + '/api/paygate/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberNumber: userData.memberNumber, amount: amount, email: userData.email })
        });
        const data = await res.json();
        if (data.success && data.redirectUrl) {
          setPendingCard({ amount: amount, payRequestId: data.payRequestId });
          const { Linking } = require('react-native');
          Linking.openURL(data.redirectUrl);
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            try {
              const statusRes = await fetch(API_URL + '/api/paygate/status/' + data.payRequestId);
              const statusData = await statusRes.json();
              if (statusData.found && statusData.credited) {
                clearInterval(poll);
                await doAirtimePurchase(amount);
                setPendingCard(null);
              }
            } catch (e) {}
            if (attempts >= 40) clearInterval(poll);
          }, 3000);
        } else {
          setNotice({ type: 'error', title: 'Payment Error', message: data.message || 'Could not start card payment. Please try wallet instead.' });
        }
      } catch (e) {
        setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
      } finally {
        setPurchasing(false);
      }
    }
  };

  const handleCompleteCardPurchase = async () => {
    if (!pendingCard) return;
    setPurchasing(true);
    try {
      const res = await fetch(API_URL + '/api/paygate/status/' + pendingCard.payRequestId);
      const data = await res.json();
      if (data.found && data.credited) {
        await doAirtimePurchase(pendingCard.amount);
        setPendingCard(null);
      } else {
        setNotice({ type: 'error', title: 'Payment Pending', message: 'Payment not confirmed yet. If you completed it, wait a few seconds and try again.' });
      }
    } catch (e) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDone = function() {
    setStage('entry');
    setPurchaseResult(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setSelectedNetwork(null);
    setSendToOther(false);
    setPhoneNumber(userData.phoneNumber || '');
    onBack();
  };

  const renderNetworkLogo = function(n, isSelected) {
    if (n.logo) {
      return <RNImage source={n.logo} style={{ width: '80%', height: 60, resizeMode: 'contain' }} />;
    }
    return (
      <View style={{ width: '100%', height: 70, borderRadius: 10, backgroundColor: n.color,
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: n.textColor, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 }}>{n.name}</Text>
      </View>
    );
  };
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

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Pressable style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
        <View style={styles.logoRow}>
          
          <Text style={styles.title}>Airtime</Text>
        </View>
        <Text style={[styles.subtitle, { color: t.text }]}>Top up any SA mobile network</Text>
      </View>

      {stage === 'entry' && (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <Text style={styles.label}>Select Network</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {NETWORKS.map(function(n) {
              const isSelected = selectedNetwork && selectedNetwork.apiId === n.apiId;
              return (
                <Pressable
                  key={n.apiId}
                  onPress={function() { setSelectedNetwork(n); }}
                  style={{ width: '47%', backgroundColor: n.color, borderWidth: 3, borderColor: isSelected ? '#50C878' : 'transparent', borderRadius: 14, padding: 8, alignItems: 'center', overflow: 'hidden' }}
                >
                  {renderNetworkLogo(n, isSelected)}
                  
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Select Amount</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
            {AMOUNTS.map(function(a) {
              const isSelected = selectedAmount === a;
              return (
                <Pressable
                  key={a}
                  onPress={function() { setSelectedAmount(a); setCustomAmount(''); }}
                  style={{ width: '30%', backgroundColor: isSelected ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: isSelected ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 10, padding: 14, alignItems: 'center', minWidth: 90 }}
                >
                  <Text style={{ color: isSelected ? '#50C878' : t.text, fontSize: 18, fontWeight: 'bold' }}>R{a}</Text>
                  <Text style={{ color: '#50C878', fontSize: 10, marginTop: 2 }}>+{(a * 0.015 * 0.70).toFixed(2)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Or Enter Custom Amount</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
            placeholder="Enter amount (min R5)"
            placeholderTextColor={t.subText}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={function(v) { setCustomAmount(v); setSelectedAmount(null); }}
          />

          <View style={[styles.recipientCard, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
            <View style={styles.recipientRow}>
              <Text style={styles.recipientLabel}>{sendToOther ? 'Send To Phone Number' : 'Send To: My Number'}</Text>
              <Pressable onPress={handleToggleSendToOther}>
                <Text style={styles.toggleLink}>{sendToOther ? 'Send to my number' : 'Send to other number'}</Text>
              </Pressable>
            </View>
            <TextInput
              style={[styles.phoneInput, { backgroundColor: t.bg, color: t.text, borderColor: sendToOther ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd') }]}
              placeholder="0812345678"
              placeholderTextColor={t.subText}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={true}
              autoFocus={false}
            />
          </View>

          <Text style={styles.label}>Pay With</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
            <Pressable onPress={function() { setPaymentMethod('wallet'); }} style={{ flex: 1, minWidth: 90, backgroundColor: paymentMethod === 'wallet' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'wallet' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center', minWidth: 90 }}>
              <Text style={{ fontSize: 22, marginBottom: 4 }}>👛</Text>
              <Text style={{ color: paymentMethod === 'wallet' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Wallet</Text>
              <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Balance: R{userData.cashWallet.toFixed(2)}</Text>
            </Pressable>
            <Pressable onPress={function() { setPaymentMethod('card'); }} style={{ flex: 1, minWidth: 90, backgroundColor: paymentMethod === 'card' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'card' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center', minWidth: 90 }}>
              <Text style={{ fontSize: 22, marginBottom: 4 }}>💳</Text>
              <Text style={{ color: paymentMethod === 'card' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Card</Text>
              <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Secure PayGate</Text>
            </Pressable>
            <Pressable
                onPress={function() { setPaymentMethod('gratitude'); }}
                style={{
                  flex: 1,
                  minWidth: 90,
                  backgroundColor: paymentMethod === 'gratitude' ? (t.darkMode ? '#1A0F00' : '#fff8e8') : (t.darkMode ? '#082040' : '#ffffff'),
                  borderWidth: 2,
                  borderColor: paymentMethod === 'gratitude' ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd'),
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center'
                }}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>🙏</Text>
              <Text style={{ color: paymentMethod === 'gratitude' ? '#FF9800' : t.text, fontSize: 14, fontWeight: 'bold' }}>Gratitude</Text>
              <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Balance: R{(userData.gratitudeWallet || 0).toFixed(2)}</Text>
            </Pressable>
          </View>
          {pendingCard && (
            <View style={{ backgroundColor: t.darkMode ? '#1A2800' : '#fff8e1', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FF9800' }}>
              <Text style={{ color: '#FF9800', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>💳 Complete your R{pendingCard.amount.toFixed(2)} PayGate payment, then tap below.</Text>
              <Pressable onPress={handleCompleteCardPurchase} disabled={purchasing} style={{ backgroundColor: '#FF9800', padding: 14, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{purchasing ? 'Checking...' : 'I Paid — Complete Purchase'}</Text>
              </Pressable>
              <Pressable onPress={function() { setPendingCard(null); }} style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: t.subText, fontSize: 12 }}>Cancel</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={[styles.primaryBtn, purchasing && styles.disabled]} onPress={handlePurchase} disabled={purchasing}>
            <Text style={styles.primaryBtnText}>{purchasing ? 'Processing...' : paymentMethod === 'card' ? 'Pay with Card — R' + (getAmount() || 0).toFixed(2) : 'Buy Airtime'}</Text>
          </Pressable>
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}

      {stage === 'success' && purchaseResult && (
        <>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={[styles.successCard, { backgroundColor: t.card2 }]}>
            <Text style={styles.successIcon}>📱</Text>
            <Text style={styles.successTitle}>{getSuccessMessage(userData && userData.homeLanguage, userData && userData.fullName, (purchaseResult.network || '') + ' Airtime')}</Text>
            <Text style={[styles.successSubtitle, { color: t.text }]}>R{purchaseResult.amount.toFixed(2)} {purchaseResult.network} airtime sent to {purchaseResult.phoneNumber}</Text>
            <View style={[styles.receiptBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#003865' : '#a0c4ff' }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Recipient</Text>
                <Text style={[styles.receiptValue, { color: t.text }]}>{purchaseResult.phoneNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Network</Text>
                <Text style={[styles.receiptValue, { color: t.text }]}>{purchaseResult.network}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Amount</Text>
                <Text style={styles.receiptValueOrange}>R{purchaseResult.amount.toFixed(2)}</Text>
              </View>
              {userData && userData.creditType?.toLowerCase() !== 'health' ? (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>Home Points</Text>
                  <Text style={styles.receiptValueGreen}>+{((purchaseResult.pvEarned || 0) * 0.70).toFixed(2)}</Text>
                </View>
              ) : (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>Health Credits</Text>
                  <Text style={[styles.receiptValueGreen, { color: '#FF9800' }]}>+{((purchaseResult.pvEarned || 0) * 0.30).toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>New Wallet Balance</Text>
                <Text style={styles.receiptValueOrange}>R{(purchaseResult.newBalance || 0).toFixed(2)}</Text>
              </View>
              {purchaseResult.transactionId && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>Reference</Text>
                  <Text style={styles.receiptValueSmall}>{purchaseResult.transactionId}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable style={styles.primaryBtn} onPress={handleDone}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>
          <View style={styles.bottomSpace} />

      
      </ScrollView>
        </>
      )}

      <Notice notice={notice} onClose={function() { setNotice(null); }} />
    </View>
      {showSound && Platform.OS !== 'web' && <WebView source={{html: SUCCESS_SOUND_HTML}} style={{width:0,height:0,position:'absolute',top:-9999,left:-9999}} javaScriptEnabled={true} mediaPlaybackRequiresUserAction={false} allowsInlineMediaPlayback={true} onLoad={()=>{setTimeout(()=>setShowSound(false),3500);}} />}
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, paddingHorizontal: 20, position: 'relative', alignItems: 'center' },
  backBtn: { position: 'absolute', left: 20, top: 22, zIndex: 10, padding: 4 },
  backText: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle: {
    position: 'absolute', right: 20, top: 22, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,152,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  modeToggleText: { fontSize: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 24, color: '#50C878', fontWeight: 'bold', letterSpacing: 1, marginLeft: 12 },
  subtitle: { fontSize: 12, marginTop: 6 },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#50C878', marginBottom: 8, fontWeight: 'bold', marginTop: 10 },
  input: { padding: 16, borderRadius: 12, fontSize: 18, borderWidth: 2, marginBottom: 15 },
  recipientCard: { padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 2 },
  recipientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recipientLabel: { fontSize: 13, color: '#50C878', fontWeight: 'bold' },
  toggleLink: { fontSize: 12, color: '#FF9800', textDecorationLine: 'underline' },
  phoneInput: { padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 2 },
  walletInfo: { padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 20, borderWidth: 2 },
  walletInfoLabel: { fontSize: 13 },
  walletInfoValue: { fontSize: 20, color: '#FF9800', fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  successCard: { padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: '#50C878' },
  successIcon: { fontSize: 48, marginBottom: 10 },
  successTitle: { fontSize: 22, color: '#50C878', fontWeight: 'bold' },
  successSubtitle: { fontSize: 14, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  receiptBox: { width: '100%', padding: 16, borderRadius: 10, borderWidth: 1 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1A2640' },
  receiptLabel: { fontSize: 12, flex: 1 },
  receiptValue: { fontSize: 13, fontWeight: 'bold' },
  receiptValueOrange: { fontSize: 14, color: '#FF9800', fontWeight: 'bold' },
  receiptValueGreen: { fontSize: 13, color: '#50C878', fontWeight: 'bold' },
  receiptValueSmall: { fontSize: 10, color: '#888', fontFamily: 'monospace', flex: 1, textAlign: 'right' },
  bottomSpace: { height: 40 },
});




