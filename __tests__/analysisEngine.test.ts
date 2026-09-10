import { describe, test, expect } from '@jest/globals';
import { runDailyPortfolioAnalysis } from '../src/services/analysisEngine';
import { Asset } from '../src/types/portfolio';

describe('Daily Portfolio Analysis Algorithm Engine (BIST, TEFAS & Halka Arz)', () => {
  const fxRate = 50.0;

  test('handles empty portfolio gracefully without crashing', () => {
    const result = runDailyPortfolioAnalysis([], 'TRY', fxRate);
    expect(result.healthScore).toBe(50);
    expect(result.riskLevel).toBe('Dengeli');
    expect(result.topGainerDaily).toBeNull();
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(typeof result.dailyInsight).toBe('string');
  });

  test('correctly detects top daily gainer and top weekly performer in BIST & IPOs', () => {
    const assets: Asset[] = [
      {
        id: '1',
        symbol: 'TI2',
        name: 'İş Portföy BIST Teknoloji Fonu',
        category: 'tefas_fund',
        amount: 1000,
        buyPrice: 14.0,
        currentPrice: 15.0,
        currency: 'TRY',
        change24h: 1.5,
        change7d: 4.2,
        lastUpdated: Date.now(),
      },
      {
        id: '2',
        symbol: 'ONRYT',
        name: 'Onur Yüksek Teknoloji (Halka Arz)',
        category: 'halka_arz',
        amount: 50,
        buyPrice: 49.50,
        currentPrice: 72.40,
        currency: 'TRY',
        change24h: 9.95, // Ceiling / Tavan
        change7d: 46.2, // Huge weekly run
        tavanCount: 4,
        lastUpdated: Date.now(),
      },
      {
        id: '3',
        symbol: 'EREGL',
        name: 'Ereğli Demir Çelik',
        category: 'bist_stock',
        amount: 200,
        buyPrice: 55.0,
        currentPrice: 52.8,
        currency: 'TRY',
        change24h: -2.1, // Daily loser
        change7d: -3.5,
        lastUpdated: Date.now(),
      },
    ];

    const analysis = runDailyPortfolioAnalysis(assets, 'TRY', fxRate);

    // ONRYT should be top daily gainer
    expect(analysis.topGainerDaily?.symbol).toBe('ONRYT');
    expect(analysis.topGainerDaily?.percent).toBe(9.95);

    // EREGL should be top daily loser
    expect(analysis.topLoserDaily?.symbol).toBe('EREGL');
    expect(analysis.topLoserDaily?.percent).toBe(-2.1);

    // ONRYT should be top weekly performer
    expect(analysis.topGainerWeekly?.symbol).toBe('ONRYT');
    expect(analysis.topGainerWeekly?.percent).toBe(46.2);
  });

  test('triggers take profit recommendation for IPOs with >= 3 ceiling run (tavan)', () => {
    const assets: Asset[] = [
      {
        id: '1',
        symbol: 'ONRYT',
        name: 'Onur Yüksek Teknoloji',
        category: 'halka_arz',
        amount: 40,
        buyPrice: 49.50,
        currentPrice: 72.40,
        currency: 'TRY',
        change24h: 9.95,
        change7d: 45.0,
        tavanCount: 4, // 4th ceiling
        lastUpdated: Date.now(),
      },
      {
        id: '2',
        symbol: 'TI2',
        name: 'TEFAS Fonu',
        category: 'tefas_fund',
        amount: 200,
        buyPrice: 14.5,
        currentPrice: 14.8,
        currency: 'TRY',
        change24h: 0.5,
        change7d: 1.5,
        lastUpdated: Date.now(),
      },
    ];

    const analysis = runDailyPortfolioAnalysis(assets, 'TRY', fxRate);
    const takeProfitRec = analysis.recommendations.find((r) => r.type === 'take_profit');

    expect(takeProfitRec).toBeDefined();
    expect(takeProfitRec?.assetSymbol).toBe('ONRYT');
    expect(takeProfitRec?.title).toContain('Tavan');
  });

  test('penalizes health score and suggests rebalancing when an asset dominates portfolio', () => {
    const dominantAssets: Asset[] = [
      {
        id: '1',
        symbol: 'THYAO',
        name: 'Türk Hava Yolları',
        category: 'bist_stock',
        amount: 1000,
        buyPrice: 300,
        currentPrice: 320, // 320,000 TL (Dominates ~96%)
        currency: 'TRY',
        change24h: 1.0,
        change7d: 3.0,
        lastUpdated: Date.now(),
      },
      {
        id: '2',
        symbol: 'USD',
        name: 'Amerikan Doları',
        category: 'forex',
        amount: 200,
        buyPrice: 48,
        currentPrice: 48.5, // ~9,700 TL
        currency: 'TRY',
        change24h: 0,
        change7d: 0,
        lastUpdated: Date.now(),
      },
    ];

    const analysis = runDailyPortfolioAnalysis(dominantAssets, 'TRY', fxRate);

    // Rebalance warning should be triggered for THYAO
    const rebalanceRec = analysis.recommendations.find((r) => r.type === 'rebalance');
    expect(rebalanceRec).toBeDefined();
    expect(rebalanceRec?.assetSymbol).toBe('THYAO');
  });

  test('rewards balanced portfolio containing TEFAS funds, BIST stocks, Halka Arz, and Gold', () => {
    const balancedAssets: Asset[] = [
      {
        id: '1',
        symbol: 'TI2',
        name: 'İş Portföy BIST Teknoloji Fonu',
        category: 'tefas_fund',
        amount: 3000,
        buyPrice: 14.0,
        currentPrice: 14.85,
        currency: 'TRY',
        change24h: 0.8,
        change7d: 2.5,
        lastUpdated: Date.now(),
      },
      {
        id: '2',
        symbol: 'THYAO',
        name: 'Türk Hava Yolları',
        category: 'bist_stock',
        amount: 150,
        buyPrice: 310,
        currentPrice: 320.5,
        currency: 'TRY',
        change24h: 1.4,
        change7d: 4.1,
        lastUpdated: Date.now(),
      },
      {
        id: '3',
        symbol: 'ALTIN.S1',
        name: 'Darphane Altın Sertifikası',
        category: 'gold',
        amount: 600,
        buyPrice: 70,
        currentPrice: 72.5,
        currency: 'TRY',
        change24h: 0.8,
        change7d: 2.9,
        lastUpdated: Date.now(),
      },
      {
        id: '4',
        symbol: 'KOCMT',
        name: 'Koç Metalurji (Halka Arz)',
        category: 'halka_arz',
        amount: 2000,
        buyPrice: 20.5,
        currentPrice: 20.5,
        currency: 'TRY',
        change24h: 0.0,
        change7d: 0.0,
        lastUpdated: Date.now(),
      },
    ];

    const analysis = runDailyPortfolioAnalysis(balancedAssets, 'TRY', fxRate);

    // Good multi-class diversification should yield a high health score (>= 80)
    expect(analysis.healthScore).toBeGreaterThanOrEqual(80);
    expect(analysis.riskLevel).toBe('Dengeli');
  });
});
