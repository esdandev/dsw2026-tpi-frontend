function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
}) {
  return (
    <div className={`relative min-w-[240px] ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>

      <input
        type="search"
        aria-label={ariaLabel || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
      />
    </div>
  );
}

export default SearchInput;
