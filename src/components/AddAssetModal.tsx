import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Asset, AssetCategory, CurrencyType } from '../types/portfolio';
import {
  LiveMarketData,
  PRESET_ASSETS,
  PresetAsset,
  getPriceForAsset,
  fetchLivePriceForSymbol,
  searchAssets,
  AssetSearchResult,
} from '../services/marketData';
import { CURRENT_HALKA_ARZLAR } from '../services/ipoService';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'lastUpdated'>, editingId?: string) => void;
  editingAsset?: Asset | null;
  initialPreset?: Partial<Asset> | null;
  marketData: LiveMarketData;
}

const MAIN_TABS: { key: AssetCategory; label: string; icon: string; tag: string }[] = [
  { key: 'halka_arz', label: 'Halka Arz', icon: 'rocket', tag: 'SPK' },
  { key: 'bist_stock', label: 'BIST Hisse', icon: 'trending-up', tag: 'Borsa' },
  { key: 'tefas_fund', label: 'TEFAS Fon', icon: 'layers', tag: 'Fon' },
  { key: 'gold', label: 'Altın/Döviz', icon: 'cash', tag: 'Emtia' },
];

const BROKER_OPTIONS = ['Ziraat', 'Midas', 'İş Bankası', 'Garanti BBVA', 'Yapı Kredi', 'Vakıfbank', 'Diğer'];

