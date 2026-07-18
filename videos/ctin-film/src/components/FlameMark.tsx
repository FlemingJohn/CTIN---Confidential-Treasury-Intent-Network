import { colors } from "../theme";

export const FlameMark = ({ size = 120 }: { size?: number }) => {
  const gradientId = "flameMarkGradient";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={colors.glow} />
          <stop offset="0.55" stopColor={colors.ember} />
          <stop offset="1" stopColor={colors.flame} />
        </linearGradient>
      </defs>
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};
