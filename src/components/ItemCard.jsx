import { ChevronRight, Package } from 'lucide-react';
import { ICONS } from '../constants/itemData';

export default function ItemCard({ item, calcRemainingDays, getRemainingPercent, calcEndDate, calcTotalDays, onClick, getUrgencyColor, formatDate }) {
  const remaining = calcRemainingDays(item);
  const remainingPercent = getRemainingPercent(item);
  const urgency = getUrgencyColor(remaining / calcTotalDays(item));
  const Icon = ICONS[item.icon] || Package;
  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 active:scale-[0.98] text-left">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${urgency.color}15` }}><Icon size={20} style={{ color: urgency.color }} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1"><h3 className="font-medium text-slate-700 text-sm truncate">{item.name}</h3><span className="text-sm font-semibold" style={{ color: urgency.color }}>{remaining <= 0 ? '期限切れ' : `${remaining}日`}</span></div>
          <div className="text-xs text-gray-400 mb-2">{item.mode === 'consumable' ? `${formatDate(item.openedDate)} → ${formatDate(calcEndDate(item).toISOString())}` : `期限: ${item.expiryDate}`}</div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${remainingPercent}%`, background: urgency.gradient }} /></div>
        </div>
        <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
      </div>
    </button>
  );
}