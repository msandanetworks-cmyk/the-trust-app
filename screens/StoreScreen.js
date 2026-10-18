import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';


const CATEGORIES = [
  { id: 'airtime', name: 'Airtime', icon: '📱', description: 'Top up any mobile network', borderColor: '#50C878' },
  { id: 'data', name: 'Data Bundles', icon: '📶', description: 'Data for your phone', borderColor: '#003865' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', description: 'Prepaid electricity tokens', borderColor: '#50C878' },
  { id: 'shoprite', name: 'Shoprite & Checkers', icon: '🛒', description: 'Grocery vouchers', borderColor: '#003865' },
  { id: 'lifestyle-vouchers', name: 'Lifestyle Vouchers', icon: '🎁', description: 'Netflix, Uber, HollywoodBets & more', borderColor: '#50C878' },
  { id: 'mzansiway-sim', name: 'Mzansiway SIM', icon: '📲', description: 'Get your Mzansiway SIM card', borderColor: '#FF9800' }
];

export default function StoreScreen({ userData, onNavigate, onBack, theme, onHideTabBar, onShowTabBar }) {
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

  const t = theme || {
    bg: '#003865',
    card: '#0a2545',
    card2: '#082040',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };


  const handleCategoryPress = (category) => {
    onNavigate(category.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView onScroll={_handleScroll} scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 90 }}>
        <View style={[styles.header, { backgroundColor: t.darkMode ? "#003865" : "#003865" }]}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable style={styles.modeToggle} onPress={t.toggle}>
            <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
          </Pressable>
          <View style={styles.logoRow}>

            <Text style={styles.title}>Store</Text>
          </View>
          <Text style={[styles.subtitle, { color: t.text }]}>Shop and earn Home Benefits Points</Text>
          <View style={[styles.balanceCard, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#003865' : '#a0c4ff' }]}>
            <View style={styles.balanceItem}>
              <Text style={[styles.balanceLabel, { color: t.subText }]}>Wallet Balance</Text>
              <Text style={styles.balanceValueOrange}>R{userData.cashWallet.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: t.darkMode ? '#50C878' : '#003865' }]}>Choose a Category</Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: t.darkMode ? '#082040' : '#ffffff', borderColor: category.borderColor }]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: t.text }]}>{category.name}</Text>
                <Text style={[styles.categoryDesc, { color: t.subText }]}>{category.description}</Text>
              </View>
              <View style={[styles.categoryArrow, { backgroundColor: category.borderColor }]}>
                <Text style={styles.categoryArrowText}>→</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.darkMode ? '#1A2F1A' : '#e8fff0' }]}>
          <Text style={styles.infoTitle}>How You Earn Home Benefits Points</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• 2.45% on Shoprite & Checkers</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• 2.28% on Airtime & Data</Text>
          <Text style={[styles.infoText, { color: t.text }]}>• Electricity varies by municipality</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Blue Label, Shoprite & Checkers</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 25, paddingHorizontal: 20, alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', left: 20, top: 22, zIndex: 10, padding: 4 },
  backText: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  modeToggle: { position: 'absolute', right: 20, top: 22, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  modeToggleText: { fontSize: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, color: '#ffffff', fontWeight: 'bold', letterSpacing: 2, marginLeft: 12 },
  subtitle: { fontSize: 13, marginTop: 6, marginBottom: 20 },
  balanceCard: { padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, width: '100%' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceDivider: { width: 1, height: 40 },
  balanceLabel: { fontSize: 11, marginBottom: 4 },
  balanceValueGreen: { fontSize: 22, color: '#50C878', fontWeight: 'bold' },
  balanceValueOrange: { fontSize: 22, color: '#FF9800', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginTop: 25, marginBottom: 15 },
  categoryGrid: { paddingHorizontal: 15 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 2 },
  categoryIcon: { fontSize: 40, marginRight: 15 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  categoryDesc: { fontSize: 13 },
  categoryArrow: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryArrowText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
  infoCard: { padding: 18, borderRadius: 12, marginTop: 10, marginHorizontal: 15, borderWidth: 1, borderColor: '#50C878' },
  infoTitle: { fontSize: 14, color: '#50C878', fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 12, marginVertical: 3, lineHeight: 18 },
  footer: { padding: 25, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#666', fontStyle: 'italic' },
});
