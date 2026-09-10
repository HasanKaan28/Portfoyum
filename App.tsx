import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  UIManager,
  LayoutAnimation,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import {
  Asset,
  CurrencyType,
  NotificationSettings,
  PortfolioSummary,
  TimeFrame,
  ViewMode,
} from './src/types/portfolio';
import {
  loadAssets,
  saveAssets,
  loadCurrency,
  saveCurrency,
  loadNotificationSettings,
  saveNotificationSettings,
  generateHistoricalPoints,
} from './src/services/storageService';
import {
  fetchLiveMarketData,
  LiveMarketData,
  getPriceForAsset,
  INITIAL_MARKET_DATA,
  AssetSearchResult,
} from './src/services/marketData';
import { runDailyPortfolioAnalysis } from './src/services/analysisEngine';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { PortfolioHeader } from './src/components/PortfolioHeader';
import { ProfitChart } from './src/components/ProfitChart';
import { DailyAnalysisCard } from './src/components/DailyAnalysisCard';
import { AssetList } from './src/components/AssetList';
import { AddAssetModal } from './src/components/AddAssetModal';
import { NotificationModal } from './src/components/NotificationModal';
import { HalkaArzScreen } from './src/components/HalkaArzScreen';
import { SearchScreen } from './src/components/SearchScreen';
import { PremiumSplashScreen } from './src/components/PremiumSplashScreen';
import { CURRENT_HALKA_ARZLAR, getActiveIposCount } from './src/services/ipoService';
import { HalkaArz } from './src/types/portfolio';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text, TouchableOpacity } from 'react-native';

