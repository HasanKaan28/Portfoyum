import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PortfolioSummary, CurrencyType } from '../types/portfolio';

// Set handler for incoming notifications while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('portfolio-alerts', {
        name: 'Portföy Bildirimleri',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error configuring notifications:', error);
    return false;
  }
}

export async function sendImmediatePortfolioNotification(
  summary: PortfolioSummary,
  currency: CurrencyType
): Promise<string | null> {
  try {
    const symbol = currency === 'TRY' ? '₺' : '$';
    const isDailyProfit = summary.dailyProfit >= 0;
    const dailySign = isDailyProfit ? '+' : '';
    const formattedDaily = `${dailySign}${symbol}${Math.abs(summary.dailyProfit).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
    const formattedPercent = `${dailySign}${summary.dailyProfitPercent.toFixed(2)}%`;
    const formattedTotal = `${symbol}${summary.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;

    const title = isDailyProfit ? '🚀 Portföyünüzde Kazanç Var!' : '📉 Portföy Durum Özeti';
    const body = `Bugünkü Kâr/Zarar: ${formattedDaily} (${formattedPercent}) • Toplam Değer: ${formattedTotal}`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { summary, timestamp: Date.now() },
      },
      trigger: {
        channelId: 'portfolio-alerts',
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to trigger immediate notification:', error);
    return null;
  }
}

export async function scheduleDailyNotification(hour: number = 18, minute: number = 0): Promise<void> {
  try {
    // Cancel existing scheduled daily notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Gün Sonu Portföy Özeti',
        body: 'Bugünkü kar/zarar durumunuzu ve anlık piyasa fiyatlarını inceleyin.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'portfolio-alerts',
      },
    });
  } catch (error) {
    console.warn('Failed to schedule daily notification:', error);
  }
}
