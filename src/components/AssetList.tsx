import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Asset, AssetCategory, CurrencyType, ViewMode } from '../types/portfolio';
import { AssetItem } from './AssetItem';

interface AssetListProps {
  assets: Asset[];
  currency: CurrencyType;
  fxRate: number;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onDelete: (id: string) => void;
  onEdit: (asset: Asset) => void;
  onAddNew: () => void;
}

type FilterCategory = 'all' | AssetCategory;

const CATEGORY_TABS: { key: FilterCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'bist_stock', label: 'BIST Hisse', icon: 'trending-up-outline' },
  { key: 'halka_arz', label: 'Halka Arz', icon: 'rocket-outline' },
  { key: 'crypto', label: 'Kripto', icon: 'logo-bitcoin' },
  { key: 'gold', label: 'Altın/Emtia', icon: 'cube-outline' },
  { key: 'tefas_fund', label: 'TEFAS Fon', icon: 'layers-outline' },
  { key: 'forex', label: 'Döviz', icon: 'cash-outline' },
];

const VIEW_MODES: { key: ViewMode; label: string; icon: string }[] = [
  { key: 'daily', label: 'Günlük (24S)', icon: 'today-outline' },
  { key: 'weekly', label: 'Haftalık (7G)', icon: 'calendar-outline' },
  { key: 'total', label: 'Toplam (Net)', icon: 'pie-chart-outline' },
];

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  currency,
  fxRate,
  viewMode,
  onSelectViewMode,
  onDelete,
  onEdit,
  onAddNew,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currSign = currency === 'TRY' ? '₺' : '$';
  const safeFxRate = fxRate > 0 ? fxRate : 48.5;

  const getConvertedPrice = (price: number, assetCurr: CurrencyType) => {
    if (currency === assetCurr) return price;
    if (currency === 'TRY' && assetCurr === 'USD') return price * safeFxRate;
    if (currency === 'USD' && assetCurr === 'TRY') return price / safeFxRate;
    return price;
  };

  // Live count per category for badge indicators
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: assets.length };
    assets.forEach((a) => {
      const cat = a.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      asset.category === selectedCategory ||
      (selectedCategory === 'bist_stock' && (asset.category as string) === 'stock') ||
      (selectedCategory === 'tefas_fund' && (asset.category as string) === 'fund') ||
      (selectedCategory === 'gold' && (asset.category as string) === 'commodity');
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate total weekly profit
  const { totalWeeklyProfit, topWeeklyAsset } = useMemo<{
    totalWeeklyProfit: number;
    topWeeklyAsset: { symbol: string; profit: number; percent: number } | null;
  }>(() => {
    let profit = 0;
    let top: { symbol: string; profit: number; percent: number } | null = null;
    let max = -Infinity;

    assets.forEach((a) => {
      const unitPrice = getConvertedPrice(a.currentPrice, a.currency);
      const holdingVal = a.amount * unitPrice;
      const weeklyPct = a.change7d !== undefined ? a.change7d : a.change24h * 2.2;
      const weeklyPnl = holdingVal * (weeklyPct / 100);
      profit += weeklyPnl;

      if (weeklyPnl > max) {
        max = weeklyPnl;
        top = { symbol: a.symbol, profit: weeklyPnl, percent: weeklyPct };
      }
    });

    return { totalWeeklyProfit: profit, topWeeklyAsset: top };
  }, [assets, currency, safeFxRate]);

  const isWeeklyProfitable = totalWeeklyProfit >= 0;

  return (
    <View style={styles.container}>
      {/* View Mode Switcher (Günlük | Haftalık | Toplam) */}
      <View
        style={[
          styles.viewModeContainer,
          { backgroundColor: isDark ? '#111827' : '#E2E8F0', borderColor: colors.border },
        ]}
      >
        {VIEW_MODES.map((mode) => {
          const isSelected = viewMode === mode.key;
          return (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.viewModeBtn,
                isSelected && {
                  backgroundColor: colors.card,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.14,
                  shadowRadius: 6,
                  elevation: 2,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                onSelectViewMode(mode.key);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={mode.icon as any}
                size={14}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.viewModeText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '900' : '600',
                  },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Weekly Highlight Banner */}
      {viewMode === 'weekly' && (
        <View
          style={[
            styles.weeklyBanner,
            {
              backgroundColor: isWeeklyProfitable ? colors.profitBg : colors.lossBg,
              borderColor: isWeeklyProfitable ? colors.profit : colors.loss,
            },
          ]}
        >
          <View style={styles.weeklyBannerLeft}>
            <View style={styles.weeklyBannerHeader}>
              <Ionicons
                name="calendar"
                size={15}
                color={isWeeklyProfitable ? colors.profit : colors.loss}
              />
              <Text
                style={[
                  styles.weeklyBannerTitle,
                  { color: isWeeklyProfitable ? colors.profit : colors.loss },
                ]}
              >
                SON 7 GÜNLÜK NET PERFORMANS
              </Text>
            </View>
            <Text
              style={[
                styles.weeklyBannerAmount,
                { color: isWeeklyProfitable ? colors.profit : colors.loss },
              ]}
            >
              {isWeeklyProfitable ? '+' : ''}
              {currSign}
              {Math.abs(Math.round(totalWeeklyProfit)).toLocaleString('tr-TR')}
            </Text>
          </View>

          {topWeeklyAsset !== null ? (
            <View style={styles.weeklyBannerRight}>
              <Text style={[styles.weeklyTopLabel, { color: colors.textSecondary }]}>Haftanın Lideri</Text>
              <Text style={[styles.weeklyTopVal, { color: colors.text }]}>
                {topWeeklyAsset.symbol} ({topWeeklyAsset.percent >= 0 ? '+' : ''}
                {topWeeklyAsset.percent.toFixed(1)}%)
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Section Title & Search */}
      <View style={styles.titleRow}>
        <View style={styles.titleWithBadge}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {viewMode === 'weekly'
              ? 'Haftalık Portföy Tablosu'
              : viewMode === 'total'
              ? 'Toplam Varlık Pozisyonları'
              : 'Varlıklarım & Yatırımlarım'}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.cardSecondary }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{filteredAssets.length}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onAddNew} style={styles.addInlineBtn}>
          <Ionicons name="add-circle" size={20} color={colors.primary} />
          <Text style={[styles.addInlineText, { color: colors.primary }]}>Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={17} color={colors.textMuted} />
        <TextInput
          placeholder="Hisse, kripto, fon veya halka arz ara..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills with Count Badges */}
      <View style={styles.categoryScroll}>
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.key;
          const count = categoryCounts[tab.key] || 0;
          if (tab.key !== 'all' && count === 0 && selectedCategory !== tab.key) return null;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSelectedCategory(tab.key);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {tab.label} {count > 0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Asset Items */}
      {filteredAssets.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="wallet-outline" size={44} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Kayıtlı Varlık Bulunamadı</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {searchQuery
              ? 'Arama kriterlerinize uygun varlık bulunamadı.'
              : 'Bu kategoride henüz portföyünüze eklenmiş bir varlık yok.'}
          </Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            onPress={onAddNew}
          >
            <Text style={styles.emptyAddBtnText}>Hemen Varlık Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredAssets.map((asset) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              currency={currency}
              fxRate={fxRate}
              viewMode={viewMode}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 999,
  },
  viewModeText: {
    fontSize: 12,
  },
  weeklyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  weeklyBannerLeft: {
    flex: 1,
  },
  weeklyBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  weeklyBannerTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  weeklyBannerAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  weeklyBannerRight: {
    alignItems: 'flex-end',
  },
  weeklyTopLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  weeklyTopVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  countText: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addInlineText: {
    fontSize: 14,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    padding: 0,
  },
  categoryScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 11.5,
  },
  listContainer: {
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
