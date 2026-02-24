/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Megaphone, Calendar, Tag, ChevronRight, Bell, Clock, X, Loader2, Share2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { SocialShare } from '@/components/SocialShare';

/**
 * Props for the AnnouncementsPage component.
 */
interface AnnouncementsProps {
  /** Callback function to handle the back navigation action. */
  onBack: () => void;
}

/**
 * Represents a single announcement item.
 */
interface Announcement {
    /** Unique identifier for the announcement. */
    id: string;
    /** The title of the announcement. */
    title: string;
    /** The date the announcement was published. */
    date: string;
    /** The category of the announcement. */
    category: 'News' | 'Event' | 'Memo' | 'Urgent';
    /** A short summary of the announcement displayed in the list view. */
    summary: string;
    /** The full content of the announcement displayed in the modal. */
    content: string;
    /** The author or department issuing the announcement. */
    author: string;
}

/**
 * A component that displays a list of announcements, news, and events.
 * Users can filter announcements by category and view details in a modal.
 *
 * @param {AnnouncementsProps} props - The component props.
 * @returns {JSX.Element} The rendered AnnouncementsPage component.
 */
export const AnnouncementsPage: React.FC<AnnouncementsProps> = ({ onBack }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const formattedAnnouncements: Announcement[] = (data || []).map(a => ({
                    id: a.id,
                    title: a.title,
                    date: new Date(a.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    category: (a.priority === 'urgent' ? 'Urgent' : 'News') as Announcement['category'],
                    summary: a.content.substring(0, 150) + (a.content.length > 150 ? '...' : ''),
                    content: a.content,
                    author: 'UISU Admin'
                }));
                
                setAnnouncements(formattedAnnouncements);
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const filteredData = filter === 'All' 
        ? announcements 
        : announcements.filter(item => item.category === filter);

    const categories = ['All', 'News', 'Event', 'Memo', 'Urgent'];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-16 text-foreground">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <button 
                        onClick={onBack}
                        className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-ui-blue transition-colors mb-6 md:mb-0"
                    >
                        <div className="p-2 rounded-full border border-border group-hover:border-ui-blue transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        <span>Back to Home</span>
                    </button>

                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold uppercase tracking-widest text-nobel-gold mb-1">Union Dispatch</div>
                        <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>

                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                       <Bell className="text-nobel-gold w-6 h-6" fill="currentColor" />
                       <span className="text-xs font-bold tracking-[0.2em] uppercase text-ui-blue">Official Releases</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-ui-blue leading-[0.9]">
                        News & <br/> <span className="italic text-muted-foreground">Announcements</span>
                    </h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                                filter === cat 
                                ? 'bg-ui-blue text-white border-ui-blue' 
                                : 'bg-card text-muted-foreground border-border hover:border-ui-blue hover:text-ui-blue'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredData.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => setSelectedItem(item)}
                                className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-nobel-gold transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {item.category === 'Urgent' && (
                                    <div className="absolute top-0 right-0 bg-destructive text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-widest">
                                        Urgent
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                        item.category === 'Event' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        item.category === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {item.category === 'Event' && <Calendar size={12}/>}
                                        {item.category === 'News' && <Megaphone size={12}/>}
                                        {item.category === 'Memo' && <Tag size={12}/>}
                                        {item.category}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                                        <Clock size={12} /> {item.date}
                                    </div>
                                </div>

                                <h3 className="font-serif text-2xl text-ui-blue mb-4 group-hover:text-nobel-gold transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground mb-6 line-clamp-2">
                                    {item.summary}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">From: {item.author}</span>
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-ui-blue group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-card w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-border flex justify-between items-start bg-muted">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-ui-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            {selectedItem.category}
                                        </span>
                                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{selectedItem.date}</span>
                                    </div>
                                    <h3 className="font-serif text-3xl text-ui-blue leading-tight">{selectedItem.title}</h3>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8">
                                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {selectedItem.content}
                                </p>
                                <div className="mt-8 pt-8 border-t border-border flex items-end justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Signed</p>
                                        <p className="font-serif text-xl text-ui-blue">{selectedItem.author}</p>
                                    </div>
                                    <SocialShare title={selectedItem.title} summary={selectedItem.summary} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};