import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform } from 'react-native';

import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import RegistrationSuccessScreen from './screens/RegistrationSuccessScreen';
import DashboardScreen from './screens/DashboardScreen';
import StoreScreen from './screens/StoreScreen';
import ShopriteScreen from './screens/ShopriteScreen';
import BluelabelAirtimeScreen from './screens/BluelabelAirtimeScreen';
import DataBundlesScreen from './screens/DataBundlesScreen';
import ElectricityScreen from './screens/ElectricityScreen';
import PaymentScreen from './screens/PaymentScreen';
import WalletTopUpScreen from './screens/WalletTopUpScreen';
import TwoFactorSetupScreen from './screens/TwoFactorSetupScreen';
import ReferralScreen from './screens/ReferralScreen';
import TitleDeedPointsScreen from './screens/TitleDeedPointsScreen';
import PropertyRegisterScreen from './screens/PropertyRegisterScreen';
import AllocationOfferScreen from './screens/AllocationOfferScreen';
import LifestyleVouchersScreen from './screens/LifestyleVouchersScreen';
import AccountantLoginScreen from './screens/AccountantLoginScreen';
import AccountantDashboardScreen from './screens/AccountantDashboardScreen';
import NotificationScreen from './screens/NotificationScreen';
import AdminAuditScreen from './screens/AdminAuditScreen';

