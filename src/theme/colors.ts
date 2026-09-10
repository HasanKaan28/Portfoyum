export interface ThemeColors {
  background: string;
  card: string;
  cardSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  profit: string;
  profitBg: string;
  loss: string;
  lossBg: string;
  neutral: string;
  gold: string;
  crypto: string;
  stock: string;
  fund: string;
  forex: string;
  bist: string;
  tefas: string;
  halkaArz: string;
  ziraat: string;
  midas: string;
  katilim: string;
  modalBackground: string;
  inputBackground: string;
  activeTab: string;
  inactiveTab: string;
  statusBar: 'light' | 'dark';
}

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardSecondary: '#F1F5F9',
  text: '#090D16',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  profit: '#059669',
  profitBg: '#D1FAE5',
  loss: '#E11D48',
  lossBg: '#FFE4E6',
  neutral: '#64748B',
  gold: '#D97706',
  crypto: '#7C3AED',
  stock: '#0284C7',
  fund: '#0D9488',
  forex: '#10B981',
  bist: '#2563EB',
  tefas: '#7C3AED',
  halkaArz: '#DB2777',
  ziraat: '#16A34A',
  midas: '#4F46E5',
  katilim: '#0D9488',
  modalBackground: '#FFFFFF',
  inputBackground: '#F1F5F9',
  activeTab: '#2563EB',
  inactiveTab: '#94A3B8',
  statusBar: 'dark',
};

export const darkTheme: ThemeColors = {
  background: '#070A11',
  card: '#0F172A',
  cardSecondary: '#162238',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#1E293B',
  primary: '#6366F1',
  primaryLight: '#312E81',
  profit: '#00E599',
  profitBg: 'rgba(0, 229, 153, 0.12)',
  loss: '#FF4D6A',
  lossBg: 'rgba(255, 77, 106, 0.12)',
  neutral: '#94A3B8',
  gold: '#F59E0B',
  crypto: '#A855F7',
  stock: '#38BDF8',
  fund: '#14B8A6',
  forex: '#00E599',
  bist: '#38BDF8',
  tefas: '#C084FC',
  halkaArz: '#F43F5E',
  ziraat: '#22C55E',
  midas: '#818CF8',
  katilim: '#2DD4BF',
  modalBackground: '#0F172A',
  inputBackground: '#162238',
  activeTab: '#6366F1',
  inactiveTab: '#64748B',
  statusBar: 'light',
};
