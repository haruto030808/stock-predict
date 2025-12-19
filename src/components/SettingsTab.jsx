import { useState } from 'react';
import { Bell, LogOut, ChevronRight, ChevronLeft, Package, History } from 'lucide-react';

export default function SettingsTab({ data, handleLogout, onBack }) {
  const [settingsPage, setSettingsPage] = useState('main');

  const itemCount = data.items?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto min-h-screen bg-white shadow-sm">
        {/* ヘッダー */}
        <header className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <button 
            onClick={() => settingsPage === 'main' ? onBack() : setSettingsPage('main')} 
            className="p-1 -ml-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {settingsPage === 'main' && '設定'}
            {settingsPage === 'notification' && '通知設定'}
          </h1>
        </header>

        <div className="p-5">
          {settingsPage === 'main' && (
            <div className="space-y-6">
              {/* ユーザー情報 */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl">
                    {data.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{data.user?.name || 'ユーザー'}</p>
                    <p className="text-sm text-slate-400">{data.user?.email || '未設定'}</p>
                  </div>
                </div>
                
                {/* 統計 */}
                <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <Package size={20} className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-2xl font-black">{itemCount}</p>
                    <p className="text-[10px] text-slate-400 uppercase">登録アイテム</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <History size={20} className="mx-auto mb-2 text-amber-400" />
                    <p className="text-2xl font-black">-</p>
                    <p className="text-[10px] text-slate-400 uppercase">使い切り回数</p>
                  </div>
                </div>
              </div>

              {/* メニュー */}
              <div className="bg-slate-50 rounded-3xl overflow-hidden">
                <button 
                  onClick={() => setSettingsPage('notification')} 
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-100 transition-colors border-b border-slate-100"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Bell size={18} className="text-amber-500" />
                  </div>
                  <span className="flex-1 text-sm font-bold text-slate-700 text-left">通知設定</span>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full p-5 flex items-center gap-4 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                    <LogOut size={18} className="text-rose-500" />
                  </div>
                  <span className="flex-1 text-sm font-bold text-rose-500 text-left">ログアウト</span>
                </button>
              </div>

              {/* アプリ情報 */}
              <div className="text-center pt-6">
                <p className="text-xs text-slate-400">StockPredict v1.0.0</p>
                <p className="text-[10px] text-slate-300 mt-1">© 2024 Your App</p>
              </div>
            </div>
          )}

          {settingsPage === 'notification' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-3xl p-5">
                <p className="text-sm font-bold text-slate-700 mb-4">通知機能</p>
                <p className="text-xs text-slate-400">
                  通知機能は現在開発中です。<br />
                  将来的に、アイテムの残量が少なくなった際にお知らせする機能を追加予定です。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}