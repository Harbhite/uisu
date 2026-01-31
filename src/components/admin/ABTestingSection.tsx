import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  desc: string;
}

const TEMPLATES: Template[] = [
  { id: 'classic', name: 'Classic', desc: 'Editorial with gold accents' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean and modern' },
  { id: 'announcement', name: 'Announcement', desc: 'Bold dark theme' },
  { id: 'newspaper', name: 'Newspaper', desc: 'Traditional masthead' },
  { id: 'longform', name: 'Longform', desc: 'Magazine style for essays' },
  { id: 'telegram', name: 'Telegram', desc: 'Vintage dispatch style' },
  { id: 'artdeco', name: 'Art Deco', desc: 'Elegant dark luxury' },
  { id: 'gradient', name: 'Gradient', desc: 'Modern pulse effect' },
];

interface ABTestingProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  variantA: string;
  variantB: string;
  onVariantAChange: (template: string) => void;
  onVariantBChange: (template: string) => void;
}

export const ABTestingSection = ({
  enabled,
  onToggle,
  variantA,
  variantB,
  onVariantAChange,
  onVariantBChange,
}: ABTestingProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-nobel-gold" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">A/B Testing</p>
            <p className="text-xs text-muted-foreground">
              {enabled ? 'Enabled - testing 2 templates' : 'Test different templates to see which performs best'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 border-t border-border">
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Enable A/B Testing</label>
                <button
                  type="button"
                  onClick={() => onToggle(!enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    enabled ? 'bg-nobel-gold' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      enabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {enabled && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-muted-foreground">
                    Subscribers will be randomly split 50/50 between the two template variants.
                    Track which performs better in campaign analytics.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Variant A */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="w-6 h-6 rounded-full bg-ui-blue text-white flex items-center justify-center text-[10px]">A</span>
                        Variant A
                      </label>
                      <select
                        value={variantA}
                        onChange={(e) => onVariantAChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                      >
                        {TEMPLATES.map(t => (
                          <option key={t.id} value={t.id} disabled={t.id === variantB}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Variant B */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="w-6 h-6 rounded-full bg-nobel-gold text-foreground flex items-center justify-center text-[10px]">B</span>
                        Variant B
                      </label>
                      <select
                        value={variantB}
                        onChange={(e) => onVariantBChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border focus:border-nobel-gold focus:outline-none text-sm"
                      >
                        {TEMPLATES.map(t => (
                          <option key={t.id} value={t.id} disabled={t.id === variantA}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                    <BarChart3 size={14} className="text-nobel-gold shrink-0" />
                    <span>Results will be shown in the campaign details after sending.</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
