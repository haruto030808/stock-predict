import { useState, useEffect, useRef } from 'react';
import { Home, Plus, Settings, Package, Calendar, Check, Droplets, Sparkles, X, Shirt, Heart, Utensils, Zap, Wind, Scissors, Eye, Smile, ChevronRight, Edit3, Trash2, RotateCcw, Mail, LogOut, User, ChevronLeft, Bell, Brush, Bath, Baby, Car, Glasses, Flower2, Sun, Moon, Apple, Cookie, Milk, Beer, ShowerHead, SprayCan, Camera, AlertTriangle, Trash, KeyRound, CalendarDays, Dog, ExternalLink } from 'lucide-react';

const ICONS = { package: Package, droplets: Droplets, sparkles: Sparkles, calendar: Calendar, shirt: Shirt, heart: Heart, utensils: Utensils, zap: Zap, wind: Wind, scissors: Scissors, eye: Eye, smile: Smile, brush: Brush, bath: Bath, baby: Baby, car: Car, glasses: Glasses, flower: Flower2, sun: Sun, moon: Moon, apple: Apple, cookie: Cookie, milk: Milk, beer: Beer, shower: ShowerHead, spray: SprayCan, dog: Dog };
const ICON_LIST = ['droplets', 'sparkles', 'heart', 'smile', 'brush', 'bath', 'baby', 'shirt', 'utensils', 'zap', 'wind', 'scissors', 'eye', 'car', 'glasses', 'flower', 'sun', 'moon', 'apple', 'cookie', 'milk', 'beer', 'shower', 'spray', 'dog', 'package', 'calendar'];
const UNITS = { ml: 'ml', g: 'g', roll: 'ロール', piece: '個', box: '箱', sheet: '枚' };
const PRESETS = [
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

const getToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const getTodayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const formatDateJP = (date) => { const d = new Date(date); const days = ['日','月','火','水','木','金','土']; return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`; };
const formatDate = (dateStr) => { const d = new Date(dateStr); return `${d.getMonth()+1}/${d.getDate()}`; };
const formatDateFull = (dateStr) => { const d = new Date(dateStr); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`; };
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const daysLater = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
const formatAmount = (amount, unit) => { if (!amount) return '未設定'; return `${amount}${UNITS[unit] || unit || ''}`; };

const initialData = {
  items: [
    { id: '1', name: 'シャンプー', mode: 'consumable', icon: 'droplets', openedDate: daysAgo(25), estimatedDays: 45, correctionFactor: 1.0, users: { adultMale: 1, adultFemale: 1, childMale: 0, childFemale: 0 }, amount: 500, unit: 'ml', createdDate: daysAgo(25) },
    { id: '2', name: '化粧水', mode: 'consumable', icon: 'heart', openedDate: daysAgo(40), estimatedDays: 60, correctionFactor: 1.0, users: { adultMale: 0, adultFemale: 1, childMale: 0, childFemale: 0 }, amount: 200, unit: 'ml', createdDate: daysAgo(40) },
    { id: '3', name: '洗濯洗剤', mode: 'consumable', icon: 'sparkles', openedDate: daysAgo(42), estimatedDays: 45, correctionFactor: 1.0, users: { adultMale: 1, adultFemale: 1, childMale: 1, childFemale: 0 }, amount: 900, unit: 'g', createdDate: daysAgo(42) },
    { id: '4', name: '歯磨き粉', mode: 'consumable', icon: 'brush', openedDate: daysAgo(28), estimatedDays: 30, correctionFactor: 1.0, users: { adultMale: 1, adultFemale: 1, childMale: 1, childFemale: 1 }, amount: 140, unit: 'g', createdDate: daysAgo(28) },
    { id: '5', name: 'トイレットペーパー', mode: 'consumable', icon: 'package', openedDate: daysAgo(10), estimatedDays: 30, correctionFactor: 1.0, users: { adultMale: 1, adultFemale: 1, childMale: 0, childFemale: 0 }, amount: 12, unit: 'roll', createdDate: daysAgo(10) },
    { id: '6', name: '定期券', mode: 'expiry', icon: 'calendar', expiryDate: daysLater(12), createdDate: daysAgo(18) },
  ],
  user: { name: 'ユーザー', email: 'user@example.com' },
  settings: { emailNotification: true, appNotification: true, notifyDaysBefore: 3 }
};

const getUrgencyColor = (ratio) => {
  if (ratio <= 0) return { color: '#DC2626', gradient: 'linear-gradient(to right, #FCA5A5, #DC2626)' };
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

function BottomSheet({ children, onClose, title, showBack, onBack }) {
  const sheetRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY; setIsDragging(true); };
  const handleTouchMove = (e) => { if (!isDragging) return; const diff = e.touches[0].clientY - startY.current; if (diff > 0) setDragY(diff); };
  const handleTouchEnd = () => { setIsDragging(false); if (dragY > 100) onClose(); else setDragY(0); };
  return (
    <div className="fixed inset-0 z-50 max-w-md mx-auto">
      <div className="absolute inset-0 bg-black/50" style={{ opacity: Math.max(0, 1 - dragY / 300) }} onClick={onClose} />
      <div ref={sheetRef} className="absolute inset-x-0 bottom-0 bg-slate-50 rounded-t-3xl max-h-[90%] flex flex-col transition-transform duration-200" style={{ transform: `translateY(${dragY}px)` }}>
        <div className="flex-shrink-0 pt-3 pb-2 cursor-grab" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between px-4">
            {showBack ? <button onClick={onBack} className="p-2 -ml-2 text-gray-500"><ChevronLeft size={22} /></button> : <div className="w-10" />}
            <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400"><X size={20} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-12 h-7 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function StockPredict() {
  const [data, setData] = useState(initialData);
  const [currentTab, setCurrentTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [settingsPage, setSettingsPage] = useState('main');
  const [showNotification, setShowNotification] = useState(false);
  const [reuseModal, setReuseModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { const r = await window.storage.get('stockpredict-v11'); if(r?.value) setData(JSON.parse(r.value)); } catch(e){} setLoading(false); })(); }, []);
  useEffect(() => { if(!loading) window.storage.set('stockpredict-v11', JSON.stringify(data)).catch(()=>{}); }, [data, loading]);

  const calcTotalDays = (item) => {
    if (item.mode === 'expiry') { const created = new Date(item.createdDate || getTodayStr()); const expiry = new Date(item.expiryDate); return Math.max(Math.ceil((expiry - created) / 86400000), 1); }
    return Math.round(item.estimatedDays * item.correctionFactor);
  };
  const calcEndDate = (item) => { if (item.mode === 'expiry') return new Date(item.expiryDate); const opened = new Date(item.openedDate); opened.setHours(0,0,0,0); return new Date(opened.getTime() + calcTotalDays(item) * 86400000); };
  const calcRemainingDays = (item) => { const end = calcEndDate(item); end.setHours(0,0,0,0); return Math.ceil((end - getToday()) / 86400000); };
  const getRemainingPercent = (item) => Math.max(0, Math.min(100, (calcRemainingDays(item) / calcTotalDays(item)) * 100));

  const handleFinished = (itemId) => { setReuseModal(data.items.find(i => i.id === itemId)); setDetailItem(null); };
  const handleReuseWithSettings = (item, newSettings) => { const actualDays = Math.max(1, Math.round((getToday() - new Date(item.openedDate)) / 86400000)); const newFactor = Math.max(0.1, item.correctionFactor * (actualDays / calcTotalDays(item))); setData(prev => ({ ...prev, items: prev.items.map(i => i.id === item.id ? { ...i, openedDate: getTodayStr(), correctionFactor: newFactor, ...newSettings } : i) })); setReuseModal(null); };
  const handleReuseKeep = (item) => { const actualDays = Math.max(1, Math.round((getToday() - new Date(item.openedDate)) / 86400000)); const newFactor = Math.max(0.1, item.correctionFactor * (actualDays / calcTotalDays(item))); setData(prev => ({ ...prev, items: prev.items.map(i => i.id === item.id ? { ...i, openedDate: getTodayStr(), correctionFactor: newFactor } : i) })); setReuseModal(null); };
  const handleStillRemaining = (itemId) => { setData(prev => ({ ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, correctionFactor: item.correctionFactor * 1.15 } : item) })); setDetailItem(null); };
  const addItem = (newItem) => { setData(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), ...newItem, openedDate: newItem.mode === 'consumable' ? getTodayStr() : undefined, createdDate: getTodayStr(), correctionFactor: 1.0 }] })); setShowAddModal(false); };
  const updateItem = (updatedItem) => { setData(prev => ({ ...prev, items: prev.items.map(i => i.id === updatedItem.id ? updatedItem : i) })); setEditItem(null); setDetailItem(null); };
  const deleteItem = (itemId) => { setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) })); setDetailItem(null); };
  const updateSettings = (newSettings) => { setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } })); };

  const consumables = data.items.filter(i => i.mode === 'consumable').sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));
  const expiries = data.items.filter(i => i.mode === 'expiry').sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));
  const nearEndItems = data.items.filter(i => { const r = calcRemainingDays(i); return r > 0 && r <= (data.settings?.notifyDaysBefore || 3); });

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">読み込み中...</div></div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-24 max-w-md mx-auto relative">
      {currentTab === 'home' && (
        <>
          <header className="sticky top-0 z-20 px-5 pt-4 pb-3" style={{ background: 'linear-gradient(135deg, #4A5568 0%, #64748B 100%)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="w-10" />
              <p className="text-sm font-medium text-white/80">{formatDateJP(new Date())}</p>
              <button onClick={() => setShowNotification(true)} className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white relative">
                <Bell size={22} />
                {nearEndItems.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">{nearEndItems.length}</span>}
              </button>
            </div>
            <div className="text-center pb-1"><h1 className="text-2xl font-bold tracking-tight text-white">Stock<span className="text-emerald-300">Predict</span></h1></div>
          </header>
          <div className="p-5">
            {consumables.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3"><div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #86A397, #6B8E7D)' }} /><h2 className="text-sm font-medium text-slate-600">消耗品</h2><span className="text-xs text-gray-400 ml-1">{consumables.length}件</span></div>
                <div className="space-y-2.5">{consumables.map(item => <ItemCard key={item.id} item={item} calcRemainingDays={calcRemainingDays} getRemainingPercent={getRemainingPercent} calcEndDate={calcEndDate} calcTotalDays={calcTotalDays} onClick={() => setDetailItem(item)} />)}</div>
              </section>
            )}
            {expiries.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3"><div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #64748B, #475569)' }} /><h2 className="text-sm font-medium text-slate-600">期限付き</h2><span className="text-xs text-gray-400 ml-1">{expiries.length}件</span></div>
                <div className="space-y-2.5">{expiries.map(item => <ItemCard key={item.id} item={item} calcRemainingDays={calcRemainingDays} getRemainingPercent={getRemainingPercent} calcEndDate={calcEndDate} calcTotalDays={calcTotalDays} onClick={() => setDetailItem(item)} />)}</div>
              </section>
            )}
            {data.items.length === 0 && <div className="text-center py-20 text-gray-400"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center shadow-sm"><Package size={32} className="opacity-40" /></div><p className="font-medium">アイテムがありません</p><p className="text-xs mt-1">下の追加ボタンから登録</p></div>}
          </div>
        </>
      )}
      {currentTab === 'settings' && (
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 px-5 pt-4 pb-3" style={{ background: 'linear-gradient(135deg, #4A5568 0%, #64748B 100%)' }}>
            {settingsPage !== 'main' && <button onClick={() => setSettingsPage('main')} className="absolute left-3 top-4 p-2 text-white/80"><ChevronLeft size={22} /></button>}
            <h1 className="text-xl font-semibold text-white text-center">{settingsPage === 'main' ? '設定' : settingsPage === 'contact' ? 'お問い合わせ' : settingsPage === 'notification' ? '通知設定' : '登録情報'}</h1>
          </header>
          <div className="p-5">
            {settingsPage === 'main' && (<><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center gap-3"><div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>{data.user.name.charAt(0)}</div><div><p className="font-medium text-slate-700">{data.user.name}</p><p className="text-xs text-gray-400">{data.user.email}</p></div></div><button onClick={() => setSettingsPage('notification')} className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Bell size={18} className="text-amber-500" /></div><span className="flex-1 text-sm text-slate-600">通知設定</span><ChevronRight size={18} className="text-gray-300" /></button><button onClick={() => setSettingsPage('contact')} className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Mail size={18} className="text-blue-500" /></div><span className="flex-1 text-sm text-slate-600">お問い合わせ</span><ChevronRight size={18} className="text-gray-300" /></button><button onClick={() => setSettingsPage('account')} className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><User size={18} className="text-purple-500" /></div><span className="flex-1 text-sm text-slate-600">登録情報</span><ChevronRight size={18} className="text-gray-300" /></button><button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50"><div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><LogOut size={18} className="text-red-500" /></div><span className="flex-1 text-sm text-red-500">ログアウト</span></button></div><div className="mt-6 text-center"><p className="text-xs text-gray-400 mb-2">StockPredict v1.0.0</p><a href="#" className="text-xs text-gray-400 underline flex items-center justify-center gap-1">プライバシーポリシー<ExternalLink size={10} /></a></div></>)}
            {settingsPage === 'notification' && (<div className="space-y-4"><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-4 flex items-center justify-between border-b border-gray-100"><div><p className="text-sm font-medium text-slate-700">メール通知</p><p className="text-xs text-gray-400 mt-0.5">期限が近づいたらメールでお知らせ</p></div><Toggle checked={data.settings?.emailNotification ?? true} onChange={(v) => updateSettings({ emailNotification: v })} /></div><div className="p-4 flex items-center justify-between border-b border-gray-100"><div><p className="text-sm font-medium text-slate-700">アプリ通知</p><p className="text-xs text-gray-400 mt-0.5">プッシュ通知でお知らせ</p></div><Toggle checked={data.settings?.appNotification ?? true} onChange={(v) => updateSettings({ appNotification: v })} /></div><div className="p-4"><p className="text-sm font-medium text-slate-700 mb-3">通知タイミング</p><p className="text-xs text-gray-400 mb-2">期限の何日前に通知しますか？</p><div className="flex gap-2">{[1, 3, 5, 7].map(d => (<button key={d} onClick={() => updateSettings({ notifyDaysBefore: d })} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={(data.settings?.notifyDaysBefore || 3) === d ? { background: 'linear-gradient(135deg, #86A397, #6B8E7D)', color: 'white' } : { background: '#F1F5F9', color: '#64748B' }}>{d}日前</button>))}</div></div></div></div>)}
            {settingsPage === 'contact' && (<div className="space-y-4"><div><label className="text-xs text-gray-500 mb-1.5 block">件名</label><input type="text" placeholder="件名を入力" className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" /></div><div><label className="text-xs text-gray-500 mb-1.5 block">内容</label><textarea rows={6} placeholder="お問い合わせ内容を入力" className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200 resize-none" /></div><button className="w-full py-3.5 text-white rounded-xl font-medium" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>送信する</button></div>)}
            {settingsPage === 'account' && (<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-4 border-b border-gray-100"><p className="text-xs text-gray-400 mb-1">メールアドレス</p><p className="text-sm text-slate-700">{data.user.email}</p></div><button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><KeyRound size={18} className="text-amber-600" /></div><span className="flex-1 text-sm text-slate-600">パスワード再設定</span><ChevronRight size={18} className="text-gray-300" /></button><button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50"><div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><Trash size={18} className="text-red-500" /></div><span className="flex-1 text-sm text-red-500">アカウント削除</span></button></div>)}
          </div>
        </div>
      )}
      {showNotification && <NotificationPanel items={nearEndItems} onClose={() => setShowNotification(false)} calcRemainingDays={calcRemainingDays} />}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30">
        <div className="backdrop-blur-xl border-t border-slate-200 px-6 py-3" style={{ background: 'rgba(241,245,249,0.95)' }}>
          <div className="flex justify-around items-center">
            <NavButton icon={Home} label="ホーム" active={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
            <button onClick={() => setShowAddModal(true)} className="relative -mt-8 w-14 h-14 text-white rounded-2xl shadow-lg active:scale-95" style={{ background: 'linear-gradient(135deg, #64748B, #475569)', boxShadow: '0 8px 20px rgba(71,85,105,0.35)' }}><Plus size={28} strokeWidth={2.5} className="mx-auto" /></button>
            <NavButton icon={Settings} label="設定" active={currentTab === 'settings'} onClick={() => { setCurrentTab('settings'); setSettingsPage('main'); }} />
          </div>
        </div>
      </nav>
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onAdd={addItem} presets={PRESETS} />}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onFinished={handleFinished} onStillRemaining={handleStillRemaining} onEdit={() => { setEditItem(detailItem); setDetailItem(null); }} onDelete={deleteItem} calcRemainingDays={calcRemainingDays} calcEndDate={calcEndDate} getRemainingPercent={getRemainingPercent} calcTotalDays={calcTotalDays} />}
      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} onSave={updateItem} />}
      {reuseModal && <ReuseSettingsModal item={reuseModal} onClose={() => setReuseModal(null)} onSaveNew={handleReuseWithSettings} onKeep={handleReuseKeep} />}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-2 px-5" style={{ color: active ? '#475569' : '#94A3B8' }}><Icon size={22} strokeWidth={active ? 2.5 : 2} /><span className="text-xs font-medium">{label}</span></button>;
}

