import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { CurrencyType, PortfolioAnalysis } from '../types/portfolio';

interface DailyAnalysisCardProps {
  analysis: PortfolioAnalysis;
  currency: CurrencyType;
}

export const DailyAnalysisCard: React.FC<DailyAnalysisCardProps> = ({ analysis, currency }) => {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const currSign = currency === 'TRY' ? '₺' : '$';

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.profit;
    if (score >= 60) return colors.gold;
    return colors.loss;
  };

  const scoreColor = getScoreColor(analysis.healthScore);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Günlük Analiz Algoritması</Text>
            <Text style={[styles.subTitle, { color: colors.textSecondary }]}>Otomatik Portföy & Risk Değerlendirmesi</Text>
          </View>
        </View>

        {/* Health Score Pill */}
        <View style={[styles.scoreBadge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{analysis.healthScore}</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>/100 Skor</Text>
        </View>
      </View>

      {/* Daily Algorithmic Insight Text */}
      <View style={[styles.insightBox, { backgroundColor: colors.cardSecondary }]}>
        <Ionicons name="sparkles" size={16} color={colors.gold} style={styles.sparkleIcon} />
        <Text style={[styles.insightText, { color: colors.text }]}>{analysis.dailyInsight}</Text>
      </View>

      {/* Top Gainer & Loser Row */}
      <View style={styles.performanceRow}>
        {analysis.topGainerDaily && (
          <View style={[styles.perfBadge, { backgroundColor: colors.profitBg, borderColor: colors.profit }]}>
            <Ionicons name="trending-up" size={14} color={colors.profit} />
            <Text style={[styles.perfBadgeText, { color: colors.profit }]} numberOfLines={1}>
              Günün Lideri: {analysis.topGainerDaily.symbol} (+{analysis.topGainerDaily.percent.toFixed(1)}%)
            </Text>
          </View>
        )}
        {analysis.topGainerWeekly && (
          <View style={[styles.perfBadge, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE', borderColor: colors.primary }]}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={[styles.perfBadgeText, { color: colors.primary }]} numberOfLines={1}>
              Haftanın Yıldızı: {analysis.topGainerWeekly.symbol} (+{analysis.topGainerWeekly.percent.toFixed(1)}%)
            </Text>
          </View>
        )}
      </View>

      {/* Category Allocation Progress Bar */}
      <View style={styles.distSection}>
        <View style={styles.distLabelRow}>
          <Text style={[styles.distSectionTitle, { color: colors.textSecondary }]}>Varlık Dağılımı</Text>
          <Text style={[styles.riskLabel, { color: colors.text }]}>
            Risk Seviyesi: <Text style={{ color: scoreColor, fontWeight: '800' }}>{analysis.riskLevel}</Text>
          </Text>
        </View>

        <View style={styles.progressBar}>
          {analysis.categoryDistribution.halka_arz > 0 && (
            <View style={{ flex: analysis.categoryDistribution.halka_arz, backgroundColor: colors.halkaArz || '#EC4899', height: 8 }} />
          )}
          {analysis.categoryDistribution.bist_stock > 0 && (
            <View style={{ flex: analysis.categoryDistribution.bist_stock, backgroundColor: colors.bist || '#2563EB', height: 8 }} />
          )}
          {analysis.categoryDistribution.tefas_fund > 0 && (
            <View style={{ flex: analysis.categoryDistribution.tefas_fund, backgroundColor: colors.tefas || '#8B5CF6', height: 8 }} />
          )}
          {analysis.categoryDistribution.gold > 0 && (
            <View style={{ flex: analysis.categoryDistribution.gold, backgroundColor: colors.gold, height: 8 }} />
          )}
          {analysis.categoryDistribution.forex > 0 && (
            <View style={{ flex: analysis.categoryDistribution.forex, backgroundColor: colors.forex, height: 8 }} />
          )}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {analysis.categoryDistribution.halka_arz > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.halkaArz || '#EC4899' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Halka Arz %{analysis.categoryDistribution.halka_arz}
              </Text>
            </View>
          )}
          {analysis.categoryDistribution.bist_stock > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.bist || '#2563EB' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                BIST Hisse %{analysis.categoryDistribution.bist_stock}
              </Text>
            </View>
          )}
          {analysis.categoryDistribution.tefas_fund > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.tefas || '#8B5CF6' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                TEFAS Fon %{analysis.categoryDistribution.tefas_fund}
              </Text>
            </View>
          )}
          {analysis.categoryDistribution.gold > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Altın/Emtia %{analysis.categoryDistribution.gold}
              </Text>
            </View>
          )}
          {analysis.categoryDistribution.forex > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.forex }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Döviz %{analysis.categoryDistribution.forex}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Algorithmic Recommendations Collapsible */}
      {analysis.recommendations.length > 0 && (
        <View style={[styles.recomSection, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.recomToggle}
            onPress={() => {
              Haptics.selectionAsync();
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setIsExpanded(!isExpanded);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.recomToggleLeft}>
              <Ionicons name="bulb-outline" size={18} color={colors.gold} />
              <Text style={[styles.recomToggleText, { color: colors.text }]}>
                Algoritmik Öneriler ({analysis.recommendations.length})
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.recomList}>
              {analysis.recommendations.map((rec) => (
                <View
                  key={rec.id}
                  style={[styles.recomItem, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
                >
                  <View style={styles.recomItemHeader}>
                    <Ionicons
                      name={
                        rec.type === 'take_profit'
                          ? 'cash-outline'
                          : rec.type === 'rebalance'
                          ? 'pie-chart-outline'
                          : 'trending-up-outline'
                      }
                      size={16}
                      color={rec.impact === 'positive' ? colors.profit : rec.impact === 'warning' ? colors.loss : colors.primary}
                    />
                    <Text style={[styles.recomItemTitle, { color: colors.text }]}>{rec.title}</Text>
                  </View>
                  <Text style={[styles.recomItemDesc, { color: colors.textSecondary }]}>
                    {rec.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  sparkleIcon: {
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  performanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  perfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  perfBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  distSection: {
    marginBottom: 8,
  },
  distLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  riskLabel: {
    fontSize: 11,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#33415520',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recomSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  recomToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  recomToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recomToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  recomList: {
    marginTop: 8,
    gap: 8,
  },
  recomItem: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  recomItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  recomItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  recomItemDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
