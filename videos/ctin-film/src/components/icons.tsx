interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
});

export const TargetIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
  </svg>
);

export const CopyIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
  </svg>
);

export const LayersIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 3 8l9 5 9-5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
);

export const UserIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </svg>
);

export const VaultIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8v-1M16 12h1M12 16v1M8 12H7" />
  </svg>
);

export const PlugIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v6M15 2v6" />
    <path d="M6 8h12v3a6 6 0 0 1-12 0V8z" />
    <path d="M12 17v5" />
  </svg>
);

export const SwapIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h13l-3-3M20 16H7l3 3" />
  </svg>
);

export const DiamondIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 5 12l7 4 7-4-7-10z" />
    <path d="M5 12l7 10 7-10" />
  </svg>
);

export const LockIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1.4" />
  </svg>
);

export const CheckIcon = ({ size = 28, color = "currentColor", strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5 11-11" />
  </svg>
);

export const CrossIcon = ({ size = 28, color = "currentColor", strokeWidth = 2 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

export const ShieldIcon = ({ size = 40, color = "currentColor", strokeWidth = 1.6 }: IconProps) => (
  <svg {...base(size)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
