import {
  Asset,
  AssetCategory,
  CurrencyType,
  PortfolioAnalysis,
  AnalysisRecommendation,
  RiskLevel,
} from '../types/portfolio';

export function runDailyPortfolioAnalysis(
  assets: Asset[],
  currency: CurrencyType,
  fxRate: number
): PortfolioAnalysis {
  if (!assets || assets.length === 0) {
    return {
      healthScore: 50,
      riskLevel: 'Dengeli',
      topGainerDaily: null,
      topLoserDaily: null,
      topGainerWeekly: null,
      categoryDistribution: { bist_stock: 0, tefas_fund: 0, halka_arz: 0, gold: 0, forex: 0, crypto: 0 },
      recommendations: [
        {
          id: 'add_assets',
          type: 'info',
          title: 'Portföyünüzü Oluşturun',
          description: 'BIST hissesi, TEFAS fonu veya halka arz ekleyerek analizi başlatın.',
          impact: 'neutral',
        },
      ],
      dailyInsight: 'Portföyünüzde henüz analiz edilecek varlık bulunmuyor.',
    };
  }

  const safeFxRate = fxRate > 0 ? fxRate : 48.5;
  const getConvertedPrice = (price: number, assetCurr: CurrencyType) => {
    if (currency === assetCurr) return price;
    if (currency === 'TRY' && assetCurr === 'USD') return price * safeFxRate;
    if (currency === 'USD' && assetCurr === 'TRY') return price / safeFxRate;
    return price;
  };

  let totalPortfolioValue = 0;
  let totalDailyProfit = 0;
  let totalWeeklyProfit = 0;

  const categoryTotals: Record<AssetCategory, number> = {
    bist_stock: 0,
    tefas_fund: 0,
    halka_arz: 0,
    gold: 0,
    forex: 0,
    crypto: 0,
  };

  interface EvaluatedAsset {
    asset: Asset;
    value: number;
    dailyProfit: number;
    weeklyProfit: number;
    weight: number;
  }

  const evaluatedAssets: EvaluatedAsset[] = [];

  assets.forEach((asset) => {
    const unitCurrent = getConvertedPrice(asset.currentPrice, asset.currency);
    const holdingValue = asset.amount * unitCurrent;
    const dailyProfit = holdingValue * ((asset.change24h || 0) / 100);
    const weeklyProfit = holdingValue * ((asset.change7d || 0) / 100);

    totalPortfolioValue += holdingValue;
    totalDailyProfit += dailyProfit;
    totalWeeklyProfit += weeklyProfit;

    if (categoryTotals[asset.category] !== undefined) {
      categoryTotals[asset.category] += holdingValue;
    }

    evaluatedAssets.push({
      asset,
      value: holdingValue,
      dailyProfit,
      weeklyProfit,
      weight: 0,
    });
  });

  const safeTotal = totalPortfolioValue > 0 ? totalPortfolioValue : 1;
  evaluatedAssets.forEach((item) => {
    item.weight = (item.value / safeTotal) * 100;
  });

  const categoryDistribution: Record<AssetCategory, number> = {
    bist_stock: Math.round(((categoryTotals.bist_stock || 0) / safeTotal) * 100),
    tefas_fund: Math.round(((categoryTotals.tefas_fund || 0) / safeTotal) * 100),
    halka_arz: Math.round(((categoryTotals.halka_arz || 0) / safeTotal) * 100),
    gold: Math.round(((categoryTotals.gold || 0) / safeTotal) * 100),
    forex: Math.round(((categoryTotals.forex || 0) / safeTotal) * 100),
    crypto: Math.round(((categoryTotals.crypto || 0) / safeTotal) * 100),
  };

  // Sort by performance
  const sortedByDaily = [...evaluatedAssets].sort((a, b) => b.dailyProfit - a.dailyProfit);
  const topDaily = sortedByDaily[0];
  const worstDaily = sortedByDaily[sortedByDaily.length - 1];

  const sortedByWeekly = [...evaluatedAssets].sort((a, b) => b.weeklyProfit - a.weeklyProfit);
  const topWeekly = sortedByWeekly[0];

  const topGainerDaily =
    topDaily && topDaily.dailyProfit > 0
      ? {
          symbol: topDaily.asset.symbol,
          name: topDaily.asset.name,
          profit: topDaily.dailyProfit,
          percent: topDaily.asset.change24h,
        }
      : null;

  const topLoserDaily =
    worstDaily && worstDaily.dailyProfit < 0
      ? {
          symbol: worstDaily.asset.symbol,
          name: worstDaily.asset.name,
          profit: worstDaily.dailyProfit,
          percent: worstDaily.asset.change24h,
        }
      : null;

  const topGainerWeekly =
    topWeekly && topWeekly.weeklyProfit > 0
      ? {
          symbol: topWeekly.asset.symbol,
          name: topWeekly.asset.name,
          profit: topWeekly.weeklyProfit,
          percent: topWeekly.asset.change7d,
        }
      : null;

  // Health Score Calculation for BIST/TEFAS portfolio
  let healthScore = 75;
  const highestWeightAsset = [...evaluatedAssets].sort((a, b) => b.weight - a.weight)[0];

  if (highestWeightAsset && highestWeightAsset.weight > 60) {
    healthScore -= 24;
  } else if (highestWeightAsset && highestWeightAsset.weight > 40) {
    healthScore -= 12;
  } else {
    healthScore += 8;
  }

  // Bonus for balancing TEFAS funds and BIST
  if (categoryDistribution.tefas_fund >= 20) healthScore += 8;
  if (categoryDistribution.bist_stock >= 20) healthScore += 5;
  if (categoryDistribution.gold >= 10) healthScore += 5;
  if (categoryDistribution.halka_arz >= 10) healthScore += 4;

  healthScore = Math.min(98, Math.max(25, healthScore));

  // Risk level
  let riskLevel: RiskLevel = 'Dengeli';
  if (categoryDistribution.bist_stock + categoryDistribution.halka_arz > 80) {
    riskLevel = 'Yüksek';
  } else if (categoryDistribution.tefas_fund + categoryDistribution.gold > 60) {
    riskLevel = 'Düşük';
  } else {
    riskLevel = 'Dengeli';
  }

  // Actionable recommendations
  const recommendations: AnalysisRecommendation[] = [];

  // 1. Tavan serisi kontrolü
  const tavanAsset = evaluatedAssets.find((i) => i.asset.category === 'halka_arz' && (i.asset.change7d >= 20 || (i.asset.tavanCount && i.asset.tavanCount >= 3)));
  if (tavanAsset) {
    recommendations.push({
      id: 'tavan_' + tavanAsset.asset.symbol,
      type: 'take_profit',
      title: `🚀 ${tavanAsset.asset.symbol} Tavan Serisi Takibi`,
      description: `${tavanAsset.asset.name} son 7 günde %+${tavanAsset.asset.change7d.toFixed(1)} yaptı. Tavan bozulması ihtimaline karşı stop-loss veya kademeli kâr alımı değerlendirilebilir.`,
      assetSymbol: tavanAsset.asset.symbol,
      impact: 'positive',
    });
  }

  // 2. Concentration check
  if (highestWeightAsset && highestWeightAsset.weight > 35) {
    recommendations.push({
      id: 'rebalance_' + highestWeightAsset.asset.symbol,
      type: 'rebalance',
      title: `${highestWeightAsset.asset.symbol} Yoğunlaşması`,
      description: `${highestWeightAsset.asset.name} portföyünüzün %${highestWeightAsset.weight.toFixed(0)}'ini oluşturuyor. TEFAS fonlarına pay aktararak riski dağıtabilirsiniz.`,
      assetSymbol: highestWeightAsset.asset.symbol,
      impact: 'warning',
    });
  }

  // 3. TEFAS Fund recommendation
  if (categoryDistribution.tefas_fund < 15) {
    recommendations.push({
      id: 'add_tefas',
      type: 'diversify',
      title: 'TEFAS Fon Dağılımı Eksikliği',
      description: 'Portföyünüze TI2 (Teknoloji) veya MAC (Hisse) gibi profesyonel TEFAS fonları eklemek BIST dalgalanmalarını dengeler.',
      impact: 'neutral',
    });
  }

  // 4. Gold check
  if (categoryDistribution.gold < 10) {
    recommendations.push({
      id: 'add_altin_s1',
      type: 'opportunity',
      title: 'Darphane Altın (ALTIN.S1) Koruma Kalkanı',
      description: 'BIST üzerinde işlem gören ALTIN.S1 veya Gram Altın eklemek hisse piyasası düzeltmelerinde koruma sağlar.',
      impact: 'neutral',
    });
  }

  // 5. Daily insight
  const currSign = currency === 'TRY' ? '₺' : '$';
  const dailySign = totalDailyProfit >= 0 ? '+' : '';
  const formattedDaily = `${dailySign}${currSign}${Math.abs(Math.round(totalDailyProfit)).toLocaleString('tr-TR')}`;

  let dailyInsight = '';
  if (totalDailyProfit >= 0) {
    if (topDaily) {
      dailyInsight = `BIST ve Fon portföyünüz bugün ${formattedDaily} kârda. En yüksek getiriyi %+${topDaily.asset.change24h.toFixed(1)} artışla ${topDaily.asset.name} sağladı.`;
    } else {
      dailyInsight = `BIST ve Fon portföyünüz bugün ${formattedDaily} kârda pozitif bir seyir izliyor.`;
    }
  } else {
    if (worstDaily) {
      dailyInsight = `BIST düzeltmesiyle portföyünüz bugün ${formattedDaily} geri çekildi. En çok etkilenen %${worstDaily.asset.change24h.toFixed(1)} ile ${worstDaily.asset.name} oldu.`;
    } else {
      dailyInsight = `Piyasadaki satış baskısıyla portföyünüzde bugün ${formattedDaily} geri çekilme yaşandı.`;
    }
  }

  return {
    healthScore,
    riskLevel,
    topGainerDaily,
    topLoserDaily,
    topGainerWeekly,
    categoryDistribution,
    recommendations: recommendations.slice(0, 4),
    dailyInsight,
  };
}
