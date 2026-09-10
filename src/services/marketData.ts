import { AssetCategory, CurrencyType } from '../types/portfolio';

export interface PresetAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  defaultCurrency: CurrencyType;
  basePrice?: number;
  tavanCount?: number;
}

export const PRESET_ASSETS: PresetAsset[] = [
  // 1. Yeni Halka Arzlar (BIST Halka Arz)
  { symbol: 'NTGLB', name: 'Net Global Yatırımlar (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 25.52 },
  { symbol: 'KOCMT', name: 'Koç Metalurji (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 20.50 },
  { symbol: 'DURKN', name: 'Durukan Şekerleme (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 17.00 },
  { symbol: 'ONRYT', name: 'Onur Yüksek Teknoloji (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 72.40, tavanCount: 4 },
  { symbol: 'HOROZ', name: 'Horoz Lojistik (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 66.50, tavanCount: 2 },
  { symbol: 'TABGD', name: 'TAB Gıda (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 142.50 },
  { symbol: 'EBEBK', name: 'Ebebek Mağazacılık (Halka Arz)', category: 'halka_arz', defaultCurrency: 'TRY', basePrice: 58.20 },

  // 2. TEFAS Yatırım Fonları
  { symbol: 'TI2', name: 'İş Portföy BIST Teknoloji Ağırlıklı Fon', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 14.85 },
  { symbol: 'MAC', name: 'Marmara Capital Hisse Senedi Fonu', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 28.40 },
  { symbol: 'TCD', name: 'Tacirler Portföy Değişken Fon', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 8.65 },
  { symbol: 'BIO', name: 'Albaraka Portföy Katılım Hisse Senedi Fonu', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 12.30 },
  { symbol: 'AFT', name: 'Ak Portföy Yeni Teknolojiler Fonu', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 0.62 },
  { symbol: 'YAY', name: 'Yapı Kredi Portföy Koç Holding İştirakleri Fonu', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 74.80 },
  { symbol: 'ZPX', name: 'Ziraat Portföy BIST 30 Endeksi Fonu', category: 'tefas_fund', defaultCurrency: 'TRY', basePrice: 5.42 },
  { symbol: 'ALTIN.S1', name: 'Darphane Altın Sertifikası (BIST)', category: 'gold', defaultCurrency: 'TRY', basePrice: 72.50 },

  // 3. Borsa İstanbul (BIST 30 / BIST 100) Hisseleri
  { symbol: 'THYAO', name: 'Türk Hava Yolları', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 320.50 },
  { symbol: 'ASELS', name: 'Aselsan', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 68.20 },
  { symbol: 'GARAN', name: 'Garanti BBVA', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 125.40 },
  { symbol: 'TUPRS', name: 'Tüpraş', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 178.60 },
  { symbol: 'EREGL', name: 'Ereğli Demir Çelik', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 52.80 },
  { symbol: 'BIMAS', name: 'BİM Birleşik Mağazalar', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 495.00 },
  { symbol: 'KCHOL', name: 'Koç Holding', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 215.00 },
  { symbol: 'AKBNK', name: 'Akbank', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 62.10 },
  { symbol: 'ISCTR', name: 'Türkiye İş Bankası (C)', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 14.75 },
  { symbol: 'YKBNK', name: 'Yapı ve Kredi Bankası', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 31.40 },
  { symbol: 'SAHOL', name: 'Sabancı Holding', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 94.20 },
  { symbol: 'FROTO', name: 'Ford Otosan', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 1045.00 },
  { symbol: 'SISE', name: 'Şişecam', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 48.30 },
  { symbol: 'SASA', name: 'SASA Polyester', category: 'bist_stock', defaultCurrency: 'TRY', basePrice: 4.85 },

  // 4. Altın & Döviz
  { symbol: 'GRAM_ALTIN', name: 'Gram Altın (Kapalıçarşı)', category: 'gold', defaultCurrency: 'TRY', basePrice: 6860 },
  { symbol: 'CEYREK_ALTIN', name: 'Çeyrek Altın', category: 'gold', defaultCurrency: 'TRY', basePrice: 11180 },
  { symbol: 'USD', name: 'Amerikan Doları', category: 'forex', defaultCurrency: 'TRY', basePrice: 48.50 },
  { symbol: 'EUR', name: 'Euro', category: 'forex', defaultCurrency: 'TRY', basePrice: 52.30 },
];

export interface PricePoint {
  price: number;
  change24h: number;
  change7d: number;
  name?: string;
}

export interface AssetSearchResult {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  change7d: number;
  currency: CurrencyType;
  isLive?: boolean;
}

export interface LiveMarketData {
  usdTry: number;
  eurTry: number;
  goldOunceUsd: number;
  gramAltinTry: number;
  ceyrekAltinTry: number;
  altinS1Try: number;
  bistPrices: Record<string, PricePoint>;
  tefasPrices: Record<string, PricePoint>;
  ipoPrices: Record<string, PricePoint>;
}

export const INITIAL_MARKET_DATA: LiveMarketData = {
  usdTry: 48.50,
  eurTry: 52.30,
  goldOunceUsd: 4400,
  gramAltinTry: 6860,
  ceyrekAltinTry: 11180,
  altinS1Try: 72.50,
  bistPrices: {
    THYAO: { price: 320.50, change24h: 1.4, change7d: 4.1 },
    ASELS: { price: 68.20, change24h: 2.1, change7d: 5.5 },
    GARAN: { price: 125.40, change24h: -0.8, change7d: 1.2 },
    TUPRS: { price: 178.60, change24h: -0.4, change7d: 2.3 },
    EREGL: { price: 52.80, change24h: 0.5, change7d: -0.9 },
    BIMAS: { price: 495.00, change24h: 0.7, change7d: 1.9 },
    KCHOL: { price: 215.00, change24h: 1.8, change7d: 3.7 },
    AKBNK: { price: 62.10, change24h: 0.9, change7d: 2.1 },
    ISCTR: { price: 14.75, change24h: 1.1, change7d: 1.8 },
    YKBNK: { price: 31.40, change24h: -0.6, change7d: 1.5 },
    SAHOL: { price: 94.20, change24h: 1.3, change7d: 3.2 },
    FROTO: { price: 1045.00, change24h: 2.4, change7d: 4.8 },
    SISE: { price: 48.30, change24h: 0.2, change7d: -0.5 },
    SASA: { price: 4.85, change24h: -1.2, change7d: -3.1 },
  },
  tefasPrices: {
    TI2: { price: 14.85, change24h: 1.8, change7d: 6.2 },
    MAC: { price: 28.40, change24h: 1.1, change7d: 3.8 },
    TCD: { price: 8.65, change24h: 0.7, change7d: 2.9 },
    BIO: { price: 12.30, change24h: 0.9, change7d: 3.1 },
    AFT: { price: 0.62, change24h: 1.5, change7d: 4.2 },
    YAY: { price: 74.80, change24h: 1.4, change7d: 3.9 },
    ZPX: { price: 5.42, change24h: 0.8, change7d: 2.4 },
    'ALTIN.S1': { price: 72.50, change24h: 0.85, change7d: 2.9 },
  },
  ipoPrices: {
    NTGLB: { price: 25.52, change24h: 0.0, change7d: 0.0 },
    KOCMT: { price: 20.50, change24h: 0.0, change7d: 0.0 },
    DURKN: { price: 17.00, change24h: 0.0, change7d: 0.0 },
    ONRYT: { price: 72.40, change24h: 9.95, change7d: 46.2 }, // Tavan serisi
    HOROZ: { price: 66.50, change24h: 9.92, change7d: 20.9 }, // Tavan serisi
    TABGD: { price: 142.50, change24h: 0.8, change7d: 2.1 },
    EBEBK: { price: 58.20, change24h: -0.5, change7d: 1.4 },
  },
};

let cachedRates: LiveMarketData = { ...INITIAL_MARKET_DATA };

// Network timeout helper so mobile requests never hang
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch real-time BIST stock or listed IPO price from Yahoo Finance
 */
export async function fetchBistPrice(symbol: string): Promise<PricePoint | null> {
  try {
    let cleanSymbol = symbol.trim().toUpperCase();
    if (cleanSymbol.endsWith('.IS')) {
      cleanSymbol = cleanSymbol.replace('.IS', '');
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}.IS?interval=1d&range=5d`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    }, 3500);

    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const current = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || current;
    const change24h = prevClose > 0 ? Math.round(((current - prevClose) / prevClose) * 10000) / 100 : 0;

    const quotes = (data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []).filter(
      (v: any) => typeof v === 'number' && !isNaN(v)
    );
    const firstQuote = quotes.length > 0 ? quotes[0] : prevClose;
    const change7d = firstQuote > 0 ? Math.round(((current - firstQuote) / firstQuote) * 10000) / 100 : change24h;
    const name = meta.shortName || meta.longName;

    return {
      price: Math.round(current * 100) / 100,
      change24h,
      change7d,
      name,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch real-time TEFAS fund price from official TEFAS JSON API
 */
export async function fetchTefasPrice(fundCode: string): Promise<PricePoint | null> {
  try {
    const cleanCode = fundCode.trim().toUpperCase();
    const url = 'https://www.tefas.gov.tr/api/funds/fonFiyatBilgiGetir';
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify({ fonKodu: cleanCode, dil: 'TR', periyod: 1 }),
    }, 3500);

    if (!res.ok) return null;
    const data = await res.json();
    const list = data?.resultList;
    if (!Array.isArray(list) || list.length === 0) return null;

    const latest = list[list.length - 1];
    if (!latest || typeof latest.fiyat !== 'number') return null;

    const current = latest.fiyat;
    const prev1d = list.length > 1 ? list[list.length - 2] : null;
    const prevClose = prev1d && typeof prev1d.fiyat === 'number' ? prev1d.fiyat : current;
    const change24h = prevClose > 0 ? Math.round(((current - prevClose) / prevClose) * 10000) / 100 : 0;

    const prev7d = list.length > 5 ? list[Math.max(0, list.length - 6)] : prev1d;
    const weekClose = prev7d && typeof prev7d.fiyat === 'number' ? prev7d.fiyat : prevClose;
    const change7d = weekClose > 0 ? Math.round(((current - weekClose) / weekClose) * 10000) / 100 : change24h;

    // Preserve higher precision for penny funds (e.g. 0.126703) or 4 decimals
    const roundedPrice = current < 10 ? Math.round(current * 1000000) / 1000000 : Math.round(current * 100) / 100;
    const name = latest.fonUnvan;

    return {
      price: roundedPrice,
      change24h,
      change7d,
      name,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch real-time US Stock or Fund price from Yahoo Finance
 */
export async function fetchUSStockPrice(symbol: string): Promise<PricePoint | null> {
  try {
    const cleanSymbol = symbol.trim().toUpperCase();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?interval=1d&range=5d`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    }, 3500);

    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

    const current = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || current;
    const change24h = prevClose > 0 ? Math.round(((current - prevClose) / prevClose) * 10000) / 100 : 0;

    const quotes = (data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || []).filter(
      (v: any) => typeof v === 'number' && !isNaN(v)
    );
    const firstQuote = quotes.length > 0 ? quotes[0] : prevClose;
    const change7d = firstQuote > 0 ? Math.round(((current - firstQuote) / firstQuote) * 10000) / 100 : change24h;

    return {
      price: Math.round(current * 100) / 100,
      change24h,
      change7d,
    };
  } catch {
    return null;
  }
}

/**
 * Dynamically look up live price for any single symbol
 */
export async function fetchLivePriceForSymbol(
  symbol: string,
  category?: AssetCategory
): Promise<{ price: number; change24h: number; change7d: number; currency: CurrencyType } | null> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;

  // Gold & Forex fast path
  if (sym === 'GRAM_ALTIN' || sym === 'GA') {
    return { price: cachedRates.gramAltinTry, change24h: 0.85, change7d: 2.8, currency: 'TRY' };
  }
  if (sym === 'CEYREK_ALTIN' || sym === 'CA') {
    return { price: cachedRates.ceyrekAltinTry, change24h: 0.85, change7d: 2.8, currency: 'TRY' };
  }
  if (sym === 'ALTIN.S1') {
    return { price: cachedRates.altinS1Try, change24h: 0.85, change7d: 2.9, currency: 'TRY' };
  }
  if (sym === 'USD' || sym === 'DOLAR') {
    return { price: cachedRates.usdTry, change24h: 0.15, change7d: 0.45, currency: 'TRY' };
  }
  if (sym === 'EUR' || sym === 'EURO') {
    return { price: cachedRates.eurTry, change24h: 0.22, change7d: 0.65, currency: 'TRY' };
  }

  // If specified as tefas or looks like 3-letter fund
  if (category === 'tefas_fund') {
    const tefasResult = await fetchTefasPrice(sym);
    if (tefasResult) {
      cachedRates.tefasPrices[sym] = tefasResult;
      return { ...tefasResult, currency: 'TRY' };
    }
  }

  // Try BIST
  if (category === 'bist_stock' || category === 'halka_arz' || !category) {
    const bistResult = await fetchBistPrice(sym);
    if (bistResult) {
      if (category === 'halka_arz') {
        cachedRates.ipoPrices[sym] = bistResult;
      } else {
        cachedRates.bistPrices[sym] = bistResult;
      }
      return { ...bistResult, currency: 'TRY' };
    }
  }

  // Try TEFAS if not yet tried
  if (category !== 'tefas_fund') {
    const tefasResult = await fetchTefasPrice(sym);
    if (tefasResult) {
      cachedRates.tefasPrices[sym] = tefasResult;
      return { ...tefasResult, currency: 'TRY' };
    }
  }

  // Fallback to global / US ticker check
  try {
    const usResult = await fetchUSStockPrice(sym);
    if (usResult) {
      return { ...usResult, currency: 'USD' };
    }
  } catch {}

  return null;
}

/**
 * Fetch all live market data for presets and active user portfolio assets
 */
export async function fetchLiveMarketData(userAssetSymbols: string[] = []): Promise<LiveMarketData> {
  try {
    let usdTry = cachedRates.usdTry;
    let eurTry = cachedRates.eurTry;

    // 1. Live Forex
    try {
      const fxRes = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD', {}, 3000);
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData.rates && fxData.rates.TRY) {
          usdTry = Number(fxData.rates.TRY);
          if (fxData.rates.EUR) {
            eurTry = Number(fxData.rates.TRY / fxData.rates.EUR);
          }
        }
      }
    } catch {
      // Fallback to Yahoo Finance USDTRY=X
      try {
        const yFxRes = await fetchWithTimeout(
          'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X?interval=1d&range=2d',
          {},
          3000
        );
        if (yFxRes.ok) {
          const yData = await yFxRes.json();
          const rate = yData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (typeof rate === 'number') usdTry = rate;
        }
      } catch {}
    }

    // 2. Live Spot Gold Ounce USD
    let goldOunceUsd = cachedRates.goldOunceUsd;
    try {
      const goldRes = await fetchWithTimeout(
        'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d',
        {},
        3000
      );
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        const price = goldData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (typeof price === 'number') goldOunceUsd = price;
      }
    } catch {
      // Secondary fallback via Binance PAXG
      try {
        const pxgRes = await fetchWithTimeout(
          'https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT',
          {},
          3000
        );
        if (pxgRes.ok) {
          const pxgData = await pxgRes.json();
          if (pxgData.lastPrice) goldOunceUsd = parseFloat(pxgData.lastPrice);
        }
      } catch {}
    }

    const gramAltinTry = (goldOunceUsd / 31.1034768) * usdTry;
    const ceyrekAltinTry = gramAltinTry * 1.63;
    const altinS1Try = gramAltinTry * 0.0105;

    // 3. Gather BIST and IPO symbols to fetch
    const bistSymbolsToFetch = new Set<string>([
      'THYAO', 'ASELS', 'GARAN', 'TUPRS', 'EREGL', 'BIMAS',
      'KCHOL', 'AKBNK', 'ISCTR', 'YKBNK', 'SAHOL', 'FROTO',
      'SISE', 'SASA', 'KOCMT', 'DURKN', 'ONRYT', 'HOROZ', 'TABGD', 'EBEBK',
    ]);

    // 4. Gather TEFAS symbols to fetch
    const tefasSymbolsToFetch = new Set<string>([
      'TI2', 'MAC', 'TCD', 'BIO', 'AFT', 'YAY', 'KZL', 'TAU', 'TTE',
    ]);

    // Add user's custom portfolio holdings to fetch list
    userAssetSymbols.forEach((sym) => {
      const clean = sym.trim().toUpperCase();
      if (!clean) return;
      if (clean === 'USD' || clean === 'EUR' || clean.includes('ALTIN') || clean === 'GA' || clean === 'CA') return;
      if (cachedRates.tefasPrices[clean] !== undefined || clean.length === 3) {
        tefasSymbolsToFetch.add(clean);
      } else {
        bistSymbolsToFetch.add(clean);
      }
    });

    const updatedBist = { ...cachedRates.bistPrices };
    const updatedIpo = { ...cachedRates.ipoPrices };
    const updatedTefas = { ...cachedRates.tefasPrices };

    // Fetch BIST & IPO prices in parallel with allSettled
    const bistFetchPromises = Array.from(bistSymbolsToFetch).map(async (symbol) => {
      const pricePoint = await fetchBistPrice(symbol);
      if (pricePoint) {
        if (['KOCMT', 'DURKN', 'ONRYT', 'HOROZ', 'TABGD', 'EBEBK'].includes(symbol)) {
          updatedIpo[symbol] = pricePoint;
        } else {
          updatedBist[symbol] = pricePoint;
        }
      }
    });

    // Fetch TEFAS prices in parallel with allSettled
    const tefasFetchPromises = Array.from(tefasSymbolsToFetch).map(async (fundCode) => {
      const pricePoint = await fetchTefasPrice(fundCode);
      if (pricePoint) {
        updatedTefas[fundCode] = pricePoint;
      }
    });

    // Run parallel batches with safe error recovery
    await Promise.allSettled([...bistFetchPromises, ...tefasFetchPromises]);

    // Always ensure ALTIN.S1 is synced with gold spot
    updatedTefas['ALTIN.S1'] = {
      price: Math.round(altinS1Try * 100) / 100,
      change24h: 0.85,
      change7d: 2.9,
    };

    cachedRates = {
      usdTry: Math.round(usdTry * 100) / 100,
      eurTry: Math.round(eurTry * 100) / 100,
      goldOunceUsd: Math.round(goldOunceUsd * 10) / 10,
      gramAltinTry: Math.round(gramAltinTry * 100) / 100,
      ceyrekAltinTry: Math.round(ceyrekAltinTry * 100) / 100,
      altinS1Try: Math.round(altinS1Try * 100) / 100,
      bistPrices: updatedBist,
      tefasPrices: updatedTefas,
      ipoPrices: updatedIpo,
    };

    return cachedRates;
  } catch (error) {
    console.warn('Market data fetch error, using cached:', error);
    return cachedRates;
  }
}

