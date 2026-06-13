import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium ring-offset-background transition-all duration-300 ease-smooth",
        "placeholder:text-slate-400 placeholder:font-light",
        "focus-visible:outline-none focus-visible:border-ui-blue focus-visible:ring-2 focus-visible:ring-ui-blue/20 focus-visible:shadow-premium",
        "hover:border-slate-300",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        "resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
