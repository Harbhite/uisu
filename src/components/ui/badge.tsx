import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-ui-blue text-white hover:bg-ui-dark shadow-sm hover:shadow-premium",
        secondary: "border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm",
        destructive: "border border-transparent bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-premium",
        outline: "border-2 border-slate-300 text-slate-700 hover:border-ui-blue hover:text-ui-blue",
        gold: "border border-nobel-gold bg-nobel-gold/20 text-nobel-dark hover:bg-nobel-gold/30 shadow-premium-gold",
        success: "border border-transparent bg-green-600 text-white hover:bg-green-700 shadow-sm",
        warning: "border border-transparent bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
        info: "border border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
