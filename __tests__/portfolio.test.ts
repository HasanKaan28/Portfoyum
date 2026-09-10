import { describe, test, expect } from '@jest/globals';
import { getPriceForAsset, LiveMarketData } from '../src/services/marketData';
import { generateHistoricalPoints } from '../src/services/storageService';
import { TimeFrame } from '../src/types/portfolio';

describe('Market Data & Asset Pricing (BIST, TEFAS & Halka Arz)', () => {
  const mockMarketData: LiveMarketData = {
    usdTry: 50.0,
    eurTry: 55.0,
    goldOunceUsd: 4000,
    gramAltinTry: 6430,
    ceyrekAltinTry: 10480,
    altinS1Try: 72.50,
    bistPrices: {
      THYAO: { price: 330, change24h: 1.5, change7d: 4.2 },
      ASELS: { price: 70, change24h: 2.0, change7d: 5.0 },
    },
    tefasPrices: {
      TI2: { price: 15.2, change24h: 1.8, change7d: 6.2 },
      MAC: { price: 29.0, change24h: 1.1, change7d: 3.8 },
      'ALTIN.S1': { price: 72.50, change24h: 0.85, change7d: 2.9 },
    },
    ipoPrices: {
      KOCMT: { price: 20.50, change24h: 0.0, change7d: 0.0 },
      ONRYT: { price: 72.40, change24h: 9.95, change7d: 46.2 },
    },
  };

  test('correctly resolves TEFAS fund prices and 7d change', () => {
    const ti2 = getPriceForAsset('TI2', mockMarketData);
    expect(ti2.price).toBe(15.2);
    expect(ti2.change24h).toBe(1.8);
    expect(ti2.change7d).toBe(6.2);
    expect(ti2.currency).toBe('TRY');

    const mac = getPriceForAsset('MAC', mockMarketData);
    expect(mac.price).toBe(29.0);
    expect(mac.change7d).toBe(3.8);
    expect(mac.currency).toBe('TRY');
  });

  test('correctly resolves BIST stock prices with TRY quote currency', () => {
    const thyao = getPriceForAsset('THYAO', mockMarketData);
    expect(thyao.price).toBe(330);
    expect(thyao.change24h).toBe(1.5);
    expect(thyao.change7d).toBe(4.2);
    expect(thyao.currency).toBe('TRY');

    // Case-insensitivity & whitespace test
    const thyaoLower = getPriceForAsset('  thyao  ', mockMarketData);
    expect(thyaoLower.price).toBe(330);
  });

  test('correctly resolves Halka Arz (IPO) prices and ceiling/tavan series', () => {
    const onryt = getPriceForAsset('ONRYT', mockMarketData);
    expect(onryt.price).toBe(72.40);
    expect(onryt.change24h).toBe(9.95);
    expect(onryt.change7d).toBe(46.2);
    expect(onryt.currency).toBe('TRY');

    const kocmt = getPriceForAsset('KOCMT', mockMarketData);
    expect(kocmt.price).toBe(20.50);
    expect(kocmt.currency).toBe('TRY');
  });

  test('correctly resolves Gold, Darphane Sertifikası and Commodity prices', () => {
    const gramAltin = getPriceForAsset('GRAM_ALTIN', mockMarketData);
    expect(gramAltin.price).toBe(6430);
    expect(gramAltin.currency).toBe('TRY');

    const shortGa = getPriceForAsset('GA', mockMarketData);
    expect(shortGa.price).toBe(6430);

    const ceyrek = getPriceForAsset('CEYREK_ALTIN', mockMarketData);
    expect(ceyrek.price).toBe(10480);

    const altinS1 = getPriceForAsset('ALTIN.S1', mockMarketData);
    expect(altinS1.price).toBe(72.50);
    expect(altinS1.currency).toBe('TRY');
  });

  test('correctly resolves Forex rates', () => {
    const usd = getPriceForAsset('USD', mockMarketData);
    expect(usd.price).toBe(50.0);
    expect(usd.currency).toBe('TRY');

    const eur = getPriceForAsset('EUR', mockMarketData);
    expect(eur.price).toBe(55.0);
    expect(eur.currency).toBe('TRY');
  });

  test('handles unknown, empty or undefined symbols safely without crashing', () => {
    const unknown = getPriceForAsset('UNKNOWN_SYMBOL', mockMarketData);
    expect(unknown.price).toBe(100);
    expect(unknown.currency).toBe('TRY');

    const empty = getPriceForAsset('', mockMarketData);
    expect(empty.price).toBe(0);

    const withoutMarketData = getPriceForAsset('THYAO');
    expect(withoutMarketData.price).toBeGreaterThan(0);
  });
});

describe('Historical Profit & Chart Points Generator', () => {
  const timeframes: TimeFrame[] = ['1G', '1H', '1A', '3A', '1Y', 'TÜMÜ'];

  timeframes.forEach((tf) => {
    test(`generates valid points for timeframe ${tf}`, () => {
      const totalValue = 500000;
      const totalProfit = 50000;
      const dailyProfit = 1200;

      const points = generateHistoricalPoints(totalValue, totalProfit, dailyProfit, tf);

      expect(points.length).toBeGreaterThan(1);

      // Verify each point has valid values and labels
      points.forEach((pt) => {
        expect(pt.value).toBeGreaterThan(0);
        expect(typeof pt.label).toBe('string');
        expect(pt.label.length).toBeGreaterThan(0);
        expect(pt.timestamp).toBeGreaterThan(0);
      });

      // The final point must match exact current total value
      const finalPoint = points[points.length - 1];
      expect(finalPoint.value).toBe(totalValue);

      // Timestamps must be strictly ascending
      for (let i = 1; i < points.length; i++) {
        expect(points[i].timestamp).toBeGreaterThan(points[i - 1].timestamp);
      }
    });
  });

  test('handles edge case where portfolio value is zero', () => {
    const points = generateHistoricalPoints(0, 0, 0, '1G');
    expect(points.length).toBeGreaterThan(1);
    const finalPoint = points[points.length - 1];
    expect(finalPoint.value).toBe(0);
  });
});

describe('Financial Math & Conversion Calculations', () => {
  test('calculates profit and profit percentages correctly', () => {
    const cost = 100000;
    const value = 125000;
    const profit = value - cost;
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

    expect(profit).toBe(25000);
    expect(profitPercent).toBe(25.0);
  });

  test('handles loss and negative profit percentages correctly', () => {
    const cost = 100000;
    const value = 80000;
    const profit = value - cost;
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

    expect(profit).toBe(-20000);
    expect(profitPercent).toBe(-20.0);
  });

  test('prevents division by zero when cost is zero', () => {
    const cost = 0;
    const value = 1000;
    const profit = value - cost;
    const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

    expect(profit).toBe(1000);
    expect(profitPercent).toBe(0);
    expect(isFinite(profitPercent)).toBe(true);
  });
});
