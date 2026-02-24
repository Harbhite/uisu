/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Users, Star, Globe, BookOpen, Heart, Gavel, Cpu, Palette, Calendar, Award, ChevronRight, ArrowRight, Loader2, Edit, Mail, MapPin, ExternalLink, Clock, Twitter, Instagram, Facebook, Linkedin, Plus, Trash2, Check, X as XIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClubEditModal } from '@/components/ClubEditModal';
import { CommunitiesSkeleton } from '@/components/skeletons/CommunitiesSkeleton';

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

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

/**
 * Represents a student club, society, or association.
 */
/** Represents an activity with title and description (for UI) */
export interface ClubActivity {
    title: string;
    description?: string;
}

// Helper to parse activity from string (supports JSON format or plain string)
export const parseActivity = (activity: string): ClubActivity => {
    try {
        const parsed = JSON.parse(activity);
        if (typeof parsed === 'object' && parsed.title) {
            return parsed as ClubActivity;
        }
    } catch {
        // Not JSON, treat as plain title
    }
    return { title: activity };
};

// Helper to serialize activity to string for DB storage
export const serializeActivity = (activity: ClubActivity): string => {
    if (activity.description) {
        return JSON.stringify(activity);
    }
    return activity.title;
};

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
    activities: ClubActivity[];
    /** Name of the current president (optional). */
    president?: string;
    /** Brand color for the club. */
    color: string;
    /** Icon name for the club. */
    iconName?: string;
    /** Image/logo URL for the club. */
    imageUrl?: string;
    /** Header/banner image URL for the club. */
    headerImageUrl?: string;
    /** Contact email */
    email?: string;
    /** Website URL */
    website?: string;
    /** Meeting location */
    meetingLocation?: string;
    /** Meeting schedule */
    meetingSchedule?: string;
    /** Social media links */
    socialLinks?: SocialLinks;
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

