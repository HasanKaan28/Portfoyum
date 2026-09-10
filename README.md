# 📈 Portföyüm - Kişisel Portföy ve Varlık Takip Uygulaması

Modern, hızlı ve kullanıcı dostu bir Android portföy ve yatırım takip uygulaması. React Native ve Expo (SDK 57) ile geliştirilmiştir.

---

## ✨ Temel Özellikler

- 🟢 **Günlük Kâr / Zarar Göstergesi:** Ana ekranda hem tutar (₺ / $) hem de yüzde olarak belirgin günlük kâr/zarar kartı.
- 📊 **Geçmiş Dönem Kâr Grafiği:** `1G`, `1H`, `1A`, `3A`, `1Y` ve `TÜMÜ` zaman dilimlerinde interaktif, dokunmatik destekli SVG alan ve çizgi grafiği.
- ➕ **Kolay Varlık Yönetimi:**
  - Kripto Paralar (Bitcoin, Ethereum, Solana, XRP vb.)
  - Altın ve Emtialar (Gram Altın, Çeyrek Altın, Ons Altın, Gümüş)
  - Borsa & Hisseler (BIST30 / ABD Borsaları)
  - Döviz (USD/TRY, EUR/TRY)
  - Tek dokunuşla varlık ekleme, düzenleme ve silme.
- ⚡ **Anlık Canlı Piyasa Verisi:** Binance ve açık piyasa kurları entegrasyonu. Çek-bırak (pull-to-refresh) ve 60 saniyede bir otomatik canlı güncelleme.
- 🔔 **İsteğe Bağlı Bildirimler:** Üst menüden tek tıkla **"Şimdi Bildirim Gönder"** diyerek anlık portföy raporunu telefonun bildirim çubuğuna alma ve günlük saat 18:00 kapanış bildirimi ayarlama.
- 🌓 **Cihaz Temasına Duyarlı Dinamik Renkler:** Android telefonun Açık / Koyu tema ayarını otomatik algılayarak yüksek kontrastlı Material 3 finansal renk paletine anında uyum sağlar.
- 💾 **Yerel ve Güvenli Depolama:** Portföy verileriniz sunucularda değil, telefonunuzun yerel AsyncStorage alanında saklanır.

---

## 🚀 Başlangıç ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- Android Telefon (Expo Go uygulaması yüklü)

### Kurulum
```bash
# Bağımlılıkları yükleyin
npm install
```

### Expo Go ile Android'de Çalıştırma
```bash
npx expo start
```
Terminalde oluşan **QR Kodunu** Android cihazınızdaki **Expo Go** uygulaması ile taratarak uygulamayı anında telefonunuzda çalıştırabilirsiniz.

---

## 🧪 Testler ve Kod Kalitesi

Projede tam kapsamlı Jest birim testleri yer almaktadır:
```bash
# Testleri çalıştırın
npm test

# TypeScript tür denetimi
npx tsc --noEmit
```

---

## 🛠️ Kullanılan Teknolojiler

- **Framework:** [Expo](https://expo.dev) SDK 57 (React Native 0.86, React 19)
- **Dil:** TypeScript
- **Grafikler:** `react-native-svg`
- **Bildirimler:** `expo-notifications`
- **Depolama:** `@react-native-async-storage/async-storage`
- **İkonlar:** `@expo/vector-icons`
- **Test:** Jest & `ts-jest`

---

## 📄 Lisans

MIT License.
