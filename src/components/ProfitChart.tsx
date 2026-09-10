import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { ChartDataPoint, CurrencyType, TimeFrame } from '../types/portfolio';

interface ProfitChartProps {
  dataPoints: ChartDataPoint[];
  selectedTimeframe: TimeFrame;
  onSelectTimeframe: (tf: TimeFrame) => void;
  currency: CurrencyType;
}

const TIMEFRAMES: TimeFrame[] = ['1G', '1H', '1A', '3A', '1Y', 'TÜMÜ'];

export const ProfitChart: React.FC<ProfitChartProps> = ({
  dataPoints,
  selectedTimeframe,
  onSelectTimeframe,
  currency,
}) => {
  const { colors, isDark } = useTheme();
  const [chartWidth, setChartWidth] = useState(320);
  const chartHeight = 180;
  const paddingX = 20;
  const paddingY = 24;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Soft fade animation when timeframe changes
  const chartOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    chartOpacity.setValue(0.4);
    Animated.timing(chartOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedTimeframe, chartOpacity]);

  const currSign = currency === 'TRY' ? '₺' : '$';

  if (!dataPoints || dataPoints.length < 2) {
    return null;
  }

  // Calculate min & max
  const values = dataPoints.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Active point or last point
  const currentPoint =
    activeIndex !== null && dataPoints[activeIndex]
      ? dataPoints[activeIndex]
      : dataPoints[dataPoints.length - 1] || { value: 0, profit: 0, label: '', timestamp: Date.now() };
  const firstPoint = dataPoints[0] || currentPoint;
  const periodChange = currentPoint.value - firstPoint.value;
  const periodPercent = firstPoint.value > 0 ? (periodChange / firstPoint.value) * 100 : 0;
  const isPeriodProfitable = periodChange >= 0;

  // Coordinates mapping
  const getX = (index: number) => {
    const usableWidth = chartWidth - paddingX * 2;
    return paddingX + (index / (dataPoints.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - paddingY * 2;
    const norm = (val - minVal) / range;
    return chartHeight - paddingY - norm * usableHeight;
  };

  // Build SVG Path (smooth bezier curve)
  let linePath = `M ${getX(0)} ${getY(dataPoints[0].value)}`;
  for (let i = 1; i < dataPoints.length; i++) {
    const prevX = getX(i - 1);
    const prevY = getY(dataPoints[i - 1].value);
    const currX = getX(i);
    const currY = getY(dataPoints[i].value);
    const midX = (prevX + currX) / 2;
    linePath += ` C ${midX} ${prevY}, ${midX} ${currY}, ${currX} ${currY}`;
  }

  // Build Gradient Area Path
  const areaPath = `${linePath} L ${getX(dataPoints.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`;

  // Touch handling
  const handleTouch = (evt: GestureResponderEvent) => {
    const touchX = evt.nativeEvent.locationX;
    const usableWidth = chartWidth - paddingX * 2;
    const relX = Math.max(0, Math.min(touchX - paddingX, usableWidth));
    const ratio = relX / usableWidth;
    const index = Math.round(ratio * (dataPoints.length - 1));
    const boundedIndex = Math.max(0, Math.min(index, dataPoints.length - 1));

    if (boundedIndex !== activeIndex) {
      Haptics.selectionAsync();
      setActiveIndex(boundedIndex);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouch,
    onPanResponderMove: handleTouch,
    onPanResponderRelease: () => setActiveIndex(null),
    onPanResponderTerminate: () => setActiveIndex(null),
  });

  const chartColor = isPeriodProfitable ? colors.profit : colors.loss;
  const activeX = activeIndex !== null ? getX(activeIndex) : null;
  const activeY = activeIndex !== null ? getY(dataPoints[activeIndex].value) : null;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
    >
      {/* Chart Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            {activeIndex !== null ? currentPoint.label : `Dönemlik Değişim (${selectedTimeframe})`}
          </Text>
          <View style={styles.changeRow}>
            <Text style={[styles.changeText, { color: chartColor }]}>
              {isPeriodProfitable ? '+' : ''}
              {currSign}
              {Math.abs(periodChange).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </Text>
            <View
              style={[
                styles.percentBadge,
                { backgroundColor: isPeriodProfitable ? colors.profitBg : colors.lossBg },
              ]}
            >
              <Text style={[styles.percentBadgeText, { color: chartColor }]}>
                {isPeriodProfitable ? '+' : ''}
                {periodPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightInfo}>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>Seçili Nokta Değeri</Text>
          <Text style={[styles.pointValueText, { color: colors.text }]}>
            {currSign}
            {currentPoint.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      {/* SVG Canvas with Soft Fade Animation and Gesture Responder */}
      <View style={styles.chartWrapper} {...panResponder.panHandlers}>
        <Animated.View style={{ opacity: chartOpacity }}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={chartColor} stopOpacity={isDark ? '0.35' : '0.2'} />
                <Stop offset="100%" stopColor={chartColor} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Area fill */}
            <Path d={areaPath} fill="url(#profitGrad)" />

            {/* Main curve line */}
            <Path d={linePath} fill="none" stroke={chartColor} strokeWidth={2.8} strokeLinecap="round" />

            {/* Horizontal dotted grid baseline */}
            <Line
              x1={paddingX}
              y1={getY(minVal)}
              x2={chartWidth - paddingX}
              y2={getY(minVal)}
              stroke={colors.border}
              strokeDasharray="4,4"
              strokeWidth={1}
            />
            <Line
              x1={paddingX}
              y1={getY(maxVal)}
              x2={chartWidth - paddingX}
              y2={getY(maxVal)}
              stroke={colors.border}
              strokeDasharray="4,4"
              strokeWidth={1}
            />

            {/* Active touch cursor and indicator */}
            {activeX !== null && activeY !== null && (
              <>
                <Line
                  x1={activeX}
                  y1={paddingY}
                  x2={activeX}
                  y2={chartHeight - paddingY}
                  stroke={colors.textSecondary}
                  strokeDasharray="3,3"
                  strokeWidth={1.5}
                />
                <Circle
                  cx={activeX}
                  cy={activeY}
                  r={6}
                  fill={chartColor}
                  stroke={colors.card}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
        </Animated.View>
      </View>

      {/* Timeframe Filter Buttons */}
      <View style={[styles.timeframeContainer, { borderTopColor: colors.border }]}>
        {TIMEFRAMES.map((tf) => {
          const isSelected = selectedTimeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              style={[
                styles.tfButton,
                isSelected && {
                  backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectTimeframe(tf);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tfText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  percentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  pointValueText: {
    fontSize: 18,
    fontWeight: '800',
  },
  chartWrapper: {
    height: 180,
    marginTop: 4,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  tfButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tfText: {
    fontSize: 13,
  },
});
