export function LogoMark({ className = 'brand__mark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 2 L28 6 V15 C28 22.5 22.8 27.6 16 30 C9.2 27.6 4 22.5 4 15 V6 Z" fill="#ffffff" />
      <path d="M16 3.8 L26.4 7.3 V15 C26.4 21.6 22 26.2 16 28.3 C10 26.2 5.6 21.6 5.6 15 V7.3 Z" fill="#1c3461" />
      <path d="M16 5.6 L24.8 8.6 V15 C24.8 20.6 21.2 24.6 16 26.5 C10.8 24.6 7.2 20.6 7.2 15 V8.6 Z" fill="none" stroke="#c99a3a" strokeWidth="1" />
      <path d="M9.8 11 L12 20 L14.3 13.6 L16 18.4 L17.7 13.6 L20 20 L22.2 11" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ subtitle = 'Westmere University' }) {
  return (
    <span className="brand">
      <LogoMark />
      <span>
        <span className="brand__name">CampusCore</span>
        <span className="brand__sub" style={{ display: 'block' }}>{subtitle}</span>
      </span>
    </span>
  );
}