function AppInner() {
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userData, setUserData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [accountantData, setAccountantData] = useState(null);

  // Auto-hide tab bar
  const tabBarAnim = React.useRef(new Animated.Value(0)).current;
  const TAB_HEIGHT = 70;
  const hideTabBar = React.useCallback(() => {
    Animated.timing(tabBarAnim, { toValue: TAB_HEIGHT, duration: 200, useNativeDriver: true }).start();
  }, []);
  const showTabBar = React.useCallback(() => {
    Animated.timing(tabBarAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, []);

  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const [darkMode, setDarkMode] = useState(getAutoTheme());

  useEffect(function() {
    const interval = setInterval(function() {
      setDarkMode(getAutoTheme());
    }, 60000);
    return function() { clearInterval(interval); };
  }, []);

  const toggleDarkMode = function() {
    setDarkMode(function(prev) { return !prev; });
  };

  const theme = {
    darkMode: darkMode,
    toggle: toggleDarkMode,
    bg: darkMode ? '#0a0a0a' : '#f5f5f5',
    card: darkMode ? '#111111' : '#ffffff',
    card2: darkMode ? '#1a1a1a' : '#eeeeee',
    text: darkMode ? '#ffffff' : '#111111',
    subText: darkMode ? '#aaaaaa' : '#555555',
    border: darkMode ? 'rgba(255,152,0,0.15)' : 'rgba(255,152,0,0.3)',
    tabBg: darkMode ? '#1A1A1A' : '#ffffff',
    tabBorder: darkMode ? '#2A2A2A' : '#dddddd',
    tabLabel: darkMode ? '#888888' : '#555555',
  };

  const handleLogin = (user) => {
    setUserData(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentScreen('welcome');
  };

  const refreshUserData = async () => {
    if (!userData) return;
    try {
      const response = await fetch('https://mzansiway-backend-production.up.railway.app/api/user/' + userData.memberNumber);
      const data = await response.json();
      if (data.user) setUserData(data.user);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => setCurrentScreen('welcome')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onLogin={() => setCurrentScreen('login')}
          onRegister={() => setCurrentScreen('register')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'accountant-login' && (
        <AccountantLoginScreen
          onLoginSuccess={(data) => { setAccountantData(data); setCurrentScreen('accountant-dashboard'); }}
          onBack={() => setCurrentScreen('welcome')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'accountant-dashboard' && accountantData && (
        <AccountantDashboardScreen
          accountantData={accountantData}
          onLogout={() => { setAccountantData(null); setCurrentScreen('welcome'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLogin}
          onBack={() => setCurrentScreen('welcome')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'register' && (
        <RegistrationScreen
          onBack={() => setCurrentScreen('welcome')}
          onNavigateToLogin={() => setCurrentScreen('login')}
          creditType="home"
          onRegisterSuccess={(result) => {
            setRegistrationResult(result);
            setCurrentScreen('registration-success');
          }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'registration-success' && registrationResult && (
        <RegistrationSuccessScreen
          memberNumber={registrationResult.memberNumber}
          queuePosition={registrationResult.queuePosition}
          fullName={registrationResult.fullName}
          onContinue={() => {
            setRegistrationResult(null);
            setCurrentScreen('login');
          }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'dashboard' && userData && (
        <DashboardScreen
          userData={userData}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLogout={handleLogout}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'store' && userData && (
        <StoreScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          onNavigate={(screen) => {
            if (screen === 'airtime') setCurrentScreen('bluelabel-airtime');
            else if (screen === 'shoprite') setCurrentScreen('shoprite');
            else if (screen === 'data') setCurrentScreen('data-bundles');
            else if (screen === 'electricity') setCurrentScreen('electricity');
            else if (screen === 'variable-voucher') setCurrentScreen('variable-voucher');
            else if (screen === 'lifestyle-vouchers') setCurrentScreen('lifestyle-vouchers');
            else if (screen === 'mzansiway-sim') setCurrentScreen('mzansiway-sim');
          }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'shoprite' && userData && (
        <ShopriteScreen
          userData={userData}
          onBack={() => { refreshUserData(); setCurrentScreen('store'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'bluelabel-airtime' && userData && (
        <BluelabelAirtimeScreen
          userData={userData}
          onBack={() => { refreshUserData(); setCurrentScreen('store'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'data-bundles' && userData && (
        <DataBundlesScreen
          route={{ params: { memberNumber: userData.memberNumber } }}
          navigation={{ goBack: () => { refreshUserData(); setCurrentScreen('store'); } }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'electricity' && userData && (
        <ElectricityScreen
          userData={userData}
          onBack={() => { refreshUserData(); setCurrentScreen('store'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'payment' && userData && paymentData && (
        <PaymentScreen
          amount={paymentData.amount}
          productType={paymentData.productType}
          pvEarned={paymentData.pvEarned}
          userData={userData}
          onSuccess={() => { setPaymentData(null); refreshUserData(); setCurrentScreen('store'); }}
          onCancel={() => { setPaymentData(null); setCurrentScreen('store'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'topup' && userData && (
        <WalletTopUpScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'audit' && userData && userData.isAdmin && (
        <AdminAuditScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          hideTabBar={hideTabBar}
          showTabBar={showTabBar}
        />
      )}

      {currentScreen === '2fa-setup' && userData && (
        <TwoFactorSetupScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'notifications' && userData && (
        <NotificationScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          onNavigate={(screen) => setCurrentScreen(screen)}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'referral' && userData && (
        <ReferralScreen
          userData={userData}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'titledeedpoints' && userData && (
        <TitleDeedPointsScreen
          route={{ params: { memberNumber: userData.memberNumber, currentMonthPV: userData.currentMonthPV } }}
          navigation={{ goBack: () => setCurrentScreen('dashboard') }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}


      {currentScreen === 'mzansiway-sim' && (
        <ComingSoonScreen
          title="Mzansiway SIM"
          message="Our own SIM card is coming soon! Buy data and airtime while earning Housing Points."
          onBack={() => setCurrentScreen('store')}
        />
      )}


      {currentScreen === 'lifestyle-vouchers' && userData && (
        <LifestyleVouchersScreen
          userData={userData}
          route={{ params: { memberNumber: userData.memberNumber, walletBalance: userData.cashWallet } }}
          navigation={{ goBack: () => { refreshUserData(); setCurrentScreen('store'); } }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'propertyregister' && userData && (
        <PropertyRegisterScreen
          userData={userData}
          navigation={{ goBack: () => setCurrentScreen('dashboard') }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen === 'allocationoffer' && userData && (
        <AllocationOfferScreen
          userData={userData}
          onBack={function() { setCurrentScreen('dashboard'); }}
          theme={theme}
          onHideTabBar={hideTabBar}
          onShowTabBar={showTabBar}
        />
      )}

      {currentScreen !== 'splash' &&
       currentScreen !== 'welcome' &&
       currentScreen !== 'login' &&
       currentScreen !== 'register' &&
       currentScreen !== 'registration-success' &&
       currentScreen !== '2fa-setup' &&
       currentScreen !== 'payment' &&
       currentScreen !== 'admin' &&
       currentScreen !== 'accountant-login' &&
       currentScreen !== 'accountant-dashboard' && (
        <Animated.View style={[styles.tabBar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder, transform: [{ translateY: tabBarAnim }], paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 20 : 16) }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('dashboard')}>
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('topup')}>
            <Text style={styles.tabIcon}>💳</Text>
            <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('store')}>
            <Text style={styles.tabIcon}>🛒</Text>
            <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Store</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('referral')}>
            <Text style={styles.tabIcon}>👥</Text>
            <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Referrals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('propertyregister')}>
            <Text style={styles.tabIcon}>🏘️</Text>
            <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Properties</Text>
          </TouchableOpacity>
          {userData && userData.isAdmin && (
            <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('audit')}>
              <Text style={styles.tabIcon}>📊</Text>
              <Text style={[styles.tabLabel, { color: theme.tabLabel }]}>Audit</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: '100vh', overflow: 'hidden' },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'visible', flexDirection: 'row', borderTopWidth: 2, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 24, marginBottom: 4 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});


const ComingSoonScreen = ({ title, message, onBack }) => (
  <View style={{ flex: 1, backgroundColor: '#ffffff', padding: 24, paddingTop: 60 }}>
    <TouchableOpacity onPress={onBack} style={{ marginBottom: 24 }}>
      <Text style={{ color: '#2e7d32', fontSize: 16 }}>← Back</Text>
    </TouchableOpacity>
    <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 }}>📱 {title}</Text>
    <View style={{ backgroundColor: '#e8f5e9', borderRadius: 12, padding: 20, marginTop: 16 }}>
      <Text style={{ fontSize: 16, color: '#2e7d32', fontWeight: 'bold', marginBottom: 8 }}>Coming Soon</Text>
      <Text style={{ fontSize: 14, color: '#444444', lineHeight: 22 }}>{message}</Text>
    </View>
  </View>
);


export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}
