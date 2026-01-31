import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { z } from "zod";

const emailSchema = z.string().email();

interface ImportResult {
  total: number;
  successful: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

interface SubscriberImportProps {
  onImportComplete: () => void;
}

export const SubscriberImport = ({ onImportComplete }: SubscriberImportProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseFile = async (file: File): Promise<string[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          complete: (results) => {
            const emails: string[] = [];
            results.data.forEach((row: any) => {
              // Handle both array rows and object rows
              if (Array.isArray(row)) {
                row.forEach(cell => {
                  if (typeof cell === 'string' && cell.includes('@')) {
                    emails.push(cell.trim().toLowerCase());
                  }
                });
              } else if (typeof row === 'object') {
                Object.values(row).forEach(value => {
                  if (typeof value === 'string' && value.includes('@')) {
                    emails.push(value.trim().toLowerCase());
                  }
                });
              }
            });
            resolve([...new Set(emails)]); // Remove duplicates
          },
          error: reject,
          skipEmptyLines: true,
        });
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const emails: string[] = [];
            
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
              
              json.forEach((row: any) => {
                if (Array.isArray(row)) {
                  row.forEach(cell => {
                    if (typeof cell === 'string' && cell.includes('@')) {
                      emails.push(cell.trim().toLowerCase());
                    }
                  });
                }
              });
            });
            
            resolve([...new Set(emails)]);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
    
    throw new Error('Unsupported file format. Please use CSV, XLS, or XLSX files.');
  };

  const handleFileSelect = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xls', 'xlsx'].includes(extension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV, XLS, or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    
    try {
      const emails = await parseFile(file);
      setParsedEmails(emails);
      setShowPreview(true);
    } catch (error: any) {
      toast({
        title: "Parse error",
        description: error.message || "Failed to parse file.",
        variant: "destructive",
      });
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (parsedEmails.length === 0) return;
    
    setImporting(true);
    const result: ImportResult = {
      total: parsedEmails.length,
      successful: 0,
      duplicates: 0,
      invalid: 0,
      errors: [],
    };

    try {
      // Validate emails and filter invalid ones
      const validEmails: string[] = [];
      parsedEmails.forEach(email => {
        try {
          emailSchema.parse(email);
          validEmails.push(email);
        } catch {
          result.invalid++;
        }
      });

      // Get existing subscribers to check for duplicates
      const { data: existingSubscribers } = await supabase
        .from("newsletter_subscribers")
        .select("email");
      
      const existingEmails = new Set(existingSubscribers?.map(s => s.email.toLowerCase()) || []);

      // Filter out duplicates
      const newEmails = validEmails.filter(email => {
        if (existingEmails.has(email)) {
          result.duplicates++;
          return false;
        }
        return true;
      });

      // Batch insert new subscribers
      if (newEmails.length > 0) {
        const insertData = newEmails.map(email => ({
          email,
          is_active: true,
          source: 'csv-import',
        }));

        // Insert in batches of 100
        for (let i = 0; i < insertData.length; i += 100) {
          const batch = insertData.slice(i, i + 100);
          const { error } = await supabase
            .from("newsletter_subscribers")
            .insert(batch);
          
          if (error) {
            result.errors.push(`Batch ${Math.floor(i/100) + 1}: ${error.message}`);
          } else {
            result.successful += batch.length;
          }
        }
      }

      setImportResult(result);
      
      if (result.successful > 0) {
        toast({
          title: "Import successful",
          description: `Added ${result.successful} new subscriber${result.successful !== 1 ? 's' : ''}.`,
        });
        onImportComplete();
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setParsedEmails([]);
    setImportResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-card border border-border p-6">
      <h3 className="font-serif text-lg text-foreground mb-4">Import Subscribers</h3>
      
      {!showPreview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-nobel-gold bg-nobel-gold/5' 
              : 'border-border hover:border-muted-foreground'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-foreground mb-2">
            Drag & drop a file or <span className="text-nobel-gold">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, XLS, and XLSX files. Any column containing emails will be detected.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* File info */}
            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-nobel-gold" />
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {parsedEmails.length} email{parsedEmails.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
              <button
                onClick={resetImport}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email preview */}
            <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
              <div className="p-3 space-y-1">
                {parsedEmails.slice(0, 20).map((email, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground font-mono">
                    {email}
                  </div>
                ))}
                {parsedEmails.length > 20 && (
                  <div className="text-xs text-nobel-gold pt-2">
                    ... and {parsedEmails.length - 20} more
                  </div>
                )}
              </div>
            </div>

            {/* Import result */}
            {importResult && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check size={16} />
                  <span className="text-sm font-medium">{importResult.successful} imported successfully</span>
                </div>
                {importResult.duplicates > 0 && (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">{importResult.duplicates} already subscribed (skipped)</span>
                  </div>
                )}
                {importResult.invalid > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle size={16} />
                    <span className="text-sm">{importResult.invalid} invalid email{importResult.invalid !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetImport}
                className="flex-1 px-4 py-3 border border-border text-muted-foreground text-xs font-bold uppercase tracking-widest hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || parsedEmails.length === 0 || (importResult?.successful ?? 0) > 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : importResult?.successful ? (
                  <>
                    <Check size={14} />
                    Done
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Import {parsedEmails.length} Email{parsedEmails.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
