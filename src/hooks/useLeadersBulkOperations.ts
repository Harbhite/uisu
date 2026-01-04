import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderRow {
  name: string;
  role: string;
  category: string;
  constituency?: string;
  level?: string;
  bio?: string;
  email?: string;
  sort_order?: number;
}

export const useLeadersBulkOperations = (onComplete: () => void) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('sort_order');

      if (error) throw error;

      const headers = ['name', 'role', 'category', 'constituency', 'level', 'bio', 'email', 'sort_order'];
      const csvContent = [
        headers.join(','),
        ...(data || []).map(leader => 
          headers.map(h => {
            const value = leader[h as keyof typeof leader];
            if (value === null || value === undefined) return '';
            const str = String(value);
            // Escape quotes and wrap in quotes if contains comma
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leaders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data?.length || 0} leaders`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export leaders');
    } finally {
      setExporting(false);
    }
  };

  const parseCSV = (text: string): LeaderRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: LeaderRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      // Validate required fields
      if (row.name && row.role && row.category) {
        rows.push({
          name: row.name,
          role: row.role,
          category: row.category,
          constituency: row.constituency || undefined,
          level: row.level || undefined,
          bio: row.bio || undefined,
          email: row.email || undefined,
          sort_order: row.sort_order ? parseInt(row.sort_order) : 0
        });
      }
    }

    return rows;
  };

  const importFromCSV = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error('No valid rows found. Ensure CSV has name, role, category columns.');
        return;
      }

      const validCategories = ['executive', 'principal_officer', 'hall_leader', 'legislator'];
      const validRows = rows.filter(r => validCategories.includes(r.category));

      if (validRows.length === 0) {
        toast.error('No valid categories found. Use: executive, principal_officer, hall_leader, legislator');
        return;
      }

      const { error } = await supabase
        .from('leaders')
        .insert(validRows.map(r => ({
          name: r.name,
          role: r.role,
          category: r.category,
          constituency: r.constituency || null,
          level: r.level || null,
          bio: r.bio || null,
          email: r.email || null,
          sort_order: r.sort_order || 0
        })));

      if (error) throw error;

      toast.success(`Imported ${validRows.length} leaders`);
      onComplete();
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import leaders';
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  return {
    importing,
    exporting,
    exportToCSV,
    importFromCSV
  };
};
