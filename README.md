# 📈 Portföyüm - Yeni Nesil Kişisel Finans & Varlık Takip Uygulaması

Modern, lüks **Neo-Fintech** tasarım diline sahip, çevrimdışı ve canlı piyasa verileriyle çalışan Android portföy ve yatırım takip uygulaması. **React Native** ve **Expo (SDK 57)** ile geliştirilmiştir.

---

## 💎 2.0 Sürümü ile Gelen Yenilikler & Tasarım Dönüşümü

- 🎨 **Neo-Fintech Obsidian & Titanium UI:** Apple Card, Revolut ve Bloomberg standartlarında derin uzay siyahı (`#070A11`), cam dokulu kartlar ve canlı neon aksanlarla baştan aşağı yenilenen orijinal tasarım.
- 👁️ **Gizlilik Modu (Bakiye Gizleme):** Başlıktaki göz simgesine tek dokunuşla tüm bakiye ve kâr tutarlarını `••••••••` şeklinde gizleme/gösterme.
- 📊 **Dinamik Varlık Dağılım Çubuğu:** Portföydeki Kripto, Borsa, Altın, Fon ve Döviz oranlarını anlık hesaplayarak görselleştiren çok renkli segment dağılım barı.
- 🏷️ **Akıllı Kategori Filtreleri:** Canlı varlık sayılarıyla (`Borsa (4)`, `Kripto (2)`, `Altın (1)`) tek tıkla filtrelenebilir çip menüsü.
- 🚀 **Halka Arz & Tavan Takibi:** Tavan serisi sayacı (`🚀 3. Tavan`), aracı kurum etiketleri (Ziraat, Midas vb.) ve halka arz takvimi.

---

## ✨ Temel Özellikler

- 🟢 **Günlük ve Dönemsel Kâr / Zarar Göstergesi:** Ana ekranda hem tutar (₺ / $) hem de yüzde olarak belirgin günlük ve toplam kâr kartları.
- 📈 **İnteraktif Performans Grafiği:** `1G`, `1H`, `1A`, `3A`, `1Y` ve `TÜMÜ` zaman dilimlerinde dokunmatik destekli SVG alan ve çizgi grafiği.
- ➕ **Çoklu Varlık Desteği:**
  - Kripto Paralar (Bitcoin, Ethereum, Solana vb.)
  - Altın ve Emtialar (Gram Altın, Çeyrek Altın, Ons Altın, Gümüş)
  - Borsa & Hisseler (BIST30 / ABD Borsaları)
  - TEFAS Yatırım Fonları
  - Döviz (USD/TRY, EUR/TRY)
- ⚡ **Anlık Canlı Piyasa Verisi:** Binance ve açık piyasa kurları entegrasyonu. Çek-bırak (pull-to-refresh) ve otomatik canlı güncelleme.
- 🔔 **İsteğe Bağlı Bildirimler:** Anlık portföy raporunu telefonun bildirim çubuğuna alma ve günlük saat 18:00 kapanış bildirimi ayarlama.
- 🌓 **Dinamik Koyu / Açık Tema:** Cihaz temasını otomatik algılayan yüksek kontrastlı OLED ve Minimalist Aydınlık mod.
- 💾 **%100 Güvenli Yerel Depolama:** Portföy verileriniz uzak sunucularda değil, telefonunuzun yerel AsyncStorage alanında şifreli saklanır.

---

## 🚀 Başlangıç ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- Android Telefon (Expo Go yüklü) veya Android Emülatör

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

Projede tam kapsamlı Jest birim testleri ve katı TypeScript tür denetimi yer almaktadır:
```bash
# Birim testlerini çalıştırın (31/31 Başarılı)
npm test

# TypeScript tür denetimi (0 Hata)
npx tsc --noEmit
```

---

## 🛠️ Kullanılan Teknolojiler

- **Framework:** [Expo](https://expo.dev) SDK 57 (React Native 0.86, React 19)
- **Dil:** TypeScript
- **Grafikler:** `react-native-svg`
- **Bildirimler:** `expo-notifications`
- **Depolama:** `@react-native-async-storage/async-storage`
- **İkonlar & Animasyonlar:** `@expo/vector-icons`, `expo-haptics`
- **Test:** Jest & `ts-jest`

---

## 📄 Lisans

MIT License.
