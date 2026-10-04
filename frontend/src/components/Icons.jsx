function makeIcon(path) {
  return function Icon({ size = 18, className = "", ...rest }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className={className} aria-hidden="true" focusable="false" {...rest}>
        {path}
      </svg>
    );
  };
}

export const ScaleIcon = makeIcon(
  <>
    <path d="M12 3v18" />
    <path d="M8 21h8" />
    <path d="M3.6 7h16.8" />
    <path d="M5.5 7 8 13l2.5-6M22 7l-2.5 6L17 7" />
    <path d="M8 13a4 4 0 0 1-4 0M16 13a4 4 0 0 0-4 0" opacity=".55" />
  </>
);

export const MenuIcon = makeIcon(<path d="M4 6h16M4 12h16M4 18h16" />);
export const CloseIcon = makeIcon(<path d="M6 6l12 12M18 6 6 18" />);

export const SearchIcon = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);

export const SendIcon = makeIcon(
  <>
    <path d="m3 11 18-8-8 18-2.5-7.5L3 11z" />
    <path d="M21 3 10.5 13.5" />
  </>
);

export const BookIcon = makeIcon(
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </>
);

export const DocIcon = makeIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6M9 17h6" />
  </>
);

export const LayersIcon = makeIcon(
  <>
    <path d="m12 2 9 5-9 5-9-5 9-5z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" opacity=".6" />
  </>
);

export const UploadIcon = makeIcon(
  <>
    <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </>
);

export const PlusIcon = makeIcon(<path d="M12 5v14M5 12h14" />);
export const TrashIcon = makeIcon(
  <>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </>
);
export const RefreshIcon = makeIcon(
  <>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </>
);

export const ChevronDownIcon = makeIcon(<path d="m6 9 6 6 6-6" />);
export const ChevronLeftIcon = makeIcon(<path d="m15 18-6-6 6-6" />);
export const ChevronRightIcon = makeIcon(<path d="m9 6 6 6-6 6" />);
export const ArrowRightIcon = makeIcon(<path d="M4 12h16m-6-6 6 6-6 6" />);

export const ExternalIcon = makeIcon(
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </>
);

export const CheckIcon = makeIcon(<path d="M20 6 9 17l-5-5" />);
export const AlertIcon = makeIcon(
  <>
    <path d="M12 3 1.8 20h20.4L12 3z" />
    <path d="M12 9v5M12 17.5v.5" />
  </>
);
export const InfoIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.5" />
  </>
);

export const FileTextIcon = makeIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M9 13h6M9 17h6" />
  </>
);

export const UserIcon = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </>
);

export const LogoutIcon = makeIcon(
  <>
    <path d="M15 12H4M8 8l-4 4 4 4" />
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
  </>
);

export const DatabaseIcon = makeIcon(
  <>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </>
);

export const CpuIcon = makeIcon(
  <>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </>
);

export const ServerIcon = makeIcon(
  <>
    <rect x="3" y="3" width="18" height="7" rx="2" />
    <rect x="3" y="14" width="18" height="7" rx="2" />
    <path d="M7 6.5h.5M7 17.5h.5" />
  </>
);

export const ShieldIcon = makeIcon(
  <>
    <path d="M12 3 4.5 6v6c0 4.6 3.2 7.7 7.5 9 4.3-1.3 7.5-4.4 7.5-9V6L12 3z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const KeyIcon = makeIcon(
  <>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9m-4 4 2 2m-5 0 2 2" />
  </>
);

export const TargetIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </>
);

export const ActivityIcon = makeIcon(<path d="M3 12h4l3-8 4 16 3-8h4" />);

export const ClockIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
);

export const BookOpenIcon = makeIcon(
  <>
    <path d="M2 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H2V4z" />
    <path d="M22 4h-7a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h7V4z" />
  </>
);

export const GitBranchIcon = makeIcon(
  <>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M6 9v6M18 9a8 8 0 0 1-8 8h-4" />
  </>
);

export const WorkflowIcon = makeIcon(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M10 6.5h4a4 4 0 0 1 4 4v3.5" />
  </>
);

export const SparkIcon = makeIcon(
  <>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    <circle cx="12" cy="12" r="3.5" />
  </>
);

export const GlobeIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </>
);

export const LockIcon = makeIcon(
  <>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <path d="M12 15v2" />
  </>
);

export const SunIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </>
);

export const MoonIcon = makeIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
);

export const FilterIcon = makeIcon(
  <>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </>
);

export const EyeIcon = makeIcon(
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const BookmarkIcon = makeIcon(
  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
);

export const CopyIcon = makeIcon(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
);