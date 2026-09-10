import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { PortfolioSummary, CurrencyType, Asset } from '../types/portfolio';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface PortfolioHeaderProps {
  summary: PortfolioSummary;
  currency: CurrencyType;
  assets?: Asset[];
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
  assets = [],
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

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const isDailyProfitable = summary.dailyProfit >= 0;
  const isTotalProfitable = summary.totalProfit >= 0;

  // Pulse animation for live market status
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
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
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Spin animation for refresh button
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 750,
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

  // Calculate allocation breakdown
  const allocation = useMemo(() => {
    if (!assets || assets.length === 0 || summary.totalValue <= 0) return [];
    const catTotals: { [key: string]: { label: string; total: number; color: string } } = {
      bist_stock: { label: 'Borsa', total: 0, color: colors.stock },
      crypto: { label: 'Kripto', total: 0, color: colors.crypto },
      gold: { label: 'Emtia/Altın', total: 0, color: colors.gold },
      tefas_fund: { label: 'Fon', total: 0, color: colors.fund },
      halka_arz: { label: 'Halka Arz', total: 0, color: colors.halkaArz },
      forex: { label: 'Döviz', total: 0, color: colors.forex },
    };

    assets.forEach((a) => {
      const val = a.amount * (a.currentPrice || 0);
      const cat = a.category;
      if (catTotals[cat]) {
        catTotals[cat].total += val;
      } else {
        catTotals['bist_stock'].total += val;
      }
    });

    const items = Object.values(catTotals)
      .filter((c) => c.total > 0)
      .map((c) => ({
        ...c,
        percent: Math.round((c.total / summary.totalValue) * 100) || 1,
      }));

    return items;
  }, [assets, summary.totalValue, colors]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return (num || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.appTitle, { color: colors.text }]}>Portföyüm</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isDark ? 'rgba(0, 229, 153, 0.12)' : 'rgba(5, 150, 105, 0.12)' },
            ]}
          >
            <Animated.View style={[styles.liveDot, { backgroundColor: colors.profit, opacity: pulseAnim }]} />
            <Text style={[styles.statusBadgeText, { color: colors.profit }]}>
              {lastUpdatedTime ? `Canlı • ${lastUpdatedTime}` : 'Canlı Piyasa'}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          {/* Privacy Toggle */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsBalanceHidden(!isBalanceHidden);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

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
              <Ionicons name="search-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Notifications Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              onOpenNotifications();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.text} />
          </TouchableOpacity>

          {/* Refresh Button */}
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
              <Ionicons name="refresh-outline" size={18} color={colors.text} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Portfolio Value Section */}
      <View style={styles.valueSection}>
        <View style={styles.valueHeaderRow}>
          <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>NET PORTFÖY DEĞERİ</Text>
          <View style={[styles.modeIndicatorPill, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.modeIndicatorText, { color: colors.textSecondary }]}>Anlık Kur</Text>
          </View>
        </View>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {isBalanceHidden ? (
            '••••••••'
          ) : (
            <>
              {currSign}
              {formatNumber(summary.totalValue, 0)}
            </>
          )}
        </Text>
      </View>

      {/* Metrics Row: Daily vs Total Profit */}
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
              size={15}
              color={isDailyProfitable ? colors.profit : colors.loss}
            />
            <Text style={[styles.metricLabel, { color: isDailyProfitable ? colors.profit : colors.loss }]}>
              GÜNLÜK NET
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: isDailyProfitable ? colors.profit : colors.loss }]}>
            {isBalanceHidden ? (
              '••••••'
            ) : (
              <>
                {isDailyProfitable ? '+' : ''}
                {currSign}
                {formatNumber(summary.dailyProfit, 0)}
              </>
            )}
          </Text>
          <Text style={[styles.metricPercent, { color: isDailyProfitable ? colors.profit : colors.loss }]}>
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
              name={isTotalProfitable ? 'stats-chart-outline' : 'trending-down-outline'}
              size={15}
              color={isTotalProfitable ? colors.profit : colors.loss}
            />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TÜM DÖNEM</Text>
          </View>
          <Text style={[styles.metricValue, { color: isTotalProfitable ? colors.profit : colors.loss }]}>
            {isBalanceHidden ? (
              '••••••'
            ) : (
              <>
                {isTotalProfitable ? '+' : ''}
                {currSign}
                {formatNumber(summary.totalProfit, 0)}
              </>
            )}
          </Text>
          <Text style={[styles.metricPercent, { color: isTotalProfitable ? colors.profit : colors.loss }]}>
            {isTotalProfitable ? '+' : ''}
            {formatNumber(summary.totalProfitPercent, 2)}% kâr
          </Text>
        </View>
      </View>

      {/* Asset Allocation Breakdown Bar */}
      {allocation.length > 0 && !isBalanceHidden && (
        <View style={styles.allocationSection}>
          <View style={styles.allocationHeader}>
            <Text style={[styles.allocationLabel, { color: colors.textSecondary }]}>VARLIK DAĞILIMI</Text>
            <Text style={[styles.allocationTotal, { color: colors.textMuted }]}>{assets.length} Varlık</Text>
          </View>
          {/* Segmented multi-color bar */}
          <View style={styles.allocationBar}>
            {allocation.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.allocationSegment,
                  {
                    backgroundColor: item.color,
                    flex: Math.max(item.percent, 3),
                  },
                ]}
              />
            ))}
          </View>
          {/* Allocation Legends */}
          <View style={styles.allocationLegends}>
            {allocation.slice(0, 4).map((item, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                  {item.label} %{item.percent}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.addAssetButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onOpenAddAsset();
        }}
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.addAssetButtonText}>Yeni Varlık / Fon Ekle</Text>
      </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
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
    fontWeight: '900',
    letterSpacing: -0.6,
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
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '900',
  },
  valueSection: {
    marginBottom: 16,
  },
  valueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  modeIndicatorPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  modeIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricPercent: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  allocationSection: {
    marginBottom: 16,
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  allocationLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  allocationTotal: {
    fontSize: 11,
    fontWeight: '600',
  },
  allocationBar: {
    flexDirection: 'row',
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 2,
    marginBottom: 8,
  },
  allocationSegment: {
    height: '100%',
    borderRadius: 2,
  },
  allocationLegends: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  addAssetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 22,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  addAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
