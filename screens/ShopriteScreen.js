import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Image } from 'react-native';
import Notice from '../components/Notice';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const SUCCESS_MESSAGES = {
  'isiZulu':     (name, product) => 'Siyabonga ' + name + '! U-' + product + ' uthunyelwe ngempumelelo. Qhubeka uthenga ukuze uqoqe amaphuzu ayo yakho indlu!',
  'isiXhosa':    (name, product) => 'Enkosi ' + name + '! I-' + product + ' ithunyelwe ngempumelelo. Qhubeka uthenga ukuze uqoqe amaphuzu endlu yakho!',
  'Afrikaans':   (name, product) => 'Dankie ' + name + '! ' + product + ' is suksesvol gestuur. Hou aan koop om punte vir jou huis te verdien!',
  'English':     (name, product) => 'Thank you ' + name + '! Your ' + product + ' was sent successfully. Keep shopping to earn points toward your home!',
  'Sepedi':      (name, product) => 'Ke a leboga ' + name + '! ' + product + ' e rometswe ka katlego. Tswela pele go reka go hweditsa dintlha tsa ga geno!',
  'Setswana':    (name, product) => 'Ke a leboga ' + name + '! ' + product + ' e romilwe ka katlego. Tswelela go reka go bona dintlha tsa ntlo ya gago!',
  'Sesotho':     (name, product) => 'Ke a leboha ' + name + '! ' + product + ' e rometswe ka katleho. Tswela pele ho reka ho fumana dintlha tsa hao!',
  'Xitsonga':    (name, product) => 'Inkomu ' + name + '! ' + product + ' yi rhumeriwe hi ndlela yo tsakisa. Tshika ku xava ku kuma tinhlamulo ta yindlu ya wena!',
  'siSwati':     (name, product) => 'Siyabonga ' + name + '! I-' + product + ' ithunyelwe ngemphumelelo. Qhubeka uthenga kuze utfole emazinge endlu yakho!',
  'Tshivenda':   (name, product) => 'Ndo livhuwa ' + name + '! ' + product + ' yo rumwa nga ndila yo takutsedzaho. Bvela phanda u wana tshikalo tsha nndu yau!',
  'isiNdebele':  (name, product) => 'Siyabonga ' + name + '! I-' + product + ' ithunyelwe ngempumelelo. Qhubeka uthenga ukuze uqoqe amaphuzu wendlu yakho!',
};

function getSuccessMessage(homeLanguage, name, product) {
  const firstName = name ? name.split(' ')[0] : 'Member';
  const fn = SUCCESS_MESSAGES[homeLanguage] || SUCCESS_MESSAGES['English'];
  return fn(firstName, product);
}

const AMOUNTS = [50, 100, 250, 500, 1000, 2000];

