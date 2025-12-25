/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Users, ChevronDown, ChevronUp, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Props for the PastLeadersPage component.
 */
interface PastLeadersProps {
  /** Callback for navigating back to the previous screen. */
  onBack: () => void;
}

/**
 * Represents a member of the executive council.
 */
interface ExecutiveMember {
    /** The role or position held (e.g., "Vice President"). */
    role: string;
    /** The name of the executive member. */
    name: string;
    /** Optional alias or nickname. */
    alias?: string;
}

/**
 * Represents a Union administration tenure.
 */
interface Administration {
    /** Unique identifier */
    id: string;
    /** The academic session year (e.g., "2023/2024"). */
    session: string;
    /** The name of the President. */
    president: string;
    /** The President's alias. */
    alias: string;
    /** The administration's motto. */
    motto: string;
    /** Key events or achievements during the tenure. */
    notableEvents: string;
    /** The status of the administration (e.g., "Completed", "Active"). */
    status: 'Completed' | 'Suspended' | 'Impeached' | 'Active';
    /** List of executive team members. */
    team: ExecutiveMember[];
}

/**
 * A page displaying a list of past Union administrations (Hall of Fame).
 * Allows searching and expanding details for each administration.
 *
 * @param {PastLeadersProps} props - The component props.
 * @returns {JSX.Element} The rendered PastLeadersPage component.
 */
export const PastLeadersPage: React.FC<PastLeadersProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [administrations, setAdministrations] = useState<Administration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdministrations = async () => {
      const { data, error } = await supabase
        .from('administrations')
        .select('*')
        .order('session', { ascending: false });

      if (error) {
        console.error('Error fetching administrations:', error);
      } else if (data) {
        const mapped: Administration[] = data.map(admin => ({
          id: admin.id,
          session: admin.session,
          president: admin.president,
          alias: admin.alias || '',
          motto: admin.motto || '',
          notableEvents: admin.notable_events || '',
          status: (admin.status as Administration['status']) || 'Completed',
          team: (admin.team as unknown as ExecutiveMember[]) || []
        }));
        setAdministrations(mapped);
      }
      setLoading(false);
    };

    fetchAdministrations();
  }, []);

  const filteredAdmins = administrations.filter(admin => 
    admin.president.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.session.includes(searchTerm) ||
    admin.alias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (session: string) => {
      setExpandedId(expandedId === session ? null : session);
  };

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
            <span>Back to Home</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
            <div>
                <div className="flex items-center gap-4 mb-4">
                   <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                   <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">Hall of Fame</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9]">
                    Executive <br/> <span className="italic text-muted-foreground">Archive</span>
                </h1>
            </div>
            
            {/* MICRO-ANIMATION 10: Search Input Focus Animation */}
            <motion.div 
                className="relative w-full md:w-96"
                animate={{ scale: isSearchFocused ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <input 
                    type="text" 
                    placeholder="Search leaders or years..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-4 pr-12 py-4 bg-card border-b-2 border-border focus:border-nobel-gold focus:outline-none text-foreground placeholder-muted-foreground text-lg font-serif transition-colors shadow-sm focus:shadow-md"
                />
                <Search className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-nobel-gold' : 'text-muted-foreground'}`} size={20} />
            </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-nobel-gold" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
              {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin, index) => (
                      <motion.div 
                          key={admin.session}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card group relative overflow-hidden border border-transparent hover:border-border hover:shadow-xl transition-all duration-500 rounded-sm"
                      >
                          {/* Selection Bar */}
                          <div className={`absolute left-0 top-0 h-full w-1 transition-colors duration-300 ${expandedId === admin.session ? 'bg-nobel-gold' : 'bg-muted group-hover:bg-nobel-gold/50'}`}></div>

                          <div className="p-8 cursor-pointer" onClick={() => toggleExpand(admin.session)}>
                              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                                  {/* Date */}
                                  <div className="min-w-[120px]">
                                      <div className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-1">Session</div>
                                      <div className="font-serif text-2xl text-ui-blue">{admin.session}</div>
                                  </div>
                                  
                                  {/* Name */}
                                  <div className="flex-1">
                                      <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-2">
                                          <h3 className="font-serif text-3xl text-ui-blue">{admin.president}</h3>
                                          <span className="text-sm font-bold tracking-widest uppercase text-nobel-gold">"{admin.alias}"</span>
                                      </div>
                                      <p className="text-muted-foreground leading-relaxed max-w-2xl font-light">{admin.notableEvents}</p>
                                  </div>

                                  {/* Status & Toggle */}
                                  <div className="min-w-[160px] flex flex-row lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-4">
                                      <StatusBadge status={admin.status} />
                                      
                                      <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-all">
                                          {expandedId === admin.session ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                      </button>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Expanded Team Section */}
                          <AnimatePresence>
                              {expandedId === admin.session && (
                                  <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="bg-muted"
                                  >
                                      <div className="p-8 border-t border-border ml-1">
                                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                              <Users size={14} /> The Executive Council
                                          </h4>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                              {admin.team.map((member, idx) => (
                                                  <div key={idx} className="bg-card p-6 border border-border hover:border-muted-foreground transition-colors">
                                                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{member.role}</div>
                                                      <div className="font-serif text-lg text-ui-blue">{member.name}</div>
                                                      {member.alias && <div className="text-xs text-nobel-gold mt-1 italic">"{member.alias}"</div>}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </motion.div>
                  ))
              ) : (
                  <div className="py-20 text-center text-muted-foreground">
                      <p className="font-serif text-xl italic">No records found for "{searchTerm}"</p>
                  </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A helper component to display status badges for administrations.
 *
 * @param {object} props - The component props.
 * @param {string} props.status - The status text to display.
 * @returns {JSX.Element} The rendered StatusBadge component.
 */
const StatusBadge = ({ status }: { status: string }) => {
    let styles = "bg-muted text-muted-foreground";
    if (status === 'Active') styles = "bg-green-50 text-green-700 border-green-100";
    if (status === 'Suspended') styles = "bg-red-50 text-red-700 border-red-100";
    if (status === 'Impeached') styles = "bg-orange-50 text-orange-700 border-orange-100";

    return (
        <motion.span 
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles} inline-block`}
        >
            {status}
        </motion.span>
    )
}