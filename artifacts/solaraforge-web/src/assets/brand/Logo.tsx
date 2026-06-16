import { brand } from "./colors";

interface LogoProps {
  size?: number;
  variant?: "full" | "icon";
  className?: string;
}

export default function Logo({ size = 32, variant = "icon", className }: LogoProps) {
  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`} role="img" aria-label="SolaraForge">
        <SolaraIcon size={size} />
        <span
          style={{
            fontFamily: brand.text.primary,
            fontSize: size * 0.6,
            fontWeight: 700,
            color: brand.primary,
            letterSpacing: "-0.01em",
          }}
        >
          SolaraForge
        </span>
      </div>
    );
  }
  return <SolaraIcon size={size} className={className} />;
}

function SolaraIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SolaraForge icon"
    >
      {/* Leaf/habitat shape */}
      <circle cx="16" cy="16" r="15" fill={brand.primary} />
      {/* Sun rays */}
      <path d="M16 7 L17.2 12 L22 10.5 L19 14.5 L23 16 L19 17.5 L22 21.5 L17.2 20 L16 25 L14.8 20 L10 21.5 L13 17.5 L9 16 L13 14.5 L10 10.5 L14.8 12 Z" fill={brand.accent} opacity="0.9" />
      {/* Leaf center */}
      <ellipse cx="16" cy="16" rx="4" ry="6" fill={brand.primaryLight} transform="rotate(-15, 16, 16)" />
      {/* Leaf vein */}
      <path d="M16 11 Q17 16 16 21" stroke={brand.accent} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
