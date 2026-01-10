import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-accent" />
  </div>
);