const COMMISSION_RATES = [
  { label: 'Sıfır Komisyon', rate: 0 },
  { label: 'Midas (%0.04)', rate: 0.0004 },
  { label: 'Banka (%0.20)', rate: 0.0020 },
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  visible,
  onClose,
  onSave,
  editingAsset,
  initialPreset,
  marketData,
}) => {
  const { colors, isDark } = useTheme();

  // Core Form State
  const [category, setCategory] = useState<AssetCategory>('halka_arz');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('TRY');

  // Specialized State for Halka Arz, BIST and TEFAS
  const [selectedBroker, setSelectedBroker] = useState<string>('Ziraat');
  const [selectedTavan, setSelectedTavan] = useState<number>(0);
  const [selectedCommission, setSelectedCommission] = useState<number>(0);
  const [showTavanSimulator, setShowTavanSimulator] = useState<boolean>(true);

  // Populate when editing or reset when adding
  useEffect(() => {
    if (editingAsset) {
      setCategory(editingAsset.category);
      setSymbol(editingAsset.symbol);
      setName(editingAsset.name);
      setAmount(editingAsset.amount.toString());
      setBuyPrice(editingAsset.buyPrice.toString());
      setCurrentPrice(editingAsset.currentPrice.toString());
      setCurrency(editingAsset.currency);
      setSelectedTavan(editingAsset.tavanCount || 0);
      setSelectedBroker(editingAsset.broker || 'Ziraat');
    } else if (initialPreset) {
      setCategory(initialPreset.category || 'halka_arz');
      setSymbol(initialPreset.symbol || '');
      setName(initialPreset.name || '');
      const defaultAmount = initialPreset.category === 'halka_arz' ? '30' : '10';
      setAmount(initialPreset.amount ? initialPreset.amount.toString() : defaultAmount);
      setBuyPrice(initialPreset.buyPrice ? initialPreset.buyPrice.toString() : '');
      setCurrentPrice(initialPreset.currentPrice ? initialPreset.currentPrice.toString() : '');
      setCurrency(initialPreset.currency || 'TRY');
      setSelectedTavan(initialPreset.tavanCount || 0);
      setSelectedBroker(initialPreset.broker || 'Ziraat');
    } else {
      // Default to first IPO preset
      const defaultPreset = PRESET_ASSETS.find((p) => p.category === 'halka_arz') || PRESET_ASSETS[0];
      if (defaultPreset) {
        applyPreset(defaultPreset);
      }
    }
  }, [editingAsset, initialPreset, visible]);

  // Modal Search State
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState<AssetSearchResult[]>([]);
  const [isModalSearching, setIsModalSearching] = useState(false);
  const modalSearchTimer = useRef<any>(null);

  const handleModalSearch = (text: string) => {
    setModalSearchQuery(text);
    if (!text.trim()) {
      setModalSearchResults([]);
      setIsModalSearching(false);
      return;
    }

    if (modalSearchTimer.current) clearTimeout(modalSearchTimer.current);
    setIsModalSearching(true);
    modalSearchTimer.current = setTimeout(async () => {
      try {
        const found = await searchAssets(text, marketData);
        setModalSearchResults(found.slice(0, 6));
      } catch {
      } finally {
        setIsModalSearching(false);
      }
    }, text.length <= 1 ? 50 : 300);
  };

  const handleSelectSearchResult = (item: AssetSearchResult) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory(item.category);
    setSymbol(item.symbol);
    setName(item.name);
    setCurrency(item.currency || 'TRY');
    if (item.price > 0) {
      setCurrentPrice(item.price.toString());
      setBuyPrice(item.price.toString());
    }
    setModalSearchQuery('');
    setModalSearchResults([]);
  };

  const [isFetchingLive, setIsFetchingLive] = useState(false);

  const applyPreset = (preset: PresetAsset) => {
    setCategory(preset.category);
    setSymbol(preset.symbol);
    setName(preset.name);
    setCurrency(preset.defaultCurrency);
    setSelectedTavan(preset.tavanCount || 0);

    const priceInfo = getPriceForAsset(preset.symbol, marketData);
    const unitPrice = (priceInfo.price > 0 ? priceInfo.price : preset.basePrice) || 0;
    setCurrentPrice(unitPrice.toString());
    setBuyPrice(unitPrice.toString());

    // Asynchronously fetch latest live price from market
    fetchLivePriceForSymbol(preset.symbol, preset.category).then((live) => {
      if (live && live.price > 0) {
        setCurrentPrice(live.price.toString());
        setBuyPrice(live.price.toString());
      }
    });
  };

  const fetchCustomSymbolPrice = async (targetSym?: string) => {
    const sym = (targetSym || symbol).trim().toUpperCase();
    if (!sym || sym.length < 2) return;
    setIsFetchingLive(true);
    try {
      const live = await fetchLivePriceForSymbol(sym, category);
      if (live && live.price > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCurrentPrice(live.price.toString());
        setBuyPrice(live.price.toString());
        if (live.currency) setCurrency(live.currency);
      }
    } catch {
      // Ignored
    } finally {
      setIsFetchingLive(false);
    }
  };

  const handleSelectTab = (tabKey: AssetCategory) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory(tabKey);

    // Auto-select first preset in selected category
    const presetsInCat = PRESET_ASSETS.filter((p) => p.category === tabKey);
    if (presetsInCat.length > 0 && !editingAsset) {
      applyPreset(presetsInCat[0]);
    }
  };

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const numBuyPrice = parseFloat(buyPrice.replace(',', '.')) || 0;
  const numCurrentPrice = parseFloat(currentPrice.replace(',', '.')) || 0;

  // Calculation with optional commission
  const commissionAmount = numAmount * numBuyPrice * selectedCommission;
  const totalCost = numAmount * numBuyPrice + commissionAmount;
  const totalValue = numAmount * numCurrentPrice;
  const totalProfit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const currSign = currency === 'TRY' ? '₺' : '$';

  // Ceiling (Tavan) Profit Simulations for IPOs
  const tavanSimulations = useMemo(() => {
    if (numBuyPrice <= 0 || numAmount <= 0) return [];
    const results = [];
    let prevPrice = numBuyPrice;
    for (let day = 1; day <= 5; day++) {
      const tavanPrice = prevPrice * 1.10;
      const tavanValue = numAmount * tavanPrice;
      const profit = tavanValue - (numAmount * numBuyPrice);
      const percent = ((tavanPrice - numBuyPrice) / numBuyPrice) * 100;
      results.push({
        day,
        price: tavanPrice,
        profit,
        percent,
      });
      prevPrice = tavanPrice;
    }
    return results;
  }, [numBuyPrice, numAmount]);

  const handleSave = () => {
    if (!symbol.trim() || !name.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen varlık adı ve sembolünü girin.');
      return;
    }
    if (numAmount <= 0) {
      Alert.alert('Geçersiz Miktar', 'Lütfen 0 dan büyük bir miktar girin.');
      return;
    }
    if (numBuyPrice < 0) {
      Alert.alert('Geçersiz Fiyat', 'Alış fiyatı negatif olamaz.');
      return;
    }

    const priceInfo = getPriceForAsset(symbol.toUpperCase(), marketData);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(
      {
        symbol: symbol.toUpperCase(),
        name,
        category,
        amount: numAmount,
        buyPrice: numBuyPrice,
        currentPrice: numCurrentPrice > 0 ? numCurrentPrice : priceInfo.price,
        currency,
        change24h: priceInfo.change24h,
        change7d: priceInfo.change7d,
        tavanCount: category === 'halka_arz' ? selectedTavan : undefined,
        broker: category === 'halka_arz' ? selectedBroker : undefined,
      },
      editingAsset?.id
    );

    onClose();
  };

  // Quick Lot increment helper
  const addLotAmount = (additional: number) => {
    Haptics.selectionAsync();
    const current = parseFloat(amount.replace(',', '.')) || 0;
    setAmount((current + additional).toString());
  };

  // Helper to copy live market price into buy price
  const copyCurrentPriceToBuy = () => {
    Haptics.selectionAsync();
    const priceInfo = getPriceForAsset(symbol.toUpperCase(), marketData);
    if (priceInfo.price > 0) {
      setBuyPrice(priceInfo.price.toString());
      setCurrentPrice(priceInfo.price.toString());
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {editingAsset
                  ? 'Varlığı Düzenle'
                  : category === 'halka_arz'
                  ? '🚀 Halka Arz Ekle'
                  : category === 'bist_stock'
                  ? '📈 BIST Hissesi Ekle'
                  : category === 'tefas_fund'
                  ? '🏛️ TEFAS Fonu Ekle'
                  : '🪙 Altın / Döviz Ekle'}
              </Text>
              <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                {category === 'halka_arz'
                  ? 'SPK onaylı halka arzlar, dağıtım lotu ve tavan kâr hesabı'
                  : category === 'bist_stock'
                  ? 'Borsa İstanbul 30/100 lot alımı ve maliyet hesabı'
                  : category === 'tefas_fund'
                  ? 'Yatırım fonu pay adedi ve TEFAS getiri takibi'
                  : 'Kapalıçarşı altın ve serbest piyasa kurları'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Smart Quick Asset Search Bar */}
          {!editingAsset && (
            <View style={[styles.modalSearchContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}>
              <Ionicons name="search" size={17} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Kod veya Varlık Ara (örn: TLY, ASTOR, MAC)..."
                placeholderTextColor={colors.textMuted}
                value={modalSearchQuery}
                onChangeText={handleModalSearch}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {isModalSearching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : modalSearchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => { setModalSearchQuery(''); setModalSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Quick Search Dropdown Suggestions */}
          {!editingAsset && modalSearchResults.length > 0 && (
            <View style={[styles.modalSearchResultsDropdown, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.modalDropdownTitle, { color: colors.textSecondary }]}>
                Bulunan Varlıklar (Dokunarak doğrudan seçebilirsiniz):
              </Text>
              <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                {modalSearchResults.map((item) => (
                  <TouchableOpacity
                    key={`${item.category}_${item.symbol}`}
                    style={[styles.dropdownItemRow, { borderBottomColor: colors.border }]}
                    onPress={() => handleSelectSearchResult(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <View
                        style={[
                          styles.dropdownCategoryBadge,
                          {
                            backgroundColor:
                              item.category === 'tefas_fund'
                                ? '#8B5CF6'
                                : item.category === 'bist_stock'
                                ? '#3B82F6'
                                : item.category === 'halka_arz'
                                ? '#F59E0B'
                                : '#EAB308',
                          },
                        ]}
                      >
                        <Text style={styles.dropdownCategoryBadgeText}>
                          {item.category === 'tefas_fund'
                            ? 'FON'
                            : item.category === 'bist_stock'
                            ? 'BIST'
                            : item.category === 'halka_arz'
                            ? 'ARZ'
                            : 'ALTIN'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdownSymbolText, { color: colors.text }]}>{item.symbol}</Text>
                        <Text style={[styles.dropdownNameText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.dropdownItemRight}>
                      <Text style={[styles.dropdownPriceText, { color: colors.text }]}>
                        ₺{item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </Text>
                      <Text
                        style={[
                          styles.dropdownChangeText,
                          { color: item.change24h >= 0 ? colors.profit : colors.loss },
                        ]}
                      >
                        {item.change24h >= 0 ? '+' : ''}
                        %{item.change24h.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Specialized Top Category Tabs (Segmented Control) */}
          <View style={[styles.segmentedTabBar, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            {MAIN_TABS.map((tab) => {
              const isSelected = category === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.segmentTab,
                    isSelected && {
                      backgroundColor: colors.card,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => handleSelectTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={14}
                    color={
                      isSelected
                        ? tab.key === 'halka_arz'
                          ? colors.halkaArz || '#EC4899'
                          : colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      {
                        color: isSelected
                          ? tab.key === 'halka_arz'
                            ? colors.halkaArz || '#EC4899'
                            : colors.text
                          : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ========================================================================= */}
            {/* 1. HALKA ARZ ÖZEL ARAYÜZÜ                                                 */}
            {/* ========================================================================= */}
            {category === 'halka_arz' && (
              <View style={styles.sectionContainer}>
                {/* Güncel Halka Arzlar Listesi */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  GÜNCEL SPK HALKA ARZLARI
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {CURRENT_HALKA_ARZLAR.map((ipo) => {
                    const isSelected = symbol === ipo.code;
                    return (
                      <TouchableOpacity
                        key={ipo.id}
                        style={[
                          styles.ipoCardPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#371B2F'
                                : '#FDF2F8'
                              : colors.cardSecondary,
                            borderColor: isSelected ? (colors.halkaArz || '#EC4899') : colors.border,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSymbol(ipo.code);
                          setName(ipo.companyName);
                          setBuyPrice(ipo.price.toString());
                          setCurrentPrice(ipo.price.toString());
                          setCurrency('TRY');
                          setSelectedTavan(ipo.tavanCount || 0);
                          if (ipo.estimatedLots && ipo.estimatedLots.length > 0) {
                            setAmount(ipo.estimatedLots[0].lots.toString());
                          }
                        }}
                      >
                        <View style={styles.ipoPillTop}>
                          <Text style={[styles.ipoPillCode, { color: colors.halkaArz || '#EC4899' }]}>
                            {ipo.code}
                          </Text>
                          <Text style={[styles.ipoPillPrice, { color: colors.text }]}>₺{ipo.price.toFixed(2)}</Text>
                        </View>
                        <Text style={[styles.ipoPillName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {ipo.companyName}
                        </Text>
                        <View style={styles.ipoPillFooter}>
                          <Text style={[styles.ipoPillStatus, { color: ipo.status === 'talep_toplaniyor' ? colors.profit : colors.primary }]}>
                            {ipo.statusLabel}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Katılınan Banka / Aracı Kurum Seçimi */}
                <View style={styles.inputSpacing}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    HANGİ KURUMDAN KATILDINIZ?
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brokerScroll}>
                    {BROKER_OPTIONS.map((broker) => {
                      const isSelected = selectedBroker === broker;
                      return (
                        <TouchableOpacity
                          key={broker}
                          style={[
                            styles.brokerChip,
                            {
                              backgroundColor: isSelected
                                ? broker === 'Ziraat'
                                  ? colors.ziraat
                                  : broker === 'Midas'
                                  ? colors.midas
                                  : colors.primary
                                : colors.cardSecondary,
                              borderColor: isSelected ? 'transparent' : colors.border,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedBroker(broker);
                          }}
                        >
                          {broker === 'Ziraat' && <Ionicons name="checkmark-circle" size={13} color="#FFF" />}
                          {broker === 'Midas' && <Ionicons name="flash" size={13} color="#FFF" />}
                          <Text
                            style={[
                              styles.brokerChipText,
                              { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '800' : '600' },
                            ]}
                          >
                            {broker}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Halka Arz Kod & İsim */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Hisse Kodu</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={symbol}
                      onChangeText={setSymbol}
                      onBlur={() => fetchCustomSymbolPrice()}
                      placeholder="KOCMT..."
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Halka Arz Fiyatı (₺)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={buyPrice}
                      onChangeText={(val) => {
                        setBuyPrice(val);
                        setCurrentPrice(val);
                      }}
                      placeholder="20.50"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Hızlı Lot Seçici */}
                <View style={styles.inputSpacing}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      DAĞITILAN / ALINAN LOT MİKTARI
                    </Text>
                    <Text style={[styles.helperBadge, { color: colors.halkaArz || '#EC4899' }]}>
                      {numAmount > 0 ? `${numAmount} Lot = ₺${(numAmount * numBuyPrice).toLocaleString('tr-TR')}` : ''}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Kaç lot dağıtıldı? (örn: 35)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                  />
                  <View style={styles.quickLotRow}>
                    {[15, 25, 35, 50, 75, 100].map((lot) => (
                      <TouchableOpacity
                        key={lot}
                        style={[styles.quickLotBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setAmount(lot.toString());
                        }}
                      >
                        <Text style={[styles.quickLotText, { color: colors.primary }]}>{lot} Lot</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Tavan Sayısı Seçici (İşlem Görenler İçin) */}
                <View style={styles.inputSpacing}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    KAÇINCI TAVANDA? (İŞLEM GÖRENLER İÇİN)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tavanScroll}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((count) => {
                      const isSelected = selectedTavan === count;
                      return (
                        <TouchableOpacity
                          key={count}
                          style={[
                            styles.tavanPill,
                            {
                              backgroundColor: isSelected ? colors.profit : colors.cardSecondary,
                              borderColor: isSelected ? colors.profit : colors.border,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedTavan(count);
                            if (count > 0 && numBuyPrice > 0) {
                              const calcCurrent = numBuyPrice * Math.pow(1.10, count);
                              setCurrentPrice(calcCurrent.toFixed(2));
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.tavanPillText,
                              { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '800' : '600' },
                            ]}
                          >
                            {count === 0 ? '0 (Başlamadı)' : `🚀 ${count}. Tavan`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Canlı Tavan Kâr Simülatörü */}
                {numAmount > 0 && numBuyPrice > 0 && (
                  <View style={[styles.simulatorBox, { backgroundColor: isDark ? '#1E293B' : '#FDF2F8', borderColor: colors.halkaArz || '#EC4899' }]}>
                    <TouchableOpacity
                      style={styles.simulatorHeader}
                      onPress={() => setShowTavanSimulator(!showTavanSimulator)}
                    >
                      <View style={styles.simTitleRow}>
                        <Ionicons name="calculator" size={16} color={colors.halkaArz || '#EC4899'} />
                        <Text style={[styles.simulatorTitle, { color: colors.halkaArz || '#EC4899' }]}>
                          Tavan Kâr Simülasyonu ({numAmount} Lot İçin)
                        </Text>
                      </View>
                      <Ionicons
                        name={showTavanSimulator ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.halkaArz || '#EC4899'}
                      />
                    </TouchableOpacity>

                    {showTavanSimulator && (
                      <View style={styles.simTable}>
                        <View style={styles.simTableHeader}>
                          <Text style={[styles.simCol, { color: colors.textSecondary }]}>Tavan</Text>
                          <Text style={[styles.simCol, { color: colors.textSecondary }]}>Hisse Fiyatı</Text>
                          <Text style={[styles.simCol, { color: colors.textSecondary }]}>Getiri %</Text>
                          <Text style={[styles.simCol, { color: colors.textSecondary }]}>Net Kâr (TL)</Text>
                        </View>
                        {tavanSimulations.map((sim) => (
                          <View key={sim.day} style={styles.simRow}>
                            <Text style={[styles.simCell, { color: colors.text, fontWeight: '700' }]}>
                              🚀 {sim.day}. Tavan
                            </Text>
                            <Text style={[styles.simCell, { color: colors.text }]}>₺{sim.price.toFixed(2)}</Text>
                            <Text style={[styles.simCell, { color: colors.profit, fontWeight: '700' }]}>
                              +{sim.percent.toFixed(1)}%
                            </Text>
                            <Text style={[styles.simCell, { color: colors.profit, fontWeight: '800' }]}>
                              +₺{Math.round(sim.profit).toLocaleString('tr-TR')}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* ========================================================================= */}
            {/* 2. BIST HİSSE ÖZEL ARAYÜZÜ                                                 */}
            {/* ========================================================================= */}
            {category === 'bist_stock' && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  POPÜLER BIST 30 / 100 HİSSELERİ
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {PRESET_ASSETS.filter((p) => p.category === 'bist_stock').map((p) => {
                    const isSelected = symbol === p.symbol;
                    const priceInfo = getPriceForAsset(p.symbol, marketData);
                    return (
                      <TouchableOpacity
                        key={p.symbol}
                        style={[
                          styles.stockPresetPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#1E3A5F'
                                : '#EFF6FF'
                              : colors.cardSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => applyPreset(p)}
                      >
                        <View style={styles.stockPillHeader}>
                          <Text style={[styles.stockPillSymbol, { color: colors.primary }]}>{p.symbol}</Text>
                          <Text
                            style={[
                              styles.stockPillChange,
                              { color: priceInfo.change24h >= 0 ? colors.profit : colors.loss },
                            ]}
                          >
                            {priceInfo.change24h >= 0 ? '+' : ''}
                            {priceInfo.change24h.toFixed(1)}%
                          </Text>
                        </View>
                        <Text style={[styles.stockPillPrice, { color: colors.text }]}>
                          ₺{priceInfo.price.toFixed(2)}
                        </Text>
                        <Text style={[styles.stockPillName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Hisse Kodu ve Adı */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Hisse Kodu (Sembol)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={symbol}
                      onChangeText={setSymbol}
                      onBlur={() => fetchCustomSymbolPrice()}
                      placeholder="THYAO, ASELS..."
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Şirket Unvanı</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Türk Hava Yolları..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Lot Adedi ve Hızlı Artırma Butonları */}
                <View style={styles.inputSpacing}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>LOT MİKTARI (1 LOT = 1 PAY)</Text>
                    <Text style={[styles.helperBadge, { color: colors.primary }]}>
                      {numAmount > 0 ? `${numAmount} Lot` : ''}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Lot adedi girin (örn: 100)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                  />
                  <View style={styles.quickLotRow}>
                    {[10, 50, 100, 250, 500].map((inc) => (
                      <TouchableOpacity
                        key={inc}
                        style={[styles.quickLotBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
                        onPress={() => addLotAmount(inc)}
                      >
                        <Text style={[styles.quickLotText, { color: colors.primary }]}>+{inc} Lot</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Alış Fiyatı & Güncel Piyasa Fiyatı */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alış Fiyatı (₺)</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={buyPrice}
                      onChangeText={setBuyPrice}
                      placeholder="Maliyet fiyatı"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Piyasa Fiyatı (₺)</Text>
                      <TouchableOpacity onPress={copyCurrentPriceToBuy}>
                        <Text style={[styles.copyBtnText, { color: colors.primary }]}>⚡ Eşitle</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={currentPrice}
                      onChangeText={setCurrentPrice}
                      placeholder="Anlık fiyat"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Aracı Kurum Komisyon Oranı */}
                <View style={styles.inputSpacing}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>KOMİSYON ORANI</Text>
                  <View style={styles.commissionRow}>
                    {COMMISSION_RATES.map((c) => {
                      const isSelected = selectedCommission === c.rate;
                      return (
                        <TouchableOpacity
                          key={c.label}
                          style={[
                            styles.commissionBtn,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.cardSecondary,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedCommission(c.rate);
                          }}
                        >
                          <Text
                            style={[
                              styles.commissionBtnText,
                              { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                            ]}
                          >
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* ========================================================================= */}
            {/* 3. TEFAS FONU ÖZEL ARAYÜZÜ                                                */}
            {/* ========================================================================= */}
            {category === 'tefas_fund' && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  POPÜLER TEFAS YATIRIM FONLARI
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {PRESET_ASSETS.filter((p) => p.category === 'tefas_fund').map((p) => {
                    const isSelected = symbol === p.symbol;
                    const priceInfo = getPriceForAsset(p.symbol, marketData);
                    return (
                      <TouchableOpacity
                        key={p.symbol}
                        style={[
                          styles.fundPresetPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#2D1F47'
                                : '#F5F3FF'
                              : colors.cardSecondary,
                            borderColor: isSelected ? (colors.tefas || '#8B5CF6') : colors.border,
                          },
                        ]}
                        onPress={() => applyPreset(p)}
                      >
                        <View style={styles.fundPillHeader}>
                          <Text style={[styles.fundPillCode, { color: colors.tefas || '#8B5CF6' }]}>{p.symbol}</Text>
                          <Text style={[styles.fundPillPrice, { color: colors.text }]}>
                            ₺{priceInfo.price.toFixed(2)}
                          </Text>
                        </View>
                        <Text style={[styles.fundPillName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <View style={styles.fundPillFooter}>
                          <Text style={[styles.fundPillChange, { color: priceInfo.change7d >= 0 ? colors.profit : colors.loss }]}>
                            Haftalık: {priceInfo.change7d >= 0 ? '+' : ''}{priceInfo.change7d.toFixed(1)}%
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Fon Kodu & Adı */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>TEFAS Fon Kodu (3 Harf)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={symbol}
                      onChangeText={setSymbol}
                      onBlur={() => fetchCustomSymbolPrice()}
                      placeholder="TI2, MAC, TCD..."
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fon Adı</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="İş Portföy Teknoloji..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Pay Adedi & Hızlı Butonlar */}
                <View style={styles.inputSpacing}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>ALINAN PAY ADEDİ</Text>
                    <Text style={[styles.helperBadge, { color: colors.tefas || '#8B5CF6' }]}>
                      {numAmount > 0 ? `${numAmount.toLocaleString('tr-TR')} Pay` : ''}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                    ]}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Pay adedi girin (örn: 1000)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                  />
                  <View style={styles.quickLotRow}>
                    {[500, 1000, 2500, 5000, 10000].map((pay) => (
                      <TouchableOpacity
                        key={pay}
                        style={[styles.quickLotBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
                        onPress={() => addLotAmount(pay)}
                      >
                        <Text style={[styles.quickLotText, { color: colors.tefas || '#8B5CF6' }]}>
                          +{pay.toLocaleString('tr-TR')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Alış Birim Pay Fiyatı */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alış Pay Fiyatı (₺)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={buyPrice}
                      onChangeText={setBuyPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Güncel TEFAS Fiyatı (₺)</Text>
                      <TouchableOpacity onPress={copyCurrentPriceToBuy}>
                        <Text style={[styles.copyBtnText, { color: colors.tefas || '#8B5CF6' }]}>⚡ Eşitle</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={currentPrice}
                      onChangeText={setCurrentPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ========================================================================= */}
            {/* 4. ALTIN / EMTİA & DÖVİZ ARAYÜZÜ                                          */}
            {/* ========================================================================= */}
            {category === 'gold' && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  ALTIN & SERBEST PİYASA VARLIKLARI
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {PRESET_ASSETS.filter((p) => p.category === 'gold' || p.category === 'forex').map((p) => {
                    const isSelected = symbol === p.symbol;
                    const priceInfo = getPriceForAsset(p.symbol, marketData);
                    return (
                      <TouchableOpacity
                        key={p.symbol}
                        style={[
                          styles.goldPresetPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? '#3D2F1B'
                                : '#FEF9C3'
                              : colors.cardSecondary,
                            borderColor: isSelected ? colors.gold : colors.border,
                          },
                        ]}
                        onPress={() => applyPreset(p)}
                      >
                        <Text style={[styles.goldPillSymbol, { color: colors.gold }]}>{p.symbol}</Text>
                        <Text style={[styles.goldPillPrice, { color: colors.text }]}>
                          ₺{priceInfo.price.toLocaleString('tr-TR')}
                        </Text>
                        <Text style={[styles.goldPillName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Varlık Adı</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Gram Altın..."
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Miktar (Gram / Adet)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Örn: 25"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alış Fiyatı (₺)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={buyPrice}
                      onChangeText={setBuyPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Güncel Fiyat (₺)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
                      ]}
                      value={currentPrice}
                      onChangeText={setCurrentPrice}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Live Calculation Preview */}
            {numAmount > 0 && numBuyPrice > 0 && (
              <View
                style={[
                  styles.calcCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.calcTitle, { color: colors.textSecondary }]}>
                  {category === 'halka_arz' ? 'Halka Arz Yatırım Özeti' : 'Pozisyon Büyüklüğü & Kâr Özeti'}
                </Text>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Toplam Maliyet:</Text>
                  <Text style={[styles.calcVal, { color: colors.text }]}>
                    {currSign}
                    {totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Güncel Değer:</Text>
                  <Text style={[styles.calcVal, { color: colors.text, fontWeight: '800' }]}>
                    {currSign}
                    {totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Tahmini Net Kâr/Zarar:</Text>
                  <Text
                    style={[
                      styles.calcVal,
                      { color: totalProfit >= 0 ? colors.profit : colors.loss, fontWeight: '800' },
                    ]}
                  >
                    {totalProfit >= 0 ? '+' : ''}
                    {currSign}
                    {totalProfit.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} (
                    {totalProfit >= 0 ? '+' : ''}
                    {profitPercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    category === 'halka_arz'
                      ? (colors.halkaArz || '#EC4899')
                      : category === 'tefas_fund'
                      ? (colors.tefas || '#8B5CF6')
                      : colors.primary,
                },
              ]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {editingAsset
                  ? 'Güncellemeleri Kaydet'
                  : category === 'halka_arz'
                  ? 'Halka Arzı Portföye Ekle'
                  : category === 'bist_stock'
                  ? 'BIST Hissesini Ekle'
                  : category === 'tefas_fund'
                  ? 'TEFAS Fonunu Ekle'
                  : 'Varlığı Portföye Ekle'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  segmentedTabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 4,
    borderRadius: 999,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 999,
    gap: 5,
  },
  segmentTabText: {
    fontSize: 11,
  },
  scrollContent: {
    padding: 18,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  helperBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetScroll: {
    marginBottom: 14,
  },
  ipoCardPill: {
    width: 145,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  ipoPillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ipoPillCode: {
    fontSize: 14,
    fontWeight: '900',
  },
  ipoPillPrice: {
    fontSize: 12,
    fontWeight: '800',
  },
  ipoPillName: {
    fontSize: 11,
    marginBottom: 6,
  },
  ipoPillFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  ipoPillStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  brokerScroll: {
    marginBottom: 14,
  },
  brokerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  brokerChipText: {
    fontSize: 11,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  input: {
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  quickLotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickLotBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickLotText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tavanScroll: {
    marginBottom: 14,
  },
  tavanPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  tavanPillText: {
    fontSize: 11,
  },
  simulatorBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simulatorTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  simTable: {
    marginTop: 10,
    gap: 5,
  },
  simTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.3)',
  },
  simRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  simCol: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  simCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  stockPresetPill: {
    width: 125,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  stockPillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockPillSymbol: {
    fontSize: 13,
    fontWeight: '900',
  },
  stockPillChange: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockPillPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  stockPillName: {
    fontSize: 10,
    marginTop: 2,
  },
  commissionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  commissionBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  commissionBtnText: {
    fontSize: 11,
  },
  fundPresetPill: {
    width: 140,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  fundPillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundPillCode: {
    fontSize: 14,
    fontWeight: '900',
  },
  fundPillPrice: {
    fontSize: 12,
    fontWeight: '800',
  },
  fundPillName: {
    fontSize: 10,
    marginTop: 2,
  },
  fundPillFooter: {
    marginTop: 4,
  },
  fundPillChange: {
    fontSize: 10,
    fontWeight: '700',
  },
  goldPresetPill: {
    width: 120,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  goldPillSymbol: {
    fontSize: 13,
    fontWeight: '900',
  },
  goldPillPrice: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  goldPillName: {
    fontSize: 10,
    marginTop: 2,
  },
  calcCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  calcTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 12,
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 52,
    borderRadius: 24,
    marginTop: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  modalSearchResultsDropdown: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modalDropdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  dropdownCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  dropdownCategoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  dropdownSymbolText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dropdownNameText: {
    fontSize: 11,
  },
  dropdownItemRight: {
    alignItems: 'flex-end',
  },
  dropdownPriceText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dropdownChangeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
