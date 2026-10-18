import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const PROVINCE_COLORS = {
  'Eastern Cape': '#50C878',
  'Free State': '#FF9800',
  'Gauteng': '#002147',
  'KwaZulu-Natal': '#2E7D32',
  'Limpopo': '#F57C00',
  'Mpumalanga': '#1565C0',
  'North West': '#8E24AA',
  'Northern Cape': '#D84315',
  'Western Cape': '#00838F'
};

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

export default function DashboardScreen({ userData, onNavigate, onLogout, theme }) {
  const [stats, setStats] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [tdpData, setTdpData] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [nextInQueue, setNextInQueue] = useState(null);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [titleDeedsIssued, setTitleDeedsIssued] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const memberStatus = userData.propertyAllocated ? 'HOMEOWNER' : 'FUTURE OWNER';
  const memberStatusIcon = userData.propertyAllocated ? '🔑' : '🏠';
  const memberStatusColor = userData.propertyAllocated ? '#FF9800' : '#50C878';
  const memberStatusInfo = userData.propertyAllocated
    ? 'You have been allocated a property and are in the queue for your Title Deed. Keep accumulating Home Points to progress toward full ownership.'
    : 'You are in the queue for your property. Keep spending to earn Home Points and move up the queue.';

  const t = theme || {
    bg: '#121212',
    card: '#1A1A1A',
    card2: '#1E1E1E',
    text: '#ffffff',
    subText: '#aaaaaa',
    darkMode: true,
    toggle: function() {}
  };

  useEffect(() => {
    fetch(`${API_URL}/api/tiers`)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) { setTiers(data.tiers); }
      })
      .catch(function(e) { console.log('Tiers load error'); });

    fetch(`${API_URL}/api/stats/provinces`)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setStats(data);
        setTitleDeedsIssued(data.titleDeedsIssued || 0);
      })
      .catch(function(e) { console.log('Stats load error'); });

    fetch(`${API_URL}/api/tdp/` + userData.memberNumber)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) { setTdpData(data); }
      })
      .catch(function(e) { console.log('TDP load error'); });

    fetch(`${API_URL}/api/notifications/` + userData.memberNumber)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) { setUnreadCount(data.unreadCount); }
      })
      .catch(function(e) { console.log('Notifications load error'); });

    fetch(`${API_URL}/api/campaign/current`)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) { setCampaign(data.campaign); setNextInQueue(data.nextInQueue); }
      })
      .catch(function(e) { console.log('Campaign load error'); });
  }, []);

  const pvProgress = (userData.currentMonthPV / userData.monthlyTarget) * 100;

  const today = new Date();
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((lastDay - today) / (1000 * 60 * 60 * 24));

  const totalMembers = stats ? stats.totalMembers : 1;
  const auctionFund = stats ? stats.auctionFund : 0;
  const auctionTarget = stats ? stats.auctionTarget : 500000;
  const auctionProgress = (auctionFund / auctionTarget) * 100;
  const provinces = stats ? stats.provinces : [];
  const provincesWithMembers = provinces.filter(function(p) { return p.count > 0; });
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  const donutSegments = provincesWithMembers.length > 0 ? provincesWithMembers.map(function(p, i) {
    const fraction = p.count / totalMembers;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const rotation = (accumulated / totalMembers) * 360 - 90;
    accumulated = accumulated + p.count;
    return {
      province: p.province,
      count: p.count,
      color: PROVINCE_COLORS[p.province] || '#888',
      dash: dash,
      gap: gap,
      rotation: rotation
    };
  }) : [];

  const tdpProgress = tdpData && tdpData.progress ? tdpData.progress : {};
  const nearestTier = tdpProgress.bachelor < 100
    ? { tierName: 'Bachelor', progressPercent: tdpProgress.bachelor }
    : tdpProgress['1bed'] < 100
    ? { tierName: '1-Bedroom', progressPercent: tdpProgress['1bed'] }
    : tdpProgress['2bed'] < 100
    ? { tierName: '2-Bedroom', progressPercent: tdpProgress['2bed'] }
    : tdpProgress['3bed'] < 100
    ? { tierName: '3-Bedroom', progressPercent: tdpProgress['3bed'] }
    : null;
  const tdpBalance = tdpData ? tdpData.titleDeedPoints : 0;

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerLeft}>
          <Svg width="40" height="40" viewBox="0 0 400 400">
            <Path d="M 200 40 L 320 90 L 320 230 Q 320 290 200 360 Q 80 290 80 230 L 80 90 Z" fill="#002147" />
            <Path d="M 200 60 L 300 100 L 300 225 Q 300 275 200 335 Q 100 275 100 225 L 100 100 Z" fill="#50C878" />
            <Path d="M 100 100 L 200 60 L 300 100 L 280 115 L 200 85 L 120 115 Z" fill="#002147" />
            <Rect x="185" y="260" width="30" height="40" fill="#002147" />
          </Svg>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: t.text }]}>Welcome back,</Text>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={[styles.memberNumber, { color: t.text }]}>{userData.memberNumber}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: memberStatusColor + '22', borderColor: memberStatusColor }]}>
                <Text style={[styles.statusText, { color: memberStatusColor }]}>{memberStatusIcon} {memberStatus}</Text>
              </View>
              <Pressable onPress={() => setShowStatusInfo(!showStatusInfo)} style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ℹ️</Text>
              </Pressable>
            </View>
            {showStatusInfo && (
              <View style={[styles.statusInfoBox, { backgroundColor: t.card2, borderColor: memberStatusColor }]}>
                <Text style={[styles.statusInfoText, { color: t.text }]}>{memberStatusInfo}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.bellBtn} onPress={function() { onNavigate('notifications'); }}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.modeToggle} onPress={t.toggle}>
            <Text style={styles.modeToggleText}>{t.darkMode ? '☀️' : '🌙'}</Text>
          </Pressable>
          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#002147' : '#a0c4ff' }]}>
          <Text style={styles.heroTitle}>Mzansiway Overview</Text>

          <View style={[styles.titleDeedsRow, { backgroundColor: t.darkMode ? '#1a3a2a' : '#e8fff0', borderColor: '#50C878' }]}>
            <Text style={styles.titleDeedsIcon}>🏆</Text>
            <View style={styles.titleDeedsInfo}>
              <Text style={styles.titleDeedsLabel}>Title Deeds Issued</Text>
              <Text style={styles.titleDeedsValue}>{titleDeedsIssued}</Text>
            </View>
            <View style={styles.titleDeedsMembersBox}>
              <Text style={styles.titleDeedsMembersLabel}>Total Members</Text>
              <Text style={styles.titleDeedsMembersValue}>{totalMembers}</Text>
            </View>
          </View>

          <View style={styles.donutWrapper}>
            <Svg width="220" height="220" viewBox="0 0 220 220">
              <Circle cx="110" cy="110" r="80" fill="none" stroke={t.darkMode ? '#1E1E1E' : '#dddddd'} strokeWidth="24" />
              {donutSegments.map(function(seg, i) {
                return (
                  <Circle key={i} cx="110" cy="110" r="80" fill="none" stroke={seg.color} strokeWidth="24"
                    strokeDasharray={seg.dash + ' ' + seg.gap}
                    transform={'rotate(' + seg.rotation + ' 110 110)'}
                  />
                );
              })}
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={[styles.donutAuctionLabel, { color: t.text }]}>Title Deed Fund</Text>
              <Text style={styles.donutAuctionValue}>R{auctionFund.toFixed(0)}</Text>
              <Text style={styles.donutMembers}>{totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}</Text>
            </View>
          </View>

          {campaign ? (
            <View style={[styles.campaignCard, { backgroundColor: t.darkMode ? '#0D1F0D' : '#e8fff0', borderColor: '#50C878' }]}>
              <Text style={styles.campaignTitle}>🏠 CURRENT CAMPAIGN</Text>
              <Text style={[styles.campaignMember, { color: t.text }]}>
                Raising for: <Text style={styles.campaignHighlight}>{campaign.memberName}'s {campaign.tierName} unit</Text>
              </Text>
              <View style={[styles.auctionBar, { backgroundColor: t.darkMode ? '#1E1E1E' : '#dddddd', marginTop: 8 }]}>
                <View style={[styles.auctionBarFill, { width: Math.min(parseFloat(campaign.progress), 100) + '%' }]} />
              </View>
              <Text style={[styles.auctionTargetText, { color: t.text }]}>
                R{parseFloat(campaign.raised).toFixed(0)} of R{campaign.target.toLocaleString()} target ({campaign.progress}%)
              </Text>
              {nextInQueue && (
                <Text style={[styles.campaignNext, { color: t.subText }]}>Next in queue: {nextInQueue.memberName}'s {nextInQueue.tierName}</Text>
              )}
            </View>
          ) : (
            <View>
              <View style={[styles.auctionBar, { backgroundColor: t.darkMode ? '#1E1E1E' : '#dddddd' }]}>
                <View style={[styles.auctionBarFill, { width: Math.min(auctionProgress, 100) + '%' }]} />
              </View>
              <Text style={[styles.auctionTargetText, { color: t.text }]}>R{auctionFund.toFixed(0)} of R{auctionTarget.toLocaleString()} target ({auctionProgress.toFixed(2)}%)</Text>
            </View>
          )}
          <Text style={styles.liveDrawText}>Live Draw: Daily at 20h30 on YouTube</Text>
        </View>

        {provincesWithMembers.length > 0 && (
          <View style={[styles.legendCard, { backgroundColor: t.card2, borderColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]}>
            <Text style={styles.legendTitle}>Members by Province</Text>
            {provincesWithMembers.map(function(p, i) {
              const percent = ((p.count / totalMembers) * 100).toFixed(0);
              return (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: PROVINCE_COLORS[p.province] || '#888' }]} />
                  <Text style={[styles.legendProvince, { color: t.text }]}>{p.province}</Text>
                  <Text style={[styles.legendCount, { color: t.text }]}>{p.count} ({percent}%)</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={[styles.countdownCard, { backgroundColor: t.card2, borderColor: '#FF9800' }]}>
          <Text style={styles.countdownIcon}>⏰</Text>
          <View style={styles.countdownContent}>
            <Text style={styles.countdownNumber}>{daysRemaining}</Text>
            <Text style={[styles.countdownLabel, { color: t.text }]}>Days Until Month End</Text>
            <Text style={styles.countdownSubtext}>Keep earning to maintain your position</Text>
          </View>
        </View>

        <View style={[styles.tdpCard, { backgroundColor: t.darkMode ? '#0F2F1F' : '#e8fff0' }]}>
          <View style={styles.tdpHeader}>
            <Text style={styles.tdpTitle}>🏠 Title Deed Points</Text>
            <Text style={styles.tdpBalance}>{tdpBalance.toFixed(2)} TDPs</Text>
          </View>
          {nearestTier ? (
            <View>
              <Text style={[styles.tdpMessage, { color: t.text }]}>
                You have earned {tdpBalance.toFixed(2)} TDPs. You are {(100 - parseFloat(nearestTier.progressPercent)).toFixed(2)}% away from your {nearestTier.tierName} title deed. Keep pushing! 💪
              </Text>
              <View style={[styles.tdpBarContainer, { backgroundColor: t.darkMode ? '#1E1E1E' : '#dddddd' }]}>
                <View style={[styles.tdpBarFill, { width: Math.min(parseFloat(nearestTier.progressPercent), 100) + '%' }]} />
              </View>
              <Text style={styles.tdpBarLabel}>{parseFloat(nearestTier.progressPercent).toFixed(2)}% toward {nearestTier.tierName}</Text>
            </View>
          ) : (
            <Text style={[styles.tdpMessage, { color: t.text }]}>🎉 Congratulations! You have earned all title deeds!</Text>
          )}
          <Pressable style={styles.tdpBtn} onPress={function() { onNavigate('titledeedpoints'); }}>
            <Text style={styles.tdpBtnText}>View Full Progress →</Text>
          </Pressable>
        </View>

        {tiers.length > 0 && (
          <View style={[styles.tiersCard, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
            <View style={styles.tiersHeader}>
              <Text style={styles.tiersTitle}>House Tier Qualification</Text>
            </View>
            <Text style={[styles.tiersCurrent, { color: t.text }]}>You this month: {userData.currentMonthPV.toFixed(2)} Home Points</Text>
            {tiers.map(function(tier) {
              const qualifies = userData.currentMonthPV >= tier.minPV;
              const needed = tier.minPV - userData.currentMonthPV;
              return (
                <View key={tier.id} style={[styles.tierRow, qualifies && styles.tierRowQualified, { borderBottomColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]}>
                  <View style={styles.tierLeft}>
                    <Text style={[styles.tierCheck, qualifies ? styles.tierCheckYes : styles.tierCheckNo]}>{qualifies ? '✓' : '○'}</Text>
                    <View style={styles.tierInfo}>
                      <Text style={[styles.tierName, { color: t.text }]}>{tier.name}</Text>
                    </View>
                  </View>
                  <View style={styles.tierRight}>
                    <Text style={qualifies ? styles.tierPVQualified : [styles.tierPV, { color: t.text }]}>{tier.minPV} pts</Text>
                    {!qualifies && needed > 0 && (
                      <Text style={styles.tierNeeded}>Need {needed.toFixed(0)} more</Text>
                    )}
                    {qualifies && (
                      <Text style={styles.tierQualified}>You qualify</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCardGreen, { backgroundColor: t.darkMode ? '#1A2F1A' : '#e8fff0' }]}>
            <Text style={[styles.statLabel, { color: t.text }]}>Home Points</Text>
            <Text style={styles.statValueGreen}>{userData.points.toFixed(2)}</Text>
            <View style={[styles.progressBarSmall, { backgroundColor: t.darkMode ? '#121212' : '#dddddd' }]}>
              <View style={[styles.progressFillGreen, { width: Math.min(pvProgress, 100) + '%' }]} />
            </View>
            <Text style={styles.statSubtext}>{userData.currentMonthPV.toFixed(2)} / {userData.monthlyTarget} this month</Text>
          </View>
          <View style={[styles.statCardBlue, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff' }]}>
            <Text style={[styles.statLabel, { color: t.text }]}>Queue Position</Text>
            <Text style={[styles.statValueBlue, { color: t.text }]}>#{userData.queuePosition}</Text>
            <Text style={styles.statSubtext}>Keep earning to hold your spot</Text>
          </View>
        </View>

        <View style={[styles.walletCard, { backgroundColor: t.card2, borderColor: '#50C878' }]}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletValue}>R{userData.cashWallet.toFixed(2)}</Text>
          <Pressable style={styles.topUpBtn} onPress={function() { onNavigate('topup'); }}>
            <Text style={styles.topUpBtnText}>Top Up Wallet</Text>
          </Pressable>
        </View>

        <View style={[styles.referralCard, { backgroundColor: t.darkMode ? '#0A1628' : '#e8f4ff', borderColor: t.darkMode ? '#002147' : '#a0c4ff' }]}>
          <Text style={styles.referralLabel}>Your Referrals</Text>
          <Text style={[styles.referralValue, { color: t.text }]}>{userData.totalReferrals} Members</Text>
          <Text style={[styles.referralCodeLabel, { color: t.subText }]}>Share your referral code with friends:</Text>
          <Text style={styles.referralCode}>{userData.referralCode}</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.quickTitle, { color: t.darkMode ? '#50C878' : '#111111' }]}>Quick Actions</Text>
          <Pressable style={[styles.actionBtn, { backgroundColor: t.card2, borderColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]} onPress={function() { onNavigate('store'); }}>
            <Text style={styles.actionIcon}>🛒</Text>
            <Text style={[styles.actionText, { color: t.text }]}>Shop and Earn Home Points</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: t.card2, borderColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]} onPress={function() { onNavigate('titledeedpoints'); }}>
            <Text style={styles.actionIcon}>🏠</Text>
            <Text style={[styles.actionText, { color: t.text }]}>My Title Deed Points</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: t.card2, borderColor: t.darkMode ? '#2A2A2A' : '#dddddd' }]} onPress={function() { onNavigate('2fa-setup'); }}>
            <Text style={styles.actionIcon}>🔐</Text>
            <Text style={[styles.actionText, { color: t.text }]}>Enable 2FA Security</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpace} /></ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { marginLeft: 12, flex: 1 },
  greeting: { fontSize: 12 },
  name: { fontSize: 20, color: '#50C878', fontWeight: 'bold', marginTop: 2 },
  memberNumber: { fontSize: 12, marginTop: 2, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  infoIcon: { padding: 2 },
  infoIconText: { fontSize: 14 },
  statusInfoBox: { marginTop: 8, padding: 10, borderRadius: 8, borderWidth: 1, maxWidth: 220 },
  statusInfoText: { fontSize: 11, lineHeight: 16 },
  bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellIcon: { fontSize: 18 },
  bellBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modeToggle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,152,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  modeToggleText: { fontSize: 18 },
  logoutBtn: { backgroundColor: '#002147', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  heroCard: { padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center', borderWidth: 2 },
  heroTitle: { fontSize: 16, color: '#50C878', fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  titleDeedsRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 15, width: '100%' },
  titleDeedsIcon: { fontSize: 28, marginRight: 12 },
  titleDeedsInfo: { flex: 1 },
  titleDeedsLabel: { fontSize: 11, color: '#50C878', fontWeight: 'bold' },
  titleDeedsValue: { fontSize: 28, color: '#50C878', fontWeight: 'bold' },
  titleDeedsMembersBox: { alignItems: 'flex-end' },
  titleDeedsMembersLabel: { fontSize: 11, color: '#888' },
  titleDeedsMembersValue: { fontSize: 20, color: '#FF9800', fontWeight: 'bold' },
  donutWrapper: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 15 },
  donutCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutAuctionLabel: { fontSize: 11 },
  donutAuctionValue: { fontSize: 26, color: '#FF9800', fontWeight: 'bold', marginTop: 2 },
  donutMembers: { fontSize: 12, color: '#50C878', marginTop: 4, fontWeight: 'bold' },
  auctionBar: { height: 8, borderRadius: 4, width: '100%', marginTop: 10, overflow: 'hidden' },
  auctionBarFill: { backgroundColor: '#50C878', height: '100%' },
  auctionTargetText: { fontSize: 11, marginTop: 6 },
  liveDrawText: { fontSize: 10, color: '#888', marginTop: 4, fontStyle: 'italic' },
  legendCard: { padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1 },
  legendTitle: { fontSize: 14, color: '#50C878', fontWeight: 'bold', marginBottom: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  legendDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendProvince: { fontSize: 13, flex: 1 },
  legendCount: { fontSize: 13, fontWeight: 'bold' },
  countdownCard: { padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 2, flexDirection: 'row', alignItems: 'center' },
  countdownIcon: { fontSize: 36, marginRight: 15 },
  countdownContent: { flex: 1 },
  countdownNumber: { fontSize: 32, color: '#FF9800', fontWeight: 'bold' },
  countdownLabel: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  countdownSubtext: { fontSize: 11, color: '#888', marginTop: 2 },
  tdpCard: { padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 2, borderColor: '#50C878' },
  tdpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tdpTitle: { fontSize: 16, color: '#50C878', fontWeight: 'bold' },
  tdpBalance: { fontSize: 18, color: '#FF9800', fontWeight: 'bold' },
  tdpMessage: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  tdpBarContainer: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  tdpBarFill: { backgroundColor: '#50C878', height: '100%', borderRadius: 5, minWidth: 4 },
  tdpBarLabel: { fontSize: 11, color: '#888', marginBottom: 12 },
  tdpBtn: { backgroundColor: '#50C878', padding: 12, borderRadius: 10, alignItems: 'center' },
  tdpBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  statCardGreen: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#50C878' },
  statCardBlue: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#002147' },
  statLabel: { fontSize: 11, marginBottom: 4 },
  statValueGreen: { fontSize: 26, color: '#50C878', fontWeight: 'bold' },
  statValueBlue: { fontSize: 26, fontWeight: 'bold' },
  progressBarSmall: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8, marginBottom: 4 },
  progressFillGreen: { backgroundColor: '#50C878', height: '100%' },
  statSubtext: { fontSize: 10, color: '#888', marginTop: 4 },
  walletCard: { padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 2 },
  walletLabel: { fontSize: 14, color: '#50C878', fontWeight: 'bold', marginBottom: 8 },
  walletValue: { fontSize: 32, color: '#FF9800', fontWeight: 'bold', marginBottom: 12 },
  topUpBtn: { backgroundColor: '#50C878', padding: 12, borderRadius: 10 },
  topUpBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  referralCard: { padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 2 },
  referralLabel: { fontSize: 14, color: '#50C878', fontWeight: 'bold', marginBottom: 4 },
  referralValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  referralCodeLabel: { fontSize: 11 },
  referralCode: { fontSize: 18, color: '#50C878', fontWeight: 'bold', marginTop: 4, letterSpacing: 1 },
  quickActions: { marginBottom: 20 },
  quickTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  actionBtn: { padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  actionIcon: { fontSize: 24, marginRight: 12 },
  actionText: { fontSize: 14, fontWeight: 'bold' },
  bottomSpace: { height: 100 },
  tiersCard: { padding: 16, borderRadius: 12, marginBottom: 15, borderWidth: 2 },
  tiersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tiersTitle: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  tiersCurrent: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  tierRowQualified: { backgroundColor: '#0F2F1F', paddingHorizontal: 8, borderRadius: 6, marginVertical: 2, borderBottomWidth: 0 },
  tierLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tierCheck: { fontSize: 18, marginRight: 10, fontWeight: 'bold' },
  tierCheckYes: { color: '#50C878' },
  tierCheckNo: { color: '#666' },
  tierInfo: { flex: 1 },
  tierName: { fontSize: 13, fontWeight: 'bold' },
  tierRight: { alignItems: 'flex-end' },
  tierPV: { fontSize: 14, fontWeight: 'bold' },
  tierPVQualified: { fontSize: 14, color: '#50C878', fontWeight: 'bold' },
  tierNeeded: { fontSize: 10, color: '#FF9800', marginTop: 2 },
  tierQualified: { fontSize: 10, color: '#50C878', fontWeight: 'bold', marginTop: 2 },
  campaignCard: { borderWidth: 2, borderRadius: 12, padding: 14, marginTop: 10 },
  campaignTitle: { fontSize: 12, fontWeight: 'bold', color: '#50C878', letterSpacing: 2, marginBottom: 6 },
  campaignMember: { fontSize: 14, marginBottom: 4 },
  campaignHighlight: { color: '#FF9800', fontWeight: 'bold' },
  campaignNext: { fontSize: 11, marginTop: 6, fontStyle: 'italic' },

  simComingSoonTile: {
    backgroundColor: '#0A1628',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a3060',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    opacity: 0.75,
    marginTop: 12,
    width: '100%',
  },
  simComingSoonBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  simComingSoonBadgeText: {
    color: '#003865',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  simComingSoonIcon: { fontSize: 36, marginBottom: 8 },
  simComingSoonTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  simComingSoonSub: { fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' },
});

