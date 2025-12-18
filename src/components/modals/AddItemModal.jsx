import { useState, useEffect } from 'react';
import { Camera, X, Package, ChevronLeft } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import BottomSheet from '../ui/BottomSheet';
import { ICONS, ICON_LIST } from '../../constants/itemData';

export default function AddItemModal({ onClose, onAdd, presets, initialMode }) {
  const [mode, setMode] = useState(initialMode || 'consumable');
  const [step, setStep] = useState(initialMode ? 2 : 1);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('package');
  const [estimatedDays, setEstimatedDays] = useState(30);
  const [users, setUsers] = useState({ adultMale: 1, adultFemale: 0, childMale: 0, childFemale: 0 });
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      // 既存のスキャナーがあればクリアしてから新しく作る
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 300, height: 200 },
        aspectRatio: 1.0,
        // PCのインカメラで反転しないように設定
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // 0 はカメラからの直接スキャン
      }, false);
      
      scanner.render((text) => {
        setName(`商品 (${text})`);
        setShowScanner(false);
      }, (err) => {
        // ここでエラーが出ても無視（リクエスト待ち状態）
      });
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [showScanner]);

  const handleSubmit = () => {
    if (!name) return;
    onAdd({ name, mode, icon, estimatedDays, users, openedDate: new Date().toISOString().split('T')[0], correctionFactor: 1.0 });
  };

  return (
    <BottomSheet 
      onClose={onClose} 
      title={showScanner ? "スキャン中" : "アイテム追加"} 
      showBack={true} 
      onBack={() => showScanner ? setShowScanner(false) : setStep(1)}
    >
      <div className="p-6 md:p-10">
        {showScanner ? (
          <div className="max-w-xl mx-auto space-y-4">
            <div id="reader" className="overflow-hidden rounded-3xl border-0 shadow-2xl bg-black min-h-[300px]"></div>
            <button onClick={() => setShowScanner(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">キャンセル</button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10">
            {/* 左側：カメラボタンと基本入力 */}
            <div className="flex-1 space-y-6">
              {mode === 'consumable' && (
                <button onClick={() => setShowScanner(true)} className="w-full py-12 border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-[2rem] flex flex-col items-center gap-3 text-emerald-600 hover:bg-emerald-50 transition-all group">
                  <Camera size={40} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black tracking-widest uppercase">バーコードをスキャン</span>
                </button>
              )}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">商品名</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="商品名を入力" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-700" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">アイコン</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_LIST.map(ic => {
                    const IconComp = ICONS[ic];
                    return (
                      <button key={ic} onClick={() => setIcon(ic)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${icon === ic ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}><IconComp size={22} /></button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右側：使用者と日数設定 */}
            <div className="flex-1 space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">使用者・日数設定</label>
                <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
                  {[['adultMale', '男性'], ['adultFemale', '女性']].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between px-2">
                      <span className="text-sm font-bold text-slate-600">{label}</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setUsers(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))} className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400">-</button>
                        <span className="text-sm font-black text-slate-800 w-4 text-center">{users[key]}</span>
                        <button onClick={() => setUsers(p => ({ ...p, [key]: p[key] + 1 }))} className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald-500">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">予想消費日数</label>
                    <span className="text-2xl font-black text-emerald-600">{estimatedDays}<span className="text-xs ml-1 text-slate-400">日</span></span>
                  </div>
                  <input type="range" min="7" max="180" value={estimatedDays} onChange={e => setEstimatedDays(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!name} className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black tracking-widest shadow-xl hover:bg-slate-700 transition-all active:scale-[0.98] disabled:opacity-30">
                アイテムを追加する
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}