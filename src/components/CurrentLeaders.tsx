import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Pencil, Plus, Trash2, Save, X, Loader2, Upload, Search, Filter, Download, FileUp } from 'lucide-react';
import { LeaderCard } from '@/components/LeaderCard';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLeadersBulkOperations } from '@/hooks/useLeadersBulkOperations';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface Leader {
    id: string;
    name: string;
    role: string;
    category: string;
    image: string;
    bio: string;
    email: string;
    socials: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    constituency?: string;
    level?: string;
    sort_order: number;
}

interface CurrentLeadersProps {
    onBack: () => void;
}

const emptyLeader: Omit<Leader, 'id'> = {
    name: '',
    role: '',
    category: 'executive',
    image: '/placeholder.svg',
    bio: '',
    email: '',
    socials: {},
    constituency: '',
    level: '',
    sort_order: 0
};

export const CurrentLeaders: React.FC<CurrentLeadersProps> = ({ onBack }) => {
    const { isStaff, loading: authLoading } = useAdminCheck();
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
    const [formData, setFormData] = useState<Omit<Leader, 'id'>>(emptyLeader);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Search and filter states for legislators
    const [legislatorSearch, setLegislatorSearch] = useState('');
    const [constituencyFilter, setConstituencyFilter] = useState('all');
    const importFileRef = useRef<HTMLInputElement>(null);

    const fetchLeaders = useCallback(async () => {
        const { data, error } = await supabase
            .from('leaders')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) {
            console.error('Error fetching leaders:', error);
            toast.error('Failed to load leaders');
        } else if (data) {
            const mapped: Leader[] = data.map(l => ({
                id: l.id,
                name: l.name,
                role: l.role,
                category: l.category,
                image: l.image || '/placeholder.svg',
                bio: l.bio || '',
                email: l.email || '',
                socials: (l.socials as Leader['socials']) || {},
                constituency: l.constituency || '',
                level: l.level || '',
                sort_order: l.sort_order || 0
            }));
            setLeaders(mapped);
        }
        setLoading(false);
    }, []);
    
    const { importing, exporting, exportToCSV, importFromCSV } = useLeadersBulkOperations(fetchLeaders);

    useEffect(() => {
        fetchLeaders();
    }, [fetchLeaders]);

    const executives = leaders.filter(l => l.category === 'executive');
    const principalOfficers = leaders.filter(l => l.category === 'principal_officer');
    const hallLeaders = leaders.filter(l => l.category === 'hall_leader');
    const allLegislators = leaders.filter(l => l.category === 'legislator');

    // Get unique constituencies for filter dropdown
    const constituencies = [...new Set(allLegislators.map(l => l.constituency).filter(Boolean))].sort();

    // Filter legislators based on search and constituency
    const filteredLegislators = allLegislators.filter(leg => {
        const matchesSearch = legislatorSearch === '' || 
            leg.name.toLowerCase().includes(legislatorSearch.toLowerCase()) ||
            (leg.constituency && leg.constituency.toLowerCase().includes(legislatorSearch.toLowerCase())) ||
            (leg.level && leg.level.includes(legislatorSearch));
        
        const matchesConstituency = constituencyFilter === 'all' || leg.constituency === constituencyFilter;
        
        return matchesSearch && matchesConstituency;
    });

    const openCreateModal = (category: string) => {
        setEditingLeader(null);
        setFormData({ ...emptyLeader, category });
        setEditModalOpen(true);
    };

    const openEditModal = (leader: Leader) => {
        setEditingLeader(leader);
        setFormData({
            name: leader.name,
            role: leader.role,
            category: leader.category,
            image: leader.image,
            bio: leader.bio,
            email: leader.email,
            socials: leader.socials,
            constituency: leader.constituency || '',
            level: leader.level || '',
            sort_order: leader.sort_order
        });
        setEditModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `leaders/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('leader-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('leader-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image: publicUrl });
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.role) {
            toast.error('Name and role are required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                role: formData.role,
                category: formData.category,
                image: formData.image,
                bio: formData.bio,
                email: formData.email,
                socials: formData.socials,
                constituency: formData.constituency || null,
                level: formData.level || null,
                sort_order: formData.sort_order
            };

            if (editingLeader) {
                const { error } = await supabase
                    .from('leaders')
                    .update(payload)
                    .eq('id', editingLeader.id);

                if (error) throw error;
                toast.success('Leader updated successfully');
            } else {
                const { error } = await supabase
                    .from('leaders')
                    .insert(payload);

                if (error) throw error;
                toast.success('Leader added successfully');
            }

            setEditModalOpen(false);
            fetchLeaders();
        } catch (error: any) {
            console.error('Error saving leader:', error);
            toast.error(error.message || 'Failed to save leader');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this leader?')) return;

        try {
            const { error } = await supabase
                .from('leaders')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            toast.success('Leader removed');
            fetchLeaders();
        } catch (error: any) {
            console.error('Error deleting leader:', error);
            toast.error('Failed to remove leader');
        }
    };

    const LeaderCardWithEdit: React.FC<{ leader: Leader }> = ({ leader }) => (
        <div className="relative group">
            <LeaderCard leader={{
                name: leader.name,
                role: leader.role,
                image: leader.image,
                bio: leader.bio,
                email: leader.email,
                socials: leader.socials
            }} />
            {isStaff && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEditModal(leader)}>
                        <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(leader.id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )}
        </div>
    );

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 pb-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-16">
            <div className="container mx-auto px-6">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Home</span>
                </button>

                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Leadership</span>
                        {isStaff && (
                            <div className="ml-auto flex gap-2">
                                <input
                                    ref={importFileRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => e.target.files?.[0] && importFromCSV(e.target.files[0])}
                                    className="hidden"
                                />
                                <Button size="sm" variant="outline" onClick={() => importFileRef.current?.click()} disabled={importing}>
                                    {importing ? <Loader2 size={14} className="mr-2 animate-spin" /> : <FileUp size={14} className="mr-2" />}
                                    Import CSV
                                </Button>
                                <Button size="sm" variant="outline" onClick={exportToCSV} disabled={exporting}>
                                    {exporting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
                                    Export CSV
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9]"
                    >
                        Current <br/> <span className="italic text-slate-300">Leaders</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light"
                    >
                        Meet the dedicated individuals serving the student body for the current academic session.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-20"
                >
                    {/* Executives Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl font-serif text-ui-blue">The Executive Council</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                            {isStaff && (
                                <Button size="sm" variant="outline" onClick={() => openCreateModal('executive')}>
                                    <Plus size={14} className="mr-2" /> Add
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {executives.map((leader) => (
                                <LeaderCardWithEdit key={leader.id} leader={leader} />
                            ))}
                        </div>
                    </section>

                    {/* Principal Officers Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl font-serif text-ui-blue">Principal Officers (SRC)</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                            {isStaff && (
                                <Button size="sm" variant="outline" onClick={() => openCreateModal('principal_officer')}>
                                    <Plus size={14} className="mr-2" /> Add
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {principalOfficers.map((leader) => (
                                <LeaderCardWithEdit key={leader.id} leader={leader} />
                            ))}
                        </div>
                    </section>

                    {/* Hall Majority Leaders Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl font-serif text-ui-blue">Hall Majority Leaders</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                            {isStaff && (
                                <Button size="sm" variant="outline" onClick={() => openCreateModal('hall_leader')}>
                                    <Plus size={14} className="mr-2" /> Add
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {hallLeaders.map((leader) => (
                                <LeaderCardWithEdit key={leader.id} leader={leader} />
                            ))}
                        </div>
                    </section>

                    {/* Legislators List */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-3xl font-serif text-ui-blue">Honourable Members</h2>
                            <div className="h-px flex-1 bg-slate-200"></div>
                            {isStaff && (
                                <Button size="sm" variant="outline" onClick={() => openCreateModal('legislator')}>
                                    <Plus size={14} className="mr-2" /> Add
                                </Button>
                            )}
                        </div>

                        {/* Search and Filter Controls */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search by name, constituency, or level..."
                                    value={legislatorSearch}
                                    onChange={(e) => setLegislatorSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-slate-400" />
                                <Select value={constituencyFilter} onValueChange={setConstituencyFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter by constituency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Constituencies</SelectItem>
                                        {constituencies.map(c => (
                                            <SelectItem key={c} value={c!}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(legislatorSearch || constituencyFilter !== 'all') && (
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                        setLegislatorSearch('');
                                        setConstituencyFilter('all');
                                    }}
                                >
                                    <X size={14} className="mr-1" /> Clear
                                </Button>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Constituency</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Level</th>
                                            {isStaff && <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLegislators.length === 0 ? (
                                            <tr>
                                                <td colSpan={isStaff ? 4 : 3} className="px-6 py-8 text-center text-slate-500">
                                                    No legislators found matching your search
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLegislators.map((leg) => (
                                                <tr key={leg.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{leg.name}</td>
                                                    <td className="px-6 py-4 text-slate-600">{leg.constituency}</td>
                                                    <td className="px-6 py-4 text-slate-500">{leg.level}</td>
                                                    {isStaff && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditModal(leg)}>
                                                                    <Pencil size={14} />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(leg.id)}>
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {filteredLegislators.length > 0 && (
                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-500">
                                    Showing {filteredLegislators.length} of {allLegislators.length} legislators
                                </div>
                            )}
                        </div>
                    </section>
                </motion.div>
            </div>

            {/* Edit/Create Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingLeader ? 'Edit Leader' : 'Add New Leader'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Name *</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter name"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Role / Position *</label>
                            <Input
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g., President, Speaker, Legislator"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="executive">Executive</SelectItem>
                                    <SelectItem value="principal_officer">Principal Officer (SRC)</SelectItem>
                                    <SelectItem value="hall_leader">Hall Majority Leader</SelectItem>
                                    <SelectItem value="legislator">Legislator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.category === 'legislator' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Constituency</label>
                                    <Input
                                        value={formData.constituency}
                                        onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                        placeholder="e.g., Faculty of Law"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Level</label>
                                    <Input
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        placeholder="e.g., 400"
                                    />
                                </div>
                            </>
                        )}

                        {formData.category !== 'legislator' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Photo</label>
                                    <div className="flex items-center gap-4">
                                        {formData.image && formData.image !== '/placeholder.svg' && (
                                            <img 
                                                src={formData.image} 
                                                alt="Preview" 
                                                className="w-16 h-16 rounded-lg object-cover border"
                                            />
                                        )}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="w-full"
                                            >
                                                {uploading ? (
                                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                                ) : (
                                                    <Upload size={14} className="mr-2" />
                                                )}
                                                {uploading ? 'Uploading...' : 'Upload Photo'}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">Or enter URL:</p>
                                            <Input
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="/placeholder.svg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Bio</label>
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Brief bio about the leader"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@uisu.org"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Twitter Handle</label>
                                    <Input
                                        value={formData.socials.twitter || ''}
                                        onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, twitter: e.target.value || undefined } })}
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">LinkedIn</label>
                                    <Input
                                        value={formData.socials.linkedin || ''}
                                        onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value || undefined } })}
                                        placeholder="https://linkedin.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Instagram</label>
                                    <Input
                                        value={formData.socials.instagram || ''}
                                        onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, instagram: e.target.value || undefined } })}
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1 block">Sort Order</label>
                            <Input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={saving}>
                                <X size={14} className="mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving || uploading}>
                                {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
                                {editingLeader ? 'Update' : 'Add'} Leader
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
