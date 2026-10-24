import React, { useState, useEffect } from 'react';
import Notice from '../components/Notice';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  TextInput, ScrollView, ActivityIndicator,
  Modal, Clipboard, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const CATEGORIES = [
  { id: 'all', label: '🌟 All' },
  { id: 'entertainment', label: '🎬 Entertainment' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'betting', label: '🎰 Betting' },
  { id: 'digital', label: '📱 Digital' },
  { id: 'airtime', label: '📡 Airtime' },
  { id: 'bundle', label: '📦 Data' },
];

const VENDOR_CATEGORIES = {
  'Netflix': 'entertainment', 'Showmax': 'entertainment', 'Spotify': 'entertainment',
  'Steam Wallet TopUp': 'entertainment', 'Playstation Plus': 'entertainment',
  'Playstation Wallet TopUp': 'entertainment', 'Roblox': 'entertainment', 'Top TV': 'entertainment',
  'Deezer': 'entertainment', 'UniPin': 'entertainment', 'OTT': 'entertainment',
  'Uber': 'transport', 'Uber Eats': 'transport', 'Gautrain City': 'transport',
  'xHollywood Bets': 'betting', 'xSupaBets': 'betting', 'Betway Bucks': 'betting',
  'xLottoStar': 'betting', 'SuperSportBet': 'betting', 'AfricaPIN': 'betting', 'xBetFlash': 'betting',
  'Google Play': 'digital', 'BluVoucher': 'digital', 'AlwaysOn': 'digital',
  'Axxess': 'bundle', 'Discovery Prepaid Health': 'digital', 'Cycle Lab': 'digital',
  'Netflorist': 'digital', 'Sorbet': 'digital', 'Pro Shop': 'digital',
  'Ringas': 'digital', 'CCONNECT': 'digital',
};

const VENDOR_DISPLAY_NAMES = {
  'xHollywood Bets': 'HollywoodBets', 'xSupaBets': 'Supabets', 'xLottoStar': 'LottoStar',
  'xBetFlash': 'BetFlash', 'Playstation Plus': 'PlayStation Plus',
  'Playstation Wallet TopUp': 'PlayStation Wallet', 'Steam Wallet TopUp': 'Steam',
  'Gautrain City': 'Gautrain', 'AlwaysOn': 'AlwaysOn WiFi',
  'Discovery Prepaid Health': 'Discovery Health',
};

const VENDOR_ICONS = {
  'Netflix': '🎬', 'Showmax': '📺', 'Spotify': '🎵', 'Steam Wallet TopUp': '🎮',
  'Playstation Plus': '🎮', 'Playstation Wallet TopUp': '🎮', 'Roblox': '🎮',
  'Uber': '🚗', 'Uber Eats': '🍔', 'Gautrain City': '🚆',
  'xHollywood Bets': '🐎', 'xSupaBets': '⚽', 'Betway Bucks': '🎯',
  'xLottoStar': '🎱', 'SuperSportBet': '🏆', 'Google Play': '▶️',
  'BluVoucher': '💙', 'Netflorist': '🌸', 'Sorbet': '💅',
  'Pro Shop': '⛳', 'Discovery Prepaid Health': '🏥', 'Top TV': '📡', 'AfricaPIN': '🎲',
  'Deezer': '🎶', 'UniPin': '🎮', 'OTT': '📺', 'Cycle Lab': '🚴', 'Ringas': '💍', 'CCONNECT': '🌐',
};

