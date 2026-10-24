import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Notice from '../components/Notice';

const API_URL = 'https://mzansiway-backend-production.up.railway.app';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
];

const LANGUAGES = [
  'isiZulu','isiXhosa','Afrikaans','English','Sepedi',
  'Setswana','Sesotho','Xitsonga','siSwati','Tshivenda','isiNdebele'
];

const RESIDENCE_TYPES = [
  { label: 'Staying for Free (with family/friends)', value: 'FREE' },
  { label: 'Renting', value: 'RENT' },
  { label: 'Bond / Home Loan', value: 'BOND' },
  { label: 'Informal Settlement', value: 'INFORMAL' },
  { label: 'Other', value: 'OTHER' },
];

const ID_TYPES = [
  { label: 'South African ID', value: 'SA_ID' },
  { label: 'Passport', value: 'PASSPORT' },
];

function parseSAID(idNumber) {
  if (!idNumber || idNumber.length !== 13 || !/^\d{13}$/.test(idNumber)) return null;
  const year = idNumber.substring(0, 2);
  const month = idNumber.substring(2, 4);
  const day = idNumber.substring(4, 6);
  const genderDigit = parseInt(idNumber.substring(6, 10));
  const fullYear = parseInt(year) <= 25 ? '20' + year : '19' + year;
  const gender = genderDigit >= 5000 ? 'Male' : 'Female';
  return { dob: day + '/' + month + '/' + fullYear, gender };
}

