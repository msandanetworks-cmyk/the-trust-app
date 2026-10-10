import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Animated, Dimensions,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const BACKEND = 'https://mzansiway-backend-production.up.railway.app';
const ORANGE  = '#F7941D';
const GREEN   = '#2ECC71';
const BLUE    = '#3498DB';
const PURPLE  = '#9B59B6';
const RED     = '#E74C3C';

// ── Minimal SVG pie chart (pure RN, no library) ────────────────────────────
function PieChart({ slices, size = 160 }) {
  const r = size / 2;
  let cumAngle = -Math.PI / 2; // start at 12 o'clock

  const paths = slices.map((s, i) => {
    if (s.pct <= 0) return null;
    const angle = s.pct * 2 * Math.PI;
    const x1 = r + r * Math.cos(cumAngle);
    const y1 = r + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = r + r * Math.cos(cumAngle);
    const y2 = r + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return (
      <React.Fragment key={i}>
        {/* Draw via View-based approach since SVG needs react-native-svg */}
      </React.Fragment>
    );
  });

  // We'll use a canvas-style approach with View segments and transform
  // Build coloured arc segments using border-radius + overflow trick
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {slices.map((s, i) => {
        if (s.pct <= 0) return null;
        return (
          <PieSlice
            key={i}
            color={s.color}
            pct={s.pct}
            startPct={slices.slice(0, i).reduce((acc, x) => acc + x.pct, 0)}
            size={size}
          />
        );
      })}
      {/* Centre hole */}
      <View style={{
        position: 'absolute',
        left: size * 0.25,
        top: size * 0.25,
        width: size * 0.5,
        height: size * 0.5,
        borderRadius: size * 0.25,
        backgroundColor: '#1a1a2e',
      }} />
    </View>
  );
}

// Render a single pie slice using the clip technique
function PieSlice({ color, pct, startPct, size }) {
  const deg = startPct * 360;
  const span = pct * 360;
  const r = size / 2;

  // We render two half-discs when span > 180
  if (span <= 180) {
    return (
      <View style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', left: 0, top: 0,
          width: size, height: size,
          borderRadius: r,
          backgroundColor: color,
          transform: [{ rotate: deg + 'deg' }],
          overflow: 'hidden',
        }}>
          {/* Clip the right half to show only the slice portion */}
          <View style={{
            position: 'absolute',
            left: r, top: 0,
            width: r, height: size,
            backgroundColor: '#1a1a2e',
            transform: [{ rotate: (180 - span) + 'deg' }, { translateX: -r / 2 }, { translateY: 0 }],
            transformOrigin: 'left center',
          }} />
        </View>
      </View>
    );
  }

  // For slices > 180 degrees, fall back to just showing a coloured arc label
  return (
    <View style={{
      position: 'absolute', left: 0, top: 0,
      width: size, height: size,
      borderRadius: r,
      backgroundColor: color,
      transform: [{ rotate: deg + 'deg' }],
    }} />
  );
}


