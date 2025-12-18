import { 
    Package, Droplets, Sparkles, Calendar, Shirt, Heart, Utensils, Zap, 
    Wind, Scissors, Eye, Smile, Brush, Bath, Baby, Car, Glasses, 
    Flower2, Sun, Moon, Apple, Cookie, Milk, Beer, ShowerHead, 
    SprayCan, Dog 
  } from 'lucide-react';
  
  export const ICONS = { 
    package: Package, droplets: Droplets, sparkles: Sparkles, calendar: Calendar, 
    shirt: Shirt, heart: Heart, utensils: Utensils, zap: Zap, wind: Wind, 
    scissors: Scissors, eye: Eye, smile: Smile, brush: Brush, bath: Bath, 
    baby: Baby, car: Car, glasses: Glasses, flower: Flower2, sun: Sun, 
    moon: Moon, apple: Apple, cookie: Cookie, milk: Milk, beer: Beer, 
    shower: ShowerHead, spray: SprayCan, dog: Dog 
  };
  
  export const ICON_LIST = [
    'droplets', 'sparkles', 'heart', 'smile', 'brush', 'bath', 'baby', 
    'shirt', 'utensils', 'zap', 'wind', 'scissors', 'eye', 'car', 
    'glasses', 'flower', 'sun', 'moon', 'apple', 'cookie', 'milk', 
    'beer', 'shower', 'spray', 'dog', 'package', 'calendar'
  ];
  
  export const UNITS = { ml: 'ml', g: 'g', roll: 'ロール', piece: '個', box: '箱', sheet: '枚' };
  
  export const PRESETS = [
    { name: 'シャンプー', icon: 'droplets', baseDays: 60, baseAmount: 500, unit: 'ml' },
    { name: 'ボディソープ', icon: 'bath', baseDays: 45, baseAmount: 500, unit: 'ml' },
    { name: '洗顔料', icon: 'smile', baseDays: 40, baseAmount: 120, unit: 'g' },
    { name: '化粧水', icon: 'heart', baseDays: 60, baseAmount: 200, unit: 'ml' },
    { name: '洗濯洗剤', icon: 'sparkles', baseDays: 45, baseAmount: 900, unit: 'g' },
    { name: '食器用洗剤', icon: 'sparkles', baseDays: 30, baseAmount: 300, unit: 'ml' },
    { name: '歯磨き粉', icon: 'brush', baseDays: 30, baseAmount: 140, unit: 'g' },
    { name: 'トイレットペーパー', icon: 'package', baseDays: 30, baseAmount: 12, unit: 'roll' },
    { name: 'ティッシュ', icon: 'package', baseDays: 20, baseAmount: 5, unit: 'box' },
    { name: 'ペットフード', icon: 'dog', baseDays: 30, baseAmount: 3000, unit: 'g' },
  ];