export function getPriceForAsset(
  symbol: string,
  marketData?: LiveMarketData
): { price: number; change24h: number; change7d: number; currency: CurrencyType } {
  if (!symbol) {
    return { price: 0, change24h: 0, change7d: 0, currency: 'TRY' };
  }

  const data = marketData || cachedRates;
  const sym = symbol.trim().toUpperCase();

  // 1. Halka Arz Fiyatları
  if (data.ipoPrices && data.ipoPrices[sym]) {
    return {
      price: data.ipoPrices[sym].price,
      change24h: data.ipoPrices[sym].change24h,
      change7d: data.ipoPrices[sym].change7d,
      currency: 'TRY',
    };
  }

  // 2. TEFAS Yatırım Fonları
  if (data.tefasPrices && data.tefasPrices[sym]) {
    return {
      price: data.tefasPrices[sym].price,
      change24h: data.tefasPrices[sym].change24h,
      change7d: data.tefasPrices[sym].change7d,
      currency: 'TRY',
    };
  }

  // 3. BIST Hisseleri
  if (data.bistPrices && data.bistPrices[sym]) {
    return {
      price: data.bistPrices[sym].price,
      change24h: data.bistPrices[sym].change24h,
      change7d: data.bistPrices[sym].change7d,
      currency: 'TRY',
    };
  }

  // 4. Altın ve Emtia
  if (sym === 'GRAM_ALTIN' || sym === 'GA') {
    return {
      price: data.gramAltinTry || 6860,
      change24h: 0.85,
      change7d: 2.80,
      currency: 'TRY',
    };
  }
  if (sym === 'CEYREK_ALTIN' || sym === 'CA') {
    return {
      price: data.ceyrekAltinTry || 11180,
      change24h: 0.85,
      change7d: 2.80,
      currency: 'TRY',
    };
  }
  if (sym === 'ALTIN.S1') {
    return {
      price: data.altinS1Try || 72.50,
      change24h: 0.85,
      change7d: 2.90,
      currency: 'TRY',
    };
  }

  // 5. Döviz
  if (sym === 'USD' || sym === 'DOLAR') {
    return {
      price: data.usdTry || 48.50,
      change24h: 0.15,
      change7d: 0.45,
      currency: 'TRY',
    };
  }
  if (sym === 'EUR' || sym === 'EURO') {
    return {
      price: data.eurTry || 52.30,
      change24h: 0.22,
      change7d: 0.65,
      currency: 'TRY',
    };
  }

  // Varsayılan
  return {
    price: 100,
    change24h: 0,
    change7d: 0,
    currency: 'TRY',
  };
}

