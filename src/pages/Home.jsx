import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Settings, Package, Trash2, Edit3, Check } from 'lucide-react';

import { ICONS } from '../constants/itemData';
import BottomSheet from '../components/ui/BottomSheet';
import ItemCard from '../components/ItemCard';
import AddItemModal from '../components/modals/AddItemModal';
import EditItemModal from '../components/modals/EditItemModal';
import SettingsTab from '../components/SettingsTab';

const getTodayStr = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr) => { 
  const d = new Date(dateStr); 
  return (d.getMonth() + 1) + '/' + d.getDate(); 
};

const formatDateFull = (dateStr) => { 
  const d = new Date(dateStr); 
  return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate(); 
};

const getUrgencyColor = (ratio) => {
  if (ratio <= 0.1) return { color: '#DC2626', gradient: 'linear-gradient(to right, #FCA5A5, #DC2626)' };
  if (ratio <= 0.2) return { color: '#EA580C', gradient: 'linear-gradient(to right, #FDBA74, #EA580C)' };
  if (ratio <= 0.35) return { color: '#F59E0B', gradient: 'linear-gradient(to right, #FCD34D, #F59E0B)' };
  if (ratio <= 0.5) return { color: '#EAB308', gradient: 'linear-gradient(to right, #FDE047, #EAB308)' };
  return { color: '#86A397', gradient: 'linear-gradient(to right, #A7C4BC, #86A397)' };
};

const formatUsers = (adultCount, childCount) => {
  const parts = [];
  if (adultCount > 0) parts.push('大人' + adultCount + '人');
  if (childCount > 0) parts.push('子ども' + childCount + '人');
  return parts.length > 0 ? parts.join('、') : '未設定';
};

