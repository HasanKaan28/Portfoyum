import { describe, test, expect } from '@jest/globals';
import {
  CURRENT_HALKA_ARZLAR,
  fetchLatestHalkaArzlar,
  getActiveIposCount,
  getIpoByCode,
} from '../src/services/ipoService';

describe('Halka Arz (IPO) Service & Broker Support', () => {
  test('CURRENT_HALKA_ARZLAR contains active and listed IPOs with valid data', async () => {
    const ipos = await fetchLatestHalkaArzlar();
    expect(ipos.length).toBeGreaterThan(0);

    ipos.forEach((ipo) => {
      expect(ipo.id).toBeDefined();
      expect(ipo.companyName.length).toBeGreaterThan(0);
      expect(ipo.code.length).toBeGreaterThan(0);
      expect(ipo.price).toBeGreaterThan(0);
      expect(typeof ipo.availableInZiraat).toBe('boolean');
      expect(typeof ipo.availableInMidas).toBe('boolean');
      expect(ipo.ziraatNote.length).toBeGreaterThan(0);
      expect(ipo.midasNote.length).toBeGreaterThan(0);
    });
  });

  test('correctly counts active IPOs currently collecting book-building bids', () => {
    const activeCount = getActiveIposCount(CURRENT_HALKA_ARZLAR);
    const expected = CURRENT_HALKA_ARZLAR.filter((i) => i.status === 'talep_toplaniyor').length;
    expect(activeCount).toBe(expected);
    expect(activeCount).toBeGreaterThanOrEqual(1);
  });

  test('verifies Ziraat and Midas availability logic', () => {
    // Koç Metalurji (KOCMT) is available on both Ziraat and Midas
    const kocmt = getIpoByCode('KOCMT');
    expect(kocmt).toBeDefined();
    expect(kocmt?.availableInZiraat).toBe(true);
    expect(kocmt?.availableInMidas).toBe(true);
    expect(kocmt?.ziraatNote).toContain('Ziraat');
    expect(kocmt?.midasNote).toContain('Midas');

    // Net Global (NTGLB) active book-building IPO with both Ziraat & Midas
    const ntglb = getIpoByCode('NTGLB');
    expect(ntglb).toBeDefined();
    expect(ntglb?.status).toBe('talep_toplaniyor');
    expect(ntglb?.price).toBe(25.52);
    expect(ntglb?.availableInZiraat).toBe(true);
    expect(ntglb?.availableInMidas).toBe(true);
    expect(ntglb?.katilimEndeksi).toBe(true);

    // Durukan Şekerleme (DURKN) is available on Ziraat (consortium) but NOT on Midas
    const durkn = getIpoByCode('DURKN');
    expect(durkn).toBeDefined();
    expect(durkn?.availableInZiraat).toBe(true);
    expect(durkn?.availableInMidas).toBe(false);
    expect(durkn?.midasNote).toContain('Konsorsiyum');
  });

  test('getIpoByCode handles case-insensitivity and trimming', () => {
    const ipo = getIpoByCode('  kocmt  ');
    expect(ipo).toBeDefined();
    expect(ipo?.code).toBe('KOCMT');

    const nonExistent = getIpoByCode('NON_EXISTENT');
    expect(nonExistent).toBeUndefined();
  });

  test('estimated lots distribution table is calculated with participants and costs', () => {
    const kocmt = getIpoByCode('KOCMT');
    expect(kocmt?.estimatedLots.length).toBeGreaterThan(0);

    kocmt?.estimatedLots.forEach((row) => {
      expect(row.lots).toBeGreaterThan(0);
      expect(row.totalCost).toBeGreaterThan(0);
      expect(row.participants).toBeDefined();
    });
  });
});
