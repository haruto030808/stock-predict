export default function Toggle({ checked, onChange }) {
    return (
      <button onClick={() => onChange(!checked)} className={`w-12 h-7 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-1 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    );
  }