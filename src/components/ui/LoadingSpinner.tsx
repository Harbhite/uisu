import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { svg: 32, radii: [10, 0, 0], stroke: 2, showLabel: false },
  md: { svg: 56, radii: [18, 13, 8], stroke: 2.5, showLabel: true },
  lg: { svg: 80, radii: [28, 20, 12], stroke: 3, showLabel: true },
};

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const { svg, radii, stroke, showLabel } = sizeConfig[size];
  const center = svg / 2;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}>
      <div className="relative" style={{ width: svg, height: svg }}>
        <svg width={svg} height={svg} viewBox={`0 0 ${svg} ${svg}`}>
          {radii.map((r, i) =>
            r > 0 ? (
              <motion.circle
                key={i}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${r * 1.2} ${r * 4}`}
                opacity={1 - i * 0.25}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2.5 - i * 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ originX: `${center}px`, originY: `${center}px` }}
              />
            ) : null
          )}
        </svg>
        {/* Center pulse dot */}
        <motion.div
          className="absolute rounded-full bg-accent"
          style={{
            width: size === "sm" ? 4 : size === "md" ? 6 : 8,
            height: size === "sm" ? 4 : size === "md" ? 6 : 8,
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
          }}
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {showLabel && (
        <motion.span
          className="text-xs tracking-widest uppercase text-muted-foreground font-sans"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading…
        </motion.span>
      )}
    </div>
  );
};