function NotificationPanel({ items, onClose, calcRemainingDays }) {
  return (
    <BottomSheet onClose={onClose} title="通知">
      <div className="p-5">
        {items.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">通知はありません</p> : (
          <div className="space-y-3">{items.map(item => (<div key={item.id} className="p-3 bg-red-50 rounded-xl border border-red-100"><div className="flex items-center gap-3"><AlertTriangle size={20} className="text-red-500 flex-shrink-0" /><div className="flex-1"><p className="text-sm font-medium text-slate-700">{item.name}</p><p className="text-xs text-red-500">あと{calcRemainingDays(item)}日で切れそうです</p></div></div></div>))}</div>
        )}
      </div>
    </BottomSheet>
  );
}

function ItemCard({ item, calcRemainingDays, getRemainingPercent, calcEndDate, calcTotalDays, onClick }) {
  const remaining = calcRemainingDays(item);
  const remainingPercent = getRemainingPercent(item);
  const totalDays = calcTotalDays(item);
  const urgency = getUrgencyColor(remaining / totalDays);
  const Icon = ICONS[item.icon] || Package;
  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 active:scale-[0.98] text-left">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${urgency.color}15` }}><Icon size={20} style={{ color: urgency.color }} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1"><h3 className="font-medium text-slate-700 text-sm truncate">{item.name}</h3><span className="text-sm font-semibold" style={{ color: urgency.color }}>{remaining <= 0 ? '期限切れ' : `${remaining}日`}</span></div>
          <div className="text-xs text-gray-400 mb-2">{item.mode === 'consumable' ? `${formatDate(item.openedDate)} → ${formatDate(calcEndDate(item).toISOString())}` : `期限: ${formatDateFull(item.expiryDate)}`}</div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${remainingPercent}%`, background: urgency.gradient }} /></div>
        </div>
        <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
      </div>
    </button>
  );
}

function DetailModal({ item, onClose, onFinished, onStillRemaining, onEdit, onDelete, calcRemainingDays, calcEndDate, getRemainingPercent, calcTotalDays }) {
  const remaining = calcRemainingDays(item);
  const remainingPercent = getRemainingPercent(item);
  const totalDays = calcTotalDays(item);
  const urgency = getUrgencyColor(remaining / totalDays);
  const Icon = ICONS[item.icon] || Package;
  const isNearEnd = remaining <= 5 && remaining > 0;
  return (
    <BottomSheet onClose={onClose} title="詳細">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${urgency.color}15` }}><Icon size={28} style={{ color: urgency.color }} /></div>
          <div className="flex-1"><h2 className="text-lg font-semibold text-slate-700">{item.name}</h2><p className="text-sm text-gray-400">{item.mode === 'consumable' ? '消耗品' : '期限付き'}</p></div>
          <div className="text-right"><p className="text-2xl font-bold" style={{ color: urgency.color }}>{remaining <= 0 ? '0' : remaining}日</p><p className="text-xs text-gray-400">残り</p></div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-3">
          {item.mode === 'consumable' && (<><div className="flex justify-between text-sm"><span className="text-gray-500">開封日</span><span className="text-slate-700 font-medium">{formatDateFull(item.openedDate)}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">予想終了日</span><span className="text-slate-700 font-medium">{formatDateFull(calcEndDate(item).toISOString())}</span></div>{item.amount && <div className="flex justify-between text-sm"><span className="text-gray-500">内容量</span><span className="text-slate-700 font-medium">{formatAmount(item.amount, item.unit)}</span></div>}<div className="flex justify-between text-sm"><span className="text-gray-500">使用者</span><span className="text-slate-700 font-medium">{formatUsers(item.users)}</span></div></>)}
          {item.mode === 'expiry' && <div className="flex justify-between text-sm"><span className="text-gray-500">期限日</span><span className="text-slate-700 font-medium">{formatDateFull(item.expiryDate)}</span></div>}
        </div>
        <div className="mb-5"><p className="text-xs text-gray-400 mb-2">残り期間</p><div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${remainingPercent}%`, background: urgency.gradient }} /></div><div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>0%</span><span className="font-medium">残り {Math.round(remainingPercent)}%</span><span>100%</span></div></div>
        {item.mode === 'consumable' && (<div className="space-y-2 mb-4"><button onClick={() => onFinished(item.id)} className="w-full py-3.5 text-white rounded-xl font-medium active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Check size={18} /> 使い終わった</button>{isNearEnd && <button onClick={() => onStillRemaining(item.id)} className="w-full py-3.5 rounded-xl font-medium active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.3)' }}><RotateCcw size={18} /> まだ残ってる（予測を延長）</button>}</div>)}
        <div className="flex gap-2"><button onClick={onEdit} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium active:scale-[0.98] flex items-center justify-center gap-2"><Edit3 size={16} /> 編集</button><button onClick={() => onDelete(item.id)} className="py-3 px-5 bg-red-50 text-red-500 rounded-xl font-medium active:scale-[0.98]"><Trash2 size={16} /></button></div>
      </div>
    </BottomSheet>
  );
}

function ReuseSettingsModal({ item, onClose, onSaveNew, onKeep }) {
  const [users, setUsers] = useState(item.users || { adultMale: 1, adultFemale: 0, childMale: 0, childFemale: 0 });
  const [estimatedDays, setEstimatedDays] = useState(item.estimatedDays);
  return (
    <BottomSheet onClose={onClose} title={`次の「${item.name}」を開封`}>
      <div className="p-5 space-y-5">
        <div><label className="text-xs text-gray-500 mb-2 block">使用者</label><div className="bg-white rounded-xl p-3 space-y-2 border border-gray-200">{[['adultMale', '男性'], ['adultFemale', '女性'], ['childMale', '男の子'], ['childFemale', '女の子']].map(([key, label]) => (<div key={key} className="flex items-center justify-between"><span className="text-sm text-slate-600">{label}</span><div className="flex items-center gap-2"><button onClick={() => setUsers(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-sm font-medium">−</button><span className="w-5 text-center text-sm font-medium text-slate-700">{users[key]}</span><button onClick={() => setUsers(p => ({ ...p, [key]: p[key] + 1 }))} className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Plus size={14} /></button></div></div>))}</div></div>
        <div><label className="text-xs text-gray-500 mb-1.5 block">予想消費日数: {estimatedDays}日</label><input type="range" min="7" max="180" value={estimatedDays} onChange={e => setEstimatedDays(Number(e.target.value))} className="w-full" style={{ accentColor: '#86A397' }} /></div>
        <div className="flex gap-3"><button onClick={() => onKeep(item)} className="flex-1 py-3.5 bg-slate-200 text-slate-600 rounded-xl font-medium active:scale-[0.98]">設定しない</button><button onClick={() => onSaveNew(item, { users, estimatedDays })} className="flex-1 py-3.5 text-white rounded-xl font-medium active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>この設定で開封</button></div>
      </div>
    </BottomSheet>
  );
}

function EditItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ ...item });
  const dateRef = useRef(null);
  const d = form.expiryDate ? new Date(form.expiryDate) : new Date();
  const [year, setYear] = useState(d.getFullYear());
  const [month, setMonth] = useState(d.getMonth() + 1);
  const [day, setDay] = useState(d.getDate());
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const daysInMonth = new Date(year, month, 0).getDate();
  useEffect(() => { if(form.mode === 'expiry') setForm(p => ({ ...p, expiryDate: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}` })); }, [year, month, day]);
  return (
    <BottomSheet onClose={onClose} title="編集">
      <div className="p-5 space-y-4">
        <div><label className="text-xs text-gray-500 mb-1.5 block">アイテム名</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" /></div>
        <div><label className="text-xs text-gray-500 mb-1.5 block">アイコン</label><div className="flex flex-wrap gap-2">{ICON_LIST.map(ic => { const I = ICONS[ic]; return <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} className="w-9 h-9 rounded-lg flex items-center justify-center" style={form.icon === ic ? { background: 'linear-gradient(135deg, #86A397, #6B8E7D)', color: 'white' } : { background: 'white', color: '#64748B', border: '1px solid #E2E8F0' }}><I size={16} /></button>; })}</div></div>
        {form.mode === 'consumable' && (<><div><label className="text-xs text-gray-500 mb-1.5 block">予想消費日数: {form.estimatedDays}日</label><input type="range" min="7" max="180" value={form.estimatedDays} onChange={e => setForm(p => ({ ...p, estimatedDays: Number(e.target.value) }))} className="w-full" style={{ accentColor: '#86A397' }} /></div><div className="flex gap-2"><div className="flex-1"><label className="text-xs text-gray-500 mb-1.5 block">内容量</label><input type="number" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" placeholder="500" /></div><div className="w-24"><label className="text-xs text-gray-500 mb-1.5 block">単位</label><select value={form.unit || 'ml'} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="w-full px-3 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Object.entries(UNITS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div></div><div><label className="text-xs text-gray-500 mb-2 block">使用者</label><div className="bg-white rounded-xl p-3 space-y-2 border border-gray-200">{[['adultMale', '男性'], ['adultFemale', '女性'], ['childMale', '男の子'], ['childFemale', '女の子']].map(([key, label]) => (<div key={key} className="flex items-center justify-between"><span className="text-sm text-slate-600">{label}</span><div className="flex items-center gap-2"><button onClick={() => setForm(p => ({ ...p, users: { ...p.users, [key]: Math.max(0, (p.users?.[key] || 0) - 1) } }))} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-sm font-medium">−</button><span className="w-5 text-center text-sm font-medium text-slate-700">{form.users?.[key] || 0}</span><button onClick={() => setForm(p => ({ ...p, users: { ...p.users, [key]: (p.users?.[key] || 0) + 1 } }))} className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Plus size={14} /></button></div></div>))}</div></div></>)}
        {form.mode === 'expiry' && (<div><label className="text-xs text-gray-500 mb-1.5 block">期限日</label><div className="flex gap-2"><select value={year} onChange={e => setYear(Number(e.target.value))} className="flex-1 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{years.map(y => <option key={y} value={y}>{y}年</option>)}</select><select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-20 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}月</option>)}</select><select value={day} onChange={e => setDay(Number(e.target.value))} className="w-20 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dd => <option key={dd} value={dd}>{dd}日</option>)}</select><button onClick={() => dateRef.current?.showPicker?.()} className="w-11 h-11 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-slate-500"><CalendarDays size={18} /></button><input type="date" ref={dateRef} value={form.expiryDate} onChange={e => { const nd = new Date(e.target.value); setYear(nd.getFullYear()); setMonth(nd.getMonth()+1); setDay(nd.getDate()); }} className="sr-only" /></div></div>)}
        <button onClick={() => onSave(form)} className="w-full py-3.5 text-white rounded-xl font-medium active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>保存する</button>
      </div>
    </BottomSheet>
  );
}

function AddItemModal({ onClose, onAdd, presets }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('consumable');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('package');
  const [expiryYear, setExpiryYear] = useState(new Date().getFullYear());
  const [expiryMonth, setExpiryMonth] = useState(new Date().getMonth() + 1);
  const [expiryDay, setExpiryDay] = useState(new Date().getDate());
  const [estimatedDays, setEstimatedDays] = useState(30);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('ml');
  const [users, setUsers] = useState({ adultMale: 1, adultFemale: 0, childMale: 0, childFemale: 0 });
  const [showCamera, setShowCamera] = useState(false);
  const dateRef = useRef(null);

  const totalUsers = users.adultMale + users.adultFemale + (users.childMale + users.childFemale) * 0.5;
  const calcSuggested = (baseDays = 30) => Math.round(baseDays / Math.max(0.5, totalUsers));
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const daysInMonth = new Date(expiryYear, expiryMonth, 0).getDate();
  const expiryDate = `${expiryYear}-${String(expiryMonth).padStart(2,'0')}-${String(expiryDay).padStart(2,'0')}`;

  const handlePreset = (preset) => { setName(preset.name); setIcon(preset.icon); setAmount(preset.baseAmount); setUnit(preset.unit || 'ml'); };
  const handleSubmit = () => { if (!name || (mode === 'expiry' && !expiryDate)) return; onAdd({ name, mode, icon, expiryDate: mode === 'expiry' ? expiryDate : undefined, estimatedDays, users, amount: Number(amount) || undefined, unit }); };
  const handleScanResult = () => { setShowCamera(false); setName('ダヴ ボディウォッシュ'); setIcon('bath'); setAmount(500); setUnit('ml'); };
  const handleBack = () => { if (step === 1) onClose(); else setStep(step - 1); };

  useEffect(() => { setEstimatedDays(calcSuggested(30)); }, [totalUsers]);

  const getTitle = () => { if (step === 1) return 'タイプ選択'; if (step === 2) return '基本情報'; return '使用者・日数設定'; };

  return (
    <BottomSheet onClose={onClose} title={getTitle()} showBack={step > 1} onBack={handleBack}>
      <div className="p-5">
        {step === 1 && (
          <div className="space-y-3">
            <button onClick={() => { setMode('consumable'); setStep(2); }} className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left active:scale-[0.98] shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(134,163,151,0.15)' }}><Package size={24} style={{ color: '#86A397' }} /></div><div><h3 className="font-medium text-slate-700">消耗品</h3><p className="text-xs text-gray-400 mt-0.5">シャンプー、洗剤など</p></div></div></button>
            <button onClick={() => { setMode('expiry'); setStep(2); }} className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-left active:scale-[0.98] shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(71,85,105,0.1)' }}><Calendar size={24} style={{ color: '#475569' }} /></div><div><h3 className="font-medium text-slate-700">期限付き</h3><p className="text-xs text-gray-400 mt-0.5">定期券、年パスなど</p></div></div></button>
          </div>
        )}
        {step === 2 && mode === 'consumable' && !showCamera && (
          <div className="space-y-5">
            <button onClick={() => setShowCamera(true)} className="w-full p-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center active:scale-[0.98]"><div className="flex items-center justify-center gap-2 text-slate-500"><Camera size={20} /><span>バーコードをスキャン</span></div></button>
            <div><label className="text-xs text-gray-500 mb-2 block">プリセット</label><div className="flex flex-wrap gap-2">{presets.map(p => { const I = ICONS[p.icon]; return <button key={p.name} onClick={() => handlePreset(p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs" style={name === p.name ? { background: 'linear-gradient(135deg, #86A397, #6B8E7D)', color: 'white' } : { background: 'white', color: '#475569', border: '1px solid #E2E8F0' }}><I size={14} />{p.name}</button>; })}</div></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">アイテム名</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：シャンプー" className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" /></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">アイコン</label><div className="flex flex-wrap gap-2">{ICON_LIST.map(ic => { const I = ICONS[ic]; return <button key={ic} onClick={() => setIcon(ic)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={icon === ic ? { background: 'linear-gradient(135deg, #86A397, #6B8E7D)', color: 'white' } : { background: 'white', color: '#64748B', border: '1px solid #E2E8F0' }}><I size={16} /></button>; })}</div></div>
            <div className="flex gap-2"><div className="flex-1"><label className="text-xs text-gray-500 mb-1.5 block">内容量</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" /></div><div className="w-24"><label className="text-xs text-gray-500 mb-1.5 block">単位</label><select value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Object.entries(UNITS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div></div>
            <button onClick={() => setStep(3)} disabled={!name} className="w-full py-3.5 text-white rounded-xl font-medium disabled:opacity-40 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #64748B, #475569)' }}>次へ：使用者・日数設定 →</button>
          </div>
        )}
        {step === 2 && mode === 'consumable' && showCamera && (
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-black rounded-2xl overflow-hidden relative flex items-center justify-center"><div className="absolute inset-0 flex items-center justify-center"><div className="w-48 h-24 border-2 border-white/50 rounded-lg" /><div className="absolute w-48 h-0.5 bg-red-500 animate-pulse" /></div><p className="text-white/60 text-sm">カメラを起動中...</p></div>
            <p className="text-xs text-gray-500 text-center">バーコードを枠内に合わせてください</p>
            <div className="flex gap-3"><button onClick={() => setShowCamera(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-medium">キャンセル</button><button onClick={handleScanResult} className="flex-1 py-3 text-white rounded-xl font-medium" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>デモ: 商品を検出</button></div>
          </div>
        )}
        {step === 3 && mode === 'consumable' && (
          <div className="space-y-5">
            <div><label className="text-xs text-gray-500 mb-2 block">使用者（必須）</label><div className="bg-white rounded-xl p-3 space-y-2 border border-gray-200">{[['adultMale', '男性'], ['adultFemale', '女性'], ['childMale', '男の子'], ['childFemale', '女の子']].map(([key, label]) => (<div key={key} className="flex items-center justify-between"><span className="text-sm text-slate-600">{label}</span><div className="flex items-center gap-2"><button onClick={() => setUsers(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-sm font-medium">−</button><span className="w-5 text-center text-sm font-medium text-slate-700">{users[key]}</span><button onClick={() => setUsers(p => ({ ...p, [key]: p[key] + 1 }))} className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Plus size={14} /></button></div></div>))}</div>{totalUsers === 0 && <p className="text-xs text-red-500 mt-1">使用者を1人以上設定してください</p>}</div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">予想消費日数: {estimatedDays}日</label><input type="range" min="7" max="180" value={estimatedDays} onChange={e => setEstimatedDays(Number(e.target.value))} className="w-full" style={{ accentColor: '#86A397' }} /><p className="text-xs text-gray-400 mt-1">使用者数から提案: 約{calcSuggested(30)}日</p></div>
            <button onClick={handleSubmit} disabled={totalUsers === 0} className="w-full py-3.5 text-white rounded-xl font-medium disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Plus size={18} />追加する</button>
          </div>
        )}
        {step === 2 && mode === 'expiry' && (
          <div className="space-y-5">
            <div><label className="text-xs text-gray-500 mb-1.5 block">アイテム名</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：定期券" className="w-full px-4 py-3 bg-white rounded-xl text-slate-700 text-sm border border-gray-200" /></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">アイコン</label><div className="flex flex-wrap gap-2">{ICON_LIST.map(ic => { const I = ICONS[ic]; return <button key={ic} onClick={() => setIcon(ic)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={icon === ic ? { background: 'linear-gradient(135deg, #86A397, #6B8E7D)', color: 'white' } : { background: 'white', color: '#64748B', border: '1px solid #E2E8F0' }}><I size={16} /></button>; })}</div></div>
            <div><label className="text-xs text-gray-500 mb-1.5 block">期限日 <span className="text-red-500">*必須</span></label><div className="flex gap-2"><select value={expiryYear} onChange={e => setExpiryYear(Number(e.target.value))} className="flex-1 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{years.map(y => <option key={y} value={y}>{y}年</option>)}</select><select value={expiryMonth} onChange={e => setExpiryMonth(Number(e.target.value))} className="w-20 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}月</option>)}</select><select value={expiryDay} onChange={e => setExpiryDay(Number(e.target.value))} className="w-20 px-3 py-2.5 bg-white rounded-xl text-slate-700 text-sm border border-gray-200">{Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dd => <option key={dd} value={dd}>{dd}日</option>)}</select><button onClick={() => dateRef.current?.showPicker?.()} className="w-11 h-11 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-slate-500"><CalendarDays size={18} /></button><input type="date" ref={dateRef} value={expiryDate} onChange={e => { const nd = new Date(e.target.value); setExpiryYear(nd.getFullYear()); setExpiryMonth(nd.getMonth()+1); setExpiryDay(nd.getDate()); }} className="sr-only" /></div></div>
            <button onClick={handleSubmit} disabled={!name} className="w-full py-3.5 text-white rounded-xl font-medium disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}><Plus size={18} />追加する</button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}