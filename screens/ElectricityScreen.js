import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, Platform, View, Text, ScrollView, TouchableOpacity, TextInput, Pressable, Linking, Clipboard } from 'react-native';
import Notice from '../components/Notice';

const SUCCESS_SOUND_HTML = '<!DOCTYPE html><html><body><script>var ctx=new(window.AudioContext||window.webkitAudioContext)();function p(f,s,d){var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";g.gain.setValueAtTime(0,ctx.currentTime+s);g.gain.linearRampToValueAtTime(1.0,ctx.currentTime+s+0.05);g.gain.linearRampToValueAtTime(0,ctx.currentTime+s+d);o.start(ctx.currentTime+s);o.stop(ctx.currentTime+s+d+0.1);}p(523.25,0,0.15);p(659.25,0.18,0.15);p(783.99,0.36,0.3);<\/script></body></html>';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

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

const ELECTRICITY_AMOUNTS = [
  { amount: 50, pv: 0.125 },
  { amount: 100, pv: 0.25 },
  { amount: 200, pv: 0.50 },
  { amount: 500, pv: 1.25 },
];

export default function ElectricityScreen({userData, onBack, theme, onHideTabBar, onShowTabBar}) {
  const [meterNumber, setMeterNumber] = useState('000000000100');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [stage, setStage] = useState('entry');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pendingCard, setPendingCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [meterInfo, setMeterInfo] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
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

  const getAmount = function() {
    return selectedAmount || parseFloat(customAmount);
  };

  const getMinimumRand = function() {
    if (!meterInfo || !meterInfo.minimumVendAmount) return 10;
    return meterInfo.minimumVendAmount / 100;
  };

  const handleCheckMeter = async () => {
    const amount = getAmount();
    if (!meterNumber || meterNumber.length < 6) {
      setNotice({ type: 'error', title: 'Invalid Meter Number', message: 'Please enter a valid meter number (at least 6 digits).' });
      return;
    }
    if (!amount || amount < 10) {
      setNotice({ type: 'error', title: 'Invalid Amount', message: 'Please select or enter an amount (minimum R10).' });
      return;
    }
    if (userData.cashWallet < amount) {
      setNotice({ type: 'error', title: 'Insufficient Funds', message: 'Your wallet balance is R' + userData.cashWallet.toFixed(2) + '. You need R' + amount.toFixed(2) + ' for this purchase.' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/bluelabel/electricity/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ meterNumber: meterNumber, amount: amount })
      });
      const data = await response.json();
      if (data.success) {
        const minRand = data.minimumVendAmount ? data.minimumVendAmount / 100 : 10;
        if (amount < minRand) {
          setNotice({
            type: 'error',
            title: 'Amount Too Low',
            message: 'The minimum purchase for ' + (data.utility || 'this municipality') + ' is R' + minRand.toFixed(2) + '. Please increase your amount.'
          });
          setLoading(false);
          return;
        }
        setMeterInfo(data);
        setStage('confirm');
      } else {
        setNotice({ type: 'error', title: 'Meter Check Failed', message: data.message || 'We could not verify this meter. Please check the number and try again.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const doElectricityPurchase = async () => {
    const amount = getAmount();
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/bluelabel/electricity/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: userData.memberNumber,
          meterNumber: meterNumber.trim(),
          amount: amount,
          reference: "MZW-" + userData.memberNumber + "-" + Date.now()
        })
      });
      const data = await response.json();
      if (data.success) {
        userData.cashWallet = data.newBalance;
        setPurchaseResult(data);
        setPendingCard(null);
        setStage('success'); setShowSound(true);
        return true;
      }
      setNotice({ type: 'error', title: 'Purchase Unavailable', message: data.message || "We couldn't process this purchase right now. Please try again or contact support." });
      return false;
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    const amount = getAmount();

    if (paymentMethod === 'wallet') {
      if (userData.cashWallet < amount) {
        setNotice({ type: 'error', title: 'Insufficient Funds', message: 'Your wallet balance is R' + userData.cashWallet.toFixed(2) + '. You need R' + amount.toFixed(2) + ' for this purchase. Switch to Card to pay directly.' });
        return;
      }
      await doElectricityPurchase();
      return;
    }

    setLoading(true);
    try {
      let base = userData.cashWallet;
      try {
        const ur = await fetch(API_URL + '/api/user/' + userData.memberNumber);
        const ud = await ur.json();
        const fb = ud.cashWallet !== undefined ? ud.cashWallet : (ud.user && ud.user.cashWallet);
        if (fb !== undefined) { base = fb; userData.cashWallet = fb; }
      } catch (e) {}
      const response = await fetch(API_URL + '/api/paygate/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberNumber: userData.memberNumber, amount: amount, email: userData.email })
      });
      const data = await response.json();
      if (data.success && data.redirectUrl) {
        Linking.openURL(data.redirectUrl);
        setPendingCard({ amount: amount, baseBalance: base });
        setStage('awaiting-card');
      } else {
        setNotice({ type: 'error', title: 'Card Payment Unavailable', message: data.message || 'Could not start the card payment. Please try again or pay from your wallet.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCardPurchase = async () => {
    if (!pendingCard) return;
    setLoading(true);
    try {
      const r = await fetch(API_URL + '/api/user/' + userData.memberNumber);
      const d = await r.json();
      const freshBalance = d.cashWallet !== undefined ? d.cashWallet : (d.user && d.user.cashWallet);
      if (freshBalance === undefined) {
        setNotice({ type: 'error', title: 'Connection Error', message: 'Could not check your payment. Please try again.' });
        return;
      }
      userData.cashWallet = freshBalance;
      if (freshBalance < pendingCard.baseBalance + pendingCard.amount) {
        setNotice({ type: 'info', title: 'Payment Not Confirmed Yet', message: 'Your card payment has not reached your wallet yet. If you completed it, wait a few seconds and tap Complete Purchase again.' });
        return;
      }
      await doElectricityPurchase();
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCard = () => {
    setPendingCard(null);
    setStage('confirm');
    setNotice({ type: 'info', title: 'Purchase Cancelled', message: 'If your card payment already went through, the money is safe in your wallet and you can buy from your wallet balance.' });
  };

  const handleCopyToken = function() {
    if (!purchaseResult) return;
    var tokenArray = Array.isArray(purchaseResult.tokens) ? purchaseResult.tokens : [];
    var allTokenStrings = tokenArray.map(function(t) { return t.token; }).filter(function(t) { return t; });
    if (allTokenStrings.length === 0 && purchaseResult.token) {
      allTokenStrings = [purchaseResult.token];
    }
    if (allTokenStrings.length === 0) {
      setNotice({ type: 'error', title: 'No Tokens', message: 'There are no tokens available to copy.' });
      return;
    }
    if (true) {
      Clipboard.setString(allTokenStrings.join('\n'));
      const successMsg = allTokenStrings.length === 1 ? 'Token copied to clipboard.' : allTokenStrings.length + ' tokens copied to clipboard.';
      setNotice({ type: 'success', title: 'Copied', message: successMsg });
    }
  };

  const handleDone = function() {
    setStage('entry');
    setMeterInfo(null);
    setPurchaseResult(null);
    setSelectedAmount(null);
    setCustomAmount('');
    onBack();
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
          
          <Text style={styles.title}>Electricity</Text>
        </View>
        <Text style={[styles.subtitle, { color: t.text }]}>Prepaid electricity tokens</Text>
      </View>
<Text style={styles.label}>Meter Number *</Text>
      {stage === 'entry' && (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          
          <TextInput
            style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
            placeholder="Enter meter number"
            placeholderTextColor={t.subText}
            keyboardType="numeric"
            maxLength={13}
            value={meterNumber}
            onChangeText={setMeterNumber}
          />

          <Text style={styles.label}>Select Amount</Text>
          <Text style={[styles.minHint, { color: t.subText }]}>⚠️ Minimum amount varies per municipality. You will be notified if your amount is too low.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 15 }}>
            {ELECTRICITY_AMOUNTS.map((item) => (
              <Pressable
                key={item.amount}
                onPress={function() { setSelectedAmount(item.amount); setCustomAmount(''); }}
                style={{ width: '47%', backgroundColor: selectedAmount === item.amount ? '#1A2F1A' : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: selectedAmount === item.amount ? 3 : 2, borderColor: selectedAmount === item.amount ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 8 }}
              >
                <Text style={{ color: t.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>R{item.amount}</Text>
                <Text style={{ color: '#50C878', fontSize: 12 }}>+{item.pv} HP</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Or Enter Custom Amount</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
            placeholder="Enter amount (min R50)"
            placeholderTextColor={t.subText}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={function(v) { setCustomAmount(v); setSelectedAmount(null); }}
          />

          <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleCheckMeter} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Checking Meter...' : 'Check Meter'}</Text>
          </Pressable>
        </ScrollView>
      )}

      {stage === 'confirm' && meterInfo && (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={[styles.confirmCard, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
            <Text style={styles.confirmTitle}>Confirm Purchase</Text>
            <View style={[styles.confirmRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
              <Text style={[styles.confirmLabel, { color: t.text }]}>Meter Number</Text>
              <Text style={styles.confirmValue}>{meterNumber}</Text>
            </View>
            {meterInfo.consumer && meterInfo.consumer.name && (
              <View style={[styles.confirmRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                <Text style={[styles.confirmLabel, { color: t.text }]}>Account Name</Text>
                <Text style={styles.confirmValue}>{meterInfo.consumer.name}</Text>
              </View>
            )}
            {meterInfo.consumer && meterInfo.consumer.address && (
              <View style={[styles.confirmRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                <Text style={[styles.confirmLabel, { color: t.text }]}>Address</Text>
                <Text style={styles.confirmValue}>{meterInfo.consumer.address}</Text>
              </View>
            )}
            {meterInfo.utility && (
              <View style={[styles.confirmRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                <Text style={[styles.confirmLabel, { color: t.text }]}>Utility</Text>
                <Text style={styles.confirmValue}>{meterInfo.utility}</Text>
              </View>
            )}
            {meterInfo.minimumVendAmount && (
              <View style={[styles.confirmRow, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                <Text style={[styles.confirmLabel, { color: t.text }]}>Minimum Purchase</Text>
                <Text style={[styles.confirmValue, { color: '#FF9800' }]}>R{(meterInfo.minimumVendAmount / 100).toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.confirmRowHighlight, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
              <Text style={[styles.confirmLabel, { color: t.text }]}>Amount</Text>
              <Text style={styles.confirmAmount}>R{getAmount().toFixed(2)}</Text>
            </View>
          </View>

          <Text style={{ fontSize: 14, color: '#50C878', marginBottom: 8, fontWeight: 'bold', marginTop: 10 }}>Pay With</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
            <Pressable
              onPress={function() { setPaymentMethod('wallet'); }}
              style={{ flex: 1, minWidth: 90, backgroundColor: paymentMethod === 'wallet' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'wallet' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>👛</Text>
              <Text style={{ color: paymentMethod === 'wallet' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Wallet</Text>
              <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Balance: R{userData.cashWallet.toFixed(2)}</Text>
            </Pressable>
            <Pressable
              onPress={function() { setPaymentMethod('card'); }}
              style={{ flex: 1, minWidth: 90, backgroundColor: paymentMethod === 'card' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'card' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>💳</Text>
              <Text style={{ color: paymentMethod === 'card' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Card</Text>
              <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Secure PayGate payment</Text>
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
          <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleConfirmPurchase} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Processing...' : (paymentMethod === 'card' ? 'Pay with Card' : 'Confirm & Buy Electricity')}</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={function() { setStage('entry'); setMeterInfo(null); }}>
            <Text style={[styles.cancelBtnText, { color: t.text }]}>Cancel</Text>
          </Pressable>
        </ScrollView>
      )}

      {stage === 'awaiting-card' && pendingCard && (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={{ padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: '#FF9800', backgroundColor: t.card2 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>💳</Text>
            <Text style={{ fontSize: 22, color: '#FF9800', fontWeight: 'bold' }}>Complete Your Card Payment</Text>
            <Text style={{ fontSize: 14, marginTop: 6, marginBottom: 10, textAlign: 'center', color: t.text }}>
              A secure PayGate page has opened for R{pendingCard.amount.toFixed(2)}. Pay there, then come back and tap Complete Purchase to buy your electricity token for meter {meterNumber}.
            </Text>
          </View>
          <Pressable style={{ backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 5, opacity: loading ? 0.5 : 1 }} onPress={handleCompleteCardPurchase} disabled={loading}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>{loading ? 'Checking...' : "I've Paid — Complete Purchase"}</Text>
          </Pressable>
          <Pressable style={{ backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#50C878', opacity: loading ? 0.5 : 1 }} onPress={handleCancelCard} disabled={loading}>
            <Text style={{ color: '#50C878', fontSize: 16, fontWeight: 'bold' }}>Cancel</Text>
          </Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {stage === 'success' && purchaseResult && (
        <>
        {showSound && Platform.OS !== 'web' && <WebView source={{html: SUCCESS_SOUND_HTML}} style={{width:0,height:0,position:'absolute',top:-9999,left:-9999}} javaScriptEnabled={true} mediaPlaybackRequiresUserAction={false} allowsInlineMediaPlayback={true} onLoad={()=>{setTimeout(()=>setShowSound(false),3500);}} />}
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
          <View style={[styles.successCard, { backgroundColor: t.card2 }]}>
            <Text style={styles.successIcon}>⚡</Text>
            <Text style={styles.successTitle}>{getSuccessMessage(userData && userData.homeLanguage, userData && userData.fullName, 'Electricity')}</Text>
            <Text style={[styles.successSubtitle, { color: t.text }]}>R{getAmount().toFixed(2)} electricity for meter {meterNumber}</Text>

            {purchaseResult.hasTokens === false && (
              <View style={[styles.noTokenBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
                <Text style={styles.noTokenIcon}>✓</Text>
                <Text style={styles.noTokenTitle}>No Token Required</Text>
                <Text style={[styles.noTokenMessage, { color: t.text }]}>Your top-up has been loaded directly to the meter. No token needs to be entered.</Text>
              </View>
            )}

            {(purchaseResult.hasTokens !== false) && Array.isArray(purchaseResult.tokens) && purchaseResult.tokens.length > 1 && (
              <View style={styles.multiTokenNotice}>
                <Text style={styles.multiTokenNoticeText}>{purchaseResult.tokens.length} tokens — please enter ALL of them into your meter, in order.</Text>
              </View>
            )}

            {(purchaseResult.hasTokens !== false) && Array.isArray(purchaseResult.tokens) && purchaseResult.tokens.length > 0 && purchaseResult.tokens.map(function(tok, idx) {
              var label = tok.tokenDescription || tok.type || 'Token';
              var header = purchaseResult.tokens.length > 1 ? ('Token ' + (idx + 1) + ' of ' + purchaseResult.tokens.length + ' — ' + label) : label;
              return (
                <View key={idx} style={[styles.tokenBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
                  <Text style={styles.tokenHeader}>{header}</Text>
                  <Text style={styles.tokenText}>{tok.token || 'Token unavailable'}</Text>
                </View>
              );
            })}

            {(purchaseResult.hasTokens !== false) && (!Array.isArray(purchaseResult.tokens) || purchaseResult.tokens.length === 0) && (
              <View style={[styles.tokenBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
                <Text style={styles.tokenText}>{purchaseResult.token || 'Token unavailable'}</Text>
              </View>
            )}

            {(purchaseResult.hasTokens !== false) && (
              <Pressable style={styles.copyBtn} onPress={handleCopyToken}>
                <Text style={styles.copyBtnText}>{Array.isArray(purchaseResult.tokens) && purchaseResult.tokens.length > 1 ? 'Copy All Tokens' : 'Copy Token'}</Text>
              </Pressable>
            )}

            {purchaseResult.units && purchaseResult.units.quantity && (
              <View style={[styles.receiptRow, { borderTopColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Units</Text>
                <Text style={[styles.receiptValue, { color: t.text }]}>{purchaseResult.units.quantity} {purchaseResult.units.unit || 'kWh'}</Text>
              </View>
            )}
            <View style={[styles.receiptRow, { borderTopColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
              <Text style={[styles.receiptLabel, { color: t.text }]}>Home Points</Text>
              <Text style={styles.receiptValueGreen}>+{((purchaseResult.pvEarned || 0) * 0.70).toFixed(3)} HC</Text>
            </View>
            <View style={[styles.receiptRow, { borderTopColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
              <Text style={[styles.receiptLabel, { color: t.text }]}>New Wallet Balance</Text>
              <Text style={styles.receiptValueOrange}>R{(purchaseResult.newBalance || 0).toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.primaryBtn} onPress={handleDone}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>

      
      </ScrollView>
        </>
      )}

      <Notice notice={notice} onClose={function() { setNotice(null); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, paddingHorizontal: 20, position: 'relative', alignItems: 'center' },
  backBtn: { position: 'absolute', left: 20, top: 22, zIndex: 10, padding: 4 },
  backText: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle: {
    position: 'absolute',
    right: 20,
    top: 22,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,152,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleText: { fontSize: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  title: { fontSize: 24, color: '#50C878', fontWeight: 'bold', letterSpacing: 1, marginLeft: 12 },
  subtitle: { fontSize: 12, marginTop: 6 },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#50C878', marginBottom: 8, fontWeight: 'bold', marginTop: 10 },
  minHint: { fontSize: 12, fontStyle: 'italic', marginBottom: 10, marginTop: -4, lineHeight: 18 },
  input: { padding: 16, borderRadius: 12, fontSize: 18, borderWidth: 2, marginBottom: 15 },
  walletInfo: { padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20, borderWidth: 2 },
  walletInfoLabel: { fontSize: 13 },
  walletInfoValue: { fontSize: 20, color: '#FF9800', fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  disabled: { opacity: 0.5 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { fontSize: 14, textDecorationLine: 'underline' },
  confirmCard: { padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 2 },
  confirmTitle: { fontSize: 18, color: '#50C878', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  confirmRowHighlight: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, marginTop: 5, paddingHorizontal: 12, borderRadius: 8 },
  confirmLabel: { fontSize: 13, flex: 1 },
  confirmValue: { fontSize: 13, color: '#50C878', fontWeight: 'bold', flex: 1, textAlign: 'right' },
  confirmAmount: { fontSize: 22, color: '#FF9800', fontWeight: 'bold' },
  successCard: { padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: '#50C878' },
  successIcon: { fontSize: 48, marginBottom: 10 },
  successTitle: { fontSize: 22, color: '#50C878', fontWeight: 'bold' },
  successSubtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  tokenBox: { paddingVertical: 18, paddingHorizontal: 12, borderRadius: 12, borderWidth: 2, borderColor: '#003865', width: '100%', alignItems: 'center', marginBottom: 15 },
  tokenText: { fontSize: 22, color: '#FF9800', fontWeight: 'bold', letterSpacing: 3, textAlign: 'center' },
  tokenHeader: { fontSize: 11, color: '#50C878', fontWeight: 'bold', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  multiTokenNotice: { backgroundColor: '#1A2F1A', padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#50C878', marginBottom: 12, width: '100%' },
  multiTokenNoticeText: { color: '#50C878', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  noTokenBox: { padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#50C878', width: '100%', alignItems: 'center', marginBottom: 15 },
  noTokenIcon: { fontSize: 36, color: '#50C878', marginBottom: 8 },
  noTokenTitle: { fontSize: 16, color: '#50C878', fontWeight: 'bold', marginBottom: 6 },
  noTokenMessage: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  copyBtn: { backgroundColor: '#003865', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10, marginBottom: 15 },
  copyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 8, borderTopWidth: 1 },
  receiptLabel: { fontSize: 13 },
  receiptValue: { fontSize: 13, fontWeight: 'bold' },
  receiptValueGreen: { fontSize: 13, color: '#50C878', fontWeight: 'bold' },
  receiptValueOrange: { fontSize: 14, color: '#FF9800', fontWeight: 'bold' },
});



