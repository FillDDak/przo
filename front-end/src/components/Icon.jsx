/**
 * 사이트 전역에서 쓰는 인라인 SVG 아이콘 세트.
 *
 * 모든 아이콘은 24x24 viewBox / stroke 기반 / stroke-width 1.6 으로 통일했다.
 * currentColor 를 쓰므로 부모의 color 만 바꾸면 색이 따라온다.
 *
 *   <Icon name="shield-check" />
 *   <Icon name="phone" size={20} />
 */

const paths = {
  // --- 내비게이션 -------------------------------------------------------
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "chevron-up": <path d="M18 15l-6-6-6 6" />,
  "chevron-left": <path d="M15 18l-6-6 6-6" />,
  "chevron-right": <path d="M9 18l6-6-6-6" />,
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </>
  ),
  "arrow-down": (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),

  // --- 방역 / 서비스 ----------------------------------------------------
  "shield-check": (
    <>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.4-7.5 9.5-4.4-1.1-7.5-4.9-7.5-9.5V6L12 3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  shield: (
    <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.4-7.5 9.5-4.4-1.1-7.5-4.9-7.5-9.5V6L12 3z" />
  ),
  spray: (
    <>
      <path d="M9 8h6a2 2 0 012 2v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9a2 2 0 012-2z" />
      <path d="M10 8V5a1 1 0 011-1h2a1 1 0 011 1v3" />
      <path d="M17 5h2" />
      <path d="M17.5 8.5h1.5" />
      <path d="M18 2.5h1.5" />
      <path d="M10 13h4" />
    </>
  ),
  inspect: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
      <path d="M8.5 11h5" />
      <path d="M11 8.5v5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  bug: (
    <>
      <path d="M8 7a4 4 0 018 0" />
      <path d="M7.5 10h9v4a4.5 4.5 0 01-9 0v-4z" />
      <path d="M4 11h3.5" />
      <path d="M16.5 11H20" />
      <path d="M4.8 6.5l2.4 1.8" />
      <path d="M19.2 6.5l-2.4 1.8" />
      <path d="M5.2 16.5l2.6-1.6" />
      <path d="M18.8 16.5l-2.6-1.6" />
    </>
  ),
  leaf: (
    <>
      <path d="M4.5 19.5C3 15 5 8.5 11.5 6.5c3-.9 6-1 8-1 0 2.5-.4 6-1.7 8.6-2 4-6.2 5.6-9.8 4.9" />
      <path d="M4.5 19.5C7 15.5 10.5 12 15 9.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 10-1.8 6.1" />
      <path d="M20 5v6h-6" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4.5h6a1 1 0 011 1V7H8V5.5a1 1 0 011-1z" />
      <path d="M16 6h2a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 011-1h2" />
      <path d="M9 12h6" />
      <path d="M9 15.5h4" />
    </>
  ),

  // --- 연락 / 정보 ------------------------------------------------------
  phone: (
    <path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 005.6 5.6L16 13l4 1.5v3a1.8 1.8 0 01-2 1.8C11 18.7 5.3 13 4.7 6a1.8 1.8 0 011.8-2z" />
  ),
  chat: (
    <>
      <path d="M20 12.5c0 3.9-3.6 7-8 7-.9 0-1.8-.1-2.6-.4L4.5 21l1.2-3.4A6.6 6.6 0 014 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7z" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.6" />
      <path d="M4 7l8 5.5L20 7" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 21s7-5.8 7-11a7 7 0 10-14 0c0 5.2 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.8" y="5.5" width="16.4" height="14" rx="1.8" />
      <path d="M3.8 9.8h16.4" />
      <path d="M8.5 3.5v3.5" />
      <path d="M15.5 3.5v3.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.8" />
      <path d="M8.2 10.5V8a3.8 3.8 0 017.6 0v2.5" />
    </>
  ),

  // --- 상태 / 피드백 ----------------------------------------------------
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.8" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.8v5" />
      <path d="M12 16.1h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 11v5.2" />
      <path d="M12 7.9h.01" />
    </>
  ),
  star: (
    <path d="M12 3.8l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9L12 3.8z" />
  ),

  // --- 기타 -------------------------------------------------------------
  image: (
    <>
      <rect x="3.8" y="5" width="16.4" height="14" rx="1.8" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17l4.2-4.2 3 3 2.6-2.6 5.2 5.2" />
    </>
  ),
  paperclip: (
    <path d="M17.5 10.5l-6.6 6.6a3.6 3.6 0 01-5.1-5.1l7.2-7.2a2.4 2.4 0 013.4 3.4l-7.1 7.1a1.2 1.2 0 01-1.7-1.7l6.3-6.3" />
  ),
  trash: (
    <>
      <path d="M4.8 7h14.4" />
      <path d="M9.5 7V5.4a1 1 0 011-1h3a1 1 0 011 1V7" />
      <path d="M6.6 7l.8 12a1.4 1.4 0 001.4 1.3h6.4A1.4 1.4 0 0016.6 19l.8-12" />
    </>
  ),
  pencil: (
    <>
      <path d="M4.5 19.5l.6-3.6L15.6 5.4a1.7 1.7 0 012.4 0l.6.6a1.7 1.7 0 010 2.4L8.1 18.9l-3.6.6z" />
      <path d="M14.4 6.6l3 3" />
    </>
  ),
  external: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5L11 13" />
      <path d="M18 14v4.6a1.4 1.4 0 01-1.4 1.4H5.4A1.4 1.4 0 014 18.6V7.4A1.4 1.4 0 015.4 6H10" />
    </>
  ),
  "grip-vertical": (
    <>
      <circle cx="9.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  send: (
    <>
      <path d="M20.5 3.5L10.8 13.2" />
      <path d="M20.5 3.5l-6.2 17-3.5-7.3-7.3-3.5 17-6.2z" />
    </>
  ),
};

const Icon = ({ name, size = 24, strokeWidth = 1.6, className, ...rest }) => {
  const shape = paths[name];
  if (!shape) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shape}
    </svg>
  );
};

export default Icon;
