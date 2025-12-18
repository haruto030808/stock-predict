import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, Settings, Bell, Package, Calendar, Check, 
  Trash2, RotateCcw, AlertTriangle 
} from 'lucide-react';

// コンポーネントとデータのインポート
import { ICONS, UNITS, PRESETS } from '../constants/itemData';
import BottomSheet from '../components/ui/BottomSheet';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/modals/AddItemModal';
import SettingsTab from '../components/SettingsTab';

// --- ヘルパー関数 ---
const getToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const getTodayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const formatDate = (dateStr) => { const d = new Date(dateStr); return `${d.getMonth()+1}/${d.getDate()}`; };
const formatDateFull = (dateStr) => { const d = new Date(dateStr); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`; };

const getUrgencyColor = (ratio) => {
  if (ratio <= 0.1) return { color: '#DC2626', gradient: 'linear-gradient(to right, #FCA5A5, #DC2626)' };
  if (ratio <= 0.2) return { color: '#EA580C', gradient: 'linear-gradient(to right, #FDBA74, #EA580C)' };
  if (ratio <= 0.35) return { color: '#F59E0B', gradient: 'linear-gradient(to right, #FCD34D, #F59E0B)' };
  if (ratio <= 0.5) return { color: '#EAB308', gradient: 'linear-gradient(to right, #FDE047, #EAB308)' };
  return { color: '#86A397', gradient: 'linear-gradient(to right, #A7C4BC, #86A397)' };
};

const formatUsers = (users) => {
  if (!users) return '未設定';
  const parts = [];
  if (users.adultMale > 0) parts.push(`男性${users.adultMale}人`);
  if (users.adultFemale > 0) parts.push(`女性${users.adultFemale}人`);
  if (users.childMale > 0) parts.push(`男の子${users.childMale}人`);
  if (users.childFemale > 0) parts.push(`女の子${users.childFemale}人`);
  return parts.length > 0 ? parts.join('、') : '未設定';
};

// 初期データ
const initialData = {
  items: [],
  user: { name: 'ユーザー', email: '' },
  settings: { emailNotification: true, appNotification: true, notifyDaysBefore: 3 }
};

export default function Home() {
  const [data, setData] = useState(initialData);
  const [currentTab, setCurrentTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialMode, setInitialMode] = useState('consumable'); 
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [reuseModal, setReuseModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // データ同期
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const savedData = localStorage.getItem('stockpredict-v11');
        let loadedData = savedData ? JSON.parse(savedData) : initialData;
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (user && !userError && isMounted) {
          loadedData.user = { name: user.user_metadata.full_name || 'ユーザー', email: user.email };
        }
        if (isMounted) setData(loadedData);
      } catch (e) {
        if (isMounted) setData(initialData);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem('stockpredict-v11', JSON.stringify(data));
  }, [data, loading]);

  // 計算ロジック
  const calcTotalDays = (item) => {
    if (item.mode === 'expiry') {
      const created = new Date(item.createdDate || getTodayStr());
      const expiry = new Date(item.expiryDate);
      return Math.max(Math.ceil((expiry - created) / 86400000), 1);
    }
    return Math.round(item.estimatedDays * (item.correctionFactor || 1.0));
  };

  const calcEndDate = (item) => {
    if (item.mode === 'expiry') return new Date(item.expiryDate);
    const opened = new Date(item.openedDate);
    opened.setHours(0,0,0,0);
    return new Date(opened.getTime() + calcTotalDays(item) * 86400000);
  };

  const calcRemainingDays = (item) => {
    const end = calcEndDate(item);
    end.setHours(0,0,0,0);
    return Math.ceil((end - getToday()) / 86400000);
  };

  const getRemainingPercent = (item) => Math.max(0, Math.min(100, (calcRemainingDays(item) / calcTotalDays(item)) * 100));

  // ハンドラー
  const openAddModal = (mode) => {
    setInitialMode(mode);
    setShowAddModal(true);
  };

  const handleFinished = (itemId) => { setReuseModal(data.items.find(i => i.id === itemId)); setDetailItem(null); };
  
  const addItem = (newItem) => {
    setData(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), ...newItem, openedDate: newItem.mode === 'consumable' ? getTodayStr() : undefined, createdDate: getTodayStr(), correctionFactor: 1.0 }] }));
    setShowAddModal(false);
  };

  const updateItem = (updatedItem) => {
    setData(prev => ({ ...prev, items: prev.items.map(i => i.id === updatedItem.id ? updatedItem : i) }));
    setEditItem(null);
    setDetailItem(null);
  };

  const deleteItem = (itemId) => {
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    setDetailItem(null);
  };

  const updateSettings = (newSettings) => { setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } })); };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  const consumables = data.items.filter(i => i.mode === 'consumable').sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));
  const expiries = data.items.filter(i => i.mode === 'expiry').sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));
  const nearEndItems = data.items.filter(i => { const r = calcRemainingDays(i); return r > 0 && r <= (data.settings?.notifyDaysBefore || 3); });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      {/* PC対応ヘッダー：端から端までグラデーション、角丸なし */}
      <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-slate-800 to-emerald-900 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between relative text-white">
          <h1 className="text-2xl font-black tracking-tighter">
            Stock<span className="text-emerald-300">Predict</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotification(true)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all relative">
              <Bell size={22} />
              {nearEndItems.length > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-slate-800" />}
            </button>
            <button onClick={() => setCurrentTab('settings')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* メインリスト：PCではグリッドレイアウト */}
      <main className="max-w-5xl mx-auto p-5">
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-emerald-400 rounded-full" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">消耗品</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {consumables.map(item => (
              <ItemCard key={item.id} item={item} calcRemainingDays={calcRemainingDays} getRemainingPercent={getRemainingPercent} calcEndDate={calcEndDate} calcTotalDays={calcTotalDays} onClick={() => setDetailItem(item)} getUrgencyColor={getUrgencyColor} formatDate={formatDate} />
            ))}
            <button onClick={() => openAddModal('consumable')} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">消耗品を追加</span>
            </button>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-slate-400 rounded-full" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">期限付き</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiries.map(item => (
              <ItemCard key={item.id} item={item} calcRemainingDays={calcRemainingDays} getRemainingPercent={getRemainingPercent} calcEndDate={calcEndDate} calcTotalDays={calcTotalDays} onClick={() => setDetailItem(item)} getUrgencyColor={getUrgencyColor} formatDate={formatDate} />
            ))}
            <button onClick={() => openAddModal('expiry')} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-all group">
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">期限付きを追加</span>
            </button>
          </div>
        </section>
      </main>

      {/* 設定画面オーバーレイ */}
      {currentTab === 'settings' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <SettingsTab 
            data={data} 
            updateSettings={updateSettings} 
            handleLogout={handleLogout} 
            onBack={() => setCurrentTab('home')} 
          />
        </div>
      )}

      {/* 各種モーダル */}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onAdd={addItem} presets={PRESETS} initialMode={initialMode} />}
      {showNotification && <NotificationPanel items={nearEndItems} onClose={() => setShowNotification(false)} calcRemainingDays={calcRemainingDays} />}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onFinished={handleFinished} onDelete={deleteItem} calcRemainingDays={calcRemainingDays} calcEndDate={calcEndDate} getRemainingPercent={getRemainingPercent} calcTotalDays={calcTotalDays} />}
    </div>
  );
}

// 通知用パネル（簡易版）
function NotificationPanel({ items, onClose, calcRemainingDays }) {
  return (
    <BottomSheet onClose={onClose} title="通知">
      <div className="p-5">
        {items.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">通知はありません</p> : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{item.name}</p>
                  <p className="text-xs text-red-500">あと{calcRemainingDays(item)}日で切れそうです</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

// 詳細表示用（簡易版）
function DetailModal({ item, onClose, onFinished, onDelete, calcRemainingDays, calcEndDate, getRemainingPercent, calcTotalDays }) {
  const remaining = calcRemainingDays(item);
  const urgency = getUrgencyColor(remaining / calcTotalDays(item));
  const Icon = ICONS[item.icon] || Package;
  return (
    <BottomSheet onClose={onClose} title="詳細">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50"><Icon size={32} className="text-slate-400" /></div>
          <div className="flex-1"><h2 className="text-xl font-bold text-slate-800">{item.name}</h2><p className="text-sm text-slate-400">{item.mode === 'consumable' ? '消耗品' : '期限付き'}</p></div>
          <div className="text-right"><p className="text-3xl font-black" style={{ color: urgency.color }}>{remaining}日</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onFinished(item.id)} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold">使い終わった</button>
          <button onClick={() => onDelete(item.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl"><Trash2 size={20} /></button>
        </div>
      </div>
    </BottomSheet>
  );
}