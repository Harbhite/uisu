import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & { variant?: 'default' | 'gold' | 'gradient' }
>(({ className, orientation = "horizontal", decorative = true, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-slate-200",
    gold: "bg-nobel-gold/30",
    gradient: orientation === "horizontal" 
      ? "bg-gradient-to-r from-transparent via-ui-blue/30 to-transparent"
      : "bg-gradient-to-b from-transparent via-ui-blue/30 to-transparent"
  };

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 transition-colors duration-300",
        variants[variant],
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
