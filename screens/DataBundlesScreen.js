import React, { useState, useEffect } from 'react';
import { Image, View, Text, TextInput, Pressable, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const API_BASE = 'https://mzansiway-backend-production.up.railway.app';

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
  'Tshivenda':   (name, product) => 'Ndo livhuwa ' + name + '! ' + product + ' yo rumwa nga ndila yo takutsedzaho. Bvela phanḓa u wana tshikalo tsha nnḓu yau!',
  'isiNdebele':  (name, product) => 'Siyabonga ' + name + '! I-' + product + ' ithunyelwe ngempumelelo. Qhubeka uthenga ukuze uqoqe amaphuzu wendlu yakho!',
};

function getSuccessMessage(homeLanguage, name, product) {
  const firstName = name ? name.split(' ')[0] : 'Member';
  const fn = SUCCESS_MESSAGES[homeLanguage] || SUCCESS_MESSAGES['English'];
  return fn(firstName, product);
}


const NETWORKS = [
  { id: 'mtn', label: 'MTN', color: '#FFCB05', textColor: '#000000', logo: require('../assets/MTN_logo.png') },
  { id: 'vodacom', label: 'Vodacom', color: '#E60000', textColor: '#FFFFFF', logo: null },
  { id: 'cellc', label: 'Cell C', color: '#000000', textColor: '#FFFFFF', logo: null },
  { id: 'telkom', label: 'Telkom', color: '#0066B3', textColor: '#FFFFFF', logo: null }
];

const BANDS = [
  { id: 'u20', label: 'Under R20' },
  { id: 'u50', label: 'Under R50' },
  { id: 'u100', label: 'Under R100' },
  { id: 'all', label: 'All' }
];

