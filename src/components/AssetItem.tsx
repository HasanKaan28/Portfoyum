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

  // Mount animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
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
  let footerTitle = 'Günlük:';

  if (viewMode === 'weekly') {
    displayPercent = asset.change7d !== undefined ? asset.change7d : asset.change24h * 2.2;
    displayProfit = totalValue * (displayPercent / 100);
    periodLabel = '7g';
    footerTitle = 'Haftalık:';
  } else if (viewMode === 'total') {
    displayProfit = totalProfit;
    displayPercent = totalProfitPercent;
    periodLabel = 'net';
    footerTitle = 'Toplam:';
  } else {
    displayPercent = asset.change24h || 0;
    displayProfit = totalValue * (displayPercent / 100);
    periodLabel = '24s';
    footerTitle = 'Günlük:';
  }

  const isProfitable = displayProfit >= 0;

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Varlığı Kaldır',
      `${asset.name} (${asset.symbol}) portföyden silinsin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
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

  const getCategoryDetails = () => {
    switch (asset.category as string) {
      case 'halka_arz':
        return { name: 'rocket-outline' as const, color: colors.halkaArz, bg: colors.halkaArz + '20' };
      case 'bist_stock':
      case 'stock':
        return { name: 'trending-up-outline' as const, color: colors.stock, bg: colors.stock + '20' };
      case 'tefas_fund':
      case 'fund':
        return { name: 'layers-outline' as const, color: colors.fund, bg: colors.fund + '20' };
      case 'gold':
      case 'commodity':
        return { name: 'cube-outline' as const, color: colors.gold, bg: colors.gold + '20' };
      case 'crypto':
        return { name: 'logo-bitcoin' as const, color: colors.crypto, bg: colors.crypto + '20' };
      case 'forex':
        return { name: 'cash-outline' as const, color: colors.forex, bg: colors.forex + '20' };
      default:
        return { name: 'wallet-outline' as const, color: colors.primary, bg: colors.primary + '20' };
    }
  };

  const cat = getCategoryDetails();

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
      {/* Left decorative category accent indicator */}
      <View style={[styles.leftAccentStrip, { backgroundColor: cat.color }]} />

      <TouchableOpacity
        activeOpacity={0.94}
        onPress={() => onEdit(asset)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardInner}
      >
        <View style={styles.topRow}>
          {/* Icon & Details */}
          <View style={styles.leftInfo}>
            <View style={[styles.iconContainer, { backgroundColor: cat.bg }]}>
              <Ionicons name={cat.name} size={20} color={cat.color} />
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
                            ? colors.ziraat + '20'
                            : asset.broker === 'Midas'
                            ? colors.midas + '20'
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
              </View>
              <Text style={[styles.nameText, { color: colors.textSecondary }]} numberOfLines={1}>
                {asset.name}
              </Text>
            </View>
          </View>

          {/* Right side: Value & Amount */}
          <View style={styles.rightInfo}>
            <Text style={[styles.totalValueText, { color: colors.text }]}>
              {currSign}
              {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {/* Change Pill */}
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
        </View>

        {/* Bottom details & Actions */}
        <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
          <View style={styles.costInfo}>
            <Text style={[styles.costLabel, { color: colors.textMuted }]}>
              {asset.amount.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} adet • Birim: {currSign}
              {unitCurrentPrice.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
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
              onPress={() => {
                Haptics.selectionAsync();
                onEdit(asset);
              }}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallActionBtn, { backgroundColor: isDark ? 'rgba(255, 77, 106, 0.15)' : '#FEE2E2' }]}
              onPress={handleDeletePress}
            >
              <Ionicons name="trash-outline" size={16} color={colors.loss} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftAccentStrip: {
    width: 4,
  },
  cardInner: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
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
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  tavanBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  tavanText: {
    fontSize: 10,
    fontWeight: '800',
  },
  brokerPill: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
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
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  changePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  rightInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalValueText: {
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: -0.5,
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
    gap: 6,
  },
  smallActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