export default function ShopriteScreen({ userData, onBack, theme }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [sendToOther, setSendToOther] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
  const [stage, setStage] = useState('entry');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pendingCardMZW, setPendingCardMZW] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleToggleSendToOther = function() {
    const newToggle = !sendToOther;
    setSendToOther(newToggle);
    if (newToggle) {
      setPhoneNumber('');
    } else {
      setPhoneNumber(userData.phoneNumber || '');
    }
  };

  const formatPhone = function(num) {
    let formatted = num.replace(/\s/g, '');
    if (!formatted.startsWith('+')) {
      if (formatted.startsWith('0')) {
        formatted = '+27' + formatted.substring(1);
      } else if (formatted.startsWith('27')) {
        formatted = '+' + formatted;
      } else {
        formatted = '+27' + formatted;
      }
    }
    return formatted;
  };

  const handlePurchase = async () => {
    if (paymentMethod === 'wallet') { await doOriginal_handlePurchase(); return; }
    // Card flow: find the purchase amount by asking the server is not possible here,
    // so we read it the same way the screen does. AMOUNT_EXPR below.
    let cardAmount = null;
    try { cardAmount = (typeof getAmount === 'function') ? getAmount() : null; } catch (e) {}
    if (cardAmount === null || isNaN(cardAmount)) {
      try { cardAmount = selectedAmount || parseFloat(customAmount); } catch (e) {}
    }
    if (cardAmount === null || cardAmount === undefined || isNaN(cardAmount) || cardAmount <= 0) {
      setNotice ? setNotice({ type: 'error', title: 'Select an Amount', message: 'Please choose a voucher amount first.' })
                : alert('Please choose a voucher amount first.');
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
        body: JSON.stringify({ memberNumber: userData.memberNumber, amount: cardAmount, email: userData.email })
      });
      const data = await response.json();
      if (data.success && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
        const payRequestId = data.payRequestId;
        setPendingCardMZW({ amount: cardAmount, payRequestId: payRequestId });
        setLoading(false);
        // PAYGATE_AUTO_POLL
        let attempts = 0;
        const poll = setInterval(async function() {
          attempts++;
          try {
            const sr = await fetch(API_URL + '/api/paygate/status/' + payRequestId);
            const sd = await sr.json();
            if (sd.found && sd.credited) {
              clearInterval(poll);
              setPendingCardMZW(null);
              await doOriginal_handlePurchase();
            }
          } catch(e) {}
          if (attempts >= 48) clearInterval(poll);
        }, 2500);
      } else {
        setNotice && setNotice({ type: 'error', title: 'Card Payment Unavailable', message: data.message || 'Could not start the card payment. Please try again or pay from your wallet.' });
      }
    } catch (error) {
      setNotice && setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardComplete_MZW = async () => {
    if (!pendingCardMZW) return;
    setLoading(true);
    try {
      const r = await fetch(API_URL + '/api/user/' + userData.memberNumber);
      const d = await r.json();
      const freshBalance = d.cashWallet !== undefined ? d.cashWallet : (d.user && d.user.cashWallet);
      if (freshBalance === undefined) {
        setNotice && setNotice({ type: 'error', title: 'Connection Error', message: 'Could not check your payment. Please try again.' });
        return;
      }
      userData.cashWallet = freshBalance;
      if (freshBalance < pendingCardMZW.baseBalance + pendingCardMZW.amount) {
        setNotice && setNotice({ type: 'info', title: 'Payment Not Confirmed Yet', message: 'Your card payment has not reached your wallet yet. If you completed it, wait a few seconds and tap Complete Purchase again.' });
        return;
      }
      const pc = pendingCardMZW;
      setPendingCardMZW(null);
      await doOriginal_handlePurchase();
    } catch (error) {
      setNotice && setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardCancel_MZW = () => {
    setPendingCardMZW(null);
    setNotice && setNotice({ type: 'info', title: 'Purchase Cancelled', message: 'If your card payment already went through, the money is safe in your wallet and you can buy from your wallet balance.' });
  };

  const doOriginal_handlePurchase = async () => {
    const amount = getAmount();
    if (!amount || amount < 10) {
      setNotice({ type: 'error', title: 'Invalid Amount', message: 'Please select or enter an amount (minimum R10).' });
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setNotice({ type: 'error', title: 'Invalid Number', message: 'Please enter a valid phone number.' });
      return;
    }
    if (paymentMethod === 'wallet' && userData.cashWallet < amount) {
      setNotice({ type: 'error', title: 'Insufficient Funds', message: 'Your wallet balance is R' + userData.cashWallet.toFixed(2) + '. You need R' + amount.toFixed(2) + ' for this voucher. Please top up or pay by card.' });
      return;
    }
    const formattedPhone = formatPhone(phoneNumber);
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/shoprite/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberNumber: userData.memberNumber,
          amount: amount,
          phoneNumber: formattedPhone,
          productType: 'Shoprite Grocery Voucher'
        })
      });
      const data = await response.json();
      if (data.success) {
        setPurchaseResult({
          amount: amount,
          phoneNumber: phoneNumber,
          formattedPhone: formattedPhone,
          voucherId: data.voucherId,
          newBalance: data.newBalance,
          pvEarned: data.pvEarned,
          gratitudeCredit: data.gratitudeCredit,
          gratitudeWallet: data.gratitudeWallet
        });
        setStage('success');
      } else {
        let title = 'Voucher Unavailable';
        let message = "We couldn't process this voucher right now. You have not been charged. Please try again later or contact support.";
        if (data.errorCode === 'POOL_INSUFFICIENT') {
          title = 'Temporarily Unavailable';
          message = 'Shoprite vouchers are temporarily unavailable. You have not been charged. Please try again a little later.';
        } else if (data.errorCode === 'UNREGISTERED_NUMBER') {
          title = 'Number Not Registered';
          message = phoneNumber + " doesn't have a Shoprite Money Market Account yet. Ask them to register on the Shoprite SA app first, or send to a different number. You have not been charged.";
        } else if (data.poolDepleted) {
          title = 'System Error';
          message = "Don't panic! Your money is safe in your wallet. Please retry this transaction in 30 minutes.";
        } else if (data.errorCode === 'INSUFFICIENT_FUNDS') {
          title = 'Insufficient Funds';
          message = 'Your wallet balance is R' + userData.cashWallet.toFixed(2) + ' but this voucher costs R' + amount.toFixed(2) + '. Please top up your wallet and try again.';
        } else if (data.errorCode === 'INVALID_AMOUNT') {
          title = 'Invalid Amount';
          message = 'Please select or enter a valid amount (minimum R10).';
        } else if (data.errorCode === 'USER_NOT_FOUND') {
          title = 'Session Problem';
          message = 'Your member profile could not be found. Please log out and log in again. You have not been charged.';
        } else if (data.errorCode === 'UPSTREAM_ERROR') {
          title = 'Purchase Not Confirmed';
          message = 'We could not confirm this purchase with Shoprite. Before trying again, please check your Transaction History to make sure it did not go through.';
        }
        setNotice({ type: 'error', title: title, message: message });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDone = function() {
    setStage('entry');
    setPurchaseResult(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setSendToOther(false);
    setPhoneNumber(userData.phoneNumber || '');
    onBack();
  };
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
          <Image source={require('../assets/shoprite.png')} style={{ height: 32, width: 130 }} resizeMode="contain" />
        </View>
        <Text style={[styles.subtitle, { color: t.text }]}>Grocery vouchers, instantly delivered</Text>
      </View>

      {stage === 'entry' && (
        <ScrollView style={styles.content}>
         <View style={[styles.brandRow, { backgroundColor: t.darkMode ? '#ffffff' : '#ffffff', borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
            <Image source={require('../assets/shoprite.png')} style={{ height: 24, width: 100, marginRight: 16 }} resizeMode="contain" />
            <Image source={require('../assets/checkers.png')} style={{ height: 22, width: 100 }} resizeMode="contain" />
          </View> 

          <Text style={styles.label}>Select Amount</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
            {AMOUNTS.map(function(a) {
              const isSelected = selectedAmount === a;
              return (
                <Pressable key={a} onPress={function() { setSelectedAmount(a); setCustomAmount(''); }} style={{ width: '30%', backgroundColor: isSelected ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: isSelected ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 10, padding: 14, alignItems: 'center' }}>
                  <Text style={{ color: t.text, fontSize: 18, fontWeight: 'bold' }}>R{a}</Text>
                  <Text style={{ color: '#50C878', fontSize: 10, marginTop: 2 }}>+{(a * 0.035).toFixed(2)} PV</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Or Enter Custom Amount</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
            placeholder="Enter amount (min R10)"
            placeholderTextColor={t.subText}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={function(v) { setCustomAmount(v); setSelectedAmount(null); }}
          />

          <View style={[styles.recipientCard, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
            <View style={styles.recipientRow}>
              <Text style={styles.recipientLabel}>{sendToOther ? 'Send Voucher To' : 'Send To: My Number'}</Text>
              <Pressable onPress={handleToggleSendToOther}>
                <Text style={styles.toggleLink}>{sendToOther ? 'Send to my number' : 'Send to other number'}</Text>
              </Pressable>
            </View>
            <TextInput
              style={[styles.phoneInput, { backgroundColor: t.bg, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
              placeholder="0812345678"
              placeholderTextColor={t.subText}
              keyboardType="phone-pad"
              maxLength={13}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={sendToOther}
            />
          </View>
          <View style={[styles.walletInfo, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#003865' : '#a0c4ff' }]}>
            <Text style={[styles.walletInfoLabel, { color: t.text }]}>Your Wallet Balance</Text>
            <Text style={styles.walletInfoValue}>R{userData.cashWallet.toFixed(2)}</Text>
          </View>
          
         

          {!pendingCardMZW && (
            <View>
              <Text style={{ fontSize: 14, color: '#50C878', marginVertical: 8, fontWeight: 'bold' }}>Pay With</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>
                <Pressable onPress={function() { setPaymentMethod('wallet'); }} style={{ flex: 1, backgroundColor: paymentMethod === 'wallet' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'wallet' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>👛</Text>
                  <Text style={{ color: paymentMethod === 'wallet' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Wallet</Text>
                  <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Balance: R{userData.cashWallet.toFixed(2)}</Text>
                </Pressable>
                <Pressable onPress={function() { setPaymentMethod('card'); }} style={{ flex: 1, backgroundColor: paymentMethod === 'card' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'card' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>💳</Text>
                  <Text style={{ color: paymentMethod === 'card' ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>Card</Text>
                  <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Secure PayGate payment</Text>
                </Pressable>
                <Pressable
                  onPress={function() { setPaymentMethod('gratitude'); }}
                  style={{ flex: 1, minWidth: '45%', backgroundColor: paymentMethod === 'gratitude' ? (t.darkMode ? '#1A0F00' : '#fff8e8') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: paymentMethod === 'gratitude' ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>🙏</Text>
                  <Text style={{ color: paymentMethod === 'gratitude' ? '#FF9800' : t.text, fontSize: 14, fontWeight: 'bold' }}>Gratitude</Text>
                  <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>Balance: R{(userData.gratitudeWallet || 0).toFixed(2)}</Text>
                </Pressable>
              </View>
            </View>
          )}
          {pendingCardMZW && (
            <View>
              <View style={{ borderWidth: 3, borderColor: '#FF9800', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 15, backgroundColor: t.darkMode ? '#082040' : '#fff8e0' }}>
                <Text style={{ fontSize: 40 }}>💳</Text>
                <Text style={{ color: '#FF9800', fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>Waiting for Payment Confirmation...</Text>
                <Text style={{ color: t.text, fontSize: 14, textAlign: 'center' }}>Complete your payment on the PayGate page. Your Shoprite voucher will load automatically once confirmed.</Text>
              </View>
              <Pressable onPress={loading ? null : handleCardComplete_MZW} disabled={loading} style={{ backgroundColor: '#50C878', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10, opacity: loading ? 0.6 : 1 }}>
                <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>{loading ? 'Checking...' : 'I already paid — check now'}</Text>
              </Pressable>
              <Pressable onPress={loading ? null : handleCardCancel_MZW} disabled={loading} style={{ backgroundColor: 'transparent', borderWidth: 2, borderColor: '#50C878', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 15, opacity: loading ? 0.6 : 1 }}>
                <Text style={{ color: '#50C878', fontSize: 15, fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              </View>
          )}
            {!pendingCardMZW && (
            <Pressable style={[styles.primaryBtn, loading && styles.disabled]} onPress={handlePurchase} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Processing...' : 'Buy Voucher'}</Text>
            </Pressable>
          )}
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}

      {stage === 'success' && purchaseResult && (
        <ScrollView style={styles.content}>
          <View style={[styles.successCard, { backgroundColor: t.card2 }]}>
            <Text style={styles.successIcon}>🛒</Text>
            <Text style={styles.successTitle}>{getSuccessMessage(userData && userData.homeLanguage, userData && userData.fullName, 'Shoprite Voucher')}</Text>
            <Text style={[styles.successSubtitle, { color: t.text }]}>R{purchaseResult.amount.toFixed(2)} loaded to MMA wallet for {purchaseResult.phoneNumber}. Check the Shoprite SA app to spend it.</Text>
            <View style={[styles.receiptBox, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#003865' : '#a0c4ff' }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Recipient</Text>
                <Text style={[styles.receiptValue, { color: t.text }]}>{purchaseResult.phoneNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Type</Text>
                <Text style={[styles.receiptValue, { color: t.text }]}>Shoprite MMA Wallet</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Amount</Text>
                <Text style={styles.receiptValueOrange}>R{purchaseResult.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>PV Earned</Text>
                <Text style={styles.receiptValueGreen}>+{(purchaseResult.pvEarned || 0)} PV</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>🙏 Gratitude Wallet</Text>
                <Text style={styles.receiptValueOrange}>+R{(purchaseResult.gratitudeCredit || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>Gratitude Balance</Text>
                <Text style={styles.receiptValueGreen}>R{(purchaseResult.gratitudeWallet || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: t.text }]}>New Wallet Balance</Text>
                <Text style={styles.receiptValueOrange}>R{(purchaseResult.newBalance || 0).toFixed(2)}</Text>
              </View>
              {purchaseResult.voucherId && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: t.text }]}>Voucher ID</Text>
                  <Text style={styles.receiptValueSmall}>{purchaseResult.voucherId}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable style={styles.primaryBtn} onPress={handleDone}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>
          <View style={styles.bottomSpace} />
        </ScrollView>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  brandLogo: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E60000', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  brandLogoGreen: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#50C878', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandLogoText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  brandText: { fontSize: 14, fontWeight: 'bold' },
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