export default function Home() {
  const [data, setData] = useState({ items: [], user: null });
  const [currentTab, setCurrentTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialMode, setInitialMode] = useState('consumable'); 
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data: dbItems, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_archived', false);

          if (!error && dbItems) {
            const formatted = dbItems.map(i => ({
              id: i.id,
              name: i.name,
              brandName: i.brand_name,
              janCode: i.jan_code,
              icon: i.icon,
              mode: i.mode,
              estimatedDays: i.base_days,
              correctionFactor: i.current_factor,
              openedDate: i.opened_at,
              expiryDate: i.expiry_date,
              capacity: i.capacity,
              unit: i.unit,
              createdAt: i.created_at,
              initialPercent: i.initial_percent || 100,
              adultCount: i.adult_count || 1,
              childCount: i.child_count || 0
            }));
            setData({ 
              items: formatted, 
              user: { 
                name: user.user_metadata?.full_name || 'ユーザー', 
                email: user.email 
              } 
            });

            const { data: historyRows } = await supabase
              .from('usage_history')
              .select('item_id, actual_days')
              .eq('user_id', user.id);

            if (historyRows) {
              const grouped = {};
              historyRows.forEach(h => {
                if (!grouped[h.item_id]) {
                  grouped[h.item_id] = { count: 0, totalDays: 0 };
                }
                grouped[h.item_id].count++;
                grouped[h.item_id].totalDays += h.actual_days;
              });
              
              const processed = {};
              Object.keys(grouped).forEach(id => {
                processed[id] = {
                  count: grouped[id].count,
                  avgDays: Math.round(grouped[id].totalDays / grouped[id].count)
                };
              });
              setHistoryData(processed);
            }
          }
        }
      } catch (err) {
        console.error('Data load error:', err);
      } finally { 
        if (isMounted) setLoading(false); 
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const calcTotalDays = (item) => {
    if (item.mode === 'expiry') {
      const start = new Date(item.openedDate || item.createdAt || getTodayStr());
      const end = new Date(item.expiryDate);
      return Math.max(Math.ceil((end - start) / 86400000), 1);
    }
    
    const history = historyData[item.id];
    if (history && history.avgDays) {
      return history.avgDays;
    }
    
    return Math.round(item.estimatedDays * (item.correctionFactor || 1.0));
  };

  const calcEndDate = (item) => {
    if (item.mode === 'expiry') {
      return new Date(item.expiryDate);
    }
    const startDate = new Date(item.openedDate || item.createdAt || getTodayStr());
    return new Date(startDate.getTime() + calcTotalDays(item) * 86400000);
  };
  
  const calcRemainingDays = (item) => {
    const end = calcEndDate(item);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / 86400000);
  };

  const getRemainingPercent = (item) => {
    const total = calcTotalDays(item);
    if (total === 0) return 0;
    return Math.max(0, Math.min(100, (calcRemainingDays(item) / total) * 100));
  };

  const addItem = async (newItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const itemData = {
        user_id: user.id,
        name: newItem.name,
        brand_name: newItem.brandName || '',
        jan_code: newItem.janCode || '',
        icon: newItem.icon,
        mode: newItem.mode,
        base_days: newItem.estimatedDays,
        adult_count: newItem.adultCount || 1,
        child_count: newItem.childCount || 0,
        initial_percent: newItem.initialPercent || 100,
        opened_at: newItem.mode === 'consumable' ? new Date().toISOString() : null,
        expiry_date: newItem.expiryDate || null,
        capacity: newItem.capacity || null,
        unit: newItem.unit || null,
        is_archived: false
      };

      const { data: inserted, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (!error && inserted) {
        const formatted = {
          id: inserted.id,
          name: inserted.name,
          brandName: inserted.brand_name,
          janCode: inserted.jan_code,
          icon: inserted.icon,
          mode: inserted.mode,
          estimatedDays: inserted.base_days,
          correctionFactor: inserted.current_factor,
          openedDate: inserted.opened_at,
          expiryDate: inserted.expiry_date,
          capacity: inserted.capacity,
          unit: inserted.unit,
          createdAt: inserted.created_at,
          initialPercent: inserted.initial_percent || 100,
          adultCount: inserted.adult_count || 1,
          childCount: inserted.child_count || 0
        };
        setData(prev => ({ ...prev, items: [...prev.items, formatted] }));
      }
    } catch (err) {
      console.error('Add item error:', err);
    }
    setShowAddModal(false);
  };

  const updateItem = async (updatedItem) => {
    try {
      const { error } = await supabase.from('items').update({
        name: updatedItem.name,
        brand_name: updatedItem.brandName,
        icon: updatedItem.icon,
        adult_count: updatedItem.adultCount || 1,
        child_count: updatedItem.childCount || 0,
        capacity: updatedItem.capacity,
        unit: updatedItem.unit
      }).eq('id', updatedItem.id);

      if (!error) {
        setData(prev => ({
          ...prev,
          items: prev.items.map(item => 
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        }));
      }
    } catch (err) {
      console.error('Update item error:', err);
    }
    setEditItem(null);
  };

  const deleteItem = async (itemId) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (!error) {
        setData(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== itemId)
        }));
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
    setDetailItem(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const finishItem = async (item) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const openedAt = new Date(item.openedDate || item.createdAt);
      const now = new Date();
      const actualDays = Math.max(1, Math.ceil((now - openedAt) / 86400000));

      const initialPercent = item.initialPercent || 100;
      const fullCycleDays = Math.round(actualDays / (initialPercent / 100));

      await supabase.from('usage_history').insert({
        item_id: item.id,
        user_id: user.id,
        opened_at: item.openedDate || item.createdAt,
        closed_at: now.toISOString(),
        actual_days: fullCycleDays,
        factor_at_time: item.correctionFactor || 1.0
      });

      await supabase.from('items').update({
        opened_at: now.toISOString(),
        initial_percent: 100
      }).eq('id', item.id);

      const newHistoryData = { ...historyData };
      if (!newHistoryData[item.id]) {
        newHistoryData[item.id] = { count: 0, totalDays: 0 };
      }
      const prevCount = newHistoryData[item.id].count;
      const prevAvg = newHistoryData[item.id].avgDays || item.estimatedDays;
      newHistoryData[item.id] = {
        count: prevCount + 1,
        avgDays: Math.round((prevCount * prevAvg + fullCycleDays) / (prevCount + 1))
      };
      setHistoryData(newHistoryData);

      setData(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id ? { ...i, openedDate: now.toISOString(), initialPercent: 100 } : i
        )
      }));

      setDetailItem(null);
    } catch (err) {
      console.error('Finish item error:', err);
      alert('エラーが発生しました');
    }
  };

  const consumables = data.items
    .filter(i => i.mode === 'consumable')
    .sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));
  
  const expiries = data.items
    .filter(i => i.mode === 'expiry')
    .sort((a, b) => calcRemainingDays(a) - calcRemainingDays(b));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative">
      <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-slate-800 to-emerald-900 shadow-lg px-6 py-5 flex items-center justify-between text-white">
        <h1 className="text-2xl font-black tracking-tighter">
          Stock<span className="text-emerald-300">Predict</span>
        </h1>
        <button 
          onClick={() => setCurrentTab('settings')} 
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
        >
          <Settings size={22} />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-5">
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-emerald-400 rounded-full" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">消耗品</h2>
            <span className="text-xs text-slate-400 ml-2">({consumables.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {consumables.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                calcRemainingDays={calcRemainingDays} 
                getRemainingPercent={getRemainingPercent} 
                calcTotalDays={calcTotalDays} 
                calcEndDate={calcEndDate} 
                formatDate={formatDate}
                getUrgencyColor={getUrgencyColor} 
                onClick={() => setDetailItem(item)} 
              />
            ))}
            <button 
              onClick={() => { setInitialMode('consumable'); setShowAddModal(true); }} 
              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
            >
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">消耗品を追加</span>
            </button>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-slate-400 rounded-full" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">期限付き</h2>
            <span className="text-xs text-slate-400 ml-2">({expiries.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiries.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                calcRemainingDays={calcRemainingDays} 
                getRemainingPercent={getRemainingPercent} 
                calcTotalDays={calcTotalDays} 
                calcEndDate={calcEndDate} 
                formatDate={formatDate}
                getUrgencyColor={getUrgencyColor} 
                onClick={() => setDetailItem(item)} 
              />
            ))}
            <button 
              onClick={() => { setInitialMode('expiry'); setShowAddModal(true); }} 
              className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">期限付きを追加</span>
            </button>
          </div>
        </section>
      </main>

      {currentTab === 'settings' && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <SettingsTab 
            data={data} 
            handleLogout={handleLogout} 
            onBack={() => setCurrentTab('home')} 
          />
        </div>
      )}

      {showAddModal && (
        <AddItemModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={addItem} 
          initialMode={initialMode} 
        />
      )}
      
      {editItem && (
        <EditItemModal 
          item={editItem} 
          onClose={() => setEditItem(null)} 
          onUpdate={updateItem} 
        />
      )}
      
      {detailItem && (
        <DetailModal 
          item={detailItem} 
          onClose={() => setDetailItem(null)} 
          onDelete={deleteItem} 
          onEdit={(item) => { setEditItem(item); setDetailItem(null); }}
          onFinish={finishItem}
          calcRemainingDays={calcRemainingDays} 
          calcEndDate={calcEndDate} 
          getRemainingPercent={getRemainingPercent} 
          calcTotalDays={calcTotalDays}
          historyCount={historyData[detailItem.id]?.count || 0}
        />
      )}
    </div>
  );
}