function MainApp() {
  const { colors, isDark } = useTheme();

  const [isSplashDone, setIsSplashDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'search' | 'halka_arz'>('portfolio');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currency, setCurrency] = useState<CurrencyType>('TRY');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1G');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [initialIpoPreset, setInitialIpoPreset] = useState<Partial<Asset> | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    enabled: true,
    dailySummaryTime: '18:00',
    notifyOnHighVolatility: true,
    notifyNewIpo: true,
  });

  const activeIpoCount = useMemo(() => getActiveIposCount(CURRENT_HALKA_ARZLAR), []);

  const [marketData, setMarketData] = useState<LiveMarketData>(INITIAL_MARKET_DATA);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Initial load
  useEffect(() => {
    (async () => {
      const [savedAssets, savedCurr, savedNotifs] = await Promise.all([
        loadAssets(),
        loadCurrency(),
        loadNotificationSettings(),
      ]);
      setAssets(savedAssets);
      setCurrency(savedCurr);
      setNotifSettings(savedNotifs);

      registerForPushNotificationsAsync();
      refreshMarketData(savedAssets);
    })();
  }, []);

  const refreshMarketData = useCallback(
    async (currentAssets?: Asset[]) => {
      setIsRefreshing(true);
      try {
        const targetAssets = currentAssets || assets;
        const userSymbols = targetAssets.map((a) => a.symbol);
        const latestData = await fetchLiveMarketData(userSymbols);
        setMarketData(latestData);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLastUpdatedTime(timeStr);

        if (targetAssets.length > 0) {
          const updated = targetAssets.map((asset) => {
            const priceInfo = getPriceForAsset(asset.symbol, latestData);
            return {
              ...asset,
              currentPrice: priceInfo.price > 0 ? priceInfo.price : asset.currentPrice,
              change24h: priceInfo.change24h,
              change7d: priceInfo.change7d,
              lastUpdated: Date.now(),
            };
          });
          setAssets(updated);
          await saveAssets(updated);
        }
      } catch (error) {
        console.warn('Error refreshing market data:', error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [assets]
  );

  // Periodic auto-refresh every 15 seconds while app is in use
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMarketData();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshMarketData]);

  // Conversion helper
  const fxRate = marketData.usdTry;
  const convertToCurrentCurrency = useCallback(
    (price: number, assetCurr: CurrencyType) => {
      if (currency === assetCurr) return price;
      if (currency === 'TRY' && assetCurr === 'USD') return price * fxRate;
      if (currency === 'USD' && assetCurr === 'TRY') return price / fxRate;
      return price;
    },
    [currency, fxRate]
  );

  // Calculate overall portfolio metrics
  const summary: PortfolioSummary = useMemo(() => {
    let totalVal = 0;
    let totalCost = 0;
    let dailyProfit = 0;
    let weeklyProfit = 0;

    assets.forEach((asset) => {
      const unitVal = convertToCurrentCurrency(asset.currentPrice, asset.currency);
      const unitCost = convertToCurrentCurrency(asset.buyPrice, asset.currency);

      const holdingVal = asset.amount * unitVal;
      const holdingCost = asset.amount * unitCost;

      totalVal += holdingVal;
      totalCost += holdingCost;

      // 24h profit
      const assetDailyProfit = holdingVal * ((asset.change24h || 0) / 100);
      dailyProfit += assetDailyProfit;

      // 7d weekly profit
      const weeklyChange = asset.change7d !== undefined ? asset.change7d : (asset.change24h * 2.2);
      const assetWeeklyProfit = holdingVal * (weeklyChange / 100);
      weeklyProfit += assetWeeklyProfit;
    });

    const totalProfit = totalVal - totalCost;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const previousDayVal = totalVal - dailyProfit;
    const dailyProfitPercent = previousDayVal > 0 ? (dailyProfit / previousDayVal) * 100 : 0;

    const previousWeekVal = totalVal - weeklyProfit;
    const weeklyProfitPercent = previousWeekVal > 0 ? (weeklyProfit / previousWeekVal) * 100 : 0;

    return {
      totalValue: totalVal,
      totalCost,
      totalProfit,
      totalProfitPercent,
      dailyProfit,
      dailyProfitPercent,
      weeklyProfit,
      weeklyProfitPercent,
    };
  }, [assets, currency, convertToCurrentCurrency]);

  // Daily Algorithmic Analysis
  const analysis = useMemo(() => {
    return runDailyPortfolioAnalysis(assets, currency, fxRate);
  }, [assets, currency, fxRate]);

  // Chart data points
  const chartData = useMemo(() => {
    return generateHistoricalPoints(
      summary.totalValue,
      summary.totalProfit,
      summary.dailyProfit,
      timeframe
    );
  }, [summary.totalValue, summary.totalProfit, summary.dailyProfit, timeframe]);

  // Handlers
  const handleToggleCurrency = async () => {
    const nextCurrency: CurrencyType = currency === 'TRY' ? 'USD' : 'TRY';
    setCurrency(nextCurrency);
    await saveCurrency(nextCurrency);
  };

  const handleSaveAsset = async (
    assetData: Omit<Asset, 'id' | 'lastUpdated'>,
    editingId?: string
  ) => {
    let updated: Asset[];
    if (editingId) {
      updated = assets.map((a) =>
        a.id === editingId
          ? {
              ...a,
              ...assetData,
              lastUpdated: Date.now(),
            }
          : a
      );
    } else {
      const newAsset: Asset = {
        ...assetData,
        id: Date.now().toString(),
        lastUpdated: Date.now(),
      };
      updated = [newAsset, ...assets];
    }
    setAssets(updated);
    await saveAssets(updated);
  };

  const handleDeleteAsset = async (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    setAssets(updated);
    await saveAssets(updated);
  };

  const handleEditAsset = (asset: Asset) => {
    setInitialIpoPreset(null);
    setEditingAsset(asset);
    setIsAddModalOpen(true);
  };

  const handleAddIpoToPortfolio = (ipo: HalkaArz) => {
    setEditingAsset(null);
    setInitialIpoPreset({
      symbol: ipo.code,
      name: ipo.companyName,
      category: 'halka_arz',
      buyPrice: ipo.price,
      currentPrice: ipo.price,
      currency: 'TRY',
      amount: ipo.estimatedLots && ipo.estimatedLots.length > 0 ? ipo.estimatedLots[0].lots : 30,
      tavanCount: ipo.tavanCount || 0,
    });
    setIsAddModalOpen(true);
  };

  const handleSelectSearchResult = (searchResult: AssetSearchResult) => {
    setEditingAsset(null);
    setInitialIpoPreset({
      symbol: searchResult.symbol,
      name: searchResult.name,
      category: searchResult.category,
      buyPrice: searchResult.price > 0 ? searchResult.price : 0,
      currentPrice: searchResult.price > 0 ? searchResult.price : 0,
      currency: searchResult.currency || 'TRY',
      amount: searchResult.category === 'halka_arz' ? 30 : 10,
      change24h: searchResult.change24h,
      change7d: searchResult.change7d,
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateNotifSettings = async (settings: NotificationSettings) => {
    setNotifSettings(settings);
    await saveNotificationSettings(settings);
  };

  if (!isSplashDone) {
    return <PremiumSplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.mainContent}>
        {activeTab === 'portfolio' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => refreshMarketData()}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {/* Main Dashboard Header */}
            <PortfolioHeader
              summary={summary}
              currency={currency}
              assets={assets}
              onToggleCurrency={handleToggleCurrency}
              onRefresh={() => refreshMarketData()}
              isRefreshing={isRefreshing}
              lastUpdatedTime={lastUpdatedTime}
              onOpenNotifications={() => setIsNotifModalOpen(true)}
              onOpenSearch={() => {
                Haptics.selectionAsync();
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setActiveTab('search');
              }}
              onOpenAddAsset={() => {
                setEditingAsset(null);
                setInitialIpoPreset(null);
                setIsAddModalOpen(true);
              }}
            />

            {/* Historical Profit & Performance Chart */}
            <ProfitChart
              dataPoints={chartData}
              selectedTimeframe={timeframe}
              onSelectTimeframe={setTimeframe}
              currency={currency}
            />

            {/* Automated Daily Portfolio Analysis Card */}
            <DailyAnalysisCard analysis={analysis} currency={currency} />

            {/* Asset Holdings List with Daily/Weekly switcher */}
            <AssetList
              assets={assets}
              currency={currency}
              fxRate={fxRate}
              viewMode={viewMode}
              onSelectViewMode={setViewMode}
              onDelete={handleDeleteAsset}
              onEdit={handleEditAsset}
              onAddNew={() => {
                setEditingAsset(null);
                setInitialIpoPreset(null);
                setIsAddModalOpen(true);
              }}
            />
          </ScrollView>
        ) : activeTab === 'search' ? (
          <SearchScreen
            marketData={marketData}
            onAddToPortfolio={handleSelectSearchResult}
          />
        ) : (
          <HalkaArzScreen onAddToPortfolio={handleAddIpoToPortfolio} />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomTabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => {
            Haptics.selectionAsync();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveTab('portfolio');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'portfolio' ? 'pie-chart' : 'pie-chart-outline'}
            size={22}
            color={activeTab === 'portfolio' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'portfolio' ? colors.primary : colors.textMuted,
                fontWeight: activeTab === 'portfolio' ? '800' : '600',
              },
            ]}
          >
            Portföyüm
          </Text>
        </TouchableOpacity>

        {/* Search Tab */}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => {
            Haptics.selectionAsync();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveTab('search');
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'search' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'search' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'search' ? colors.primary : colors.textMuted,
                fontWeight: activeTab === 'search' ? '800' : '600',
              },
            ]}
          >
            Varlık Ara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => {
            Haptics.selectionAsync();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveTab('halka_arz');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.tabIconWrapper}>
            <Ionicons
              name={activeTab === 'halka_arz' ? 'rocket' : 'rocket-outline'}
              size={22}
              color={activeTab === 'halka_arz' ? (colors.halkaArz || '#EC4899') : colors.textMuted}
            />
            {activeIpoCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: colors.profit }]}>
                <Text style={styles.tabBadgeText}>{activeIpoCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'halka_arz' ? (colors.halkaArz || '#EC4899') : colors.textMuted,
                fontWeight: activeTab === 'halka_arz' ? '800' : '600',
              },
            ]}
          >
            Halka Arzlar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Asset Modal */}
      <AddAssetModal
        visible={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAsset(null);
          setInitialIpoPreset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        initialPreset={initialIpoPreset}
        marketData={marketData}
      />

      {/* Notification Manager Modal */}
      <NotificationModal
        visible={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        summary={summary}
        currency={currency}
        settings={notifSettings}
        onUpdateSettings={handleUpdateNotifSettings}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
  mainContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  tabIconWrapper: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 11,
  },
});
