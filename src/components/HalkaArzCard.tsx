import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { HalkaArz } from '../types/portfolio';

interface HalkaArzCardProps {
  ipo: HalkaArz;
  onAddToPortfolio: (ipo: HalkaArz) => void;
}

export const HalkaArzCard: React.FC<HalkaArzCardProps> = ({ ipo, onAddToPortfolio }) => {
  const { colors, isDark } = useTheme();
  const [showLots, setShowLots] = useState(false);
  const [showBrokerDetails, setShowBrokerDetails] = useState(false);

  const isActive = ipo.status === 'talep_toplaniyor';
  const isTrading = ipo.status === 'islem_goruyor';

  const toggleLots = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowLots(!showLots);
  };

  const toggleBrokerDetails = () => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowBrokerDetails(!showBrokerDetails);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top row: Code & Status */}
      <View style={styles.topRow}>
        <View style={styles.codeContainer}>
          <View style={[styles.codeBadge, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{ipo.code}</Text>
          </View>
          <View style={styles.titleColumn}>
            <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
              {ipo.companyName}
            </Text>
            <Text style={[styles.marketText, { color: colors.textSecondary }]}>
              {ipo.market} • {ipo.distributionType}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isActive
                ? colors.profitBg
                : isTrading
                ? isDark
                  ? '#1E3A5F'
                  : '#DBEAFE'
                : colors.cardSecondary,
              borderColor: isActive ? colors.profit : isTrading ? colors.primary : colors.border,
            },
          ]}
        >
          {isActive && <View style={styles.livePulseDot} />}
          <Text
            style={[
              styles.statusText,
              { color: isActive ? colors.profit : isTrading ? colors.primary : colors.textSecondary },
            ]}
          >
            {ipo.statusLabel}
          </Text>
        </View>
      </View>

      {/* Main Info: Dates & Price */}
      <View style={[styles.infoGrid, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>HALKA ARZ FİYATI</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>₺{ipo.price.toFixed(2)}</Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>TALEP TARİHLERİ</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{ipo.dates}</Text>
        </View>

        {ipo.tavanCount ? (
          <>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.profit }]}>TAVAN SERİSİ</Text>
              <Text style={[styles.infoValue, { color: colors.profit }]}>🚀 {ipo.tavanCount}. Tavan</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Tavan Serisi Streak Visualizer */}
      {ipo.tavanCount ? (
        <View
          style={[
            styles.tavanStreakBox,
            { backgroundColor: isDark ? '#064E3B20' : '#ECFDF5', borderColor: colors.profit },
          ]}
        >
          <View style={styles.tavanStreakHeader}>
            <View style={styles.tavanStreakTitleRow}>
              <Ionicons name="flame" size={15} color={colors.profit} />
              <Text style={[styles.tavanStreakTitle, { color: colors.profit }]}>
                {ipo.tavanCount}. Gündür Tavan Serisinde
              </Text>
            </View>
            <Text style={[styles.tavanStreakReturn, { color: colors.profit }]}>
              +%{((Math.pow(1.10, ipo.tavanCount) - 1) * 100).toFixed(1)} Getiri
            </Text>
          </View>
          <View style={styles.tavanStepsRow}>
            {[1, 2, 3, 4, 5].map((step) => {
              const isPassed = step <= (ipo.tavanCount || 0);
              return (
                <View key={step} style={styles.tavanStepItem}>
                  <View
                    style={[
                      styles.tavanStepCircle,
                      {
                        backgroundColor: isPassed ? colors.profit : colors.cardSecondary,
                        borderColor: isPassed ? colors.profit : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tavanStepNum,
                        { color: isPassed ? '#FFFFFF' : colors.textMuted },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.tavanStepLabel,
                      { color: isPassed ? colors.profit : colors.textMuted },
                    ]}
                  >
                    {step}. Tavan
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Streamlined Simple Broker Badges */}
      <View style={styles.brokerSection}>
        <View style={styles.brokerPillsRow}>
          {/* Ziraat Pill */}
          <View
            style={[
              styles.brokerStatusPill,
              {
                backgroundColor: ipo.availableInZiraat
                  ? isDark
                    ? '#064E3B30'
                    : '#DCFCE7'
                  : isDark
                  ? '#7F1D1D25'
                  : '#FEE2E2',
                borderColor: ipo.availableInZiraat ? colors.ziraat : colors.loss,
              },
            ]}
          >
            <Ionicons
              name={ipo.availableInZiraat ? 'checkmark-circle' : 'close-circle'}
              size={15}
              color={ipo.availableInZiraat ? colors.ziraat : colors.loss}
            />
            <Text
              style={[
                styles.brokerStatusText,
                { color: ipo.availableInZiraat ? colors.ziraat : colors.loss },
              ]}
            >
              Ziraat {ipo.availableInZiraat ? 'Katılım Var' : 'Yok'}
            </Text>
          </View>

          {/* Midas Pill */}
          <View
            style={[
              styles.brokerStatusPill,
              {
                backgroundColor: ipo.availableInMidas
                  ? isDark
                    ? '#312E8135'
                    : '#EEF2FF'
                  : isDark
                  ? '#7F1D1D25'
                  : '#FEE2E2',
                borderColor: ipo.availableInMidas ? colors.midas : colors.loss,
              },
            ]}
          >
            <Ionicons
              name={ipo.availableInMidas ? 'checkmark-circle' : 'close-circle'}
              size={15}
              color={ipo.availableInMidas ? colors.midas : colors.loss}
            />
            <Text
              style={[
                styles.brokerStatusText,
                { color: ipo.availableInMidas ? colors.midas : colors.loss },
              ]}
            >
              Midas {ipo.availableInMidas ? 'Katılım Var' : 'Yok'}
            </Text>
          </View>
        </View>

        {/* Katılım Endeksi & Details Toggle */}
        <View style={styles.badgeFooterRow}>
          <View
            style={[
              styles.katilimBadge,
              {
                backgroundColor: ipo.katilimEndeksi ? colors.profitBg : isDark ? '#1E293B' : '#F1F5F9',
                borderColor: ipo.katilimEndeksi ? colors.katilim : colors.border,
              },
            ]}
          >
            <Ionicons
              name={ipo.katilimEndeksi ? 'shield-checkmark' : 'alert-circle-outline'}
              size={13}
              color={ipo.katilimEndeksi ? colors.katilim : colors.textMuted}
            />
            <Text
              style={[
                styles.katilimText,
                { color: ipo.katilimEndeksi ? colors.katilim : colors.textSecondary },
              ]}
            >
              {ipo.katilimEndeksi ? 'Katılım Endeksine Uygun' : 'Katılım Dışı'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.detailsToggleBtn}
            onPress={toggleBrokerDetails}
            activeOpacity={0.7}
          >
            <Text style={[styles.detailsToggleText, { color: colors.primary }]}>
              {showBrokerDetails ? 'Notları Gizle' : 'Kurum Notları'}
            </Text>
            <Ionicons
              name={showBrokerDetails ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Expandable Broker Details */}
        {showBrokerDetails && (
          <View style={[styles.notesContainer, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
            <View style={styles.noteItem}>
              <Text style={[styles.noteBrokerLabel, { color: colors.ziraat }]}>• Ziraat:</Text>
              <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{ipo.ziraatNote}</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={[styles.noteBrokerLabel, { color: colors.midas }]}>• Midas:</Text>
              <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{ipo.midasNote}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Expandable Estimated Lots Table */}
      {ipo.estimatedLots && ipo.estimatedLots.length > 0 && (
        <View style={[styles.lotSection, { borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.lotToggleBtn} onPress={toggleLots} activeOpacity={0.7}>
            <View style={styles.lotToggleLeft}>
              <Ionicons name="calculator-outline" size={15} color={colors.primary} />
              <Text style={[styles.lotToggleText, { color: colors.primary }]}>
                Tahmini Dağıtım Tablosu
              </Text>
            </View>
            <Ionicons
              name={showLots ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showLots && (
            <View style={[styles.lotTable, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
              <View style={[styles.lotTableHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.lotColTitle, { color: colors.textSecondary }]}>Katılımcı</Text>
                <Text style={[styles.lotColTitle, { color: colors.textSecondary }]}>Tahmini Lot</Text>
                <Text style={[styles.lotColTitle, { color: colors.textSecondary }]}>Tutar</Text>
              </View>
              {ipo.estimatedLots.map((row, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.lotTableRow,
                    idx < ipo.estimatedLots.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 },
                  ]}
                >
                  <Text style={[styles.lotColCell, { color: colors.text }]}>{row.participants}</Text>
                  <Text style={[styles.lotColCell, { color: colors.primary, fontWeight: '800' }]}>
                    ~{row.lots} Lot
                  </Text>
                  <Text style={[styles.lotColCell, { color: colors.text, fontWeight: '700' }]}>
                    ₺{row.totalCost.toLocaleString('tr-TR')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action: Add to portfolio */}
      <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onAddToPortfolio(ipo);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Portföyüme Halka Arz Olarak Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 26,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  titleColumn: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
  },
  marketText: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  brokerSection: {
    marginBottom: 12,
    gap: 8,
  },
  brokerPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  brokerStatusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  brokerStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  katilimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  katilimText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  detailsToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  detailsToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesContainer: {
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteBrokerLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  noteContent: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  lotSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  lotToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lotToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lotToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lotTable: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
  },
  lotTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  lotColTitle: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  lotTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  lotColCell: {
    fontSize: 11,
    flex: 1,
    textAlign: 'center',
  },
  actionRow: {
    paddingTop: 10,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tavanStreakBox: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  tavanStreakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tavanStreakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tavanStreakTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  tavanStreakReturn: {
    fontSize: 11,
    fontWeight: '800',
  },
  tavanStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tavanStepItem: {
    alignItems: 'center',
    gap: 4,
  },
  tavanStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  tavanStepNum: {
    fontSize: 11,
    fontWeight: '900',
  },
  tavanStepLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
