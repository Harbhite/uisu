/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Users, Star, Globe, BookOpen, Heart, Gavel, Cpu, Palette, Calendar, Award, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Props for the Communities component.
 */
interface CommunitiesProps {
  /** Callback for navigating back to the previous screen. */
  onBack: () => void;
  /** Callback for selecting a specific club to view details. */
  onClubSelect: (id: string) => void;
}

/**
 * Valid categories for classifying clubs and societies.
 */
type Category = 'All' | 'Sociocultural' | 'Academic' | 'Religious' | 'Press' | 'Tech' | 'Sports' | 'Politics';

/**
 * Represents a student club, society, or association.
 */
export interface Club {
    /** Unique identifier for the club. */
    id: string;
    /** Full name of the club. */
    name: string;
    /** Optional acronym or abbreviation. */
    acronym?: string;
    /** The category the club belongs to. */
    category: string;
    /** The year the club was founded. */
    founded: string;
    /** The club's motto or slogan. */
    motto: string;
    /** A detailed description of the club's mission and activities. */
    description: string;
    /** A list of key activities or events organized by the club. */
    activities: string[];
    /** Name of the current president (optional). */
    president?: string;
    /** Brand color for the club. */
    color: string;
    /** Icon name for the club. */
    iconName?: string;
}

// Helper function to get icon component from icon name
const getIconComponent = (iconName?: string, size: number = 24) => {
    switch (iconName) {
        case 'Award': return <Award size={size} />;
        case 'Globe': return <Globe size={size} />;
        case 'Heart': return <Heart size={size} />;
        case 'Cpu': return <Cpu size={size} />;
        case 'Users': return <Users size={size} />;
        case 'Gavel': return <Gavel size={size} />;
        case 'Palette': return <Palette size={size} />;
        default: return <Star size={size} />;
    }
};

