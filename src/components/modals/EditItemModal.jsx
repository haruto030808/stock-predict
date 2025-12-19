import { useState } from 'react';
import { Package, Users, Check } from 'lucide-react';
import { ICONS, ICON_LIST } from '../../constants/itemData';
import BottomSheet from '../ui/BottomSheet';

export default function EditItemModal({ item, onClose, onUpdate }) {
  const [name, setName] = useState(item.name);
  const [brandName, setBrandName] = useState(item.brandName || '');
  const [icon, setIcon] = useState(item.icon);
  const [adultCount, setAdultCount] = useState(item.adultCount || 1);
  const [childCount, setChildCount] = useState(item.childCount || 0);
  const [capacity, setCapacity] = useState(item.capacity || '');
  const [unit, setUnit] = useState(item.unit || 'ml');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const CurrentIcon = ICONS[icon] || Package;

  const handleSubmit = () => {
    if (!name) return;
    onUpdate({ 
      ...item, 
      name, 
      brandName,
      icon, 
      adultCount,
      childCount,
      capacity,
      unit
    });
  };

  return (
    <BottomSheet onClose={onClose} title="アイテムを編集">
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <div className="space-y-5">
          {/* アイコン選択 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <CurrentIcon size={32} className="text-slate-600" />
            </button>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">アイコン</p>
              <p className="text-sm text-slate-600">タップして変更</p>
            </div>
          </div>

          {/* アイコンピッカー */}
          {showIconPicker && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="grid grid-cols-6 gap-2">
                {ICON_LIST.map((iconName) => {
                  const IconComp = ICONS[iconName] || Package;
                  return (
                    <button
                      key={iconName}
                      onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                      className={`p-3 rounded-xl transition-all ${
                        icon === iconName 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">商品名</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-emerald-500" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ブランド名</label>
            <input 
              type="text" 
              value={brandName} 
              onChange={e => setBrandName(e.target.value)} 
              placeholder="メーカー・ブランド名"
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-emerald-500" 
            />
          </div>

          {item.mode === 'consumable' && (
            <>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">容量</label>
                  <input 
                    type="text" 
                    value={capacity} 
                    onChange={e => setCapacity(e.target.value)} 
                    placeholder="450"
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-emerald-500" 
                  />
                </div>
                <div className="w-1/3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">単位</label>
                  <select 
                    value={unit} 
                    onChange={e => setUnit(e.target.value)} 
                    className="w-full h-[56px] px-4 bg-slate-100 rounded-2xl font-bold appearance-none text-center"
                  >
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="回">回</option>
                    <option value="枚">枚</option>
                    <option value="roll">ロール</option>
                    <option value="box">箱</option>
                  </select>
                </div>
              </div>

              {/* 使用者構成 */}
              <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Users size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">使用人数</span>
                </div>
                
                {[
                  ['adult', '大人', '🧑', adultCount, setAdultCount],
                  ['child', '子ども', '👶', childCount, setChildCount]
                ].map(([key, label, emoji, count, setCount]) => (
                  <div key={key} className="flex justify-between items-center bg-white/50 p-3 rounded-2xl">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <span className="text-lg">{emoji}</span> {label}
                    </span>
                    <div className="flex gap-4 items-center">
                      <button 
                        onClick={() => setCount(Math.max(0, count - 1))} 
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-lg hover:bg-slate-50 active:scale-90 transition-all"
                      >-</button>
                      <span className="w-5 text-center font-black text-lg text-slate-700">{count}</span>
                      <button 
                        onClick={() => setCount(count + 1)} 
                        className="w-9 h-9 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center font-bold text-lg text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 保存ボタン */}
          <button 
            onClick={handleSubmit}
            disabled={!name}
            className="w-full mt-4 py-5 bg-slate-800 text-white rounded-2xl font-black shadow-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check size={20} />
            保存
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}