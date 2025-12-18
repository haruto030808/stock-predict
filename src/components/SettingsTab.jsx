import { useState } from 'react';
import { Bell, Mail, User, LogOut, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import Toggle from './ui/Toggle';

export default function SettingsTab({ data, updateSettings, handleLogout, onBack }) {
  const [settingsPage, setSettingsPage] = useState('main');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* PCで見るときに横に広がりすぎないよう、max-w-2xl で幅を制限 */}
      <div className="max-w-2xl mx-auto min-h-screen bg-white shadow-sm">
        <header className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <button onClick={() => settingsPage === 'main' ? onBack() : setSettingsPage('main')} className="p-1 -ml-1 text-slate-400">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {settingsPage === 'main' ? '設定' : '通知設定'}
          </h1>
        </header>

        <div className="p-5">
          {settingsPage === 'main' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-3xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl" style={{ background: 'linear-gradient(135deg, #86A397, #6B8E7D)' }}>
                  {data.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{data.user?.name || 'ユーザー'}</p>
                  <p className="text-xs text-slate-400">{data.user?.email || '未設定'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button onClick={() => setSettingsPage('notification')} className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-colors">
                  <Bell size={20} className="text-amber-500" />
                  <span className="flex-1 text-sm font-semibold text-slate-600">通知設定</span>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-colors text-rose-500">
                  <LogOut size={20} />
                  <span className="flex-1 text-sm font-semibold">ログアウト</span>
                </button>
              </div>
            </div>
          )}

          {settingsPage === 'notification' && (
            <div className="p-4 bg-slate-50 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">メール通知</span>
                <Toggle checked={data.settings?.emailNotification} onChange={(v) => updateSettings({ emailNotification: v })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}