// ── Clean redemption instructions per vendor ───────────────────────────────
// These replace the raw Blue Label productInstructions text which contains
// unreadable escape sequences like \n, |N|, |C etc.
const VENDOR_REDEEM_INSTRUCTIONS = {
  'Uber': 'Open the Uber app → Account → Wallet → Add Funds → Gift Card → Paste your PIN or Code. Your Uber Cash will reflect immediately. Valid for Uber rides and Uber Eats in South Africa only.',
  'Uber Eats': 'Open the Uber Eats app → Account → Wallet → Add Funds → Gift Card → Paste your PIN or Code. Your credit will reflect immediately. Valid for Uber Eats orders in South Africa only.',
  'Netflix': 'Go to netflix.com/redeem on a browser or the Netflix app. Sign in to your account, enter your PIN code, and your credit will be applied immediately.',
  'Showmax': 'Go to showmax.com and sign in. Navigate to Account → Redeem voucher, enter your PIN code. Your subscription will activate immediately.',
  'Spotify': 'Go to spotify.com/redeem on a browser. Sign in to your Spotify account, enter your PIN code, and enjoy Premium immediately.',
  'Google Play': 'Open the Google Play Store app → tap your profile photo → Payments & subscriptions → Redeem gift code. Enter your PIN code to add the credit to your account.',
  'Steam Wallet TopUp': 'Open the Steam app or go to store.steampowered.com. Click your username → Account Details → Add funds to your Steam Wallet → Redeem a Steam Gift Card. Enter your PIN code.',
  'Playstation Plus': 'On your PlayStation console, go to PlayStation Store → Redeem Codes. Or visit playstation.com/redeem on a browser. Enter your PIN code to activate your subscription.',
  'Playstation Wallet TopUp': 'On your PlayStation console, go to PlayStation Store → Redeem Codes. Or visit playstation.com/redeem on a browser. Enter your PIN code to add funds to your wallet.',
  'Roblox': 'Go to roblox.com/redeem on a browser. Sign in to your Roblox account and enter your PIN code to add Robux to your account.',
  'xHollywood Bets': 'Log in to your HollywoodBets account on the app or website. Go to Deposit → Voucher, and enter your PIN code. Funds reflect immediately.',
  'xSupaBets': 'Log in to your Supabets account. Go to Deposit → Voucher/Coupon, and enter your PIN code to load funds to your betting account.',
  'Betway Bucks': 'Log in to your Betway account on the app or website. Navigate to Deposit → Voucher, and enter your PIN code. Funds reflect immediately.',
  'xLottoStar': 'Log in to your LottoStar account. Go to Wallet → Deposit → Voucher, and enter your PIN code to add funds.',
  'SuperSportBet': 'Log in to your SuperSportBet account. Navigate to Deposit → Voucher, and enter your PIN code to add funds to your betting account.',
  'AfricaPIN': 'Visit the AfricaPIN website or app. Enter your PIN code in the redeem or deposit section to load funds to your account.',
  'xBetFlash': 'Log in to your BetFlash account. Go to Deposit → Voucher, and enter your PIN code to add funds to your account.',
  'Gautrain City': 'Visit any Gautrain station ticket machine or the Gautrain app. Select Load Voucher and enter your PIN code to add credit to your Gautrain card.',
  'Top TV': 'Call Top TV support on 086 000 0567, or visit their website. Provide your PIN code and decoder serial number to activate your subscription.',
  'BluVoucher': 'Use your BluVoucher PIN at any participating online store at checkout. Select BluVoucher as the payment method and enter your PIN code.',
  'Netflorist': 'Visit netflorist.co.za and add items to your cart. At checkout, select Gift Voucher as payment and enter your PIN code.',
  'Sorbet': 'Visit any Sorbet salon and present your PIN code at the till when paying for your treatment or products.',
  'Pro Shop': 'Visit any Pro Shop store and present your PIN code at the till, or use it online at proshop.co.za at checkout.',
  'AlwaysOn': 'Connect to an AlwaysOn WiFi hotspot. When the login page appears, select Voucher login and enter your PIN code to access the internet.',
  'Axxess': 'Log in to your Axxess account at axxess.co.za. Go to My Account → Vouchers → Redeem, and enter your PIN code.',
  'Discovery Prepaid Health': 'Call Discovery on 0860 99 88 77 or visit discovery.co.za. Provide your PIN code to load your prepaid health benefit.',
  'Deezer': 'Go to deezer.com/redeem on a browser. Sign in to your Deezer account and enter your PIN code to activate your subscription.',
  'Cycle Lab': 'Visit any Cycle Lab store and present your PIN code at the till, or use it online at cyclelab.com at checkout.',
};

