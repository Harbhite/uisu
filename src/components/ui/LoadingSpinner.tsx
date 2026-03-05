import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import loadingAnimation from "@/assets/loading-animation.json";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { width: 64, height: 64, showLabel: false },
  md: { width: 120, height: 120, showLabel: false },
  lg: { width: 200, height: 200, showLabel: false },
};

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const { width, height } = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-8", className)}>
      <Lottie
        animationData={loadingAnimation}
        loop
        autoplay
        style={{ width, height }}
      />
    </div>
  );
};
