function StatusPill({
  label,
  badgeClass = 'bg-slate-100 text-slate-700',
  dotClass = '',
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
    >
      {dotClass && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {label}
    </span>
  );
}

export default StatusPill;