// Returns our clean message, or null if we don't have one (fall back to productInstructions)
function getRedeemInstructions(vendorName) {
  return VENDOR_REDEEM_INSTRUCTIONS[vendorName] || null;
}

// Returns a short one-line hint shown under the PIN box
function getPinHint(vendorName) {
  const hints = {
    'Uber': 'Open Uber app → Account → Wallet → Add Funds → Gift Card → Paste PIN or Code',
    'Uber Eats': 'Open Uber Eats app → Account → Wallet → Add Funds → Gift Card → Paste PIN or Code',
    'Netflix': 'Go to netflix.com/redeem',
    'Showmax': 'Go to showmax.com → Account → Redeem voucher',
    'Spotify': 'Go to spotify.com/redeem',
    'Google Play': 'Google Play Store → Profile → Redeem gift code',
    'Steam Wallet TopUp': 'Steam → Account Details → Redeem a Gift Card',
    'Playstation Plus': 'PlayStation Store → Redeem Codes',
    'Playstation Wallet TopUp': 'PlayStation Store → Redeem Codes',
    'Roblox': 'Go to roblox.com/redeem',
    'xHollywood Bets': 'HollywoodBets → Deposit → Voucher',
    'xSupaBets': 'Supabets → Deposit → Voucher',
    'Betway Bucks': 'Betway → Deposit → Voucher',
    'xLottoStar': 'LottoStar → Wallet → Deposit → Voucher',
    'SuperSportBet': 'SuperSportBet → Deposit → Voucher',
    'xBetFlash': 'BetFlash → Deposit → Voucher',
    'Gautrain City': 'Gautrain station machine or app → Load Voucher',
    'BluVoucher': 'Use at checkout on participating online stores',
    'AlwaysOn': 'Connect to AlwaysOn WiFi → Select Voucher login',
    'Axxess': 'axxess.co.za → My Account → Vouchers → Redeem',
    'Deezer': 'Go to deezer.com/redeem',
  };
  return hints[vendorName] || 'Enter your PIN code when prompted to redeem';
}

function getVendorCategory(vendorName, category) {
  if (VENDOR_CATEGORIES[vendorName]) return VENDOR_CATEGORIES[vendorName];
  if (category === 'airtime') return 'airtime';
  if (category === 'bundle') return 'bundle';
  return 'digital';
}

