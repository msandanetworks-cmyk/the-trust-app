import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUTE_KEY = 'mzansiway_payment_sound_muted';

const MESSAGES = {
  FREE: {
    isiZulu: 'Ngizowuthola owami umuzi',
    isiXhosa: 'Ndizobanalo ikhaya lam',
    Afrikaans: 'Ek sal my eie huis kry.',
    English: 'I will get my own home.',
    Sepedi: 'Ke tla reka motse Waka',
    Setswana: 'Ke tla NNA le ntlo ya ka.',
    Sesotho: 'Ke haha waka motse.',
    Xitsonga: 'Nita xava ya mina yindlo',
    siSwati: 'Ngitawutfola likhaya lami',
    Tshivenda: 'Ndido wana nndu yanga.',
    isiNdebele: 'Ngizowuthola umuzi uthi mina no nofana wami',
  },
  RENT: {
    isiZulu: 'Ziyaphela izinsuku zikamastende',
    isiXhosa: 'Intsuku zika masandi zibaliwe',
    Afrikaans: 'Die verhuurder se dae is getel.',
    English: "The landlord's days are numbered.",
    Sepedi: 'Matsatsi aka agoba le landlord a kgauswi le go fela.',
    Setswana: 'Matsatsi a go patela Landlord a Fela.',
    Sesotho: "A ke satla ba le kamano efeng le Mong'antlo kapa ho ba mohiri.",
    Xitsonga: 'Masiku ya mastende ya hlayiwini',
    siSwati: 'Tinsuku temninidlu wendzawo tibaliwe',
    Tshivenda: 'Maduvha a vhahirisi o vhaliwa',
    isiNdebele: 'Kuyaphela ukuqatjha maduze',
  },
  BOND: {
    isiZulu: 'Sizophuma ebugqileni be bond',
    isiXhosa: 'Ndizaygqiba le-bond ngenye imini',
    Afrikaans: 'Ons sal ontsnap om die verband te betaal.',
    English: 'We will escape the bondage of the bond.',
    Sepedi: 'Re tla ikhutsa morwalo wa bond.',
    Setswana: 'Re tla tswa Mo kgatellong ya bond.',
    Sesotho: 'Ha ke sale lekhoba la kadimo ea ntlo.',
    Xitsonga: 'Hita hambana naku bohiwa hi bond',
    siSwati: 'Sitawuphunyuka ebugcilini sesibopho',
    Tshivenda: 'Ridobva vhupulini ha zwikolodo zwa haya.',
    isiNdebele: 'Sidlula ekubhadeleni abanye iinkolodo zabo',
  },
};

function getMotivationalMessage(homeLanguage, residenceType) {
  if (!residenceType || residenceType === 'OWN') return null;
  const langMessages = MESSAGES[residenceType];
  if (!langMessages) return null;
  return langMessages[homeLanguage] || langMessages['English'] || null;
}

async function playSuccessSound() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
      { shouldPlay: true, volume: 1.0 }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {}
}

async function showSuccessNotification(amount, productType) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Payment Successful ✅',
        body: `R${amount ? amount.toFixed(2) : '0.00'} paid for ${productType || 'transaction'}. Thank you for using Mzansiway!`,
        sound: true,
      },
      trigger: null,
    });
  } catch (e) {}
}

export default function PaymentSuccessScreen({ amount, productType, newBalance, pvEarned, onClose, homeLanguage, residenceType, onHideTabBar, onShowTabBar }) {
  const _lastScrollY = React.useRef(0);
  const [muted, setMuted] = useState(false);

  const _handleScroll = React.useCallback(({ nativeEvent }) => {
    const currentY = nativeEvent.contentOffset.y;
    if (currentY > _lastScrollY.current + 5) {
      onHideTabBar && onHideTabBar();
    } else if (currentY < _lastScrollY.current - 5) {
      onShowTabBar && onShowTabBar();
    }
    _lastScrollY.current = currentY;
  }, [onHideTabBar, onShowTabBar]);

  useEffect(() => {
    AsyncStorage.getItem(MUTE_KEY).then(val => {
      const isMuted = val === 'true';
      setMuted(isMuted);
      if (!isMuted) {
        playSuccessSound();
        showSuccessNotification(amount, productType);
      }
    }).catch(() => {
      playSuccessSound();
      showSuccessNotification(amount, productType);
    });
  }, []);

  const toggleMute = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    try { await AsyncStorage.setItem(MUTE_KEY, String(newMuted)); } catch (e) {}
  };

  const message = getMotivationalMessage(homeLanguage, residenceType);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
      <View style={styles.content}>

        <Pressable style={styles.muteButton} onPress={toggleMute}>
          <Text style={styles.muteIcon}>{muted ? '🔕' : '🔔'}</Text>
        </Pressable>

        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>{productType}</Text>

        {message ? (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationIcon}>🏠</Text>
            <Text style={styles.motivationText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.detailCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={styles.value}>R{amount ? amount.toFixed(2) : '0.00'}</Text>
          </View>
          {pvEarned !== undefined && pvEarned !== null && (
            <View style={styles.row}>
              <Text style={styles.label}>HP Earned</Text>
              <Text style={styles.valueGreen}>+{pvEarned.toFixed(4)} PV</Text>
            </View>
          )}
          {newBalance !== undefined && newBalance !== null && (
            <View style={styles.row}>
              <Text style={styles.label}>New Balance</Text>
              <Text style={styles.valueOrange}>R{newBalance.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>🏡 Thank you for using Mzansiway!</Text>
          <Text style={styles.infoSubText}>Your transaction has been processed successfully.</Text>
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Done</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#003865', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { padding: 30, alignItems: 'center', paddingTop: 60 },
  muteButton: { position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 },
  muteIcon: { fontSize: 24 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A2F1A', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 3, borderColor: '#50C878' },
  icon: { fontSize: 56 },
  title: { fontSize: 28, color: '#50C878', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 20, textAlign: 'center' },
  motivationCard: { backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#FF9800', borderRadius: 16, padding: 20, width: '100%', marginBottom: 20, alignItems: 'center' },
  motivationIcon: { fontSize: 32, marginBottom: 10 },
  motivationText: { fontSize: 20, color: '#FF9800', fontWeight: 'bold', textAlign: 'center', lineHeight: 28 },
  detailCard: { backgroundColor: '#082040', padding: 20, borderRadius: 16, width: '100%', marginBottom: 20, borderWidth: 2, borderColor: '#0d2d50' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#0d2d50' },
  label: { fontSize: 14, color: '#888' },
  value: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
  valueGreen: { fontSize: 18, color: '#50C878', fontWeight: 'bold' },
  valueOrange: { fontSize: 18, color: '#FF9800', fontWeight: 'bold' },
  infoCard: { backgroundColor: '#1A2F1A', padding: 15, borderRadius: 12, width: '100%', marginBottom: 30, borderWidth: 2, borderColor: '#50C878' },
  infoText: { fontSize: 14, color: '#50C878', fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  infoSubText: { fontSize: 12, color: '#FFF', textAlign: 'center' },
  closeButton: { backgroundColor: '#50C878', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center' },
  closeButtonText: { color: '#003865', fontSize: 18, fontWeight: 'bold' },
});