// ── Housing Upgrade Algorithm ──────────────────────────────────────────────
function UpgradeAlgorithm({ result, theme }) {
  const t = theme || {};
  const card  = t.card  || '#16213e';
  const card2 = t.card2 || '#1a1a2e';
  const text  = t.text  || '#ffffff';
  const sub   = t.subText || '#8a8a9a';

  const ORANGE = '#F7941D';
  const GREEN  = '#2ECC71';
  const BLUE   = '#3498DB';
  const PURPLE = '#9B59B6';

  // Tier definitions
  const TIERS = [
    { key: 'bachelor',  label: '🛏  Bachelor',   pvPerMonth: 50,  months: 6,  referrals: 10  },
    { key: '1bed',      label: '🏠 1 Bedroom',   pvPerMonth: 100, months: 9,  referrals: 20  },
    { key: '2bed',      label: '🏡 2 Bedroom',   pvPerMonth: 150, months: 12, referrals: 35  },
    { key: '3bed',      label: '🏘  3 Bedroom',   pvPerMonth: 200, months: 18, referrals: 50  },
    { key: '4bed',      label: '🏰 4 Bedroom',   pvPerMonth: 300, months: 24, referrals: 75  },
  ];

  // Detect current tier from member data
  const tierRaw = (result.member?.preferredTier || 'bachelor').toLowerCase();
  let currentTierIdx = 0;
  if (tierRaw.includes('4') || tierRaw.includes('four'))   currentTierIdx = 3;
  else if (tierRaw.includes('3') || tierRaw.includes('three')) currentTierIdx = 2;
  else if (tierRaw.includes('2') || tierRaw.includes('two'))   currentTierIdx = 1;
  else if (tierRaw.includes('1') || tierRaw.includes('one'))   currentTierIdx = 0;
  else currentTierIdx = 0; // bachelor = index 0, next is 1bed

  const nextTierIdx = currentTierIdx + 1;
  const currentTier = TIERS[currentTierIdx] || TIERS[0];
  const nextTier    = TIERS[nextTierIdx];

  // Member stats
  const currentPV    = parseFloat(result.pv?.currentMonthPV  || 0);
  const lifetimePV   = parseFloat(result.pv?.lifetimeTotalPV || 0);
  const referrals    = parseInt(result.referrals?.totalReferrals || result.member?.totalReferrals || 0);
  const monthsActive = Math.max(1, Math.floor(lifetimePV / Math.max(currentPV, 1)));

  if (!nextTier) {
    // Already at top tier
    return (
      <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <Text style={{ color: ORANGE, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>
          🏆 Upgrade Path
        </Text>
        <Text style={{ color: GREEN, fontWeight: '700', fontSize: 16, textAlign: 'center', paddingVertical: 12 }}>
          🎉 You are at the highest tier — 4 Bedroom!
        </Text>
        <Text style={{ color: sub, fontSize: 12, textAlign: 'center' }}>
          Focus on referrals to earn 10% of our commission every month.
        </Text>
      </View>
    );
  }

  // ── SPEND PATH calculation ──
  const pvNeededPerMonth = nextTier.pvPerMonth;
  const monthsNeeded     = nextTier.months;
  const pvGapPerMonth    = Math.max(0, pvNeededPerMonth - currentPV);
  const spendQualified   = currentPV >= pvNeededPerMonth && monthsActive >= monthsNeeded;

  // Progress toward spend qualification (0-100)
  const pvProgress   = Math.min(100, Math.round((currentPV / pvNeededPerMonth) * 100));
  const timeProgress = Math.min(100, Math.round((monthsActive / monthsNeeded) * 100));
  const spendProgress = Math.round((pvProgress + timeProgress) / 2);

  // ── REFERRAL PATH calculation ──
  const referralsNeeded = nextTier.referrals;
  const referralGap     = Math.max(0, referralsNeeded - referrals);
  const refProgress     = Math.min(100, Math.round((referrals / referralsNeeded) * 100));
  const refQualified    = referrals >= referralsNeeded;

  // ── COMMISSION ESTIMATE ──
  // 10% of Mzansiway's commission. Assume avg member spends ~R100 HP/month
  // Mzansiway earns ~20% margin = R20 per member. 10% of that = R2/referral/month
  // We display conservatively as "up to R[X]/month"
  const commissionPerReferral = 2; // R2/month per active referral (10% of our ~R20 commission)
  const monthlyCommission     = referrals * commissionPerReferral;
  const groceryThreshold      = 50; // R50 = basic grocery run

  // Progress bar component
  function ProgressBar({ pct, color }) {
    return (
      <View style={{ height: 8, backgroundColor: card2, borderRadius: 4, overflow: 'hidden', marginTop: 6, marginBottom: 2 }}>
        <View style={{ width: pct + '%', height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: card, borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <Text style={{ color: ORANGE, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
        🏠 Your Upgrade Path
      </Text>
      <Text style={{ color: sub, fontSize: 12, marginBottom: 14 }}>
        Current tier: <Text style={{ color: text, fontWeight: '700' }}>{currentTier.label}</Text>
        {'  →  '}
        Next tier: <Text style={{ color: GREEN, fontWeight: '700' }}>{nextTier.label}</Text>
      </Text>

      {/* ── PATH 1: SPENDING ── */}
      <View style={{ backgroundColor: card2, borderRadius: 10, padding: 12, marginBottom: 10 }}>
        <Text style={{ color: BLUE, fontWeight: '700', fontSize: 13, marginBottom: 6 }}>
          📊 Path 1 — Shopping Activity
        </Text>
        <Text style={{ color: sub, fontSize: 11, marginBottom: 4 }}>
          Spend <Text style={{ color: text }}>{nextTier.pvPerMonth} PV/month</Text> consistently for{' '}
          <Text style={{ color: text }}>{nextTier.months} months</Text> to qualify for {nextTier.label}.
        </Text>

        <Text style={{ color: sub, fontSize: 11 }}>
          Your current month: <Text style={{ color: currentPV >= pvNeededPerMonth ? GREEN : ORANGE, fontWeight: '700' }}>{currentPV} PV</Text>
          {pvGapPerMonth > 0 ? (
            <Text style={{ color: sub }}> — top up <Text style={{ color: ORANGE }}>{pvGapPerMonth} more HP</Text> this month</Text>
          ) : (
            <Text style={{ color: GREEN }}> ✓ monthly target met</Text>
          )}
        </Text>

        <ProgressBar pct={spendProgress} color={BLUE} />
        <Text style={{ color: sub, fontSize: 10, textAlign: 'right' }}>{spendProgress}% toward spend qualification</Text>

        {spendQualified && (
          <Text style={{ color: GREEN, fontWeight: '700', fontSize: 12, marginTop: 6 }}>
            ✅ You qualify via spending! Contact support to upgrade.
          </Text>
        )}
      </View>

      {/* ── PATH 2: REFERRALS (SECRET WEAPON) ── */}
      <View style={{ backgroundColor: card2, borderRadius: 10, padding: 12, marginBottom: 10 }}>
        <Text style={{ color: PURPLE, fontWeight: '700', fontSize: 13, marginBottom: 6 }}>
          🚀 Path 2 — Referral Secret Weapon
        </Text>

        <Text style={{ color: sub, fontSize: 11, marginBottom: 6 }}>
          Refer <Text style={{ color: text, fontWeight: '700' }}>{referralsNeeded} active members</Text> who shop like you to qualify for{' '}
          <Text style={{ color: GREEN }}>{nextTier.label}</Text> — regardless of your spend level.
        </Text>

        <Text style={{ color: sub, fontSize: 11 }}>
          Your referrals: <Text style={{ color: PURPLE, fontWeight: '700' }}>{referrals}</Text>
          {referralGap > 0
            ? <Text style={{ color: sub }}> — <Text style={{ color: ORANGE }}>{referralGap} more</Text> to qualify</Text>
            : <Text style={{ color: GREEN }}> ✓ referral target met</Text>
          }
        </Text>

        <ProgressBar pct={refProgress} color={PURPLE} />
        <Text style={{ color: sub, fontSize: 10, textAlign: 'right' }}>{refProgress}% toward referral qualification</Text>

        {refQualified && (
          <Text style={{ color: GREEN, fontWeight: '700', fontSize: 12, marginTop: 6 }}>
            ✅ You qualify via referrals! Contact support to upgrade.
          </Text>
        )}

        {/* Commission callout */}
        <View style={{ borderTopWidth: 1, borderTopColor: card, marginTop: 10, paddingTop: 10 }}>
          <Text style={{ color: GREEN, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
            💰 Your Referral Earnings
          </Text>
          <Text style={{ color: sub, fontSize: 11 }}>
            You earn <Text style={{ color: GREEN, fontWeight: '700' }}>10% of our commission</Text> for every referral who shops.
            With <Text style={{ color: text }}>{referrals} active referral{referrals !== 1 ? 's' : ''}</Text>, you earn approximately{' '}
            <Text style={{ color: GREEN, fontWeight: '700' }}>R{monthlyCommission}/month</Text> back into your wallet.
          </Text>
          {monthlyCommission >= groceryThreshold ? (
            <Text style={{ color: GREEN, fontWeight: '700', fontSize: 12, marginTop: 6 }}>
              🛒 That's enough for free groceries every month!
            </Text>
          ) : (
            <Text style={{ color: sub, fontSize: 11, marginTop: 6 }}>
              Get to <Text style={{ color: ORANGE }}>{Math.ceil(groceryThreshold / commissionPerReferral)} referrals</Text> and your commission covers free groceries every month.
            </Text>
          )}
        </View>
      </View>

      {/* ── COMBINED FAST TRACK ── */}
      <View style={{ backgroundColor: '#1a2a1a', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: GREEN }}>
        <Text style={{ color: GREEN, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
          ⚡ Fast Track to {nextTier.label}
        </Text>
        <Text style={{ color: sub, fontSize: 11 }}>{'Combine both paths:'}</Text>
        <Text style={{ color: sub, fontSize: 11 }}>{'• Shop consistently + refer friends who buy'}</Text>
        <Text style={{ color: sub, fontSize: 11 }}>{'• Your referral commission reduces what you need to spend'}</Text>
        <Text style={{ color: sub, fontSize: 11 }}>{'• More referrals = bigger wallet = faster upgrade'}</Text>
        <Text style={{ color: sub, fontSize: 11 }}>{'• '}<Text style={{ color: GREEN }}>{'10% of our commission'}</Text>{' is credited directly to your Mzansiway wallet'}</Text>
      </View>
    </View>
  );
}

export default function AdminAuditScreen({ userData, onBack, theme, hideTabBar, showTabBar }) {
  const t = theme || {};

  // ── Fund dashboard state ──
  const [funds, setFunds]         = useState(null);
  const [fundsLoading, setFL]     = useState(true);

  // -- Reserve status state --
  const [reserve, setReserve]       = useState(null);
  const [reserveLoading, setRL]     = useState(true);

  // ── Member search state ──
  const [phone, setPhone]         = useState('');
  const [result, setResult]       = useState(null);
  const [searching, setSearching] = useState(false);

  // ── Scroll / header anim ──
  const scrollY  = useRef(new Animated.Value(0)).current;
  const lastY    = useRef(0);
  const headerH  = useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden

  const onScroll = useCallback((e) => {
    const y   = e.nativeEvent.contentOffset.y;
    const dy  = y - lastY.current;
    lastY.current = y;

    if (dy > 5 && y > 60) {
      // Scrolling down → hide tab bar
      if (hideTabBar) hideTabBar();
    } else if (dy < -5) {
      // Scrolling up → show tab bar
      if (showTabBar) showTabBar();
    }
  }, [hideTabBar, showTabBar]);

  // ── Load global funds on mount ──
  useEffect(() => {
    fetchFunds();
    fetchReserve();
  }, []);

  async function fetchFunds() {
    setFL(true);
    try {
      const adminPhone = userData?.phoneNumber || '';
      const resp = await fetch(BACKEND + '/api/admin/funds?adminPhone=' + encodeURIComponent(adminPhone));
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      setFunds(data);
    } catch (err) {
      console.log('[Audit] Fund load error:', err.message);
      setFunds(null);
    } finally {
      setFL(false);
    }
  }

  async function fetchReserve() {
    setRL(true);
    try {
      const resp = await fetch(BACKEND + '/api/admin/reserve-status');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      setReserve(data);
    } catch (err) {
      console.log('[Audit] Reserve load error:', err.message);
      setReserve(null);
    } finally {
      setRL(false);
    }
  }

  async function searchMember() {
    const q = phone.trim();
    if (!q) { Alert.alert('Enter a phone number'); return; }
    setSearching(true);
    setResult(null);
    try {
      const adminPhone = userData?.phoneNumber || '';
      const url = BACKEND + '/api/admin/audit-member?phone=' + encodeURIComponent(q) + '&adminPhone=' + encodeURIComponent(adminPhone);
      const resp = await fetch(url);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + resp.status);
      }
      const data = await resp.json();
      setResult(data);
      // Also refresh funds from this call
      if (data.funds) setFunds(data.funds);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSearching(false);
    }
  }

  // ── Pie chart data from funds ──
  const fundSlices = funds ? (() => {
    const total = (funds.auctionFund || 0) + (funds.operationsFund || 0) +
                  (funds.salariesFund || 0) + (funds.emergencyFund || 0);
    if (total === 0) return [];
    return [
      { label: 'Auction/Pool',  value: funds.auctionFund    || 0, color: ORANGE, pct: (funds.auctionFund    || 0) / total },
      { label: 'Operations',   value: funds.operationsFund  || 0, color: BLUE,   pct: (funds.operationsFund  || 0) / total },
      { label: 'Salaries',     value: funds.salariesFund    || 0, color: GREEN,  pct: (funds.salariesFund    || 0) / total },
      { label: 'Emergency',    value: funds.emergencyFund   || 0, color: RED,    pct: (funds.emergencyFund   || 0) / total },
    ].filter(s => s.value > 0);
  })() : [];

  const totalFunds = funds
    ? (funds.auctionFund || 0) + (funds.operationsFund || 0) +
      (funds.salariesFund || 0) + (funds.emergencyFund || 0)
    : 0;

  function r(n) { return 'R' + Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // credit type display
  function creditLabel(ct) {
    if (!ct) return 'Unknown';
    const l = ct.toLowerCase();
    if (l === 'health') return 'Healthcare Benefits';
    if (l === 'home')   return 'Home Points';
    return ct;
  }

  const bg    = t.bg    || '#0d0d1a';
  const card  = t.card  || '#16213e';
  const card2 = t.card2 || '#1a1a2e';
  const text  = t.text  || '#ffffff';
  const sub   = t.subText || '#8a8a9a';

  return (
    <View style={[s.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: card }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🔍 Admin Audit</Text>
        <Text style={[s.headerSub, { color: sub }]}>{userData?.name}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* ── GLOBAL FUND DASHBOARD ── */}
        <View style={[s.section, { backgroundColor: card }]}>
          <Text style={[s.sectionTitle, { color: ORANGE }]}>📊 Global Fund Dashboard</Text>

          {fundsLoading ? (
            <ActivityIndicator color={ORANGE} style={{ marginVertical: 20 }} />
          ) : funds ? (
            <>
              {/* Pie chart + legend side by side */}
              <View style={s.chartRow}>
                <DonutRing slices={fundSlices} size={140} total={totalFunds} />
                <View style={s.legend}>
                  {[
                    { label: 'Auction / Pool',  value: funds.auctionFund    || 0, color: ORANGE },
                    { label: 'Operations',       value: funds.operationsFund  || 0, color: BLUE   },
                    { label: 'Salaries',         value: funds.salariesFund    || 0, color: GREEN  },
                    { label: 'Emergency',        value: funds.emergencyFund   || 0, color: RED    },
                  ].map(f => (
                    <View key={f.label} style={s.legendRow}>
                      <View style={[s.legendDot, { backgroundColor: f.color }]} />
                      <View>
                        <Text style={[s.legendLabel, { color: sub }]}>{f.label}</Text>
                        <Text style={[s.legendVal,   { color: text }]}>{r(f.value)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Total bar */}
              <View style={[s.totalBar, { backgroundColor: card2 }]}>
                <Text style={[s.totalLabel, { color: sub }]}>Total Funds</Text>
                <Text style={[s.totalVal,   { color: ORANGE }]}>{r(totalFunds)}</Text>
              </View>

              {/* Split bars */}
              {totalFunds > 0 && (
                <View style={{ marginTop: 10 }}>
                  {[
                    { label: 'Auction / Pool',  value: funds.auctionFund    || 0, color: ORANGE },
                    { label: 'Operations',       value: funds.operationsFund  || 0, color: BLUE   },
                    { label: 'Salaries',         value: funds.salariesFund    || 0, color: GREEN  },
                    { label: 'Emergency',        value: funds.emergencyFund   || 0, color: RED    },
                  ].map(f => (
                    <View key={f.label} style={{ marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ color: sub, fontSize: 11 }}>{f.label}</Text>
                        <Text style={{ color: text, fontSize: 11 }}>{totalFunds > 0 ? Math.round(f.value / totalFunds * 100) : 0}%</Text>
                      </View>
                      <View style={[s.barBg, { backgroundColor: card2 }]}>
                        <View style={[s.barFill, { backgroundColor: f.color, width: totalFunds > 0 ? (f.value / totalFunds * 100) + '%' : '0%' }]} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={[s.noData, { color: sub }]}>No fund data available</Text>
          )}
        </View>

        
        {/* -- POOL RESERVE STATUS -- */}
        <View style={[s.section, { backgroundColor: card }]}>
          <Text style={[s.sectionTitle, { color: ORANGE }]}>⚡ Pool Reserve Status</Text>
          {reserveLoading ? (
            <ActivityIndicator color={ORANGE} style={{ marginVertical: 12 }} />
          ) : reserve ? (() => {
            const healthy = reserve.healthy;
            const statusColor = healthy ? GREEN : RED;
            const pct = reserve.reserveRequired > 0
              ? Math.min(100, Math.round((reserve.poolBalance / reserve.reserveRequired) * 100))
              : 100;
            return (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: statusColor, marginRight: 8,
                  }} />
                  <Text style={{ color: statusColor, fontWeight: '700', fontSize: 15 }}>
                    {healthy ? 'HEALTHY' : 'UNDERFUNDED'}
                  </Text>
                </View>
                {[
                  ['Pool Balance (Auction Fund)', reserve.poolBalance],
                  ['Total Member Wallets',        reserve.totalWallets],
                  ['Reserve Required (1.5x)',     reserve.reserveRequired],
                  [healthy ? 'Surplus' : 'Shortfall', Math.abs(reserve.shortfall)],
                ].map(([label, val]) => (
                  <View key={label} style={[s.row, { borderBottomColor: card2 }]}>
                    <Text style={[s.rowL, { color: sub }]}>{label}</Text>
                    <Text style={[s.rowV, { color: label.includes('Shortfall') ? RED : label.includes('Surplus') ? GREEN : text }]}>
                      {'R' + Number(val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))}
                <View style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: sub, fontSize: 11 }}>Reserve coverage</Text>
                    <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700' }}>{pct}%</Text>
                  </View>
                  <View style={[s.barBg, { backgroundColor: card2 }]}>
                    <View style={[s.barFill, { backgroundColor: statusColor, width: pct + '%' }]} />
                  </View>
                  <Text style={{ color: sub, fontSize: 10, marginTop: 4 }}>
                    {healthy
                      ? 'Pool covers member wallets at ' + pct + '% (minimum 150%)'
                      : 'Pool is below the 150% minimum - top up needed'}
                  </Text>
                </View>
              </>
            );
          })() : (
            <Text style={[s.noData, { color: sub }]}>Reserve data unavailable</Text>
          )}
        </View>

        {/* ── MEMBER SEARCH ── */}
        <View style={[s.section, { backgroundColor: card }]}>
          <Text style={[s.sectionTitle, { color: ORANGE }]}>👤 Member Search</Text>
          <Text style={[s.hint, { color: sub }]}>Enter member cellphone number</Text>

          <View style={s.searchRow}>
            <TextInput
              style={[s.input, { backgroundColor: card2, color: text, borderColor: ORANGE + '44', flex: 1 }]}
              placeholder="e.g. 0812345678"
              placeholderTextColor={sub}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="search"
              onSubmitEditing={searchMember}
            />
            <TouchableOpacity
              style={[s.searchBtn, { backgroundColor: ORANGE }]}
              onPress={searchMember}
              disabled={searching}
            >
              {searching
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.searchBtnText}>Search</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SEARCH RESULTS ── */}
        {result && (
          <>
            {/* Member Details */}
            <View style={[s.section, { backgroundColor: card }]}>
              <Text style={[s.sectionTitle, { color: ORANGE }]}>👤 Member Details</Text>
              {[
                ['Full Name',     result.member?.name],
                ['Member No.',    result.member?.memberNumber],
                ['Phone',         result.member?.phoneNumber],
                ['Email',         result.member?.email || 'N/A'],
                ['Credit Type',   creditLabel(result.member?.creditType)],
                ['Province',      result.member?.province || 'N/A'],
                ['City',          result.member?.city || 'N/A'],
                ['Queue #',       result.member?.queuePosition || 'N/A'],
                ['Tier',          result.member?.preferredTier || 'N/A'],
                ['Reg Date',      result.member?.registrationDate ? new Date(result.member.registrationDate).toLocaleDateString('en-ZA') : 'N/A'],
                ['Is Accountant', result.member?.isAccountant ? 'Yes' : 'No'],
              ].map(([l, v]) => (
                <View key={l} style={[s.row, { borderBottomColor: card2 }]}>
                  <Text style={[s.rowL, { color: sub  }]}>{l}</Text>
                  <Text style={[s.rowV, { color: text }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* PV & Points */}
            <View style={[s.section, { backgroundColor: card }]}>
              <Text style={[s.sectionTitle, { color: ORANGE }]}>📈 HP & Points</Text>
              {[
                ['This Month PV',   result.pv?.currentMonthPV + ' HP'],
                ['Lifetime HP',     result.pv?.lifetimeTotalPV + ' HP'],
                ['Last Month HP',   result.pv?.lastMonthPV + ' HP'],
                ['Today HP',        result.pv?.todayPV + ' HP'],
                ['Monthly Target',  result.pv?.monthlyTarget + ' HP'],
                ['Points',          result.pv?.points],
                ['Title Deed Pts',  result.pv?.titleDeedPoints],
              ].map(([l, v]) => (
                <View key={l} style={[s.row, { borderBottomColor: card2 }]}>
                  <Text style={[s.rowL, { color: sub  }]}>{l}</Text>
                  <Text style={[s.rowV, { color: GREEN }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Wallets */}
            <View style={[s.section, { backgroundColor: card }]}>
              <Text style={[s.sectionTitle, { color: ORANGE }]}>💰 Wallets</Text>
              {[
                ['Cash Wallet',      r(result.wallet?.cashWallet)],
                ['Gratitude Wallet', r(result.wallet?.gratitudeWallet)],
                ['Cashback',         'N/A'],
              ].map(([l, v]) => (
                <View key={l} style={[s.row, { borderBottomColor: card2 }]}>
                  <Text style={[s.rowL, { color: sub  }]}>{l}</Text>
                  <Text style={[s.rowV, { color: text }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Housing Upgrade Algorithm */}
            <UpgradeAlgorithm result={result} theme={theme} />

            {/* Transaction History */}
            {result.transactions && result.transactions.length > 0 && (
              <View style={[s.section, { backgroundColor: card }]}>
                <Text style={[s.sectionTitle, { color: ORANGE }]}>📋 Recent Transactions</Text>
                {result.transactions.map((tx, idx) => (
                  <View key={idx} style={[s.row, { borderBottomColor: card2, flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 8 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                      <Text style={{ color: text, fontWeight: '700', fontSize: 12, flex: 1 }}>
                        {tx.type}
                        {tx.pv > 0 ? <Text style={{ color: GREEN }}>{' +' + tx.pv + ' HP'}</Text> : null}
                      </Text>
                      <Text style={{ color: tx.amount >= 0 ? GREEN : RED, fontWeight: '700', fontSize: 12 }}>
                        {'R' + Math.abs(tx.amount).toFixed(2)}
                      </Text>
                    </View>
                    {tx.description ? (
                      <Text style={{ color: sub, fontSize: 11, marginTop: 2 }}>{tx.description}</Text>
                    ) : null}
                    {tx.date ? (
                      <Text style={{ color: sub, fontSize: 10, marginTop: 2 }}>
                        {new Date(tx.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
            {result.transactions && result.transactions.length === 0 && (
              <View style={[s.section, { backgroundColor: card }]}>
                <Text style={[s.sectionTitle, { color: ORANGE }]}>📋 Recent Transactions</Text>
                <Text style={{ color: sub, textAlign: 'center', paddingVertical: 16 }}>No transactions found for this member.</Text>
              </View>
            )}


            {/* Referrals */}
            <View style={[s.section, { backgroundColor: card }]}>
              <Text style={[s.sectionTitle, { color: ORANGE }]}>🤝 Referrals</Text>
              {[
                ['Total Referrals', result.referrals?.totalReferrals],
                ['Referral Code',   result.referrals?.referralCode || 'N/A'],
                ['Referred By',     result.referrals?.referredBy || 'Direct'],
              ].map(([l, v]) => (
                <View key={l} style={[s.row, { borderBottomColor: card2 }]}>
                  <Text style={[s.rowL, { color: sub  }]}>{l}</Text>
                  <Text style={[s.rowV, { color: text }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Monthly Reconciliation */}
            <View style={[s.section, { backgroundColor: card }]}>
              <Text style={[s.sectionTitle, { color: ORANGE }]}>🧾 Monthly Reconciliation</Text>
              {result.monthlyReconciliation && (() => {
                const m = result.monthlyReconciliation;
                const total = m.monthlySalesRands || 0;
                return [
                  { l: 'Monthly Sales',     v: r(m.monthlySalesRands),      bar: null,  color: text   },
                  { l: 'Commission (3%)',    v: r(m.monthlyCommission),      bar: null,  color: text   },
                  { l: '─────────────────', v: 'Fund Split',                bar: null,  color: sub    },
                  { l: 'Pool / Auction',    v: r(m.poolContribution)   + ' (60%)', bar: 0.60, color: ORANGE },
                  { l: 'Operations',        v: r(m.operationsContribution) + ' (20%)', bar: 0.20, color: BLUE   },
                  { l: 'Salaries',          v: r(m.salariesContribution)   + ' (10%)', bar: 0.10, color: GREEN  },
                  { l: 'Emergency',         v: r(m.emergencyContribution)  + ' (10%)', bar: 0.10, color: RED    },
                ].map(({ l, v, bar, color }) => (
                  <View key={l} style={[s.row, { borderBottomColor: card2, flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                      <Text style={[s.rowL, { color: sub   }]}>{l}</Text>
                      <Text style={[s.rowV, { color: color }]}>{v}</Text>
                    </View>
                    {bar !== null && total > 0 && (
                      <View style={[s.barBg, { backgroundColor: card2, marginTop: 4, width: '100%' }]}>
                        <View style={[s.barFill, { backgroundColor: color, width: (bar * 100) + '%' }]} />
                      </View>
                    )}
                  </View>
                ));
              })()}
            </View>
          </>
        )}

      
      </ScrollView>
    </View>
  );
}

// ── Donut ring (pure RN — uses layered Views with border trick) ──────────────
function DonutRing({ slices, size, total }) {
  const r = size / 2;

  // Fallback: if no slices, show empty ring
  if (!slices || slices.length === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: size, height: size, borderRadius: r,
          borderWidth: size * 0.15,
          borderColor: '#333',
        }} />
      </View>
    );
  }

  // Build conic-like effect with stacked Views rotated around centre
  // We simulate sectors by rendering full-circle discs with colour and clipping
  let accumulated = 0;
  const segments = slices.map((slice, i) => {
    const startDeg = accumulated * 360;
    accumulated   += slice.pct;
    return { ...slice, startDeg };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Base circle */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: r, backgroundColor: slices[slices.length - 1]?.color || '#333' }} />

      {/* Each segment clips the previous colour */}
      {segments.map((seg, i) => {
        if (i === segments.length - 1) return null; // last segment is the base
        const remainPct = 1 - seg.pct - segments.slice(0, i).reduce((a, x) => a + x.pct, 0);
        const clipDeg   = remainPct * 360;
        return (
          <View key={i} style={{ position: 'absolute', width: size, height: size }}>
            <View style={{
              position: 'absolute', width: size, height: size,
              borderRadius: r,
              backgroundColor: seg.color,
              transform: [{ rotate: seg.startDeg + 'deg' }],
              overflow: 'hidden',
            }}>
              {/* Hide portion beyond this segment */}
              <View style={{
                position: 'absolute',
                right: 0, top: 0,
                width: r, height: size,
                backgroundColor: i > 0 ? segments[i-1].color : '#0d0d1a',
                transform: [{ rotate: (-(seg.pct * 360)) + 'deg' }],
                transformOrigin: 'left center',
              }} />
            </View>
          </View>
        );
      })}

      {/* Donut hole */}
      <View style={{
        position: 'absolute',
        width: size * 0.55, height: size * 0.55,
        borderRadius: size * 0.275,
        backgroundColor: '#16213e',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: '#F7941D', fontSize: 10, fontWeight: '700' }}>TOTAL</Text>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
          {'R' + (total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0))}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 48 },
  back:       { color: '#F7941D', fontSize: 16, fontWeight: '600' },
  headerTitle:{ color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub:  { fontSize: 12 },

  section:    { margin: 12, borderRadius: 14, padding: 16 },
  sectionTitle:{ fontSize: 15, fontWeight: '700', marginBottom: 12 },
  hint:       { fontSize: 12, marginBottom: 10 },

  chartRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legend:     { flex: 1, marginLeft: 16, gap: 8 },
  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendLabel:{ fontSize: 11 },
  legendVal:  { fontSize: 13, fontWeight: '600' },

  totalBar:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 12, marginTop: 4 },
  totalLabel: { fontSize: 13 },
  totalVal:   { fontSize: 18, fontWeight: '800' },

  barBg:      { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill:    { height: 6, borderRadius: 3 },

  searchRow:  { flexDirection: 'row', gap: 8 },
  input:      { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  searchBtn:  { borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  searchBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  row:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1 },
  rowL:       { fontSize: 13, flex: 1 },
  rowV:       { fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1 },

  noData:     { textAlign: 'center', marginVertical: 16, fontSize: 13 },
});
