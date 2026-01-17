import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="rounded-none"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
