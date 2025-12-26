import { motion } from "framer-motion";
import { X, ArrowRight, History } from "lucide-react";

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: {
    id: string;
    user_id: string | null;
    action: string;
    table_name: string;
    record_id: string | null;
    old_data: any;
    new_data: any;
    created_at: string;
    profile?: {
      full_name: string | null;
      email: string | null;
    };
  } | null;
}

const AuditLogDetailsModal = ({ isOpen, onClose, log }: AuditLogDetailsModalProps) => {
  if (!isOpen || !log) return null;

  const formatJson = (data: any) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'delete': return 'bg-destructive/10 text-destructive';
      case 'create': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'role_change': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'staff_invite': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <History className="w-5 h-5 text-muted-foreground" />
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full ${getActionColor(log.action)}`}>
                {log.action}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-ui-blue">
                {log.table_name}
              </span>
            </div>
            <h2 className="font-serif text-2xl text-foreground">Audit Log Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {log.profile?.full_name || log.profile?.email || 'Unknown User'} • {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Record ID</span>
              <p className="text-sm text-foreground mt-1 font-mono break-all">{log.record_id || 'N/A'}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">User ID</span>
              <p className="text-sm text-foreground mt-1 font-mono break-all">{log.user_id || 'N/A'}</p>
            </div>
          </div>

          {/* Data Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Old Data */}
            <div className="border border-border rounded overflow-hidden">
              <div className="bg-destructive/10 px-4 py-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                  Old Data (Before)
                </span>
              </div>
              <div className="p-4 bg-muted/30 overflow-auto max-h-[400px]">
                {log.old_data ? (
                  <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">
                    {formatJson(log.old_data)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No previous data (new record)</p>
                )}
              </div>
            </div>

            {/* Arrow indicator for desktop */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 pointer-events-none" style={{ display: 'none' }}>
              <ArrowRight className="w-6 h-6 text-nobel-gold" />
            </div>

            {/* New Data */}
            <div className="border border-border rounded overflow-hidden">
              <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                  New Data (After)
                </span>
              </div>
              <div className="p-4 bg-muted/30 overflow-auto max-h-[400px]">
                {log.new_data ? (
                  <pre className="text-xs text-foreground font-mono whitespace-pre-wrap break-words">
                    {formatJson(log.new_data)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No new data (deleted record)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuditLogDetailsModal;
