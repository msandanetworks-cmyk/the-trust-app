import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// How long the splash stays on screen (milliseconds)
const SPLASH_MS = 3200;

function MzansiLogo({ size = 120 }) {
  return (
    <Svg viewBox="0 0 200 200" width={size} height={size}>
      <Circle cx="100" cy="100" r="100" fill="#003865" />
      <Path d="M100 22 L155 45 L155 105 Q155 145 100 172 Q45 145 45 105 L45 45 Z" fill="#004f8f" />
      <Path d="M100 22 L100 172 Q45 145 45 105 L45 45 Z" fill="#003265" />
      <Path d="M100 22 L155 45 L155 105 Q155 145 100 172 Q45 145 45 105 L45 45 Z"
            fill="none" stroke="#FF9800" strokeWidth="5" strokeLinejoin="round" />
      <Ellipse cx="100" cy="172" rx="12" ry="5" fill="#FF9800" />
      <Polygon points="60,95 100,62 100,95" fill="#FF9800" />
      <Polygon points="100,62 140,95 100,95" fill="#cc7a00" opacity="0.5" />
      <Rect x="72" y="95" width="56" height="42" fill="white" />
      <Rect x="88" y="110" width="14" height="27" fill="#004f8f" />
      <Rect x="76" y="100" width="10" height="9" rx="1" fill="#004f8f" />
      <Rect x="114" y="100" width="10" height="9" rx="1" fill="#004f8f" />
    </Svg>
  );
}

// A soft glowing "cloud": stacked circles, faint at the edge, brighter in the middle.
// Works the same on phone and web (no blur library needed).
function Glow({ size, color, rings = 8, strength = 0.07 }) {
  const layers = [];
  for (let i = 0; i < rings; i++) {
    const s = size * (1 - i / (rings + 2));
    layers.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: color,
          opacity: strength,
          left: (size - s) / 2,
          top: (size - s) / 2,
        }}
      />
    );
  }
  return <View style={{ width: size, height: size }}>{layers}</View>;
}

// One drifting glow: floats, sways and breathes in a loop
function DriftingGlow({ size, color, strength, style, rise, sway, grow, duration, delay = 0 }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, delay, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(t, { toValue: 0, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, rise] });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, sway] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [1, grow] });
  const opacity = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.8] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', opacity, transform: [{ translateX }, { translateY }, { scale }] }, style]}
    >
      <Glow size={size} color={color} strength={strength} />
    </Animated.View>
  );
}

export default function SplashScreen({ onFinish }) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const loopWave = (val, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(val, { toValue: 0, duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      );

    loopWave(wave1, 1800).start();
    loopWave(wave2, 2300).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(barWidth, { toValue: 90, duration: 900, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(barWidth, { toValue: 40, duration: 900, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, SPLASH_MS);

    return () => clearTimeout(timer);
  }, []);

  const wave1Y = wave1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
  const wave2Y = wave2.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });

  return (
    <View style={styles.container}>

      {/* Glowing "firebase" clouds behind everything */}
      <DriftingGlow size={width * 1.3} color="#FF9800" strength={0.06}
        style={{ left: -width * 0.45, bottom: -width * 0.55 }}
        rise={-120} sway={50} grow={1.25} duration={1600} />
      <DriftingGlow size={width * 1.1} color="#1E7BD9" strength={0.07}
        style={{ right: -width * 0.45, top: -width * 0.35 }}
        rise={90} sway={-60} grow={1.3} duration={1900} delay={200} />
      <DriftingGlow size={width * 0.9} color="#FF6A00" strength={0.05}
        style={{ right: -width * 0.3, bottom: height * 0.05 }}
        rise={-100} sway={-40} grow={1.35} duration={1400} delay={400} />
      <DriftingGlow size={width * 0.8} color="#FFB347" strength={0.05}
        style={{ alignSelf: 'center', top: height / 2 - width * 0.4 }}
        rise={-20} sway={0} grow={1.2} duration={1200} />

      {/* Waves (now see-through so the glow shows) */}
      <Animated.View style={[styles.wave, styles.wave2, { transform: [{ translateY: wave2Y }] }]} />
      <Animated.View style={[styles.wave, styles.wave1, { transform: [{ translateY: wave1Y }] }]} />

      <View style={styles.content}>
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <MzansiLogo size={130} />
        </Animated.View>

        <Animated.Text style={[styles.wordmark, { opacity: textOpacity }]}>
          <Text style={styles.white}>Mzansi</Text>
          <Text style={styles.orange}>way</Text>
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          {'The South African Way \u{1F1FF}\u{1F1E6}'}
        </Animated.Text>

        <Animated.View style={[styles.bar, { width: barWidth }]} />
      
      </View>

      

      <Animated.Text style={[styles.reg, { opacity: taglineOpacity }]}>
        {'Mzansiway NPC · Reg: 2026/211861/08'}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    left: -width * 0.1,
    right: -width * 0.1,
    borderRadius: width,
  },
  wave1: {
    bottom: -height * 0.2,
    height: height * 0.5,
    backgroundColor: 'rgba(0,56,101,0.45)',
  },
  wave2: {
    bottom: -height * 0.27,
    height: height * 0.5,
    backgroundColor: 'rgba(255,152,0,0.14)',
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  wordmark: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 1,
  },
  white: { color: '#FFFFFF' },
  orange: { color: '#FF9800' },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  bar: {
    height: 3,
    backgroundColor: '#FF9800',
    borderRadius: 2,
    marginTop: 24,
  },
  reg: {
    position: 'absolute',
    bottom: 36,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
    zIndex: 2,
  },
});
