import { 
  Package, Droplets, Sparkles, Calendar, Shirt, Heart, Utensils, Zap, 
  Wind, Scissors, Eye, Smile, Brush, Bath, Baby, Car, Glasses, 
  Flower2, Sun, Moon, Apple, Cookie, Milk, Beer, ShowerHead, 
  SprayCan, Dog 
} from 'lucide-react';

// アイコンマッピング
export const ICONS = { 
  package: Package, 
  droplets: Droplets, 
  sparkles: Sparkles, 
  calendar: Calendar, 
  shirt: Shirt, 
  heart: Heart, 
  utensils: Utensils, 
  zap: Zap, 
  wind: Wind, 
  scissors: Scissors, 
  eye: Eye, 
  smile: Smile, 
  brush: Brush, 
  bath: Bath, 
  baby: Baby, 
  car: Car, 
  glasses: Glasses, 
  flower: Flower2, 
  sun: Sun, 
  moon: Moon, 
  apple: Apple, 
  cookie: Cookie, 
  milk: Milk, 
  beer: Beer, 
  shower: ShowerHead, 
  spray: SprayCan, 
  dog: Dog 
};

// アイコン選択用リスト
export const ICON_LIST = [
  'droplets', 'sparkles', 'heart', 'smile', 'brush', 'bath', 'baby', 
  'shirt', 'utensils', 'zap', 'wind', 'scissors', 'eye', 'car', 
  'glasses', 'flower', 'sun', 'moon', 'apple', 'cookie', 'milk', 
  'beer', 'shower', 'spray', 'dog', 'package', 'calendar'
];

// 単位
export const UNITS = { 
  ml: 'ml', 
  g: 'g', 
  roll: 'ロール', 
  piece: '個', 
  box: '箱', 
  sheet: '枚' 
};

// プリセット（モード別オブジェクト形式）
// defaultDays = 大人1人が標準容量を使い切る日数
// perPerson = 1人あたりの消費係数（大人=1.0, 子ども=0.5で計算）
export const PRESETS = {
  consumable: [
    { name: 'シャンプー', icon: 'droplets', defaultDays: 60, baseAmount: 500, unit: 'ml', perPerson: true },
    { name: 'コンディショナー', icon: 'droplets', defaultDays: 60, baseAmount: 500, unit: 'ml', perPerson: true },
    { name: 'ボディソープ', icon: 'bath', defaultDays: 45, baseAmount: 500, unit: 'ml', perPerson: true },
    { name: '洗顔料', icon: 'smile', defaultDays: 40, baseAmount: 120, unit: 'g', perPerson: true },
    { name: '化粧水', icon: 'heart', defaultDays: 60, baseAmount: 200, unit: 'ml', perPerson: false },
    { name: '乳液', icon: 'heart', defaultDays: 90, baseAmount: 150, unit: 'ml', perPerson: false },
    { name: '洗濯洗剤', icon: 'sparkles', defaultDays: 45, baseAmount: 900, unit: 'g', perPerson: false },
    { name: '柔軟剤', icon: 'wind', defaultDays: 45, baseAmount: 600, unit: 'ml', perPerson: false },
    { name: '食器用洗剤', icon: 'sparkles', defaultDays: 30, baseAmount: 300, unit: 'ml', perPerson: false },
    { name: '歯磨き粉', icon: 'brush', defaultDays: 30, baseAmount: 140, unit: 'g', perPerson: true },
    { name: 'トイレットペーパー', icon: 'package', defaultDays: 30, baseAmount: 12, unit: 'roll', perPerson: true },
    { name: 'ティッシュ', icon: 'package', defaultDays: 20, baseAmount: 5, unit: 'box', perPerson: false },
    { name: 'ペットフード', icon: 'dog', defaultDays: 30, baseAmount: 3000, unit: 'g', perPerson: false },
  ],
  expiry: [
    { name: '牛乳', icon: 'milk', defaultDays: 7 },
    { name: '卵', icon: 'cookie', defaultDays: 14 },
    { name: 'ヨーグルト', icon: 'milk', defaultDays: 10 },
    { name: '豆腐', icon: 'package', defaultDays: 5 },
    { name: '納豆', icon: 'package', defaultDays: 7 },
    { name: 'パン', icon: 'cookie', defaultDays: 4 },
    { name: 'ハム・ベーコン', icon: 'utensils', defaultDays: 10 },
    { name: 'チーズ', icon: 'cookie', defaultDays: 14 },
    { name: '味噌', icon: 'utensils', defaultDays: 180 },
    { name: 'マヨネーズ', icon: 'utensils', defaultDays: 30 },
  ]
};

// 人数から予測日数を計算
export const calcDaysFromUsers = (baseDays, adultCount, childCount, perPerson) => {
  if (!perPerson) return baseDays; // 人数に依存しない商品
  const totalPeople = adultCount + (childCount * 0.5); // 子ども = 大人の半分
  if (totalPeople <= 0) return baseDays;
  return Math.round(baseDays / totalPeople);
};