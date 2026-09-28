import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const NOTIFICATION_ICONS = {
  airtime: '📱', data: '📊', electricity: '⚡', shoprite: '🛒',
  lifestyle: '🎫', draw: '🎯', system: '🔔', allocation: '🏠'
};

export default function NotificationScreen({ userData, onBack, onNavigate, theme }) {
  if (!userData) return null;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = theme || { bg: '#121212', card: '#1A1A1A', card2: '#1E1E1E', text: '#ffffff', subText: '#aaaaaa', darkMode: true };

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(API_URL + '/api/notifications/' + userData.memberNumber);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
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

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const showDrawReminder = (hour === 19 && minute >= 30) || hour === 20 || (hour === 21 && minute === 0);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        <Text style={[styles.headerSub, { color: t.subText }]}>{userData.name}</Text>
      </View>
      <ScrollView style={styles.scroll}>
        {showDrawReminder ? (
          <View style={styles.drawBanner}>
            <Text style={styles.drawBannerIcon}>🎯</Text>
            <View style={styles.drawBannerContent}>
              <Text style={styles.drawBannerTitle}>Live Draw Tonight at 20:30!</Text>
              <Text style={styles.drawBannerMsg}>To participate in tonight's draw you must have made a purchase today.</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.drawReminderCard, { backgroundColor: t.card2, borderColor: '#FF9800' }]}>
            <Text style={styles.drawReminderIcon}>🎯</Text>
            <View style={styles.drawReminderContent}>
              <Text style={styles.drawReminderTitle}>Daily Live Draw — 20:30 Every Night</Text>
              <Text style={[styles.drawReminderMsg, { color: t.subText }]}>Remember: to qualify for tonight's draw you must make at least one purchase today. Every rand you spend earns you entries. The more you spend, the more entries you get!</Text>
              <Text style={styles.drawReminderSub}>Your entries reset daily. Shop now to participate! 🛒</Text>
            </View>
          </View>
        )}
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
  drawBanner: { backgroundColor: '#FF9800', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  drawBannerIcon: { fontSize: 32, marginRight: 12 },
  drawBannerContent: { flex: 1 },
  drawBannerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  drawBannerMsg: { color: '#fff', fontSize: 13, lineHeight: 18 },
  drawReminderCard: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15, borderWidth: 2 },
  drawReminderIcon: { fontSize: 28, marginRight: 12 },
  drawReminderContent: { flex: 1 },
  drawReminderTitle: { color: '#FF9800', fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  drawReminderMsg: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  drawReminderSub: { color: '#50C878', fontSize: 12, fontWeight: 'bold' },
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
