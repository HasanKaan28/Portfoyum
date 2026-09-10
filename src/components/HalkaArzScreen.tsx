import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { HalkaArz } from '../types/portfolio';
import { HalkaArzCard } from './HalkaArzCard';
import { fetchLatestHalkaArzlar, CURRENT_HALKA_ARZLAR } from '../services/ipoService';

interface HalkaArzScreenProps {
  onAddToPortfolio: (ipo: HalkaArz) => void;
}

type StatusFilter = 'all' | 'talep_toplaniyor' | 'islem_goruyor' | 'tamamlandi';
type BrokerFilter = 'all' | 'ziraat' | 'midas' | 'katilim';

const STATUS_TABS: { key: StatusFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'Tümü', icon: 'apps-outline' },
  { key: 'talep_toplaniyor', label: 'Talep Toplayan', icon: 'flame-outline' },
  { key: 'islem_goruyor', label: 'İşlem Gören', icon: 'rocket-outline' },
  { key: 'tamamlandi', label: 'Geçmiş', icon: 'checkmark-done-outline' },
];

export const HalkaArzScreen: React.FC<HalkaArzScreenProps> = ({ onAddToPortfolio }) => {
  const { colors, isDark } = useTheme();

  const [ipos, setIpos] = useState<HalkaArz[]>(CURRENT_HALKA_ARZLAR);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [brokerFilter, setBrokerFilter] = useState<BrokerFilter>('all');
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const loadIpos = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchLatestHalkaArzlar();
      setIpos(data);
    } catch (e) {
      console.warn('Error fetching IPOs', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadIpos();
  }, [loadIpos]);

  // Key metrics
  const activeCount = useMemo(() => ipos.filter((i) => i.status === 'talep_toplaniyor').length, [ipos]);
  const ziraatActiveCount = useMemo(
    () => ipos.filter((i) => i.status === 'talep_toplaniyor' && i.availableInZiraat).length,
    [ipos]
  );
  const midasActiveCount = useMemo(
    () => ipos.filter((i) => i.status === 'talep_toplaniyor' && i.availableInMidas).length,
    [ipos]
  );

  // Filtered IPOs
  const filteredIpos = useMemo(() => {
    return ipos.filter((ipo) => {
      // Status filter
      if (statusFilter !== 'all' && ipo.status !== statusFilter) {
        return false;
      }

      // Broker / Katilim filter
      if (brokerFilter === 'ziraat' && !ipo.availableInZiraat) return false;
      if (brokerFilter === 'midas' && !ipo.availableInMidas) return false;
      if (brokerFilter === 'katilim' && !ipo.katilimEndeksi) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = ipo.code.toLowerCase().includes(q);
        const matchName = ipo.companyName.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }

      return true;
    });
  }, [ipos, statusFilter, brokerFilter, searchQuery]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={loadIpos}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Ionicons name="rocket" size={24} color={colors.halkaArz || '#EC4899'} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Halka Arz Takvimi</Text>
            {activeCount > 0 && (
              <View style={[styles.pulseBadge, { backgroundColor: colors.profitBg, borderColor: colors.profit }]}>
                <View style={styles.pulseDot} />
                <Text style={[styles.pulseText, { color: colors.profit }]}>{activeCount} Aktif</Text>
              </View>
            )}
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            SPK onaylı halka arzlar, Ziraat & Midas katılım rehberi
          </Text>
        </View>
      </View>

      {/* Top Metric Summary Cards */}
      <View style={styles.metricGrid}>
        {/* Aktif Halka Arz */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={[styles.metricNumber, { color: colors.text }]}>{activeCount}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Aktif Talep</Text>
        </View>

        {/* Ziraat Katılımı */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <Ionicons name="checkmark-circle" size={18} color={colors.ziraat} />
            <Text style={[styles.metricNumber, { color: colors.ziraat }]}>{ziraatActiveCount}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Ziraat Katılım</Text>
        </View>

        {/* Midas Katılımı */}
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <Ionicons name="flash" size={18} color={colors.midas} />
            <Text style={[styles.metricNumber, { color: colors.midas }]}>{midasActiveCount}</Text>
          </View>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Midas Katılım</Text>
        </View>
      </View>

      {/* Ziraat & Midas Bilgi Kutusu (Açılır-Kapanır) */}
      {showInfoBanner ? (
        <View
          style={[
            styles.infoBanner,
            { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: colors.primary },
          ]}
        >
          <View style={styles.infoBannerHeader}>
            <View style={styles.infoBannerTitleRow}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={[styles.infoBannerTitle, { color: colors.primary }]}>
                Ziraat & Midas Katılımı Nasıl Çalışır?
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowInfoBanner(false)}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.infoBannerText, { color: colors.text }]}>
            • <Text style={{ fontWeight: '800', color: colors.ziraat }}>Ziraat Bankası / Yatırım:</Text> Konsorsiyumda
            yer alan tüm halka arzlara Ziraat Mobil {'>'} Menü {'>'} Halka Arz sekmesinden nakit veya fon teminatı ile
            talep girilebilir.
          </Text>
          <Text style={[styles.infoBannerText, { color: colors.text, marginTop: 4 }]}>
            • <Text style={{ fontWeight: '800', color: colors.midas }}>Midas:</Text> Yalnızca{' '}
            <Text style={{ fontWeight: '700' }}>"Borsa'da Satış (Bireysele Eşit)"</Text> yöntemiyle yapılan halka arzlara
            aracı kurum kısıtlaması olmaksızın, normal hisse senedi alır gibi emir verilerek katılabilirsiniz.
          </Text>
        </View>
      ) : null}

      {/* Status Filter Tabs (Tümü | Talep Toplayan | İşlem Gören | Geçmiş) */}
      <View
        style={[
          styles.statusTabContainer,
          { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', borderColor: colors.border },
        ]}
      >
        {STATUS_TABS.map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.statusTabBtn,
                isSelected && {
                  backgroundColor: colors.card,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setStatusFilter(tab.key);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.statusTabText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
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

      {/* Search & Broker Quick Filter Chips */}
      <View style={styles.filterSection}>
        {/* Search Input */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            placeholder="Halka arz şirket veya kod ara (KOCMT, DURKN...)"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Broker Filter Chips */}
        <View style={styles.chipRow}>
          {[
            { key: 'all' as BrokerFilter, label: 'Tüm Kurumlar' },
            { key: 'ziraat' as BrokerFilter, label: '🟢 Ziraat Katılımı Var' },
            { key: 'midas' as BrokerFilter, label: '🟣 Midas Katılımı Var' },
            { key: 'katilim' as BrokerFilter, label: '🕌 Katılım Endeksi' },
          ].map((chip) => {
            const isSelected = brokerFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setBrokerFilter(chip.key);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>Halka Arz Listesi</Text>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredIpos.length} halka arz listeleniyor
        </Text>
      </View>

      {/* IPO Cards */}
      {filteredIpos.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="file-tray-outline" size={44} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Halka Arz Bulunamadı</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Filtreleme kriterlerinize uygun halka arz bulunamadı. Filtreleri sıfırlayabilirsiniz.
          </Text>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setStatusFilter('all');
              setBrokerFilter('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetBtnText}>Filtreleri Sıfırla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {filteredIpos.map((ipo) => (
            <HalkaArzCard key={ipo.id} ipo={ipo} onAddToPortfolio={onAddToPortfolio} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  pulseText: {
    fontSize: 11,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  metricGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoBanner: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  infoBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  infoBannerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  statusTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  statusTabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 999,
  },
  statusTabText: {
    fontSize: 11,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultsCount: {
    fontSize: 12,
  },
  emptyBox: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
