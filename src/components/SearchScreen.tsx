import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { AssetCategory } from '../types/portfolio';
import {
  AssetSearchResult,
  searchAssets,
  LiveMarketData,
} from '../services/marketData';

interface SearchScreenProps {
  marketData: LiveMarketData;
  onAddToPortfolio: (asset: AssetSearchResult) => void;
}

const CATEGORY_FILTERS: { key: 'ALL' | AssetCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: 'Tümü', icon: 'grid-outline' },
  { key: 'tefas_fund', label: 'TEFAS Fon', icon: 'layers-outline' },
  { key: 'bist_stock', label: 'BIST Hisse', icon: 'trending-up-outline' },
  { key: 'halka_arz', label: 'Halka Arz', icon: 'rocket-outline' },
  { key: 'gold', label: 'Altın/Emtia', icon: 'cash-outline' },
];

const QUICK_TAGS = ['TLY', 'THYAO', 'MAC', 'TI2', 'ASTOR', 'KOCMT', 'ONRYT', 'GRAM_ALTIN'];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  marketData,
  onAddToPortfolio,
}) => {
  const { colors, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AssetCategory>('ALL');
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchTimeoutRef = useRef<any>(null);

  // Perform search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchAssets(query, marketData);
        setResults(data);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, query.length <= 1 ? 0 : 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, marketData]);

  // Filter results by selected category
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'ALL') return results;
    return results.filter((r) => r.category === selectedCategory);
  }, [results, selectedCategory]);

  const handleSelectTag = (tag: string) => {
    Haptics.selectionAsync();
    setQuery(tag);
  };

  const handleClear = () => {
    Haptics.selectionAsync();
    setQuery('');
  };

  const getCategoryMeta = (cat: AssetCategory) => {
    switch (cat) {
      case 'tefas_fund':
        return {
          label: 'TEFAS Fonu',
          color: '#8B5CF6',
          bg: isDark ? '#2E1065' : '#EDE9FE',
          icon: 'layers',
        };
      case 'bist_stock':
        return {
          label: 'BIST Hissesi',
          color: '#3B82F6',
          bg: isDark ? '#1E3A8A' : '#DBEAFE',
          icon: 'trending-up',
        };
      case 'halka_arz':
        return {
          label: 'Halka Arz',
          color: '#F59E0B',
          bg: isDark ? '#78350F' : '#FEF3C7',
          icon: 'rocket',
        };
      case 'gold':
        return {
          label: 'Altın / Emtia',
          color: '#EAB308',
          bg: isDark ? '#713F12' : '#FEF9C3',
          icon: 'cash',
        };
      case 'forex':
        return {
          label: 'Döviz',
          color: '#10B981',
          bg: isDark ? '#064E3B' : '#D1FAE5',
          icon: 'swap-horizontal',
        };
      default:
        return {
          label: 'Varlık',
          color: colors.primary,
          bg: colors.cardSecondary,
          icon: 'cube',
        };
    }
  };

  const formatPrice = (price: number, curr: string) => {
    const symbol = curr === 'TRY' ? '₺' : '$';
    const formatted = (price || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    });
    return `${symbol}${formatted}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Varlık & Fon Arama</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          BIST hisseleri, TEFAS fonları (örn: TLY), halka arzlar ve altın
        </Text>
      </View>

      {/* Search Bar Input */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Kod veya isim yazın (örn: TLY, THYAO, MAC)..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={19} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Quick Search Chips */}
      <View style={styles.quickTagsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_TAGS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.quickTagsContent}
          renderItem={({ item }) => {
            const isSelected = query.toUpperCase() === item;
            return (
              <TouchableOpacity
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.cardSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectTag(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Category Filter Tabs */}
      <View style={styles.categoryFiltersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.categoryFiltersContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory(item.key);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterBtnText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsCountRow}>
        <Text style={[styles.resultsCountText, { color: colors.textSecondary }]}>
          {filteredResults.length} varlık bulundu
          {query.trim() ? ` ("${query.trim().toUpperCase()}")` : ' (Popüler Varlıklar)'}
        </Text>
      </View>

      {/* Result Cards List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => `${item.category}_${item.symbol}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
        renderItem={({ item }) => {
          const meta = getCategoryMeta(item.category);
          const isProfitable = item.change24h >= 0;

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.symbolGroup}>
                  <View style={[styles.categoryIconCircle, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon as any} size={16} color={meta.color} />
                  </View>
                  <View style={styles.nameGroup}>
                    <View style={styles.symbolRow}>
                      <Text style={[styles.symbolText, { color: colors.text }]}>{item.symbol}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.categoryBadgeText, { color: meta.color }]}>
                          {meta.label}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.assetName, { color: colors.textSecondary }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                  </View>
                </View>

                {/* Price & 24h Change */}
                <View style={styles.priceGroup}>
                  <Text style={[styles.priceText, { color: colors.text }]}>
                    {formatPrice(item.price, item.currency)}
                  </Text>
                  <View
                    style={[
                      styles.changePill,
                      {
                        backgroundColor: isProfitable
                          ? (isDark ? '#064E3B' : '#DCFCE7')
                          : (isDark ? '#7F1D1D' : '#FEE2E2'),
                      },
                    ]}
                  >
                    <Ionicons
                      name={isProfitable ? 'caret-up' : 'caret-down'}
                      size={10}
                      color={isProfitable ? colors.profit : colors.loss}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        { color: isProfitable ? colors.profit : colors.loss },
                      ]}
                    >
                      %{Math.abs(item.change24h || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button: Portföye Ekle */}
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onAddToPortfolio(item);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Portföye Ekle</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Sonuç Bulunamadı</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                "{query}" sembolü bulunamadı. Kodu kontrol edebilir veya manuel olarak ekleyebilirsiniz.
              </Text>
              {query.trim().length >= 2 && (
                <TouchableOpacity
                  style={[styles.manualAddBtn, { borderColor: colors.primary }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onAddToPortfolio({
                      symbol: query.trim().toUpperCase(),
                      name: query.trim().toUpperCase(),
                      category: query.length === 3 ? 'tefas_fund' : 'bist_stock',
                      price: 0,
                      change24h: 0,
                      change7d: 0,
                      currency: 'TRY',
                    });
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.primary} />
                  <Text style={[styles.manualAddBtnText, { color: colors.primary }]}>
                    "{query.trim().toUpperCase()}" Olarak Manuel Ekle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  loader: {
    marginLeft: 8,
  },
  quickTagsContainer: {
    marginVertical: 6,
  },
  quickTagsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryFiltersContainer: {
    marginVertical: 6,
  },
  categoryFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultsCountRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 10,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameGroup: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  assetName: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceGroup: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 22,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  manualAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 14,
  },
  manualAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
