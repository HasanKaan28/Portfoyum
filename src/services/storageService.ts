import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset, ChartDataPoint, CurrencyType, NotificationSettings, TimeFrame } from '../types/portfolio';

const STORAGE_KEYS = {
  ASSETS: '@portfolio_assets_v1',
  CURRENCY: '@portfolio_currency_v1',
  NOTIFICATIONS: '@portfolio_notifications_v1',
  SNAPSHOTS: '@portfolio_snapshots_v1',
};

export const DEFAULT_INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'KOCMT',
    name: 'Koç Metalurji (Halka Arz)',
    category: 'halka_arz',
    amount: 58,
    buyPrice: 20.50,
    currentPrice: 20.50,
    currency: 'TRY',
    change24h: 0.0,
    change7d: 0.0,
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    symbol: 'ONRYT',
    name: 'Onur Yüksek Teknoloji',
    category: 'halka_arz',
    amount: 8,
    buyPrice: 49.50,
    currentPrice: 72.40,
    currency: 'TRY',
    change24h: 9.95,
    change7d: 46.2,
    lastUpdated: Date.now(),
    tavanCount: 4,
  },
  {
    id: '3',
    symbol: 'TI2',
    name: 'İş Portföy BIST Teknoloji Fonu',
    category: 'tefas_fund',
    amount: 1200,
    buyPrice: 13.50,
    currentPrice: 14.85,
    currency: 'TRY',
    change24h: 1.8,
    change7d: 6.2,
    lastUpdated: Date.now(),
  },
  {
    id: '4',
    symbol: 'THYAO',
    name: 'Türk Hava Yolları',
    category: 'bist_stock',
    amount: 200,
    buyPrice: 285.0,
    currentPrice: 320.50,
    currency: 'TRY',
    change24h: 1.4,
    change7d: 4.1,
    lastUpdated: Date.now(),
  },
  {
    id: '5',
    symbol: 'ALTIN.S1',
    name: 'Darphane Altın Sertifikası',
    category: 'gold',
    amount: 500,
    buyPrice: 66.20,
    currentPrice: 72.50,
    currency: 'TRY',
    change24h: 0.85,
    change7d: 2.9,
    lastUpdated: Date.now(),
  },
];

export async function loadAssets(): Promise<Asset[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!raw) {
      // First time launch: seed with starter portfolio
      await saveAssets(DEFAULT_INITIAL_ASSETS);
      return DEFAULT_INITIAL_ASSETS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading assets:', error);
    return DEFAULT_INITIAL_ASSETS;
  }
}

export async function saveAssets(assets: Asset[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  } catch (error) {
    console.error('Error saving assets:', error);
  }
}

export async function loadCurrency(): Promise<CurrencyType> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENCY);
    return (raw as CurrencyType) || 'TRY';
  } catch {
    return 'TRY';
  }
}

export async function saveCurrency(currency: CurrencyType): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  } catch (error) {
    console.error('Error saving currency:', error);
  }
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: true,
    dailySummaryTime: '18:00',
    notifyOnHighVolatility: true,
    notifyNewIpo: true,
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * Generates realistic historical profit & value data points for a given timeframe
 * based on current portfolio value and daily profit.
 */
export function generateHistoricalPoints(
  totalValue: number,
  totalProfit: number,
  dailyProfit: number,
  timeframe: TimeFrame
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const now = Date.now();

  let count = 12;
  let stepMs = 2 * 3600 * 1000; // 2 hours for 1G
  let volatility = 0.015;

  switch (timeframe) {
    case '1G':
      count = 12; // 2 hour intervals
      stepMs = 2 * 3600 * 1000;
      volatility = 0.008;
      break;
    case '1H':
      count = 7; // 7 days
      stepMs = 24 * 3600 * 1000;
      volatility = 0.025;
      break;
    case '1A':
      count = 15; // 2-day intervals
      stepMs = 2 * 24 * 3600 * 1000;
      volatility = 0.05;
      break;
    case '3A':
      count = 12; // weekly intervals
      stepMs = 7 * 24 * 3600 * 1000;
      volatility = 0.09;
      break;
    case '1Y':
      count = 12; // monthly intervals
      stepMs = 30 * 24 * 3600 * 1000;
      volatility = 0.18;
      break;
    case 'TÜMÜ':
      count = 14;
      stepMs = 45 * 24 * 3600 * 1000;
      volatility = 0.28;
      break;
  }

  // Baseline start value before returns
  const startCost = Math.max(100, totalValue - totalProfit);
  const startValue = timeframe === '1G' ? totalValue - dailyProfit : startCost;

  for (let i = 0; i < count; i++) {
    const pointTime = new Date(now - (count - 1 - i) * stepMs);
    const progress = i / (count - 1); // 0 to 1

    // Seeded curve trending towards current value
    const randomWiggle = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.9) * 0.5) * volatility;
    let interpolated = startValue + (totalValue - startValue) * progress;
    if (i < count - 1) {
      interpolated = interpolated * (1 + randomWiggle);
    } else {
      interpolated = totalValue; // Ensure exact final point
    }

    let label = '';
    if (timeframe === '1G') {
      label = `${pointTime.getHours().toString().padStart(2, '0')}:00`;
    } else if (timeframe === '1H') {
      const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      label = days[pointTime.getDay()];
    } else if (timeframe === '1A' || timeframe === '3A') {
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      label = `${pointTime.getDate()} ${months[pointTime.getMonth()]}`;
    } else {
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      label = `${months[pointTime.getMonth()]} '${String(pointTime.getFullYear()).slice(2)}`;
    }

    const calculatedProfit = interpolated - startCost;

    points.push({
      timestamp: pointTime.getTime(),
      label,
      value: Math.round(interpolated),
      profit: Math.round(calculatedProfit),
    });
  }

  return points;
}