function normalizeSearchText(str: string): string {
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Search all assets across BIST, TEFAS, Halka Arz and Gold/Forex
 * Supports both local presets and instant live querying for any symbol (e.g. TLY)
 */
export async function searchAssets(
  query: string,
  marketData?: LiveMarketData
): Promise<AssetSearchResult[]> {
  const rawQuery = (query || '').trim();
  const q = rawQuery.toUpperCase();
  const normQ = normalizeSearchText(rawQuery);
  const data = marketData || cachedRates;

  // Curated popular assets when search query is empty
  if (!normQ) {
    const popularCodes = [
      'THYAO', 'ASELS', 'GARAN', 'TUPRS', 'EREGL', 'BIMAS', 'KCHOL',
      'TI2', 'MAC', 'TCD', 'BIO', 'AFT', 'YAY',
      'ONRYT', 'KOCMT', 'DURKN', 'HOROZ',
      'GRAM_ALTIN', 'ALTIN.S1', 'USD', 'EUR',
    ];
    const results: AssetSearchResult[] = [];
    for (const code of popularCodes) {
      const p = PRESET_ASSETS.find((item) => item.symbol === code);
      if (p) {
        const info = getPriceForAsset(p.symbol, data);
        results.push({
          symbol: p.symbol,
          name: p.name,
          category: p.category,
          price: info.price,
          change24h: info.change24h,
          change7d: info.change7d,
          currency: info.currency,
          isLive: true,
        });
      }
    }
    return results;
  }

  const resultsMap = new Map<string, AssetSearchResult>();

  // 1. Match from PRESET_ASSETS
  PRESET_ASSETS.forEach((item) => {
    const symNorm = normalizeSearchText(item.symbol);
    const nameNorm = normalizeSearchText(item.name);
    if (symNorm.includes(normQ) || nameNorm.includes(normQ)) {
      const priceInfo = getPriceForAsset(item.symbol, data);
      resultsMap.set(item.symbol, {
        symbol: item.symbol,
        name: item.name,
        category: item.category,
        price: priceInfo.price,
        change24h: priceInfo.change24h,
        change7d: priceInfo.change7d,
        currency: priceInfo.currency,
        isLive: true,
      });
    }
  });

  // 2. If query is 2+ characters, do a live lookup against TEFAS and BIST
  if (q.length >= 2) {
    // TEFAS Fund live lookup (e.g. TLY)
    try {
      const tefasPrice = await fetchTefasPrice(q);
      if (tefasPrice && tefasPrice.price > 0) {
        data.tefasPrices[q] = tefasPrice;
        resultsMap.set(q, {
          symbol: q,
          name: tefasPrice.name || `${q} Yatırım Fonu`,
          category: 'tefas_fund',
          price: tefasPrice.price,
          change24h: tefasPrice.change24h,
          change7d: tefasPrice.change7d,
          currency: 'TRY',
          isLive: true,
        });
      }
    } catch {}

    // BIST Stock live lookup (e.g. ASTOR, KONTR)
    if (!resultsMap.has(q) || resultsMap.get(q)?.category === 'bist_stock') {
      try {
        const bistPrice = await fetchBistPrice(q);
        if (bistPrice && bistPrice.price > 0) {
          data.bistPrices[q] = bistPrice;
          resultsMap.set(q, {
            symbol: q,
            name: bistPrice.name || `${q} Pay Senedi`,
            category: 'bist_stock',
            price: bistPrice.price,
            change24h: bistPrice.change24h,
            change7d: bistPrice.change7d,
            currency: 'TRY',
            isLive: true,
          });
        }
      } catch {}
    }
  }

  const list = Array.from(resultsMap.values());

  // Sort: Exact symbol match first, then symbol startsWith, then name startsWith
  list.sort((a, b) => {
    const aSym = a.symbol.toUpperCase();
    const bSym = b.symbol.toUpperCase();
    if (aSym === q && bSym !== q) return -1;
    if (bSym === q && aSym !== q) return 1;

    const aStarts = aSym.startsWith(q);
    const bStarts = bSym.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return aSym.localeCompare(bSym);
  });

  return list;
}

