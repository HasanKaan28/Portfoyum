import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { PortfolioSummary, CurrencyType } from '../types/portfolio';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface PortfolioHeaderProps {
  summary: PortfolioSummary;
  currency: CurrencyType;
  onToggleCurrency: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNotifications: () => void;
  onOpenAddAsset: () => void;
  onOpenSearch?: () => void;
  lastUpdatedTime?: string;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  summary,
  currency,
  onToggleCurrency,
  onRefresh,
  isRefreshing,
  onOpenNotifications,
  onOpenAddAsset,
  onOpenSearch,
  lastUpdatedTime,
}) => {
  const { colors, isDark } = useTheme();
  const currSign = currency === 'TRY' ? '₺' : '$';

  const isDailyProfitable = summary.dailyProfit >= 0;
  const isTotalProfitable = summary.totalProfit >= 0;

  // Soft pulse animation for the live status dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Smooth spin animation for the refresh icon
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [isRefreshing, spinAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Scale button feedback for CTA
  const btnScale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return (num || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top action row */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.appTitle, { color: colors.text }]}>Portföyüm</Text>
          <View style={[styles.statusBadge, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
            <Text style={[styles.statusBadgeText, { color: colors.textSecondary }]}>
              {lastUpdatedTime ? `Canlı • ${lastUpdatedTime}` : 'Canlı Piyasa'}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          {/* Currency Switcher */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              onToggleCurrency();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.currencyText, { color: colors.primary }]}>{currency}</Text>
          </TouchableOpacity>

          {/* Search Button */}
          {onOpenSearch && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
              onPress={() => {
                Haptics.selectionAsync();
                onOpenSearch();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={19} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Instant Notification Trigger Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              onOpenNotifications();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Refresh Button with Smooth Spin */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRefresh();
            }}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <Ionicons name="refresh-outline" size={20} color={colors.text} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Portfolio Value */}
      <View style={styles.valueSection}>
        <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>Toplam Portföy Değeri</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {currSign}
          {formatNumber(summary.totalValue, 0)}
        </Text>
      </View>

      {/* Daily Profit & Total Profit Highlights */}
      <View style={styles.metricsRow}>
        {/* Daily Profit Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDailyProfitable ? colors.profitBg : colors.lossBg,
              borderColor: isDailyProfitable ? colors.profit : colors.loss,
            },
          ]}
        >
          <View style={styles.metricHeaderRow}>
            <Ionicons
              name={isDailyProfitable ? 'trending-up' : 'trending-down'}
              size={16}
              color={isDailyProfitable ? colors.profit : colors.loss}
            />
            <Text
              style={[
                styles.metricLabel,
                { color: isDailyProfitable ? colors.profit : colors.loss, fontWeight: '700' },
              ]}
            >
              GÜNLÜK KÂR / ZARAR
            </Text>
          </View>
          <Text
            style={[
              styles.metricValue,
              { color: isDailyProfitable ? colors.profit : colors.loss },
            ]}
          >
            {isDailyProfitable ? '+' : ''}
            {currSign}
            {formatNumber(summary.dailyProfit, 0)}
          </Text>
          <Text
            style={[
              styles.metricPercent,
              { color: isDailyProfitable ? colors.profit : colors.loss },
            ]}
          >
            {isDailyProfitable ? '+' : ''}
            {formatNumber(summary.dailyProfitPercent, 2)}% bugün
          </Text>
        </View>

        {/* Total Profit Card */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.cardSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.metricHeaderRow}>
            <Ionicons
              name={isTotalProfitable ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
              size={16}
              color={isTotalProfitable ? colors.profit : colors.loss}
            />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TOPLAM KÂR / ZARAR</Text>
          </View>
          <Text
            style={[
              styles.metricValue,
              { color: isTotalProfitable ? colors.profit : colors.loss },
            ]}
          >
            {isTotalProfitable ? '+' : ''}
            {currSign}
            {formatNumber(summary.totalProfit, 0)}
          </Text>
          <Text
            style={[
              styles.metricPercent,
              { color: isTotalProfitable ? colors.profit : colors.loss },
            ]}
          >
            {isTotalProfitable ? '+' : ''}
            {formatNumber(summary.totalProfitPercent, 2)}% tüm dönem
          </Text>
        </View>
      </View>

      {/* Quick Add Asset Button with Spring Scaling */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <TouchableOpacity
          style={[styles.addAssetButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.selectionAsync();
            onOpenAddAsset();
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addAssetButtonText}>Yeni Varlık / Fon Ekle</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '800',
  },
  valueSection: {
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 22,
    borderWidth: 1,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  addAssetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  addAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