function DetailModal({ 
  item, 
  onClose, 
  onDelete, 
  onEdit,
  onFinish,
  calcRemainingDays, 
  calcEndDate, 
  getRemainingPercent, 
  calcTotalDays,
  historyCount
}) {
  const remaining = calcRemainingDays(item);
  const total = calcTotalDays(item);
  const remainingPercent = getRemainingPercent(item);
  const urgency = getUrgencyColor(total > 0 ? remaining / total : 0);
  const Icon = ICONS[item.icon] || Package;

  const handleDelete = () => {
    if (window.confirm('「' + item.name + '」を削除しますか？')) {
      onDelete(item.id);
    }
  };

  const handleFinish = () => {
    if (window.confirm('「' + item.name + '」を使い切りましたか？')) {
      onFinish(item);
    }
  };

  return (
    <BottomSheet onClose={onClose} title="">
      <div className="p-6 sm:p-10 max-w-2xl mx-auto">
        <div 
          className="relative rounded-[2rem] p-8 mb-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, ' + urgency.color + '08 0%, ' + urgency.color + '15 100%)' }}
        >
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30" 
            style={{ background: urgency.color }} 
          />
          
          <div className="relative flex items-center gap-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, white 0%, ' + urgency.color + '10 100%)' }}
            >
              <Icon size={36} style={{ color: urgency.color }} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-slate-800 truncate">{item.name}</h2>
              {item.brandName && (
                <p className="text-sm font-medium text-slate-400 mt-1">{item.brandName}</p>
              )}
              {historyCount > 0 && (
                <p className="text-xs text-emerald-500 font-bold mt-1">
                  📊 {historyCount}回の履歴から予測中
                </p>
              )}
            </div>

            <div 
              className="text-center px-5 py-3 rounded-2xl"
              style={{ background: urgency.color + '15' }}
            >
              <p className="text-3xl font-black" style={{ color: urgency.color }}>{remaining}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">days left</p>
            </div>
          </div>
        </div>

        {item.mode === 'consumable' && (
          <button
            onClick={handleFinish}
            className="w-full mb-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Check size={20} />
            完了
          </button>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400">残量</span>
            <span className="text-xs font-medium text-slate-500">
              {item.mode === 'expiry' ? '期限' : '予測終了'}: {formatDateFull(calcEndDate(item).toISOString())}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000" 
              style={{ width: remainingPercent + '%', background: urgency.gradient }} 
            />
          </div>
        </div>

        {item.mode === 'consumable' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">使用者</p>
              <p className="text-sm font-bold text-slate-700">{formatUsers(item.adultCount, item.childCount)}</p>
            </div>
            {item.capacity && (
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">容量</p>
                <p className="text-sm font-bold text-slate-700">{item.capacity} {item.unit}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(item)} 
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={18} />
            編集
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all"
          >
            閉じる
          </button>
          <button 
            onClick={handleDelete} 
            className="w-14 py-4 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-100 hover:text-rose-500 transition-all flex items-center justify-center"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}