// --- COMPONENT FOR EXPANDABLE ACTIVITY ITEMS ---
const ActivityCard: React.FC<{ activity: string }> = ({ activity }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-5 bg-card border rounded-xl transition-all cursor-pointer group ${
                isOpen ? 'border-nobel-gold shadow-lg ring-1 ring-nobel-gold/20' : 'border-border hover:border-nobel-gold hover:shadow-md'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.div 
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                            isOpen ? 'bg-nobel-gold text-white' : 'bg-muted text-nobel-gold group-hover:bg-ui-blue/5'
                        }`}
                    >
                        <ChevronRight size={20} />
                    </motion.div>
                    <h4 className={`font-serif text-lg leading-tight transition-colors ${isOpen ? 'text-ui-blue font-bold' : 'text-foreground'}`}>
                        {activity}
                    </h4>
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-border pl-[3.5rem]">
                            <p className="text-sm text-muted-foreground leading-relaxed font-light mb-4">
                                Participate in the annual {activity}. A cornerstone event that brings together members for professional development, networking, and celebration of our shared values.
                            </p>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold hover:text-ui-blue transition-colors flex items-center gap-2">
                                Learn More <ArrowRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- STANDALONE PAGE: CLUB DETAIL ---
interface ClubDetailProps {
    clubId: string;
    onBack: () => void;
}

export const ClubDetailPage: React.FC<ClubDetailProps> = ({ clubId, onBack }) => {
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClub = async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select('*')
                .eq('id', clubId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching club:', error);
            } else if (data) {
                setClub({
                    id: data.id,
                    name: data.name,
                    acronym: data.acronym || undefined,
                    category: data.category,
                    founded: data.founded || '',
                    motto: data.motto || '',
                    description: data.description || '',
                    activities: data.activities || [],
                    president: data.president || undefined,
                    color: data.color || '#6d28d9',
                    iconName: data.icon_name || undefined
                });
            }
            setLoading(false);
        };

        fetchClub();
    }, [clubId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
            </div>
        );
    }

    if (!club) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-serif text-foreground">Club Not Found</h2>
                <button onClick={onBack} className="mt-4 text-ui-blue underline">Go Back</button>
            </div>
        </div>
    );

    const icon = getIconComponent(club.iconName);

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-6">
                {/* Back Navigation */}
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Directory</span>
                </button>

                {/* Hero Header */}
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-12">
                    <div className="h-48 md:h-64 relative bg-foreground overflow-hidden">
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 opacity-80" style={{ backgroundColor: club.color }}></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-150 text-white">
                            {icon}
                        </div>
                    </div>
                    
                    <div className="px-8 pb-8 md:px-12 md:pb-12 -mt-16 relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-32 h-32 md:w-40 md:h-40 bg-card rounded-2xl shadow-xl flex items-center justify-center text-5xl md:text-6xl border-4 border-card"
                                style={{ color: club.color }}
                            >
                                {icon}
                            </motion.div>
                            
                            <div className="flex-1 pt-4 md:pt-16">
                                <div className="flex flex-wrap gap-3 mb-3">
                                    <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded-full border border-border">
                                        {club.category}
                                    </span>
                                    {club.acronym && (
                                        <span className="px-3 py-1 bg-ui-blue/10 text-ui-blue text-[10px] font-bold uppercase tracking-widest rounded-full border border-ui-blue/20">
                                            {club.acronym}
                                        </span>
                                    )}
                                </div>
                                <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-none mb-2">{club.name}</h1>
                                <p className="font-serif text-xl md:text-2xl text-muted-foreground italic">"{club.motto}"</p>
                            </div>

                            <div className="pt-4 md:pt-16 flex gap-4">
                                <button className="px-6 py-3 bg-ui-blue text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all shadow-md">
                                    Join Club
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h3 className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                                <BookOpen size={16} /> About The Association
                            </h3>
                            <p className="text-xl text-muted-foreground leading-relaxed font-light">
                                {club.description}
                            </p>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                                <Star size={16} /> Key Activities & Events
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {club.activities.map((activity, idx) => (
                                    <ActivityCard key={idx} activity={activity} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                         <div className="p-6 bg-card border border-border rounded-xl">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Quick Facts</h4>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Established</div>
                                    <div className="font-serif text-xl text-foreground">{club.founded}</div>
                                </div>
                                
                                <div className="h-px bg-border w-full"></div>

                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Membership Status</div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="font-serif text-lg text-foreground">Open for Registration</span>
                                    </div>
                                </div>

                                <div className="h-px bg-border w-full"></div>

                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Affiliation</div>
                                    <div className="font-serif text-lg text-foreground">Registered with Student Affairs</div>
                                </div>
                            </div>
                         </div>

                         <div className="p-6 bg-ui-blue text-white rounded-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Get Involved</h4>
                                <p className="text-sm text-white/80 mb-4 leading-relaxed">
                                    Interested in joining {club.name}? Visit their secretariat or contact the PRO.
                                </p>
                                <button className="w-full py-3 bg-white/10 border border-white/20 hover:bg-white hover:text-ui-blue rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                                    Contact Executive
                                </button>
                            </div>
                            <Users size={100} className="absolute -bottom-4 -right-4 text-white/5 rotate-12" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DIRECTORY LIST ---
export const CommunitiesPage: React.FC<CommunitiesProps> = ({ onBack, onClubSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubs = async () => {
            const { data, error } = await supabase
                .from('clubs')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching clubs:', error);
            } else if (data) {
                const mapped: Club[] = data.map(club => ({
                    id: club.id,
                    name: club.name,
                    acronym: club.acronym || undefined,
                    category: club.category,
                    founded: club.founded || '',
                    motto: club.motto || '',
                    description: club.description || '',
                    activities: club.activities || [],
                    president: club.president || undefined,
                    color: club.color || '#6d28d9',
                    iconName: club.icon_name || undefined
                }));
                setClubs(mapped);
            }
            setLoading(false);
        };

        fetchClubs();
    }, []);

    const categories: Category[] = ['All', 'Sociocultural', 'Academic', 'Religious', 'Press', 'Tech', 'Sports', 'Politics'];

    const filteredClubs = clubs.filter(club => {
        const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (club.acronym && club.acronym.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-6">
                {/* Header Navigation */}
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Home</span>
                </button>

                {/* Hero Content */}
                <div className="mb-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <Users className="text-nobel-gold w-6 h-6" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Directory</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9] mb-6"
                    >
                        Clubs & <br/> <span className="italic text-muted-foreground">Societies</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-muted-foreground font-light max-w-2xl leading-relaxed"
                    >
                        The lifeblood of the University. From the ancient traditions of Sigma to the modern innovations of the Developer Clubs.
                    </motion.p>
                </div>

                {/* Search & Filter */}
                <div className="mb-16 space-y-8 py-4 border-b border-border">
                    <div className="relative max-w-2xl">
                        <input 
                            type="text" 
                            placeholder="Find a club, society, or association..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-full focus:border-nobel-gold focus:outline-none shadow-sm text-lg font-serif transition-shadow focus:shadow-md text-foreground"
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                                    activeCategory === cat 
                                    ? 'bg-ui-blue text-white shadow-md transform scale-105' 
                                    : 'bg-card text-muted-foreground border border-border hover:border-ui-blue'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredClubs.map((club) => (
                                <motion.div
                                    layout
                                    key={club.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => onClubSelect(club.id)}
                                    className="bg-card p-8 rounded-xl border border-border hover:border-nobel-gold hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[320px]"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-ui-blue group-hover:bg-ui-blue group-hover:text-white transition-colors">
                                                {getIconComponent(club.iconName)}
                                            </div>
                                            <div className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest rounded border border-border">
                                                {club.category}
                                            </div>
                                        </div>

                                        <h3 className="font-serif text-2xl text-ui-blue mb-2 group-hover:text-nobel-gold transition-colors leading-tight">
                                            {club.name}
                                        </h3>
                                        {club.acronym && <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">{club.acronym}</div>}
                                        
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-light">
                                            {club.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <Calendar size={12} /> Est. {club.founded}
                                        </div>
                                        <ArrowRight size={16} className="text-muted group-hover:text-nobel-gold group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};