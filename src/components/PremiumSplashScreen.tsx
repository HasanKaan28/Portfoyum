import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface PremiumSplashScreenProps {
  onFinish: () => void;
}

export const PremiumSplashScreen: React.FC<PremiumSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Staggered status items
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Initial Fade & Scale In
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loop for glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle continuous rotation
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Staggered items animation
    Animated.stagger(280, [
      Animated.timing(item1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(item2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(item3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Finish and transition to main app
    const timer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, pulseAnim, logoRotate, progressAnim, item1Anim, item2Anim, item3Anim, onFinish]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

      {/* Ambient background glow orbs */}
      <Animated.View
        style={[
          styles.glowOrb1,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb2,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Brand Emblem */}
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[
              styles.outerGlowCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dashedCircle,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <View style={styles.logoCore}>
            <Ionicons name="trending-up" size={38} color="#38BDF8" />
          </View>
        </View>

        {/* Brand Title & Tagline */}
        <Text style={styles.brandTitle}>PORTFÖYÜM</Text>
        <View style={styles.editionPill}>
          <Ionicons name="shield-checkmark" size={12} color="#38BDF8" />
          <Text style={styles.editionText}>BIST • TEFAS • HALKA ARZ</Text>
        </View>

        {/* Luxury Sync Status List */}
        <View style={styles.statusList}>
          <Animated.View style={[styles.statusItem, { opacity: item1Anim, transform: [{ translateY: item1Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Borsa İstanbul Canlı Veri Hattı</Text>
            <Ionicons name="checkmark-circle" size={15} color="#10B981" />
          </Animated.View>

          <Animated.View style={[styles.statusItem, { opacity: item2Anim, transform: [{ translateY: item2Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            <View style={[styles.statusDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.statusText}>TEFAS Resmi Fon Veritabanı</Text>
            <Ionicons name="checkmark-circle" size={15} color="#8B5CF6" />
          </Animated.View>

          <Animated.View style={[styles.statusItem, { opacity: item3Anim, transform: [{ translateY: item3Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusText}>SPK Halka Arz & Tavan Takibi</Text>
            <Ionicons name="checkmark-circle" size={15} color="#F59E0B" />
          </Animated.View>
        </View>

        {/* Sleek Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingNote}>Güvenli Portföy Başlatılıyor...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#070A12',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glowOrb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    top: height * 0.22,
    left: width * 0.1,
  },
  glowOrb2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    bottom: height * 0.25,
    right: width * 0.1,
  },
  content: {
    alignItems: 'center',
    width: width * 0.88,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  dashedCircle: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderStyle: 'dashed',
  },
  logoCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.6)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  editionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 36,
  },
  editionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  statusList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  progressTrack: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  loadingNote: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.3,
  },
});
