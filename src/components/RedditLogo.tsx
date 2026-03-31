interface RedditLogoProps {
  subtitle?: string
  className?: string
}

export default function RedditLogo({ subtitle = 'clone', className = '' }: RedditLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4500] shadow-sm shadow-orange-200/80">
        <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true" focusable="false">
          <circle cx="32" cy="32" r="32" fill="#ff4500" />
          <circle cx="18" cy="30" r="7" fill="#fff" />
          <circle cx="46" cy="30" r="7" fill="#fff" />
          <ellipse cx="32" cy="36" rx="18" ry="14" fill="#fff" />
          <path d="M29 16l9 2" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M37 18c1.2-3.8 4.1-6 8-6" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="46" cy="12" r="6" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
          <circle cx="26" cy="35" r="4" fill="#ff4500" />
          <circle cx="38" cy="35" r="4" fill="#ff4500" />
          <path d="M24 43c2.6 2.8 13.4 2.8 16 0" stroke="#111827" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </span>

      <div>
        <p className="text-sm font-black tracking-tight text-slate-900">reddit</p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}
