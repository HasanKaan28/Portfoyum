import { describe, test, expect } from '@jest/globals';
import { getPriceForAsset, PRESET_ASSETS, LiveMarketData } from '../src/services/marketData';

describe('Market Data Live Integration Tests', () => {
  test('PRESET_ASSETS has valid symbols and categories for BIST, TEFAS and IPO', () => {
    expect(PRESET_ASSETS.length).toBeGreaterThan(15);
    const ipos = PRESET_ASSETS.filter(p => p.category === 'halka_arz');
    const tefas = PRESET_ASSETS.filter(p => p.category === 'tefas_fund');
    const bist = PRESET_ASSETS.filter(p => p.category === 'bist_stock');

    expect(ipos.length).toBeGreaterThanOrEqual(5);
    expect(tefas.length).toBeGreaterThanOrEqual(5);
    expect(bist.length).toBeGreaterThanOrEqual(10);
  });

  test('getPriceForAsset resolves prices from live market dataset', () => {
    const testData: LiveMarketData = {
      usdTry: 48.5,
      eurTry: 52.3,
      goldOunceUsd: 4400,
      gramAltinTry: 6860,
      ceyrekAltinTry: 11180,
      altinS1Try: 72.0,
      bistPrices: {
        THYAO: { price: 296.75, change24h: -1.58, change7d: -1.58 },
      },
      tefasPrices: {
        TI2: { price: 0.126703, change24h: 0.32, change7d: -2.77 },
      },
      ipoPrices: {
        ONRYT: { price: 59.1, change24h: 2.34, change7d: 2.34 },
      },
    };

    const thyao = getPriceForAsset('THYAO', testData);
    expect(thyao.price).toBe(296.75);
    expect(thyao.change24h).toBe(-1.58);

    const ti2 = getPriceForAsset('TI2', testData);
    expect(ti2.price).toBe(0.126703);
    expect(ti2.change24h).toBe(0.32);

    const onryt = getPriceForAsset('ONRYT', testData);
    expect(onryt.price).toBe(59.1);
  });

  test('searchAssets returns popular assets when query is empty', async () => {
    const { searchAssets } = await import('../src/services/marketData');
    const results = await searchAssets('');
    expect(results.length).toBeGreaterThan(5);
    const symbols = results.map(r => r.symbol);
    expect(symbols).toContain('THYAO');
    expect(symbols).toContain('TI2');
  });

  test('searchAssets finds matching stocks and funds by symbol or name', async () => {
    const { searchAssets } = await import('../src/services/marketData');
    
    // Search by partial ticker 'THY'
    const thyResults = await searchAssets('thy');
    expect(thyResults.length).toBeGreaterThan(0);
    expect(thyResults[0].symbol).toBe('THYAO');
    expect(thyResults[0].category).toBe('bist_stock');

    // Search by partial name 'teknoloji'
    const teknoResults = await searchAssets('teknoloji');
    expect(teknoResults.length).toBeGreaterThan(0);
    const fundCodes = teknoResults.map(r => r.symbol);
    expect(fundCodes).toContain('TI2');
  });

  test('searchAssets performs live query for unlisted TEFAS fund like TLY', async () => {
    const { searchAssets } = await import('../src/services/marketData');
    const tlyResults = await searchAssets('tly');
    expect(tlyResults.length).toBeGreaterThan(0);
    const tly = tlyResults[0];
    expect(tly.symbol).toBe('TLY');
    expect(tly.category).toBe('tefas_fund');
    expect(tly.price).toBeGreaterThan(1000);
    expect(tly.name).toContain('TERA');
  }, 10000);
});
