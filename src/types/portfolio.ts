export type AssetCategory = 'bist_stock' | 'tefas_fund' | 'halka_arz' | 'gold' | 'forex';

export type CurrencyType = 'TRY' | 'USD';

export type ViewMode = 'daily' | 'weekly' | 'total';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  amount: number;
  buyPrice: number; // In TRY
  currentPrice: number;
  currency: CurrencyType;
  change24h: number; // 24-hour percentage change
  change7d: number; // 7-day weekly percentage change
  lastUpdated: number;
  tavanCount?: number; // Halka arz tavan serisi sayısı (örn: 3)
  broker?: string; // Katılınan kurum / aracı kurum (örn: "Ziraat", "Midas")
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  dailyProfit: number;
  dailyProfitPercent: number;
  weeklyProfit: number;
  weeklyProfitPercent: number;
}

export interface ChartDataPoint {
  timestamp: number;
  label: string;
  value: number;
  profit: number;
}

export type TimeFrame = '1G' | '1H' | '1A' | '3A' | '1Y' | 'TÜMÜ';

export interface NotificationSettings {
  enabled: boolean;
  dailySummaryTime: string;
  notifyOnHighVolatility: boolean;
  notifyNewIpo: boolean; // Yeni halka arz SPK onayı bildirimi
}

export interface MarketPriceInfo {
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  currency: CurrencyType;
}

export type RiskLevel = 'Düşük' | 'Dengeli' | 'Yüksek' | 'Çok Yüksek';

export interface AnalysisRecommendation {
  id: string;
  type: 'take_profit' | 'rebalance' | 'opportunity' | 'diversify' | 'info';
  title: string;
  description: string;
  assetSymbol?: string;
  impact: 'positive' | 'warning' | 'neutral';
}

export interface PortfolioAnalysis {
  healthScore: number;
  riskLevel: RiskLevel;
  topGainerDaily: { symbol: string; name: string; profit: number; percent: number } | null;
  topLoserDaily: { symbol: string; name: string; profit: number; percent: number } | null;
  topGainerWeekly: { symbol: string; name: string; profit: number; percent: number } | null;
  categoryDistribution: Record<AssetCategory, number>;
  recommendations: AnalysisRecommendation[];
  dailyInsight: string;
}

export type IpoStatus = 'talep_toplaniyor' | 'onaylandi' | 'islem_goruyor' | 'tamamlandi';

export interface EstimatedLotRow {
  participants: string; // "1.5 Milyon Kişi"
  lots: number; // 15 Lot
  totalCost: number; // 367.5 TL
}

export interface HalkaArz {
  id: string;
  companyName: string;
  code: string; // e.g. "KOCMT", "HOROZ"
  status: IpoStatus;
  statusLabel: string; // "Talep Toplanıyor" | "SPK Onaylandı" | "İşlem Görüyor"
  dates: string; // "12-13 Eylül 2026"
  price: number; // 24.50 TL
  totalLots: number; // 25,000,000 Lot
  distributionType: 'Bireysele Eşit' | 'Tamamı Eşit' | 'Oransal';
  katilimEndeksi: boolean; // Katılım Endeksine Uygun mu?
  market: string; // "Yıldız Pazar" | "Ana Pazar"
  availableInZiraat: boolean;
  ziraatNote: string; // "Ziraat'ten Talep Girilebilir (Halka Arz Menüsü)"
  availableInMidas: boolean;
  midasNote: string; // "Midas'tan Hisse Alır Gibi Katılınabilir" veya "Konsorsiyum Dışı (Midas'ta Yok)"
  leadConsortium: string; // Lider aracı kurum
  estimatedLots: EstimatedLotRow[];
  tavanCount?: number;
  isNew?: boolean;
}