const DataBundlesScreen = ({ route, navigation, theme }) => {
  const { memberNumber } = (route && route.params) ? route.params : {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('mtn');
  const [selectedBand, setSelectedBand] = useState('u20');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pendingCard, setPendingCard] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  const t = theme || {
    bg: '#0a0a0a',
    card: '#003865',
    card2: '#082040',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };

  useEffect(() => {
    const fallback = [
      { id: '1888', name: 'MTN Daily Whatsapp 250MB R5', category: 'data', vendorId: 'mtn', amount: 500 },
      { id: '2061', name: 'MTN Daily 100MB R10', category: 'data', vendorId: 'mtn', amount: 1000 },
      { id: '2067', name: 'MTN Daily 300MB R20', category: 'data', vendorId: 'mtn', amount: 2000 },
      { id: '2076', name: 'MTN Daily 1GB R29', category: 'data', vendorId: 'mtn', amount: 2900 },
      { id: '1902', name: 'Vodacom Daily WhatsApp 250MB R5', category: 'data', vendorId: 'vodacom', amount: 500 },
      { id: '3817', name: 'Vodacom Daily 1GB R29', category: 'data', vendorId: 'vodacom', amount: 2900 },
      { id: '3818', name: 'Vodacom Weekly 1GB R49', category: 'data', vendorId: 'vodacom', amount: 4900 },
      { id: '3819', name: 'Vodacom Monthly 1GB R99', category: 'data', vendorId: 'vodacom', amount: 9900 },
      { id: '4001', name: 'Cell C Daily 50MB R5', category: 'data', vendorId: 'cellc', amount: 500 },
      { id: '4002', name: 'Cell C Daily 200MB R10', category: 'data', vendorId: 'cellc', amount: 1000 },
      { id: '4003', name: 'Cell C Weekly 1GB R29', category: 'data', vendorId: 'cellc', amount: 2900 },
      { id: '4004', name: 'Cell C Monthly 2GB R49', category: 'data', vendorId: 'cellc', amount: 4900 },
      { id: '5001', name: 'Telkom Daily 50MB R5', category: 'data', vendorId: 'telkom', amount: 500 },
      { id: '5002', name: 'Telkom Daily 200MB R10', category: 'data', vendorId: 'telkom', amount: 1000 },
      { id: '5003', name: 'Telkom Weekly 1GB R29', category: 'data', vendorId: 'telkom', amount: 2900 },
      { id: '5004', name: 'Telkom Monthly 2GB R49', category: 'data', vendorId: 'telkom', amount: 4900 }
    ];

    fetch(API_BASE + '/api/bluelabel/data/products')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(fallback);
        }
        setLoading(false);
      })
      .catch(function() {
        setProducts(fallback);
        setLoading(false);
      });

    refreshUser();
  }, [memberNumber]);

  const refreshUser = function() {
    return fetch(API_BASE + '/api/user/' + memberNumber)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.user) {
          setUserData(data.user);
          setSavedRecipients(data.user.savedRecipients || []);
          setPhoneNumber(data.user.phoneNumber || '');
          return data.user;
        }
        return null;
      })
      .catch(function() { return null; });
  };

  const filteredProducts = products.filter(function(p) {
    const matchNetwork = p.vendorId === selectedNetwork;
    const amount = p.amount / 100;
    let matchBand = true;
    if (selectedBand === 'u20') matchBand = amount < 20;
    else if (selectedBand === 'u50') matchBand = amount < 50;
    else if (selectedBand === 'u100') matchBand = amount < 100;
    return matchNetwork && matchBand;
  });

  const doDataPurchase = function(bundle, phone) {
    setPurchasing(true);
    setMessage(null);
    return fetch(API_BASE + '/api/bluelabel/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberNumber: memberNumber, productId: bundle, phoneNumber: phone })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setPurchasing(false);
        if (data.success) {
          const lang = userData ? userData.homeLanguage : 'English';
          const uname = userData ? userData.fullName : '';
          setMessage({ type: 'success', text: getSuccessMessage(lang, uname, bundle.name || 'Data Bundle') });
          setSelectedBundle(null);
          setPhoneNumber('');
          setPendingCard(null);
          if (userData) {
            setUserData(Object.assign({}, userData, { cashWallet: data.newBalance }));
          }
          fetch(API_BASE + '/api/recipients/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberNumber: memberNumber, phoneNumber: phone, nickname: phone })
          }).catch(function() {});
          return true;
        }
        setMessage({ type: 'error', text: data.message || 'Purchase failed' });
        return false;
      })
      .catch(function() {
        setPurchasing(false);
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
        return false;
      });
  };

  const handlePurchase = function() {
    if (!selectedBundle) return setMessage({ type: 'error', text: 'Please select a bundle' });
    if (!phoneNumber || phoneNumber.length < 10) return setMessage({ type: 'error', text: 'Please enter a valid phone number' });
    const amount = selectedBundle.amount / 100;

    if (paymentMethod === 'wallet') {
      if (!userData || userData.cashWallet < amount) return setMessage({ type: 'error', text: 'Insufficient wallet balance. Switch to Card to pay directly.' });
      doDataPurchase(selectedBundle, phoneNumber);
      return;
    }

    // Card flow
    setPurchasing(true);
    setMessage(null);
    fetch(API_BASE + '/api/paygate/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberNumber: memberNumber, amount: amount, email: userData ? userData.email : undefined })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setPurchasing(false);
        if (data.success && data.redirectUrl) {
          window.open(data.redirectUrl, '_blank');
          const payRequestId = data.payRequestId;
          setPendingCard({ bundle: selectedBundle, phone: phoneNumber, amount: amount, payRequestId: payRequestId });
          setPurchasing(false);
          // PAYGATE_AUTO_POLL
          let attempts = 0;
          const poll = setInterval(async function() {
            attempts++;
            try {
              const sr = await fetch(API_BASE + '/api/paygate/status/' + payRequestId);
              const sd = await sr.json();
              if (sd.found && sd.credited) {
                clearInterval(poll);
                setPendingCard(null);
                doDataPurchase(selectedBundle, phoneNumber);
              }
            } catch(e) {}
            if (attempts >= 48) clearInterval(poll);
          }, 2500);
        } else {
          setMessage({ type: 'error', text: data.message || 'Could not start the card payment. Please try again or pay from your wallet.' });
        }
      })
      .catch(function() {
        setPurchasing(false);
        setMessage({ type: 'error', text: 'Network error. Please try again.' });
      });
  };

  const handleCompleteCardPurchase = function() {
    if (!pendingCard) return;
    setPurchasing(true);
    refreshUser().then(function(fresh) {
      if (!fresh) {
        setPurchasing(false);
        setMessage({ type: 'error', text: 'Could not check your payment. Please try again.' });
        return;
      }
      if (fresh.cashWallet < (pendingCard.baseBalance || 0) + pendingCard.amount) {
        setPurchasing(false);
        setMessage({ type: 'error', text: 'Payment not confirmed yet. If you completed it, wait a few seconds and tap Complete Purchase again.' });
        return;
      }
      doDataPurchase(pendingCard.bundle, pendingCard.phone);
    });
  };

  const handleCancelCard = function() {
    setPendingCard(null);
    setMessage({ type: 'success', text: 'Cancelled. If your card payment already went through, the money is safe in your wallet.' });
  };

  const renderNetworkLogo = function(n, active) {
    if (n.logo) {
      return <Image source={n.logo} style={{ width: '80%', height: 60, resizeMode: 'contain' }} />;
    }
    return (
      <View style={{ width: '100%', height: 70, borderRadius: 10, backgroundColor: n.color,
        alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: n.textColor, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 }}>{n.label}</Text>
      </View>
    );
  };

  const renderMethodCard = function(id, icon, name, detail) {
    const isSelected = paymentMethod === id;
    return (
      <Pressable
        onPress={function() { setPaymentMethod(id); }}
        style={{ flex: 1, backgroundColor: isSelected ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : (t.darkMode ? '#082040' : '#ffffff'), borderWidth: 2, borderColor: isSelected ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'), borderRadius: 12, padding: 14, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 22, marginBottom: 4 }}>{icon}</Text>
        <Text style={{ color: isSelected ? '#50C878' : t.text, fontSize: 14, fontWeight: 'bold' }}>{name}</Text>
        <Text style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>{detail}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={function() { navigation.goBack(); }}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>📶 Data Bundles</Text>
        <Text style={[styles.headerSub, { color: t.subText }]}>Buy data for any SA network</Text>

      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionLabel, { color: t.subText }]}>Select Network</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {NETWORKS.map(function(n) {
            const active = selectedNetwork === n.id;
            return (
              <Pressable
                key={n.id}
                onPress={function() { setSelectedNetwork(n.id); setSelectedBundle(null); }}
                style={{ width: '47%', backgroundColor: n.color, borderWidth: 3, borderColor: active ? '#50C878' : 'transparent', borderRadius: 14, padding: 8, alignItems: 'center', overflow: 'hidden' }}
              >
                {renderNetworkLogo(n, active)}
                
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: t.subText }]}>Select Band</Text>
        <View style={styles.bandRow}>
          {BANDS.map(function(b) {
            const active = selectedBand === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                onPress={function() { setSelectedBand(b.id); setSelectedBundle(null); }}
                style={[styles.bandBtn, { backgroundColor: active ? 'rgba(255,152,0,0.15)' : t.card2, borderColor: active ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd') }]}
              >
                <Text style={[styles.bandBtnText, active && styles.bandBtnTextActive, { color: active ? '#FF9800' : t.subText }]}>{b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF9800" style={{ marginTop: 40 }} />
        ) : filteredProducts.length === 0 ? (
          <Text style={[styles.noProducts, { color: t.subText }]}>No bundles available for this selection</Text>
        ) : (
          <View style={styles.bundleGrid}>
            {filteredProducts.map(function(p) {
              const active = selectedBundle && selectedBundle.id === p.id;
              const amount = p.amount / 100;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={function() { setSelectedBundle(p); }}
                  style={[styles.bundleCard, { backgroundColor: active ? 'rgba(255,152,0,0.08)' : t.card2, borderColor: active ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd') }]}
                >
                  <Text style={styles.bundleAmount}>R{amount.toFixed(0)}</Text>
                  <Text style={[styles.bundleName, { color: t.text }]}>{p.name}</Text>
                  <Text style={styles.bundlePV}>+{(amount * 0.0325).toFixed(2)} PV</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: t.subText }]}>Enter Phone Number</Text>
        <View style={styles.phoneRow}>
          <TextInput
            placeholder="e.g. 0821234567"
            placeholderTextColor={t.subText}
            value={phoneNumber}
            onChangeText={function(val) { setPhoneNumber(val); }}
            keyboardType="phone-pad"
            maxLength={11}
            autoComplete="off"
            style={{ flex: 1, backgroundColor: t.card2, color: t.text, borderWidth: 1, borderColor: t.darkMode ? '#0d2d50' : '#dddddd', borderRadius: 8, padding: 12, fontSize: 16 }}
          />
          <TouchableOpacity onPress={function() { setShowSaved(!showSaved); }} style={[styles.savedBtn, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
            <Text style={styles.savedBtnText}>📋</Text>
          </TouchableOpacity>
        </View>

        {showSaved && savedRecipients.length > 0 && (
          <View style={[styles.savedList, { backgroundColor: t.card2, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
            {savedRecipients.map(function(r, i) {
              return (
                <TouchableOpacity key={i} onPress={function() { setPhoneNumber(r.phoneNumber); setShowSaved(false); }} style={[styles.savedItem, { borderBottomColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}>
                  <Text style={[styles.savedItemText, { color: t.text }]}>{r.nickname || r.phoneNumber}</Text>
                  <Text style={[styles.savedItemSub, { color: t.subText }]}>{r.phoneNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!pendingCard && (
          <View>
            <Text style={[styles.sectionLabel, { color: t.subText }]}>Pay With</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 5 }}>
              {renderMethodCard('wallet', '👛', 'Wallet', userData ? 'Balance: R' + userData.cashWallet.toFixed(2) : 'Wallet balance')}
              { renderMethodCard('card', '💳', 'Card', 'Secure PayGate payment')}
              {renderMethodCard('gratitude', '🙏', 'Gratitude', 'Balance: R' + (userData ? (userData.gratitudeWallet||0).toFixed(2) : '0.00'))}
            </View>
          </View>
        )}

        {message && (
          <View style={[styles.messageBox, message.type === 'success' ? styles.messageSuccess : styles.messageError]}>
            <Text style={[styles.messageText, { color: message.type === 'success' ? '#50C878' : '#FF4444' }]}>{message.text}</Text>
          </View>
        )}

        {pendingCard ? (
          <View>
            <View style={[styles.messageBox, { borderColor: '#FF9800', backgroundColor: 'rgba(255,152,0,0.08)' }]}>
              <Text style={[styles.messageText, { color: '#FF9800' }]}>
                💳 A secure PayGate page has opened for R{pendingCard.amount.toFixed(2)}. Pay there, then tap Complete Purchase to send {pendingCard.bundle.name} to {pendingCard.phone}.
              </Text>
            </View>
            <TouchableOpacity onPress={handleCompleteCardPurchase} disabled={purchasing} style={[styles.buyBtn, purchasing && styles.buyBtnDisabled]}>
              {purchasing ? <ActivityIndicator color="#000000" /> : <Text style={[styles.buyBtnText, { color: '#000000' }]}>I already paid — check now</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelCard} disabled={purchasing} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing || !selectedBundle}
            style={[styles.buyBtn, (!selectedBundle || purchasing) && styles.buyBtnDisabled]}
          >
            {purchasing
              ? <ActivityIndicator color="#000000" />
              : <Text style={[styles.buyBtnText, { color: (!selectedBundle || purchasing) ? t.subText : '#000000' }]}>
                  {selectedBundle
                    ? (paymentMethod === 'card' ? 'Pay with Card — R' + (selectedBundle.amount / 100).toFixed(2) : 'Buy ' + selectedBundle.name + ' — R' + (selectedBundle.amount / 100).toFixed(2))
                    : 'Select a Bundle'}
                </Text>
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 48, borderBottomWidth: 1, position: 'relative' },
  backBtn: { color: '#50C878', fontSize: 16, marginBottom: 12 },
  modeToggle: {
    position: 'absolute', right: 24, top: 48, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,152,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  modeToggleText: { fontSize: 18 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSub: { fontSize: 14 },
  walletBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(80,200,120,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(80,200,120,0.3)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  walletText: { color: '#50C878', fontSize: 13, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 20 },
  bandRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bandBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  bandBtnText: { fontSize: 13 },
  bandBtnTextActive: { fontWeight: 'bold' },
  bundleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bundleCard: { width: '47%', padding: 16, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
  bundleAmount: { color: '#FF9800', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  bundleName: { fontSize: 11, textAlign: 'center', marginBottom: 6 },
  bundlePV: { color: '#50C878', fontSize: 11, fontWeight: 'bold' },
  noProducts: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  savedBtn: { borderWidth: 1, borderRadius: 8, padding: 12 },
  savedBtnText: { fontSize: 20 },
  savedList: { borderRadius: 8, borderWidth: 1, marginTop: 8 },
  savedItem: { padding: 12, borderBottomWidth: 1 },
  savedItemText: { fontSize: 14, fontWeight: 'bold' },
  savedItemSub: { fontSize: 12 },
  messageBox: { padding: 16, borderRadius: 8, marginTop: 16, borderWidth: 1 },
  messageSuccess: { backgroundColor: 'rgba(80,200,120,0.1)', borderColor: 'rgba(80,200,120,0.3)' },
  messageError: { backgroundColor: 'rgba(255,68,68,0.1)', borderColor: 'rgba(255,68,68,0.3)' },
  messageText: { fontSize: 14, textAlign: 'center' },
  buyBtn: { backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buyBtnDisabled: { backgroundColor: '#082040', borderWidth: 1, borderColor: '#0d2d50' },
  buyBtnText: { fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#50C878' },
  cancelBtnText: { color: '#50C878', fontSize: 16, fontWeight: 'bold' },
});

export default DataBundlesScreen;
