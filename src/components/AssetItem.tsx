import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Asset, CurrencyType, ViewMode } from '../types/portfolio';

interface AssetItemProps {
  asset: Asset;
  currency: CurrencyType;
  fxRate: number;
  viewMode: ViewMode;
  onDelete: (id: string) => void;
  onEdit: (asset: Asset) => void;
}

export const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  currency,
  fxRate,
  viewMode = 'daily',
  onDelete,
  onEdit,
}) => {
  const { colors, isDark } = useTheme();

  // Soft mount fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const safeFxRate = fxRate > 0 ? fxRate : 48.5;
  const getConvertedPrice = (price: number, assetCurr: CurrencyType) => {
    if (currency === assetCurr) return price;
    if (currency === 'TRY' && assetCurr === 'USD') return price * safeFxRate;
    if (currency === 'USD' && assetCurr === 'TRY') return price / safeFxRate;
    return price;
  };

  const currSign = currency === 'TRY' ? '₺' : '$';

  const unitCurrentPrice = getConvertedPrice(asset.currentPrice, asset.currency);
  const unitBuyPrice = getConvertedPrice(asset.buyPrice, asset.currency);

  const totalValue = asset.amount * unitCurrentPrice;
  const totalCost = asset.amount * unitBuyPrice;
  const totalProfit = totalValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Mode calculations
  let displayProfit = 0;
  let displayPercent = 0;
  let periodLabel = 'bugün';
  let footerTitle = 'Günlük Kâr:';

  if (viewMode === 'weekly') {
    displayPercent = asset.change7d !== undefined ? asset.change7d : asset.change24h * 2.2;
    displayProfit = totalValue * (displayPercent / 100);
    periodLabel = '7 gün';
    footerTitle = 'Haftalık Kâr:';
  } else if (viewMode === 'total') {
    displayProfit = totalProfit;
    displayPercent = totalProfitPercent;
    periodLabel = 'toplam';
    footerTitle = 'Toplam Kâr:';
  } else {
    displayPercent = asset.change24h || 0;
    displayProfit = totalValue * (displayPercent / 100);
    periodLabel = '24s';
    footerTitle = 'Günlük Kâr:';
  }

  const isProfitable = displayProfit >= 0;

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Varlığı Sil',
      `${asset.name} (${asset.symbol}) portföyünüzden kaldırılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete(asset.id);
          },
        },
      ]
    );
  };

  const getCategoryIcon = () => {
    switch (asset.category as string) {
      case 'halka_arz':
        return { name: 'rocket-outline' as const, color: colors.halkaArz || '#EC4899' };
      case 'bist_stock':
      case 'stock':
        return { name: 'bar-chart-outline' as const, color: colors.bist || '#2563EB' };
      case 'tefas_fund':
      case 'fund':
        return { name: 'layers-outline' as const, color: colors.tefas || '#8B5CF6' };
      case 'gold':
      case 'commodity':
        return { name: 'cube-outline' as const, color: colors.gold };
      case 'crypto':
        return { name: 'logo-bitcoin' as const, color: colors.crypto };
      case 'forex':
        return { name: 'cash-outline' as const, color: colors.forex };
      default:
        return { name: 'wallet-outline' as const, color: colors.primary };
    }
  };

  const catIcon = getCategoryIcon();

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onEdit(asset)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.topRow}>
          {/* Icon & Name */}
          <View style={styles.leftInfo}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name={catIcon.name} size={22} color={catIcon.color} />
            </View>
            <View style={styles.nameColumn}>
              <View style={styles.symbolRow}>
                <Text style={[styles.symbolText, { color: colors.text }]}>{asset.symbol}</Text>
                {asset.category === 'halka_arz' && (
                  <View style={[styles.tavanBadge, { backgroundColor: colors.profitBg, borderColor: colors.profit }]}>
                    <Text style={[styles.tavanText, { color: colors.profit }]}>
                      {asset.tavanCount ? `🚀 ${asset.tavanCount}. Tavan` : '🚀 Halka Arz'}
                    </Text>
                  </View>
                )}
                {asset.broker && (
                  <View
                    style={[
                      styles.brokerPill,
                      {
                        backgroundColor:
                          asset.broker === 'Ziraat'
                            ? colors.ziraat + '25'
                            : asset.broker === 'Midas'
                            ? colors.midas + '25'
                            : colors.cardSecondary,
                        borderColor:
                          asset.broker === 'Ziraat'
                            ? colors.ziraat
                            : asset.broker === 'Midas'
                            ? colors.midas
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.brokerPillText,
                        {
                          color:
                            asset.broker === 'Ziraat'
                              ? colors.ziraat
                              : asset.broker === 'Midas'
                              ? colors.midas
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {asset.broker}
                    </Text>
                  </View>
                )}
                {/* Change Pill based on active viewMode (Daily / Weekly / Total) */}
                <View
                  style={[
                    styles.changePill,
                    { backgroundColor: isProfitable ? colors.profitBg : colors.lossBg },
                  ]}
                >
                  <Text style={[styles.changePillText, { color: isProfitable ? colors.profit : colors.loss }]}>
                    {isProfitable ? '+' : ''}
                    {displayPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
              <Text style={[styles.nameText, { color: colors.textSecondary }]} numberOfLines={1}>
                {asset.name}
              </Text>
            </View>
          </View>

          {/* Right side: Total Value */}
          <View style={styles.rightInfo}>
            <Text style={[styles.totalValueText, { color: colors.text }]}>
              {currSign}
              {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.amountText, { color: colors.textSecondary }]}>
              {asset.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} adet
            </Text>
          </View>
        </View>

        {/* Bottom details & Quick actions */}
        <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
          <View style={styles.costInfo}>
            <Text style={[styles.costLabel, { color: colors.textMuted }]}>
              Birim: {currSign}{unitCurrentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.profitInline}>
              <Text style={[styles.costLabel, { color: colors.textMuted }]}>{footerTitle} </Text>
              <Text style={[styles.profitInlineValue, { color: isProfitable ? colors.profit : colors.loss }]}>
                {isProfitable ? '+' : ''}
                {currSign}
                {Math.abs(displayProfit).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ({isProfitable ? '+' : ''}
                {displayPercent.toFixed(1)}% {periodLabel})
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.smallActionBtn, { backgroundColor: colors.cardSecondary }]}
              onPress={() => onEdit(asset)}
            >
              <Ionicons name="create-outline" size={17} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallActionBtn, { backgroundColor: isDark ? '#3E1F1F' : '#FEE2E2' }]}
              onPress={handleDeletePress}
            >
              <Ionicons name="trash-outline" size={17} color={colors.loss} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameColumn: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '800',
  },
  tavanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  tavanText: {
    fontSize: 10,
    fontWeight: '800',
  },
  brokerPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  brokerPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  changePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  totalValueText: {
    fontSize: 17,
    fontWeight: '800',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  profitInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profitInlineValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
