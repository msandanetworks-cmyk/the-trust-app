import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const NOTIFICATION_ICONS = {
  airtime: '📱', data: '📡', electricity: '⚡', shoprite: '🛒',
  lifestyle: '🎁', draw: '🏆', system: '🔔', allocation: '🏠'
};


export default function NotificationScreen({ userData, onBack, onNavigate, theme, onHideTabBar, onShowTabBar }) {
  const _lastScrollY = useRef(0);
  const _handleScroll = React.useCallback(({ nativeEvent }) => {
    const currentY = nativeEvent.contentOffset.y;
    if (currentY > _lastScrollY.current + 5) {
      onHideTabBar && onHideTabBar();
    } else if (currentY < _lastScrollY.current - 5) {
      onShowTabBar && onShowTabBar();
    }
    _lastScrollY.current = currentY;
  }, [onHideTabBar, onShowTabBar]);

  if (!userData) return null;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = theme || { bg: '#003865', card: '#0a2545', card2: '#082040', text: '#ffffff', subText: '#aaaaaa', darkMode: true };

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(API_URL + '/api/notifications/' + userData.memberNumber);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        const hasUnread = data.notifications.some(n => !n.read);
        await fetch(API_URL + '/api/notifications/mark-read/' + userData.memberNumber, { method: 'POST' });
      }
    } catch (err) { console.error('Notifications error:', err); }
    finally { setLoading(false); }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    return days + 'd ago';
  };

  const handleNotifPress = (notif) => {
    if (notif.type === 'allocation' && onNavigate) {
      onNavigate('allocationoffer');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>

      <View style={[styles.header, { backgroundColor: t.card }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        <Text style={[styles.headerSub, { color: t.subText }]}>{userData.name}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 90 }} onScroll={_handleScroll} scrollEventThrottle={16}>
        {loading ? (
          <Text style={[styles.emptyText, { color: t.subText }]}>Loading...</Text>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyText, { color: t.subText }]}>No notifications yet.</Text>
            <Text style={[styles.emptySubText, { color: t.subText }]}>Your transaction updates will appear here.</Text>
          </View>
        ) : (
          notifications.map(function(notif) {
            const isAllocation = notif.type === 'allocation';
            const CardComponent = isAllocation ? TouchableOpacity : View;
            return (
              <CardComponent
                key={notif.id}
                onPress={isAllocation ? () => handleNotifPress(notif) : undefined}
                style={[
                  styles.notifCard,
                  { backgroundColor: notif.read ? t.card2 : (t.darkMode ? '#1a2a1a' : '#e8fff0') },
                  { borderLeftColor: notif.success ? '#50C878' : '#FF4444' },
                  !notif.read && styles.notifUnread,
                  isAllocation && styles.notifAllocation,
                ]}
              >
                <Text style={styles.notifIcon}>{NOTIFICATION_ICONS[notif.type] || '🔔'}</Text>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: notif.success ? '#50C878' : '#FF4444' }]}>{notif.title}</Text>
                  <Text style={[styles.notifMessage, { color: t.text }]}>{notif.message}</Text>
                  <Text style={[styles.notifTime, { color: t.subText }]}>{formatTime(notif.timestamp)}</Text>
                  {isAllocation && (
                    <Text style={styles.notifTapHint}>Tap to view your offer →</Text>
                  )}
                </View>
              </CardComponent>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 30 },
  backArrow: { color: '#FF9800', fontSize: 16, marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { fontSize: 13, marginTop: 2 },
  scroll: { flex: 1, padding: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  emptySubText: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  notifCard: { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  notifUnread: { borderWidth: 1, borderColor: '#50C87855' },
  notifAllocation: { borderColor: '#FF9800', borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  notifIcon: { fontSize: 26, marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  notifMessage: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11 },
  notifTapHint: { color: '#FF9800', fontSize: 12, fontWeight: 'bold', marginTop: 6 },
});

