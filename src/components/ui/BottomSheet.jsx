import { ChevronLeft, X } from 'lucide-react';

export default function BottomSheet({ children, onClose, title, showBack, onBack }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* 背景の暗幕 */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white w-full max-w-lg sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            {showBack && (
              <button onClick={onBack} className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}