function NativeDropdown({ value, options, placeholder, onChange, theme }) {
  const [open, setOpen] = useState(false);
  const t = theme || { bg: '#003865', card: '#0a2545', card2: '#082040', text: '#ffffff', subText: '#aaaaaa' };
  const selected = options.find(o => (o.value !== undefined ? o.value : o) === value);
  const label = selected ? (selected.label || selected) : placeholder;

  return (
    <View style={{ marginBottom: 4 }}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[styles.dropBtn, { backgroundColor: t.card2, borderColor: '#0d2d50' }]}
        activeOpacity={0.8}
      >
        <Text style={{ color: value ? t.text : t.subText, fontSize: 15, flex: 1 }}>{label}</Text>
        <Text style={{ color: t.subText, fontSize: 12 }}>{'▼'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.modalBox, { backgroundColor: t.card }]}>
            <Text style={[styles.modalTitle, { color: t.text }]}>{placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, i) => String(i)}
              renderItem={({ item }) => {
                const val = item.value !== undefined ? item.value : item;
                const lbl = item.label || item;
                const isSelected = val === value;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && { backgroundColor: '#FF980033' }]}
                    onPress={() => { onChange(val); setOpen(false); }}
                  >
                    <Text style={{ color: isSelected ? '#FF9800' : t.text, fontSize: 15 }}>{lbl}</Text>
                    {isSelected && <Text style={{ color: '#FF9800' }}>{'✓'}</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setOpen(false)}>
              <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function RegistrationScreen({ onRegisterSuccess, onBack, onNavigateToLogin, creditType, theme, onHideTabBar, onShowTabBar }) {
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

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [useCustomCity, setUseCustomCity] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [referredBy, setReferredBy] = useState('');
  const [preferredTier, setPreferredTier] = useState('bachelor');
  const [preferredSuburb, setPreferredSuburb] = useState('');
  const [idType, setIdType] = useState('SA_ID');
  const [idNumber, setIdNumber] = useState('');
  const [idDob, setIdDob] = useState('');
  const [idGender, setIdGender] = useState('');
  const [homeLanguage, setHomeLanguage] = useState('');
  const [residenceType, setResidenceType] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const t = theme || {
    bg: '#003865', card: '#0a2545', card2: '#082040',
    text: '#ffffff', subText: '#aaaaaa', darkMode: true, toggle: function() {}
  };

  useEffect(() => {
    fetch(API_URL + '/api/registration/cities')
      .then(r => r.json())
      .then(data => { if (data.cities) setAvailableCities(data.cities); })
      .catch(() => {});
  }, []);

  const handleIdNumber = (val) => {
    setIdNumber(val);
    if (idType === 'SA_ID' && val.length === 13) {
      const parsed = parseSAID(val);
      if (parsed) { setIdDob(parsed.dob); setIdGender(parsed.gender); }
      else { setIdDob(''); setIdGender(''); }
    } else { setIdDob(''); setIdGender(''); }
  };

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || !password || (creditType !== 'health' && !province)) {
      setNotice({ type: 'error', title: 'Missing Information', message: 'Please fill in all required fields.' }); return;
    }
    const finalCity = useCustomCity ? customCity.trim() : city;
    if (!finalCity && creditType !== 'health') {
      setNotice({ type: 'error', title: 'City Required', message: 'Please select or enter your town/city.' }); return;
    }
    if (password !== confirmPassword) {
      setNotice({ type: 'error', title: "Passwords Don't Match", message: "The passwords you entered don't match." }); return;
    }
    if (password.length < 8) {
      setNotice({ type: 'error', title: 'Password Too Short', message: 'Your password must be at least 8 characters.' }); return;
    }
    if (phoneNumber.length < 10) {
      setNotice({ type: 'error', title: 'Invalid Phone Number', message: 'Please enter a valid 10-digit phone number.' }); return;
    }
    if (!idNumber) {
      setNotice({ type: 'error', title: 'ID Required', message: 'Please enter your ID or Passport number.' }); return;
    }
    if (idType === 'SA_ID' && idNumber.length !== 13) {
      setNotice({ type: 'error', title: 'Invalid SA ID', message: 'Your SA ID number must be exactly 13 digits.' }); return;
    }
    if (!homeLanguage && creditType !== 'health') {
      setNotice({ type: 'error', title: 'Home Language Required', message: 'Please select your home language.' }); return;
    }
    if (!residenceType && creditType !== 'health') {
      setNotice({ type: 'error', title: 'Living Situation Required', message: 'Please tell us your current living situation.' }); return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, phoneNumber, password, province,
          city: finalCity, preferredSuburb, referredBy,
          creditType: creditType || 'home',
          idType, idNumber, homeLanguage, residenceType
        }),
      });
      const data = await response.json();
      if (response.ok) {
        onRegisterSuccess({ memberNumber: data.memberNumber, queuePosition: data.queuePosition, fullName, creditType: (data.user && data.user.creditType) || creditType || 'home', user: data.user });
      } else {
        setNotice({ type: 'error', title: 'Registration Failed', message: data.message || 'Please check your details and try again.' });
      }
    } catch (error) {
      setNotice({ type: 'error', title: 'Connection Error', message: 'Error: ' + error.message });
      console.log('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <ScrollView style={[styles.container, { backgroundColor: t.bg }]} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 200 }} onScroll={_handleScroll} scrollEventThrottle={16}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <TouchableOpacity style={styles.modeToggle} onPress={t.toggle}>
          <Text style={styles.modeToggleText}>{t.darkMode ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MZANSIWAY</Text>
        <Text style={[styles.subtitle, { color: t.text }]}>Create Your Account</Text>
      </View>

      <View style={styles.form}>
        {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}

        <View style={{ backgroundColor: creditType === 'health' ? '#1F1500' : '#0F2F1F', borderWidth: 1, borderColor: creditType === 'health' ? '#FF9800' : '#50C878', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: creditType === 'health' ? '#FF9800' : '#50C878', fontWeight: 'bold', fontSize: 14, textAlign: 'center' }}>
            {creditType === 'health' ? '🏥 Registering for Health Credits' : '🏠 Registering for Home Points'}
          </Text>
        </View>

        <Text style={styles.label}>1. Name and Surname *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
          placeholder="Enter your full name" placeholderTextColor={t.subText}
          value={fullName} onChangeText={setFullName}
        />

        <Text style={styles.label}>2. Phone Number *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
          placeholder="e.g., 0812345678" placeholderTextColor={t.subText}
          value={phoneNumber} onChangeText={setPhoneNumber}
          keyboardType="phone-pad" maxLength={10}
        />

        <Text style={styles.label}>3. Password *</Text>
        <View style={[styles.passwordRow, { backgroundColor: t.card2, borderColor: '#0d2d50' }]}>
          <TextInput
            style={[styles.passwordInput, { color: t.text }]}
            placeholder="Create password (min 8 characters)" placeholderTextColor={t.subText}
            value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeText}>{showPassword ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>4. Confirm Password *</Text>
        <View style={[styles.passwordRow, { backgroundColor: t.card2, borderColor: '#0d2d50' }]}>
          <TextInput
            style={[styles.passwordInput, { color: t.text }]}
            placeholder="Re-enter password" placeholderTextColor={t.subText}
            value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.eyeText}>{showConfirmPassword ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        {(creditType !== 'health') && (
          <View>
            <Text style={styles.label}>5. Province *</Text>
            <NativeDropdown value={province} options={PROVINCES} placeholder="-- Select Province --" onChange={setProvince} theme={t} />
          </View>
        )}

        {(creditType !== 'health') && (
          <View>
            <Text style={styles.label}>6. Town/City *</Text>
            {!useCustomCity ? (
              <View>
                <NativeDropdown value={city} options={availableCities} placeholder="-- Select City --" onChange={setCity} theme={t} />
                <TouchableOpacity onPress={() => { setUseCustomCity(true); setCity(''); }}>
                  <Text style={[styles.customCityLink, { color: '#FF9800' }]}>My city is not listed - add it</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
                  placeholder="Enter your town/city" placeholderTextColor={t.subText}
                  value={customCity} onChangeText={setCustomCity}
                />
                <TouchableOpacity onPress={() => { setUseCustomCity(false); setCustomCity(''); }}>
                  <Text style={[styles.customCityLink, { color: '#FF9800' }]}>Choose from existing list instead</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {(creditType !== 'health') && (
          <View>
            <Text style={styles.label}>7. Preferred Suburb?</Text>
            <Text style={[styles.helperText, { color: t.subText }]}>Dream big - tell us where you want to own your home.</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
              placeholder="e.g. Sandton, Umhlanga, Thornhill etc" placeholderTextColor={t.subText}
              value={preferredSuburb} onChangeText={setPreferredSuburb}
            />
          </View>
        )}

        <Text style={styles.label}>8. Referral Cell Number (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
          placeholder="e.g. 0812345678" placeholderTextColor={t.subText}
          value={referredBy} onChangeText={setReferredBy}
          keyboardType="numeric" maxLength={10}
        />

        <Text style={styles.label}>9. ID Type *</Text>
        <NativeDropdown value={idType} options={ID_TYPES} placeholder="Select ID Type"
          onChange={(val) => { setIdType(val); setIdNumber(''); setIdDob(''); setIdGender(''); }} theme={t} />

        <Text style={styles.label}>10. {idType === 'SA_ID' ? 'SA ID Number' : 'Passport Number'} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.card2, color: t.text, borderColor: '#0d2d50' }]}
          placeholder={idType === 'SA_ID' ? '13-digit ID number' : 'Passport number'}
          placeholderTextColor={t.subText}
          value={idNumber} onChangeText={handleIdNumber}
          keyboardType={idType === 'SA_ID' ? 'numeric' : 'default'}
          maxLength={idType === 'SA_ID' ? 13 : 20}
        />
        {idType === 'SA_ID' && idDob ? (
          <View style={[styles.idInfoBox, { backgroundColor: '#0a4a1a', borderColor: '#50C878' }]}>
            <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>ID Verified</Text>
            <Text style={{ color: t.text, fontSize: 13 }}>Date of Birth: <Text style={{ fontWeight: 'bold' }}>{idDob}</Text></Text>
            <Text style={{ color: t.text, fontSize: 13 }}>Gender: <Text style={{ fontWeight: 'bold' }}>{idGender}</Text></Text>
          </View>
        ) : null}

        {(creditType !== 'health') && (
          <View>
            <Text style={styles.label}>11. Home Language *</Text>
            <NativeDropdown value={homeLanguage} options={LANGUAGES} placeholder="-- Select Home Language --" onChange={setHomeLanguage} theme={t} />
          </View>
        )}

        {(creditType !== 'health') && (
          <View>
            <Text style={styles.label}>12. Current Living Situation *</Text>
            <NativeDropdown value={residenceType} options={RESIDENCE_TYPES} placeholder="-- Select Living Situation --" onChange={setResidenceType} theme={t} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.registerButton, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
          <Text style={[styles.loginLinkText, { color: t.subText }]}>Already have an account? <Text style={{ color: '#FF9800' }}>Sign In</Text></Text>
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity style={[styles.backButton, { borderWidth: 2, borderColor: '#FF9800', borderRadius: 12, paddingVertical: 16, backgroundColor: '#003865' }]} onPress={onBack}>
            <Text style={[styles.backButtonText, { color: '#FF9800', fontWeight: '800', fontSize: 15 }]}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 50, alignItems: 'center', position: 'relative' },
  modeToggle: { position: 'absolute', top: 20, right: 20, padding: 8 },
  modeToggleText: { fontSize: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF9800', letterSpacing: 3, marginBottom: 4 },
  subtitle: { fontSize: 16, opacity: 0.9 },
  form: { padding: 20 },
  label: { color: '#aaaaaa', fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  helperText: { fontSize: 12, marginBottom: 6, marginTop: -4 },
  input: { borderWidth: 1.5, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, marginBottom: 4 },
  passwordInput: { flex: 1, padding: 14, fontSize: 15 },
  eyeButton: { padding: 14 },
  eyeText: { fontSize: 18 },
  dropBtn: { borderWidth: 1.5, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', minHeight: 50 },
  customCityLink: { fontSize: 13, marginTop: 6, marginBottom: 4, textDecorationLine: 'underline' },
  idInfoBox: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 4 },
  registerButton: { backgroundColor: '#FF9800', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  registerButtonText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  loginLink: { alignItems: 'center', marginBottom: 8 },
  loginLinkText: { fontSize: 14 },
  backButton: { alignItems: 'center', marginBottom: 30 },
  backButtonText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', maxHeight: 420, borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#ffffff22' },
  modalClose: { marginTop: 12, alignItems: 'center', padding: 12 },
});
