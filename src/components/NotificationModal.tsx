import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { CurrencyType, NotificationSettings, PortfolioSummary } from '../types/portfolio';
import {
  registerForPushNotificationsAsync,
  sendImmediatePortfolioNotification,
  scheduleDailyNotification,
} from '../services/notificationService';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  summary: PortfolioSummary;
  currency: CurrencyType;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  summary,
  currency,
  settings,
  onUpdateSettings,
}) => {
  const { colors, isDark } = useTheme();
  const [isSending, setIsSending] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const handleSendInstantNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSending(true);

    try {
      const granted = await registerForPushNotificationsAsync();
      setHasPermission(granted);

      if (!granted) {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Android ayarlarından Portföyüm uygulaması için bildirim izni vermeniz gerekmektedir.'
        );
        setIsSending(false);
        return;
      }

      const notifId = await sendImmediatePortfolioNotification(summary, currency);
      if (notifId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Bildirim Gönderildi! 🔔',
          'Güncel portföy kâr/zarar ve toplam değer raporunuz telefonunuzun bildirim çubuğuna gönderildi.'
        );
      } else {
        Alert.alert('Uyarı', 'Bildirim oluşturulamadı. Lütfen bildirim izinlerini kontrol edin.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Bildirim gönderilirken bir sorun oluştu.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleDaily = async (val: boolean) => {
    Haptics.selectionAsync();
    const updated = { ...settings, enabled: val };
    onUpdateSettings(updated);

    if (val) {
      await registerForPushNotificationsAsync();
      await scheduleDailyNotification(18, 0);
    }
  };

  const handleToggleVolatility = (val: boolean) => {
    Haptics.selectionAsync();
    onUpdateSettings({ ...settings, notifyOnHighVolatility: val });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleContainer}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Bildirim Merkezi</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Primary Action: Send Instant Notification */}
            <View
              style={[
                styles.instantCard,
                { backgroundColor: colors.cardSecondary, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>Anlık Durum Bildirimi</Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                İstediğiniz an tek dokunuşla portföyünüzün toplam kârını ve değerini bildirim olarak telefonunuza
                gönderin.
              </Text>

              <TouchableOpacity
                style={[styles.instantBtn, { backgroundColor: colors.primary }]}
                onPress={handleSendInstantNotification}
                disabled={isSending}
                activeOpacity={0.85}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                    <Text style={styles.instantBtnText}>Şimdi Bildirim Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Daily Automated Notification */}
            <View style={[styles.settingRow, { borderColor: colors.border }]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Her Gün Kâr/Zarar Özeti</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                  Her akşam saat 18:00'de gün sonu portföy kapanış bildirimi
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleDaily}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* High Volatility Alert */}
            <View style={[styles.settingRow, { borderColor: colors.border }]}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Yüksek Hareketlilik Uyarısı</Text>
                <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                  Portföyünüzde günlük %3'ten fazla dalgalanma olduğunda uyar
                </Text>
              </View>
              <Switch
                value={settings.notifyOnHighVolatility}
                onValueChange={handleToggleVolatility}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Information Notice */}
            <View style={[styles.infoBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Bildirimler Android sisteminiz üzerinde yerel olarak çalışır, harici sunucuya kişisel verileriniz
                aktarılmaz.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
  },
  instantCard: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  instantBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
  },
  instantBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 20,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
