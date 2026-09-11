# 📈 Portföyüm - Next-Gen Personal Wealth & Asset Tracking Mobile App

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_0_Errors-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-31%2F31_Passing-10B981?logo=jest&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Portföyüm** is a high-performance, privacy-first personal wealth and investment tracking mobile application built with **React Native** and **Expo (SDK 57)**. Designed with an ultra-modern **Neo-Fintech Obsidian & Titanium UI**, it provides real-time market syncing, dynamic asset allocation analytics, and localized tracking for stocks, crypto, gold, funds, and forex.

---

## 💎 Neo-Fintech 2.0 Design & Architecture Highlights

- 🎨 **Obsidian & Titanium Glass UI:** Designed following luxury fintech standards (inspired by Apple Card, Revolut, and Bloomberg Terminal) featuring deep space-black surfaces (`#070A11`), frosted cards (`#0F172A`), and vibrant neon emerald (`#00E599`) and cyber-sapphire accents.
- 👁️ **Privacy Shield Mode:** Instant one-tap balance and profit concealment (`••••••••`) for secure usage in public environments, accompanied by haptic micro-feedback.
- 📊 **Dynamic Allocation Segment Bar:** Real-time multi-color segmented progress bar calculating exact portfolio distribution across Borsa, Crypto, Gold, Funds, and Forex.
- 🏷️ **Smart Category Counters:** Live badges on category tabs displaying active holdings count (e.g., `Borsa (4)`, `Kripto (2)`).
- 🚀 **IPO & Ceiling Tracker (Halka Arz):** Ceiling streak counters (`🚀 3. Tavan`), brokerage badges (Ziraat, Midas, etc.), and calendar tracking.
- 📴 **100% Offline-First & Private:** All asset data is securely persisted on-device via `@react-native-async-storage/async-storage`—no external databases, zero tracking.

---

## ✨ Core Features

- 🟢 **Daily & Cumulative PnL Cards:** Prominent daily profit/loss card showing amount and percentage in both TRY (₺) and USD ($).
- 📈 **Interactive Performance Charts:** Touch-responsive SVG line and area charts with timeframe filters (`1D`, `1W`, `1M`, `3M`, `1Y`, `ALL`).
- ⚡ **Live Real-Time Market Feed:** Integrated with Binance and open market exchange rates with automatic 60-second polling and pull-to-refresh.
- 🔔 **Custom Smart Notifications:** On-demand portfolio briefing sent directly to the Android notification drawer and scheduled daily market close summaries (18:00).
- 🌓 **Dynamic Theme Adaptation:** Automatically harmonizes with system Dark/Light mode preferences.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Expo](https://expo.dev) SDK 57 (React Native 0.86, React 19) |
| **Language** | TypeScript (Strict mode, 100% typed) |
| **Charts & Graphics** | `react-native-svg` |
| **Haptics & UI** | `expo-haptics`, `@expo/vector-icons` |
| **Notifications** | `expo-notifications`, `expo-device` |
| **Persistence** | `@react-native-async-storage/async-storage` |
| **Testing Suite** | Jest 30, `ts-jest` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0+)
- Android device with **Expo Go** or an Android Emulator

### Installation
```bash
# Clone repository
git clone https://github.com/HasanKaan28/Portfolyom.git
cd Portfolyom

# Install dependencies
npm install
```

### Running on Android via Expo Go
```bash
npx expo start
```
Scan the generated **QR Code** using the **Expo Go** application on your Android device to launch instantly.

---

## 🧪 Testing & Code Quality

Comprehensive unit test coverage for calculation engines, IPO services, and live data processors:
```bash
# Run Jest unit test suite (31/31 Passing)
npm test

# Run strict TypeScript type check (0 Errors)
npx tsc --noEmit
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