export default function LifestyleVouchersScreen({route, navigation, theme, userData, onHideTabBar, onShowTabBar}) {
  const insets = useSafeAreaInsets();
  const t = theme || {
    bg: '#003865', card: '#003865', card2: '#0a2545',
    text: '#ffffff', subText: '#aaaaaa',
    border: 'rgba(255,152,0,0.15)', darkMode: true,
    toggle: function() {}
  };
  const { memberNumber, walletBalance: initialBalance } = route.params || {};

  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWallet] = useState(parseFloat(initialBalance) || 0);
  const [selectedProduct, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [pendingCardMZW, setPendingCardMZW] = useState(null);
  const [notice, setNotice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Scroll handler — MUST be before any early return ──────────────────────
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

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { filterProducts(activeCategory, search); }, [allProducts, activeCategory, search]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lifestyle-vouchers/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const EXCLUDED_VENDORS = [
          'Vodacom', 'MTN', 'Cell C', 'Telkom Mobile', 'Telkom',
          'BLD Vodacom', 'BLD MTN', 'BLD Cell C', 'BLD Telkom Mobile',
          'Neotel', 'OTT', 'Virgin Mobile', 'Ringas', 'CCONNECT',
          'Bela - International Calling Card', 'xDabba', 'Cell C Rewards',
          'English Test', 'PowerCard', 'UniPin'
        ];
        setAllProducts(data.filter(p => !EXCLUDED_VENDORS.includes(p.vendorName)));
      }
    } catch (err) {
      console.error('Lifestyle products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = (category, searchText) => {
    let result = allProducts;
    if (category !== 'all') {
      result = result.filter(p => getVendorCategory(p.vendorName, p.category) === category);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (VENDOR_DISPLAY_NAMES[p.vendorName] || p.vendorName).toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    const productAmount = selectedProduct.amount / 100;
    if (productAmount > walletBalance) {
      setNotice({ type: 'error', title: 'Insufficient Balance', message: `Your wallet has R${walletBalance.toFixed(2)}.` });
      return;
    }
    setConfirmModal(true);
  };

  const doWalletPurchase = async () => {
    setConfirmModal(false);
    setPurchasing(true);
    try {
      const res = await fetch(`${API_URL}/api/lifestyle-vouchers/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberNumber, productId: selectedProduct.id, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.newWalletBalance);
        setSuccessData({ ...data, productName: selectedProduct.name, vendorName: selectedProduct.vendorName });
        setSelected(null);
      } else {
        setNotice({ type: 'error', title: 'Purchase Failed', message: data.error || 'This voucher is not yet available. Please try another product.' });
      }
    } catch (err) {
      setNotice({ type: 'error', title: 'Network Error', message: 'Could not connect. Please check your internet and try again.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async () => {
    if (paymentMethod === 'wallet') { handleBuyNow(); return; }
    const cardAmount = selectedProduct ? selectedProduct.amount / 100 : null;
    if (!cardAmount || cardAmount <= 0) {
      setNotice({ type: 'error', title: 'Select a Product', message: 'Please choose a voucher first.' });
      return;
    }
    setPurchasing(true);
    try {
      const response = await fetch(API_URL + '/api/paygate/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberNumber: userData.memberNumber, amount: cardAmount, email: userData.email })
      });
      const data = await response.json();
      if (data.success && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
        setPendingCardMZW({ amount: cardAmount, payRequestId: data.payRequestId });
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const sr = await fetch(API_URL + '/api/paygate/status/' + data.payRequestId);
            const sd = await sr.json();
            if (sd.found && sd.credited) {
              clearInterval(poll);
              setPendingCardMZW(null);
              await doWalletPurchase();
            }
          } catch (e) {}
          if (attempts >= 48) clearInterval(poll);
        }, 2500);
      } else {
        setNotice({ type: 'error', title: 'Card Payment Unavailable', message: data.message || 'Could not start card payment. Please pay from your wallet.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please try again.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleCardComplete = async () => {
    if (!pendingCardMZW) return;
    setPurchasing(true);
    try {
      const res = await fetch(API_URL + '/api/paygate/status/' + pendingCardMZW.payRequestId);
      const sd = await res.json();
      if (sd.found && sd.credited) {
        setPendingCardMZW(null);
        await doWalletPurchase();
      } else {
        setNotice({ type: 'error', title: 'Payment Pending', message: 'Payment not confirmed yet. Wait a few seconds and try again.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Cannot connect to server. Please try again.' });
    } finally {
      setPurchasing(false);
    }
  };

  const handleCardCancel = () => {
    setPendingCardMZW(null);
    setNotice({ type: 'info', title: 'Purchase Cancelled', message: 'If your card payment went through, the money is safe in your wallet.' });
  };

  // ── Confirm Modal ──────────────────────────────────────────────────────────
  const ConfirmModal = () => {
    if (!selectedProduct) return null;
    const productAmount = selectedProduct.amount / 100;
    const walletAfter = walletBalance - productAmount;
    const icon = VENDOR_ICONS[selectedProduct.vendorName] || '🎫';
    const displayName = VENDOR_DISPLAY_NAMES[selectedProduct.vendorName] || selectedProduct.vendorName;
    return (
      <Modal transparent animationType="fade" visible={confirmModal} onRequestClose={() => setConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
            <Text style={styles.modalIcon}>{icon}</Text>
            <Text style={[styles.modalTitle, { color: t.text }]}>Confirm Purchase</Text>
            <Text style={styles.modalVendor}>{displayName}</Text>
            <Text style={[styles.modalProduct, { color: t.subText }]}>{selectedProduct.name}</Text>
            <View style={[styles.modalDivider, { backgroundColor: t.darkMode ? '#1a4a7a' : '#dddddd' }]} />
            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, { color: t.subText }]}>Cost</Text>
              <Text style={[styles.modalValue, { color: t.text }]}>R{productAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, { color: t.subText }]}>Wallet balance</Text>
              <Text style={[styles.modalValue, { color: t.text }]}>R{walletBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, { color: t.subText }]}>Wallet after</Text>
              <Text style={[styles.modalValue, { color: '#50C878' }]}>R{walletAfter.toFixed(2)}</Text>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: t.darkMode ? '#1a4a7a' : '#dddddd' }]} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setConfirmModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={doWalletPurchase}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (successData) {
    const hasToken = successData.token && successData.token.trim() !== '';
    const hasSerial = successData.serialNumber && successData.serialNumber.trim() !== '';
    const hasReference = successData.reference && successData.reference.trim() !== '';
    const pvDisplay = successData.pvEarned != null
      ? (typeof successData.pvEarned === 'number' ? successData.pvEarned.toFixed(4) : successData.pvEarned)
      : '0.0000';

    // Get the primary code to copy (PIN > Serial > Reference)
    const primaryCode = hasToken ? successData.token : (hasSerial ? successData.serialNumber : successData.reference);
    const primaryLabel = hasToken ? 'PIN' : (hasSerial ? 'Code' : 'Reference');

    // Get our clean redemption instructions for this vendor
    const vendorName = successData.vendorName || '';
    const cleanInstructions = getRedeemInstructions(vendorName);
    const pinHint = getPinHint(vendorName);

    const copyToClipboard = (text, label) => {
      try {
        Clipboard.setString(text);
        Alert.alert('Copied!', `${label} copied to clipboard.`);
      } catch (e) {
        Alert.alert('Copy failed', 'Please copy the code manually by holding down on it.');
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.successContainer, { paddingBottom: insets.bottom + 80 }]} onScroll={_handleScroll} scrollEventThrottle={16}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Voucher Purchased!</Text>
          <Text style={[styles.successProduct, { color: t.subText }]}>{successData.productName}</Text>

          {/* Voucher PIN — shown prominently */}
          {hasToken ? (
            <View style={[styles.tokenBox, { backgroundColor: t.card2 }]}>
              <Text style={styles.tokenLabel}>Your Voucher PIN</Text>
              <Text style={[styles.tokenValue, { color: t.text }]} selectable>{successData.token}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(successData.token, 'Voucher PIN')}>
                <Text style={styles.copyBtnText}>📋 Copy PIN</Text>
              </TouchableOpacity>
              <Text style={[styles.tokenHint, { color: t.subText }]}>{pinHint}</Text>
            </View>
          ) : null}

          {/* Serial Number — shown prominently when no token */}
          {hasSerial ? (
            <View style={[styles.tokenBox, { backgroundColor: t.card2 }]}>
              <Text style={styles.tokenLabel}>{hasToken ? 'Serial Number' : 'Your Voucher Code'}</Text>
              <Text style={[styles.tokenValue, { color: t.text, fontSize: hasToken ? 16 : 22 }]} selectable>{successData.serialNumber}</Text>
              {!hasToken && (
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(successData.serialNumber, 'Voucher Code')}>
                  <Text style={styles.copyBtnText}>📋 Copy Code</Text>
                </TouchableOpacity>
              )}
              {!hasToken && <Text style={[styles.tokenHint, { color: t.subText }]}>{pinHint}</Text>}
            </View>
          ) : null}

          {/* Reference — fallback when no token and no serial */}
          {!hasToken && !hasSerial && hasReference ? (
            <View style={[styles.tokenBox, { backgroundColor: t.card2 }]}>
              <Text style={styles.tokenLabel}>Transaction Reference</Text>
              <Text style={[styles.tokenValue, { color: t.text, fontSize: 16 }]} selectable>{successData.reference}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(successData.reference, 'Reference')}>
                <Text style={styles.copyBtnText}>📋 Copy Reference</Text>
              </TouchableOpacity>
              <Text style={[styles.tokenHint, { color: t.subText }]}>Keep this reference for support queries</Text>
            </View>
          ) : null}

          {/* Reference shown smaller when we already have a token/serial */}
          {(hasToken || hasSerial) && hasReference ? (
            <View style={[styles.infoBox, { backgroundColor: t.card2 }]}>
              <Text style={[styles.infoLabel, { color: t.subText }]}>Transaction Reference</Text>
              <Text style={[styles.infoValue, { color: t.text }]} selectable>{successData.reference}</Text>
            </View>
          ) : null}

          {/* How to redeem — our clean message takes priority; fall back to Blue Label text only if we have no clean message */}
          {(cleanInstructions || successData.productInstructions) ? (
            <View style={[styles.infoBox, { backgroundColor: t.card2 }]}>
              <Text style={[styles.infoLabel, { color: t.subText }]}>How to redeem:</Text>
              <Text style={[styles.infoValue, { color: t.text }]}>
                {cleanInstructions || successData.productInstructions
                  .replace(/\\n/g, '\n')
                  .replace(/\|N\|?/g, '')
                  .replace(/\|C/g, '')
                  .replace(/\n{3,}/g, '\n\n')
                  .trim()}
              </Text>
            </View>
          ) : null}

          {/* HP earned */}
          <View style={[styles.pvBox, { backgroundColor: t.card2 }]}>
            <Text style={styles.pvText}>✅ {pvDisplay} HP earned toward your property!</Text>
          </View>

          <Text style={[styles.newBalance, { color: t.text }]}>
            New Wallet Balance: R{(successData.newWalletBalance ?? 0).toFixed(2)}
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={() => setSuccessData(null)}>
            <Text style={styles.doneBtnText}>Buy Another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back to Store</Text>
          </TouchableOpacity>
        </ScrollView>
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </View>
    );
  }

  // ── Main Screen ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <ConfirmModal />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card2 }]}>
        <Pressable style={styles.backBtn2} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Pressable style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🌟 Lifestyle Vouchers</Text>
        <Text style={[styles.headerSub, { color: t.text }]}>Buy vouchers for top SA brands</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>

        {/* Wallet balance */}
        <View style={[styles.walletInfoRow, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#003865' : '#a0c4ff' }]}>
          <Text style={[styles.walletInfoLabel, { color: t.text }]}>Your Wallet Balance</Text>
          <Text style={styles.walletInfoValue}>R{walletBalance.toFixed(2)}</Text>
        </View>

        {/* Search */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: t.card2, color: t.text, borderColor: t.darkMode ? '#0d2d50' : '#dddddd' }]}
          placeholder="Search Netflix, Uber, HollywoodBets..."
          placeholderTextColor={t.subText}
          value={search}
          onChangeText={setSearch}
        />

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catBtn, { backgroundColor: t.card2, borderColor: t.darkMode ? '#1a4a7a' : '#dddddd' }, activeCategory === cat.id && styles.catBtnActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[styles.catBtnText, { color: t.subText }, activeCategory === cat.id && styles.catBtnTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        {loading ? (
          <ActivityIndicator color="#FF9800" size="large" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.productGrid}>
            {filtered.length === 0 ? (
              <Text style={[styles.emptyText, { color: t.subText }]}>No vouchers found.</Text>
            ) : (
              filtered.map(product => {
                const displayName = VENDOR_DISPLAY_NAMES[product.vendorName] || product.vendorName;
                const icon = VENDOR_ICONS[product.vendorName] || '🎫';
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[styles.productCard,
                      { backgroundColor: isSelected ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : t.card2,
                        borderColor: isSelected ? '#50C878' : (t.darkMode ? '#1a4a7a' : '#dddddd') }
                    ]}
                    onPress={() => setSelected(isSelected ? null : product)}
                  >
                    <Text style={styles.productIcon}>{icon}</Text>
                    <View style={styles.productInfo}>
                      <Text style={styles.productVendor}>{displayName}</Text>
                      <Text style={[styles.productName, { color: t.text }]}>{product.name}</Text>
                    </View>
                    <Text style={[styles.productPrice, { color: t.text }]}>R{(product.amount / 100).toFixed(2)}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Payment Section */}
        {selectedProduct && !pendingCardMZW && (
          <View style={styles.paymentSection}>
            <Text style={styles.payWithLabel}>Pay With</Text>
            <View style={styles.payMethodRow}>
              <Pressable
                onPress={() => setPaymentMethod('wallet')}
                style={[styles.payMethodBtn, {
                  backgroundColor: paymentMethod === 'wallet' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : t.card2,
                  borderColor: paymentMethod === 'wallet' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'),
                }]}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>👛</Text>
                <Text numberOfLines={1} style={{ color: paymentMethod === 'wallet' ? '#50C878' : t.text, fontSize: 13, fontWeight: 'bold' }}>Wallet</Text>
                <Text numberOfLines={1} style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>R{walletBalance.toFixed(2)}</Text>
              </Pressable>
              <Pressable
                onPress={() => setPaymentMethod('card')}
                style={[styles.payMethodBtn, {
                  backgroundColor: paymentMethod === 'card' ? (t.darkMode ? '#1A2F1A' : '#e8fff0') : t.card2,
                  borderColor: paymentMethod === 'card' ? '#50C878' : (t.darkMode ? '#0d2d50' : '#dddddd'),
                }]}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>💳</Text>
                <Text numberOfLines={1} style={{ color: paymentMethod === 'card' ? '#50C878' : t.text, fontSize: 13, fontWeight: 'bold' }}>Card</Text>
                <Text numberOfLines={1} style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>PayGate</Text>
              </Pressable>
              <Pressable
                onPress={() => setPaymentMethod('gratitude')}
                style={[styles.payMethodBtn, {
                  backgroundColor: paymentMethod === 'gratitude' ? (t.darkMode ? '#1A0F00' : '#fff8e8') : (t.darkMode ? '#082040' : '#ffffff'),
                  borderColor: paymentMethod === 'gratitude' ? '#FF9800' : (t.darkMode ? '#0d2d50' : '#dddddd'),
                }]}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>🙏</Text>
                <Text numberOfLines={1} style={{ color: paymentMethod === 'gratitude' ? '#FF9800' : t.text, fontSize: 13, fontWeight: 'bold' }}>Gratitude</Text>
                <Text numberOfLines={1} style={{ color: t.subText, fontSize: 11, marginTop: 2 }}>R{(userData?.gratitudeWallet || 0).toFixed(2)}</Text>
              </Pressable>
            </View>
            <Pressable
              style={[styles.buyBtn, purchasing && { opacity: 0.5 }]}
              onPress={paymentMethod === 'wallet' ? handleBuyNow : handlePurchase}
              disabled={purchasing}
            >
              {purchasing
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buyBtnText}>
                    {paymentMethod === 'card'
                      ? `Pay with Card – R${(selectedProduct.amount / 100).toFixed(2)}`
                      : 'Buy Voucher'}
                  </Text>
              }
            </Pressable>
          </View>
        )}

        {/* Pending card */}
        {selectedProduct && pendingCardMZW && (
          <View style={[styles.pendingCard, { backgroundColor: t.darkMode ? '#1A2800' : '#fff8e1', borderColor: '#FF9800' }]}>
            <Text style={{ color: '#FF9800', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
              💳 Complete your R{pendingCardMZW.amount.toFixed(2)} PayGate payment, then tap below.
            </Text>
            <Pressable onPress={handleCardComplete} disabled={purchasing} style={[styles.buyBtn, purchasing && { opacity: 0.6 }]}>
              <Text style={styles.buyBtnText}>{purchasing ? 'Checking...' : 'I Paid – Complete Purchase'}</Text>
            </Pressable>
            <Pressable onPress={handleCardCancel} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: t.subText, fontSize: 12 }}>Cancel</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />

      </ScrollView>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  // Header
  header:             { paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center', position: 'relative' },
  backBtn2:           { position: 'absolute', left: 20, top: 22, zIndex: 10, padding: 4 },
  backText:           { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle:         { position: 'absolute', right: 20, top: 22, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  modeToggleText:     { fontSize: 18 },
  headerTitle:        { fontSize: 24, color: '#50C878', fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },
  headerSub:          { fontSize: 12, marginTop: 6 },
  scroll:             { flex: 1, padding: 20 },
  // Wallet info
  walletInfoRow:      { padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderWidth: 2 },
  walletInfoLabel:    { fontSize: 13 },
  walletInfoValue:    { fontSize: 20, color: '#FF9800', fontWeight: 'bold' },
  // Search
  searchInput:        { padding: 14, borderRadius: 12, fontSize: 15, borderWidth: 2, marginBottom: 16 },
  // Tabs
  catScroll:          { marginBottom: 16 },
  catBtn:             { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  catBtnActive:       { backgroundColor: '#FF9800', borderColor: '#FF9800' },
  catBtnText:         { fontSize: 13, fontWeight: '600' },
  catBtnTextActive:   { color: '#ffffff' },
  // Products
  productGrid:        { gap: 10, marginBottom: 10 },
  productCard:        { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, borderWidth: 2 },
  productIcon:        { fontSize: 28, marginRight: 12 },
  productInfo:        { flex: 1 },
  productVendor:      { color: '#FF9800', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  productName:        { fontSize: 14 },
  productPrice:       { fontSize: 16, fontWeight: 'bold' },
  emptyText:          { textAlign: 'center', marginTop: 40, fontSize: 15 },
  // Payment
  paymentSection:     { marginTop: 16, marginBottom: 10 },
  payWithLabel:       { fontSize: 14, color: '#50C878', marginBottom: 8, fontWeight: 'bold', marginTop: 10 },
  payMethodRow:       { flexDirection: 'row', gap: 8, marginBottom: 15 },
  payMethodBtn:       { flex: 1, borderWidth: 2, borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 0 },
  buyBtn:             { backgroundColor: '#50C878', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  buyBtnText:         { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  pendingCard:        { borderRadius: 10, padding: 14, borderWidth: 1, marginTop: 16 },
  // Modal
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox:           { borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, borderWidth: 2 },
  modalIcon:          { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  modalTitle:         { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  modalVendor:        { color: '#50C878', fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  modalProduct:       { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  modalDivider:       { height: 1, marginVertical: 12 },
  modalRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  modalLabel:         { fontSize: 14 },
  modalValue:         { fontSize: 14, fontWeight: 'bold' },
  modalButtons:       { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel:        { flex: 1, borderWidth: 2, borderColor: '#50C878', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalCancelText:    { color: '#50C878', fontSize: 15, fontWeight: 'bold' },
  modalConfirm:       { flex: 1, backgroundColor: '#50C878', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalConfirmText:   { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  // Success
  successContainer:   { alignItems: 'center', padding: 24 },
  successIcon:        { fontSize: 60, marginBottom: 12 },
  successTitle:       { color: '#50C878', fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  successProduct:     { fontSize: 16, marginBottom: 24 },
  tokenBox:           { borderRadius: 12, padding: 20, alignItems: 'center', width: '100%', marginBottom: 16, borderWidth: 2, borderColor: '#50C878' },
  tokenLabel:         { color: '#50C878', fontSize: 14, marginBottom: 8 },
  tokenValue:         { fontSize: 24, fontWeight: 'bold', letterSpacing: 3 },
  tokenHint:          { fontSize: 12, marginTop: 8, textAlign: 'center' },
  copyBtn:            { marginTop: 12, backgroundColor: '#1a6b3a', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'center' },
  copyBtnText:        { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  infoBox:            { borderRadius: 10, padding: 16, width: '100%', marginBottom: 12 },
  infoLabel:          { fontSize: 13, marginBottom: 4 },
  infoValue:          { fontSize: 14, lineHeight: 22 },
  pvBox:              { borderRadius: 10, padding: 14, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#50C878' },
  pvText:             { color: '#50C878', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  newBalance:         { fontSize: 16, marginBottom: 20 },
  doneBtn:            { backgroundColor: '#50C878', borderRadius: 10, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  doneBtnText:        { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  backBtn:            { borderWidth: 1, borderColor: '#FF9800', borderRadius: 10, padding: 14, width: '100%', alignItems: 'center' },
  backBtnText:        { color: '#FF9800', fontSize: 16 },
});
