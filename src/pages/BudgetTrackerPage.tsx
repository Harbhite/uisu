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

  const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 pt-28 pb-14 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 mb-3">Personal Finance</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">Budget Tracker</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Wallet size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl text-foreground mb-2">Sign in to get started</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Track your income and expenses privately. Only you can see your data.</p>
          <Button onClick={() => window.location.href = '/auth'} className="rounded-sm">Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Budget Tracker - UISU SPACE" description="Track your personal income and expenses" />

      {/* Hero */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 pt-28 pb-14 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60 mb-3">Personal Finance</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">Budget Tracker</h1>
            <p className="text-primary-foreground/70 font-light max-w-xl text-lg">
              Your personal finance dashboard. Private to you only.
            </p>
          </motion.div>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-primary-foreground/10">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary-foreground/60" />
              <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-auto bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground rounded-sm h-9 text-sm" />
            </div>
            <Button onClick={() => setShowModal(true)} variant="secondary" className="gap-2 rounded-sm ml-auto">
              <Plus size={16} /> Add Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Income</span>
            </div>
            <p className="text-3xl font-serif font-bold text-primary">{formatNaira(totalIncome)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-sm bg-destructive/10 flex items-center justify-center">
                <TrendingDown size={16} className="text-destructive" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Expenses</span>
            </div>
            <p className="text-3xl font-serif font-bold text-destructive">{formatNaira(totalExpenses)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${balance >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                <Wallet size={16} className={balance >= 0 ? 'text-primary' : 'text-destructive'} />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Balance</span>
            </div>
            <p className={`text-3xl font-serif font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatNaira(balance)}</p>
          </motion.div>
        </div>

        {/* Expense Breakdown */}
        {expenseByCategory.length > 0 && (
          <div className="bg-card border border-border rounded-sm p-6 mb-10">
            <h3 className="text-xs font-bold text-muted-foreground mb-5 uppercase tracking-[0.15em]">Expense Breakdown</h3>
            <div className="space-y-4">
              {expenseByCategory.map(([cat, amount]) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium">{cat}</span>
                      <span className="text-muted-foreground font-light">{formatNaira(amount)} <span className="text-[10px]">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full bg-primary rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Entries List */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-5">Transactions</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
          ) : monthEntries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Wallet size={28} className="text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">No entries this month</h3>
              <p className="text-muted-foreground text-sm">Start tracking by adding your first entry.</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {monthEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-sm p-4 hover:shadow-sm transition-shadow group"
                >
                  <div className={`w-1 h-10 rounded-full ${entry.entry_type === 'income' ? 'bg-primary' : 'bg-destructive'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{entry.description || entry.category}</span>
                      <Badge variant="outline" className="text-[10px] rounded-sm">{entry.category}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                  </div>
                  <span className={`font-serif font-bold text-sm ${entry.entry_type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {entry.entry_type === 'income' ? '+' : '-'}{formatNaira(Number(entry.amount))}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:rounded-sm">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Add Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Tabs value={form.entry_type} onValueChange={v => setForm(f => ({ ...f, entry_type: v, category: v === 'income' ? 'Allowance' : 'Food' }))}>
              <TabsList className="w-full rounded-sm">
                <TabsTrigger value="expense" className="flex-1 rounded-sm">Expense</TabsTrigger>
                <TabsTrigger value="income" className="flex-1 rounded-sm">Income</TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <Label className="text-xs">Amount (₦) *</Label>
              <Input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0" step="any" className="rounded-sm" />
            </div>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(form.entry_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-sm" />
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.entry_date} onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} className="rounded-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-sm">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="rounded-sm">
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
