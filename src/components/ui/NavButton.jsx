export default function NavButton({ icon: Icon, label, active, onClick }) {
    return <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-2 px-5" style={{ color: active ? '#475569' : '#94A3B8' }}><Icon size={22} strokeWidth={active ? 2.5 : 2} /><span className="text-xs font-medium">{label}</span></button>;
  }