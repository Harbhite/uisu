import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Loader2, Calendar } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';


const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Books', 'Data/Airtime', 'Accommodation', 'Entertainment', 'Health', 'Clothing', 'Other'];
const INCOME_CATEGORIES = ['Allowance', 'Scholarship', 'Part-time Job', 'Gift', 'Other'];

interface BudgetEntry {
  id: string;
  user_id: string;
  amount: number;
  entry_type: string;
  category: string;
  description: string | null;
  entry_date: string;
  created_at: string;
}

const BudgetTrackerPage = () => {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [form, setForm] = useState({ amount: '', entry_type: 'expense', category: 'Food', description: '', entry_date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setCurrentUser(uid);
      if (uid) fetchEntries();
      else setLoading(false);
    });
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase.from('budget_entries').select('*').order('entry_date', { ascending: false });
    if (!error && data) setEntries(data);
    setLoading(false);
  };

  const monthEntries = useMemo(() => {
    const monthDate = new Date(selectedMonth + '-01');
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return entries.filter(e => isWithinInterval(new Date(e.entry_date), { start, end }));
  }, [entries, selectedMonth]);

  const totalIncome = useMemo(() => monthEntries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + Number(e.amount), 0), [monthEntries]);
  const totalExpenses = useMemo(() => monthEntries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0), [monthEntries]);
  const balance = totalIncome - totalExpenses;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthEntries.filter(e => e.entry_type === 'expense').forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthEntries]);

  const handleCreate = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!currentUser) { toast.error('Please sign in'); return; }
    setCreating(true);
    try {
      const { error } = await supabase.from('budget_entries').insert({
        user_id: currentUser, amount: Number(form.amount), entry_type: form.entry_type,
        category: form.category, description: form.description || null, entry_date: form.entry_date,
      });
      if (error) throw error;
      toast.success('Entry added');
      setShowModal(false);
      setForm({ amount: '', entry_type: 'expense', category: 'Food', description: '', entry_date: format(new Date(), 'yyyy-MM-dd') });
      fetchEntries();
    } catch { toast.error('Failed to add'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('budget_entries').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchEntries(); }
  };

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl text-center">
          <Wallet size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Budget Tracker</h1>
          <p className="text-muted-foreground mb-6">Sign in to start tracking your income and expenses privately.</p>
          <Button onClick={() => window.location.href = '/auth'}>Sign In</Button>
        </div>
      </div>
    );
  }

  const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Budget Tracker - UISU SPACE" description="Track your personal income and expenses" />
      

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2">Budget Tracker</h1>
            <p className="text-muted-foreground">Your personal finance dashboard. Private to you only.</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
            <Plus size={18} /> Add Entry
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={16} className="text-muted-foreground" />
          <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-auto" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Income</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatNaira(totalIncome)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatNaira(totalExpenses)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Balance</span>
            </div>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatNaira(balance)}</p>
          </motion.div>
        </div>

        {/* Expense Breakdown */}
        {expenseByCategory.length > 0 && (
          <div className="bg-card border border-border p-5 mb-10">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Expense Breakdown</h3>
            <div className="space-y-3">
              {expenseByCategory.map(([cat, amount]) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{cat}</span>
                      <span className="text-muted-foreground">{formatNaira(amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-primary rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : monthEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No entries for this month. Start tracking!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthEntries.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 bg-card border border-border p-3 hover:shadow-sm transition-shadow">
                <div className={`w-1 h-10 rounded ${entry.entry_type === 'income' ? 'bg-green-500' : 'bg-destructive'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{entry.description || entry.category}</span>
                    <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                </div>
                <span className={`font-bold text-sm ${entry.entry_type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                  {entry.entry_type === 'income' ? '+' : '-'}{formatNaira(Number(entry.amount))}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Tabs value={form.entry_type} onValueChange={v => setForm(f => ({ ...f, entry_type: v, category: v === 'income' ? 'Allowance' : 'Food' }))}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
                <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <Label className="text-xs">Amount (₦) *</Label>
              <Input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0" step="any" />
            </div>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(form.entry_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 size={16} className="animate-spin mr-2" />}
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetTrackerPage;