// --- COMPONENT FOR EDITABLE ACTIVITY ITEMS ---
interface ActivityCardProps {
    activity: string;
    activityDescription?: string;
    isEditing?: boolean;
    onEdit?: (newTitle: string, newDescription: string) => void;
    onDelete?: () => void;
    color?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
    activity, 
    activityDescription = '', 
    isEditing, 
    onEdit, 
    onDelete, 
    color 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(activity);
    const [editDescription, setEditDescription] = useState(
        activityDescription || `Participate in the annual ${activity}. A cornerstone event that brings together members for professional development, networking, and celebration of our shared values.`
    );
    const [isEditable, setIsEditable] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setEditTitle(activity);
        setEditDescription(
            activityDescription || `Participate in the annual ${activity}. A cornerstone event that brings together members for professional development, networking, and celebration of our shared values.`
        );
    }, [activity, activityDescription]);

    if (isEditing && isEditable) {
        return (
            <div className="p-4 bg-card border border-accent rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-muted/50 font-serif font-semibold"
                        placeholder="Activity title..."
                        autoFocus
                    />
                </div>
                <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full min-h-[80px] p-3 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Describe this activity..."
                />
                <div className="flex justify-end gap-2">
                    <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                            setEditTitle(activity);
                            setEditDescription(activityDescription || `Participate in the annual ${activity}. A cornerstone event that brings together members for professional development, networking, and celebration of our shared values.`);
                            setIsEditable(false);
                        }}
                    >
                        <XIcon size={14} className="mr-1" /> Cancel
                    </Button>
                    <Button 
                        size="sm"
                        onClick={() => {
                            onEdit?.(editTitle, editDescription);
                            setIsEditable(false);
                        }}
                    >
                        <Check size={14} className="mr-1" /> Save
                    </Button>
                </div>
            </div>
        );
    }

    const displayDescription = activityDescription || `Participate in the annual ${activity}. A cornerstone event that brings together members for professional development, networking, and celebration of our shared values.`;

    return (
        <div 
            onClick={() => !isEditing && setIsOpen(!isOpen)}
            className={`p-5 bg-card border rounded-xl transition-all cursor-pointer group relative ${
                isOpen ? 'border-accent shadow-lg ring-1 ring-accent/20' : 'border-border hover:border-accent hover:shadow-md'
            }`}
        >
            {isEditing && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditable(true);
                        }}
                    >
                        <Edit size={12} />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.div 
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0`}
                        style={{ 
                            backgroundColor: isOpen ? color : 'hsl(var(--muted))',
                            color: isOpen ? 'white' : color
                        }}
                    >
                        <ChevronRight size={20} />
                    </motion.div>
                    <h4 className={`font-serif text-lg leading-tight transition-colors ${isOpen ? 'text-foreground font-bold' : 'text-foreground'}`}>
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
                                {displayDescription}
                            </p>
                            <button 
                                className="text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-colors flex items-center gap-2"
                                style={{ color }}
                            >
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [isInlineEditing, setIsInlineEditing] = useState(false);
    const [editedActivities, setEditedActivities] = useState<ClubActivity[]>([]);
    const [newActivity, setNewActivity] = useState('');
    const { isStaff } = useAdminCheck();

    const fetchClub = async () => {
        const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', clubId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching club:', error);
        } else if (data) {
            // Convert string[] from DB to ClubActivity[]
            const activities: ClubActivity[] = (data.activities || []).map((a: string) => parseActivity(a));
            
            const mapped: Club = {
                id: data.id,
                name: data.name,
                acronym: data.acronym || undefined,
                category: data.category,
                founded: data.founded || '',
                motto: data.motto || '',
                description: data.description || '',
                activities,
                president: data.president || undefined,
                color: data.color || '#6d28d9',
                iconName: data.icon_name || undefined,
                imageUrl: data.image_url || undefined,
                headerImageUrl: data.header_image_url || undefined,
                email: data.email || undefined,
                website: data.website || undefined,
                meetingLocation: data.meeting_location || undefined,
                meetingSchedule: data.meeting_schedule || undefined,
                socialLinks: (data.social_links as SocialLinks) || {}
            };
            setClub(mapped);
            setEditedActivities(mapped.activities);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClub();
    }, [clubId]);

    const saveInlineChanges = async () => {
        if (!club) return;
        
        try {
            // Convert ClubActivity[] back to string[] for DB
            const activitiesForDb = editedActivities.map(a => serializeActivity(a));
            
            const { error } = await supabase
                .from('clubs')
                .update({ activities: activitiesForDb })
                .eq('id', club.id);
            
            if (error) throw error;
            setIsInlineEditing(false);
            fetchClub();
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleActivityEdit = (index: number, newTitle: string, newDescription: string) => {
        const updated = [...editedActivities];
        updated[index] = { title: newTitle, description: newDescription };
        setEditedActivities(updated);
    };

    const handleActivityDelete = (index: number) => {
        setEditedActivities(prev => prev.filter((_, i) => i !== index));
    };

    const addNewActivity = () => {
        if (newActivity.trim()) {
            setEditedActivities(prev => [...prev, { title: newActivity.trim() }]);
            setNewActivity('');
        }
    };

    if (loading) {
        return <CommunitiesSkeleton />;
    }

    if (!club) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-serif text-foreground">Club Not Found</h2>
                <button onClick={onBack} className="mt-4 text-accent underline">Go Back</button>
            </div>
        </div>
    );

    const icon = getIconComponent(club.iconName, 80);
    const hasSocials = club.socialLinks && Object.values(club.socialLinks).some(v => v);

    return (
        <div className="min-h-screen bg-background">
            {/* Edit Modal */}
            <ClubEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                club={club}
                onSave={() => fetchClub()}
            />

            {/* Hero Banner */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                {/* Background */}
                {club.headerImageUrl ? (
                    <img 
                        src={club.headerImageUrl} 
                        alt={`${club.name} banner`}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: club.color }}>
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                            {React.cloneElement(icon as React.ReactElement, { size: 400 })}
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>

                {/* Navigation */}
                <div className="absolute top-0 left-0 right-0 z-20 pt-24 px-6">
                    <div className="container mx-auto flex items-center justify-between">
                        <button 
                            onClick={onBack}
                            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
                        >
                            <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                                <ArrowLeft size={16} />
                            </div>
                            <span>Directory</span>
                        </button>

                        {isStaff && (
                            <Button
                                onClick={() => setShowEditModal(true)}
                                variant="outline"
                                size="sm"
                                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-primary"
                            >
                                <Edit size={14} className="mr-2" />
                                Edit Club
                            </Button>
                        )}
                    </div>
                </div>

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="container mx-auto px-6 pb-8">
                    {/* Mobile: Horizontal layout matching desktop alignment */}
                    <div className="flex flex-row gap-4 md:gap-6 items-center">
                        {/* Logo */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 md:w-36 md:h-36 bg-card rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center border-2 md:border-4 border-background overflow-hidden shrink-0"
                            style={{ color: club.color }}
                        >
                            {club.imageUrl ? (
                                <img 
                                    src={club.imageUrl} 
                                    alt={`${club.name} logo`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                React.cloneElement(icon as React.ReactElement, { size: 36 })
                            )}
                        </motion.div>

                        {/* Title - Left aligned on all screens */}
                        <div className="flex-1 text-left">
                            <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
                                <span 
                                    className="px-2 md:px-3 py-0.5 md:py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full text-white"
                                    style={{ backgroundColor: club.color }}
                                >
                                    {club.category}
                                </span>
                                {club.acronym && (
                                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20">
                                        {club.acronym}
                                    </span>
                                )}
                            </div>
                            <h1 className="font-serif text-2xl md:text-6xl text-foreground leading-tight md:leading-none mb-1 md:mb-2">{club.name}</h1>
                            {club.motto && (
                                <p className="font-serif text-sm md:text-xl text-muted-foreground italic line-clamp-2 md:line-clamp-none">"{club.motto}"</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                                <BookOpen size={16} className="text-accent" /> About The Association
                            </h3>
                            <div className="bg-card border border-border rounded-2xl p-8">
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {club.description || 'No description available.'}
                                </p>
                            </div>
                        </motion.section>

                        {/* President */}
                        {club.president && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3 className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
                                    <Users size={16} className="text-accent" /> Leadership
                                </h3>
                                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6">
                                    <div 
                                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                                        style={{ backgroundColor: club.color }}
                                    >
                                        {club.president.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-serif text-xl font-bold text-foreground">{club.president}</p>
                                        <p className="text-sm text-muted-foreground">President</p>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Activities */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    <Star size={16} className="text-accent" /> Key Activities & Events
                                </h3>
                                {isStaff && (
                                    <div className="flex gap-2">
                                        {isInlineEditing ? (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setIsInlineEditing(false);
                                                    setEditedActivities(club.activities);
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={saveInlineChanges}>
                                                    Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => setIsInlineEditing(true)}>
                                                <Edit size={14} className="mr-2" />
                                                Edit Activities
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Add new activity input when editing */}
                            {isInlineEditing && (
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        value={newActivity}
                                        onChange={(e) => setNewActivity(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addNewActivity()}
                                        placeholder="Add new activity..."
                                        className="bg-muted/50"
                                    />
                                    <Button onClick={addNewActivity} variant="outline" size="icon">
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(isInlineEditing ? editedActivities : club.activities).length > 0 ? (
                                    (isInlineEditing ? editedActivities : club.activities).map((activity, idx) => (
                                        <ActivityCard 
                                            key={idx} 
                                            activity={activity.title}
                                            activityDescription={activity.description}
                                            isEditing={isInlineEditing}
                                            onEdit={(newTitle, newDesc) => handleActivityEdit(idx, newTitle, newDesc)}
                                            onDelete={() => handleActivityDelete(idx)}
                                            color={club.color}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                                        No activities listed yet.
                                        {isStaff && !isInlineEditing && (
                                            <button 
                                                onClick={() => setIsInlineEditing(true)}
                                                className="block mx-auto mt-2 text-accent hover:underline text-sm"
                                            >
                                                Add activities
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {/* Sidebar */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Quick Facts */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Quick Facts</h4>
                            
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Established</div>
                                        <div className="font-serif text-lg text-foreground">{club.founded || 'Unknown'}</div>
                                    </div>
                                </div>
                                
                                <div className="h-px bg-border"></div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Membership Status</div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="font-serif text-base text-foreground">Open</span>
                                        </div>
                                    </div>
                                </div>

                                {club.meetingSchedule && (
                                    <>
                                        <div className="h-px bg-border"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Meeting Schedule</div>
                                                <div className="font-serif text-base text-foreground">{club.meetingSchedule}</div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {club.meetingLocation && (
                                    <>
                                        <div className="h-px bg-border"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Meeting Location</div>
                                                <div className="font-serif text-base text-foreground">{club.meetingLocation}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        {hasSocials && (
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Connect With Us</h4>
                                <div className="flex gap-3">
                                    {club.socialLinks?.twitter && (
                                        <a 
                                            href={club.socialLinks.twitter} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <Twitter size={18} />
                                        </a>
                                    )}
                                    {club.socialLinks?.instagram && (
                                        <a 
                                            href={club.socialLinks.instagram} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <Instagram size={18} />
                                        </a>
                                    )}
                                    {club.socialLinks?.facebook && (
                                        <a 
                                            href={club.socialLinks.facebook} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <Facebook size={18} />
                                        </a>
                                    )}
                                    {club.socialLinks?.linkedin && (
                                        <a 
                                            href={club.socialLinks.linkedin} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA Card */}
                        <div 
                            className="rounded-2xl p-6 relative overflow-hidden text-white"
                            style={{ backgroundColor: club.color }}
                        >
                            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Get Involved</h4>
                                <p className="text-sm text-white/90 mb-6 leading-relaxed">
                                    Ready to join {club.acronym || club.name}? Connect with the executive team.
                                </p>
                                <div className="space-y-3">
                                    {club.email ? (
                                        <a 
                                            href={`mailto:${club.email}`}
                                            className="w-full py-3 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Mail size={14} />
                                            Contact Executive
                                        </a>
                                    ) : (
                                        <button className="w-full py-3 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                                            <Mail size={14} />
                                            Contact Executive
                                        </button>
                                    )}
                                    {club.website ? (
                                        <a 
                                            href={club.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 bg-white/10 border border-white/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink size={14} />
                                            Visit Website
                                        </a>
                                    ) : (
                                        <button className="w-full py-3 bg-white/10 border border-white/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                                            <ExternalLink size={14} />
                                            Visit Secretariat
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Users size={120} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />
                        </div>
                    </motion.div>
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
                    activities: (club.activities || []).map((a: string) => parseActivity(a)),
                    president: club.president || undefined,
                    color: club.color || '#6d28d9',
                    iconName: club.icon_name || undefined,
                    imageUrl: club.image_url || undefined,
                    headerImageUrl: club.header_image_url || undefined,
                    email: club.email || undefined,
                    website: club.website || undefined,
                    meetingLocation: club.meeting_location || undefined,
                    meetingSchedule: club.meeting_schedule || undefined,
                    socialLinks: (club.social_links as SocialLinks) || {}
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-6">
                {/* Header Navigation */}
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-border group-hover:border-accent transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Home</span>
                </button>

                {/* Page Header */}
                <div className="mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <Users className="text-accent w-6 h-6" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Directory</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-serif text-primary leading-[0.9] mb-8"
                    >
                        Clubs & <br/> <span className="italic text-muted-foreground/30">Societies</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl"
                    >
                        Explore the vibrant community of student organizations at the University of Ibadan. 
                        From academic societies to cultural associations, find your tribe.
                    </motion.p>
                </div>

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    {/* Search */}
                    <div className="relative max-w-md mb-6">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search clubs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border transition-all ${
                                    activeCategory === cat 
                                        ? 'bg-accent text-white border-accent' 
                                        : 'border-border hover:border-accent text-muted-foreground hover:text-accent'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : (
                    /* Clubs Grid */
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredClubs.map((club) => (
                                <motion.div
                                    key={club.id}
                                    variants={cardVariants}
                                    layout
                                    onClick={() => onClubSelect(club.id)}
                                    className="group cursor-pointer"
                                >
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full relative">
                                        {/* Top Accent Bar */}
                                        <div 
                                            className="h-1 w-full transition-all duration-300 group-hover:h-2"
                                            style={{ backgroundColor: club.color }}
                                        />

                                        {/* Glass overlay on hover */}
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            style={{
                                                background: `linear-gradient(135deg, ${club.color}10 0%, transparent 50%)`
                                            }}
                                        />

                                        <div className="p-6 relative z-10">
                                            {/* Header */}
                                            <div className="flex items-start gap-4 mb-4">
                                                {/* Logo */}
                                                <div 
                                                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-border group-hover:border-accent transition-colors"
                                                    style={{ color: club.color }}
                                                >
                                                    {club.imageUrl ? (
                                                        <img src={club.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        getIconComponent(club.iconName, 24)
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <span 
                                                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1"
                                                        style={{ backgroundColor: `${club.color}20`, color: club.color }}
                                                    >
                                                        {club.category}
                                                    </span>
                                                    <h3 className="font-serif text-lg font-bold text-foreground leading-tight group-hover:text-accent transition-colors truncate">
                                                        {club.acronym || club.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Full name if acronym exists */}
                                            {club.acronym && (
                                                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{club.name}</p>
                                            )}

                                            {/* Motto */}
                                            {club.motto && (
                                                <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2 font-serif">
                                                    "{club.motto}"
                                                </p>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    Est. {club.founded || '—'}
                                                </span>
                                                <span 
                                                    className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all group-hover:gap-2"
                                                    style={{ color: club.color }}
                                                >
                                                    View <ArrowRight size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && filteredClubs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-serif text-foreground mb-2">No clubs found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};