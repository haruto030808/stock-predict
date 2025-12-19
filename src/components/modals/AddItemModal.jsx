import { useState, useEffect } from 'react';
import { Camera, Plus, Package, ChevronLeft, Search, Users, Info, Check } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import BottomSheet from '../ui/BottomSheet';
import { ICONS, PRESETS, calcDaysFromUsers } from '../../constants/itemData';

export default function AddItemModal({ onClose, onAdd, initialMode }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [janCode, setJanCode] = useState('');
  const [icon, setIcon] = useState('package');
  const [estimatedDays, setEstimatedDays] = useState(30);
  const [expiryDate, setExpiryDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [unit, setUnit] = useState('ml');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [initialPercent, setInitialPercent] = useState(100);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (initialMode === 'expiry' && !expiryDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setExpiryDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [initialMode, expiryDate]);

  useEffect(() => {
    if (selectedPreset && selectedPreset.perPerson !== undefined) {
      const days = calcDaysFromUsers(
        selectedPreset.defaultDays,
        adultCount,
        childCount,
        selectedPreset.perPerson
      );
      setEstimatedDays(days);
    }
  }, [adultCount, childCount, selectedPreset]);

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      });
      scanner.render((text) => {
        setJanCode(text);
        setName('スキャン済み商品 (' + text + ')');
        setShowScanner(false);
      }, () => {});
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Scanner clear error:", error));
      }
    };
  }, [showScanner]);

  const handleSelectPreset = (p) => {
    setName(p.name);
    setIcon(p.icon);
    setSelectedPreset(p);
    setIsCustom(false);
    if (p.baseAmount) setCapacity(String(p.baseAmount));
    if (p.unit) setUnit(p.unit);
    const days = calcDaysFromUsers(p.defaultDays, adultCount, childCount, p.perPerson);
    setEstimatedDays(days);
    setStep(2);
  };

  const handleCustom = () => {
    setSelectedPreset(null);
    setIsCustom(true);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!name) return;
    onAdd({ 
      name, 
      brandName,
      janCode,
      icon, 
      estimatedDays, 
      expiryDate: initialMode === 'expiry' ? expiryDate : null,
      adultCount,
      childCount,
      initialPercent,
      capacity, 
      unit, 
      mode: initialMode 
    });
    onClose();
  };

  const currentPresets = PRESETS[initialMode] || [];

  const renderUserCounter = (key, label, emoji, count, setCount) => (
    <div key={key} className="flex justify-between items-center bg-white/50 p-3 rounded-2xl">
      <span className="font-bold text-slate-600 flex items-center gap-2">
        <span className="text-lg">{emoji}</span> {label}
      </span>
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => setCount(Math.max(0, count - 1))} 
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-xl hover:bg-slate-50 active:scale-90 transition-all"
        >-</button>
        <span className="w-6 text-center font-black text-xl text-slate-700">{count}</span>
        <button 
          onClick={() => setCount(count + 1)} 
          className="w-10 h-10 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center font-bold text-xl text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all"
        >+</button>
      </div>
    </div>
  );

  return (
    <BottomSheet 
      onClose={onClose} 
      title={step === 1 ? (initialMode === 'consumable' ? "消耗品を追加" : "期限付きを追加") : "詳細を設定"} 
      showBack={step === 2} 
      onBack={() => setStep(1)}
    >
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {step === 1 ? (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-slate-400">
              <Search size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">定番のアイテムから選ぶ</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentPresets.map((p) => {
                const IconComp = ICONS[p.icon] || Package;
                return (
                  <button 
                    key={p.name} 
                    onClick={() => handleSelectPreset(p)} 
                    className="p-5 bg-slate-50 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 group transition-all"
                  >
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <IconComp className="text-slate-400 group-hover:text-emerald-500" size={28} />
                    </div>
                    <span className="text-sm font-black text-slate-700">{p.name}</span>
                  </button>
                );
              })}
              <button 
                onClick={handleCustom} 
                className="p-5 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:bg-slate-50 transition-all"
              >
                <div className="p-3 bg-slate-100 rounded-2xl">
                  <Plus size={28} />
                </div>
                <span className="text-sm font-black text-slate-400">その他</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10">
            {showScanner ? (
              <div className="w-full space-y-4">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-black aspect-square max-w-sm mx-auto">
                  <div id="reader" className="w-full" />
                </div>
                <button 
                  onClick={() => setShowScanner(false)} 
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} /> キャンセル
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5">
                  {initialMode === 'consumable' && (
                    <button 
                      onClick={() => setShowScanner(true)} 
                      className="w-full py-8 border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-[2rem] flex flex-col items-center gap-2 text-emerald-600 hover:bg-emerald-100 transition-all group"
                    >
                      <Camera size={32} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold">バーコードをスキャン</span>
                    </button>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">商品名</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="商品名を入力" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-lg outline-emerald-500" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ブランド名 (任意)</label>
                    <input 
                      type="text" 
                      value={brandName} 
                      onChange={e => setBrandName(e.target.value)} 
                      placeholder="メーカー・ブランド名" 
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-emerald-500" 
                    />
                  </div>

                  {initialMode === 'expiry' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">有効期限</label>
                      <input 
                        type="date" 
                        value={expiryDate} 
                        onChange={e => setExpiryDate(e.target.value)} 
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-emerald-500" 
                      />
                    </div>
                  ) : (
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
                  )}

                  {isCustom && initialMode === 'consumable' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                        予想消費日数: <span className="text-emerald-500">{estimatedDays}日</span>
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="180" 
                        value={estimatedDays} 
                        onChange={e => setEstimatedDays(Number(e.target.value))} 
                        className="w-full accent-emerald-500" 
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-5">
                  {initialMode === 'consumable' && (
                    <>
                      <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Users size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">使用人数</span>
                        </div>
                        
                        {renderUserCounter('adult', '大人', '🧑', adultCount, setAdultCount)}
                        {renderUserCounter('child', '子ども', '👶', childCount, setChildCount)}

                        {selectedPreset && (
                          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                            <p className="text-xs text-slate-400 mb-1">予測消費日数</p>
                            <p className="text-2xl font-black text-emerald-500">{estimatedDays}日</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 rounded-[2rem] p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                          <Info size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">今の残量は？</span>
                        </div>
                        <div className="space-y-3">
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            step="10"
                            value={initialPercent} 
                            onChange={e => setInitialPercent(Number(e.target.value))} 
                            className="w-full accent-amber-500" 
                          />
                          <div className="flex justify-between text-xs font-bold text-amber-600">
                            <span>残りわずか</span>
                            <span className="text-lg">{initialPercent}%</span>
                            <span>新品</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-amber-600/70">途中から登録する場合は調整してください</p>
                      </div>
                    </>
                  )}

                  <button 
                    onClick={handleSubmit} 
                    disabled={!name}
                    className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={22} /> 追加する
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}