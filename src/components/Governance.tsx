import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark, Users, Scale, Gavel, Mic, Book, Coins, Shield, Trophy, Star, ArrowRight, Settings, Plus, Loader2, Briefcase, FileText, Heart, Globe, Building2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { CommitteeManagement } from './CommitteeManagement';
import { Button } from '@/components/ui/button';

interface GovernanceProps {
  onBack: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- Helper Components ---

const ActivityIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

const RoleCard = ({ title, desc, icon, isDark = false }: { title: string, desc: string, icon: React.ReactNode, isDark?: boolean }) => (
    <motion.div
        variants={itemVariants}
        className={`p-8 border transition-all duration-300 group relative overflow-hidden ${isDark ? "bg-ui-blue border-ui-blue text-white" : "bg-white border-slate-200 hover:border-nobel-gold text-slate-900"}`}
    >
        <div className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${isDark ? "bg-nobel-gold" : "bg-nobel-gold"}`}></div>

        <div className={`mb-6 ${isDark ? "text-nobel-gold" : "text-ui-blue"}`}>
            {icon}
        </div>
        <h3 className="font-serif text-3xl mb-4 leading-none">{title}</h3>
        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
    </motion.div>
);

const CommitteeCard = ({ title, desc, icon, type }: { title: string, desc: string, icon: React.ReactNode, type: string }) => {
    // Simple slugify for the ID
    const slug = title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');

    return (
        <Link
            to={`/committee/${slug}`}
            className="block h-full"
        >
            <motion.div
                variants={itemVariants}
                className="bg-white p-8 border border-slate-200 hover:shadow-lg hover:border-nobel-gold transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-slate-50 text-ui-blue group-hover:bg-ui-blue group-hover:text-white transition-colors">
                        {icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-1">{type}</span>
                </div>
                <h4 className="font-serif text-2xl text-ui-blue mb-3 group-hover:text-nobel-gold transition-colors">{title}</h4>
                <p className="text-sm text-slate-500 font-light leading-relaxed flex-grow">
                    {desc}
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-nobel-gold transition-colors">View Mandate</span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-nobel-gold transition-all" />
                </div>
            </motion.div>
        </Link>
    );
};

const AccordionSection = ({ title, children, defaultOpen }: { title: string, children: React.ReactNode, defaultOpen: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 bg-white rounded-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-nobel-gold"></span>
                    <h3 className="font-serif text-2xl text-ui-blue">{title}</h3>
                </div>
                <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="text-slate-400" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 border-t border-slate-100">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {children}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Data ---

const legislativeCommittees = [
    {
        title: "Finance & Budget Committee",
        icon: <Coins size={24} />,
        desc: "Scrutinizes the budget proposals of the Executive Council, monitors spending, and ensures financial transparency.",
        type: "Standing"
    },
    {
        title: "Disciplinary Committee",
        icon: <Scale size={24} />,
        desc: "Investigates allegations of misconduct, maintains order, and upholds the constitution and code of conduct.",
        type: "Judicial"
    },
    {
        title: "Audit Committee",
        icon: <FileText size={24} />,
        desc: "Independently reviews financial records and ensures compliance with financial regulations.",
        type: "Standing"
    }
];

const executiveCommittees = [
    {
        title: "Student Welfare Board",
        icon: <Heart size={24} />,
        desc: "Oversees student accommodation, pricing regulation, and general welfare conditions on campus.",
        type: "Statutory"
    },
    {
        title: "Sports Council",
        icon: <Trophy size={24} />,
        desc: "Organizes the SU Cup, Inter-Faculty Games, and promotes sporting activities across the university.",
        type: "Social"
    },
    {
        title: "Press & Publicity Committee",
        icon: <Globe size={24} />,
        desc: "Manages the Union's public relations, press releases, social media, and media presence.",
        type: "Executive"
    },
    {
        title: "Academic Committee",
        icon: <Briefcase size={24} />,
        desc: "Liaises with the university management on academic matters, calendars, and library services.",
        type: "Statutory"
    },
    {
        title: "Projects & Capital Committee",
        icon: <Building2 size={24} />,
        desc: "Oversees the construction, renovation, and maintenance of Union projects and assets.",
        type: "Ad-hoc"
    },
    {
        title: "Health Committee",
        icon: <ActivityIcon size={24} />,
        desc: "Ensures the Jaja Clinic serves students effectively, organizes health drives, and promotes health awareness.",
        type: "Welfare"
    }
];

export const GovernancePage: React.FC<GovernanceProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'cec' | 'src' | 'committees'>('cec');
  const [committeeManagementOpen, setCommitteeManagementOpen] = useState(false);
  const [dbCommittees, setDbCommittees] = useState<any[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const { isStaff } = useAdminCheck();

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    setLoadingCommittees(true);
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('is_active', true)
      .order('title');
    
    if (!error && data) {
      setDbCommittees(data);
    }
    setLoadingCommittees(false);
  };

  const getIconComponent = (iconName: string | null) => {
    const icons: Record<string, React.ReactNode> = {
      'Coins': <Coins size={24} />,
      'Scale': <Scale size={24} />,
      'FileText': <FileText size={24} />,
      'Heart': <Heart size={24} />,
      'Trophy': <Trophy size={24} />,
      'Globe': <Globe size={24} />,
      'Briefcase': <Briefcase size={24} />,
      'Building2': <Building2 size={24} />,
      'Users': <Users size={24} />,
    };
    return icons[iconName || ''] || <Users size={24} />;
  };

  // Filter database committees by type
  const dbLegislativeCommittees = dbCommittees.filter(c => 
    ['Standing', 'Judicial'].includes(c.type)
  );
  const dbExecutiveCommittees = dbCommittees.filter(c => 
    ['Statutory', 'Executive', 'Ad-hoc', 'Social', 'Welfare'].includes(c.type)
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="container mx-auto px-6">
        <Link
            to="/"
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
            <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                <ArrowLeft size={14} />
            </div>
            <span>Back to Home</span>
        </Link>

        <div className="mb-20 relative">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-4"
             >
                <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">The Constitution</span>
             </motion.div>
             
             <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-9xl font-serif text-ui-blue leading-[0.9]"
             >
                Union <br/> <span className="italic text-slate-300">Structure</span>
             </motion.h1>
             
             <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light"
             >
                Modeled after the Federal Republic. A complete separation of powers to guarantee accountability.
             </motion.p>
        </div>

        <div className="flex flex-wrap gap-8 mb-16 border-b border-slate-200">
            {['cec', 'src', 'committees'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as 'cec' | 'src' | 'committees')}
                    className={`pb-6 text-sm font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === tab ? 'text-ui-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <span className="flex items-center gap-3">
                        {tab === 'cec' && "The Executive"}
                        {tab === 'src' && "The Legislative"}
                        {tab === 'committees' && "Committees"}
                    </span>
                    {activeTab === tab && (
                        <motion.div 
                            layoutId="tab-line" 
                            className="absolute bottom-0 left-0 w-full h-1 bg-nobel-gold" 
                        />
                    )}
                </button>
            ))}
        </div>

        <div className="min-h-[500px]">
            {activeTab === 'cec' && (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <RoleCard 
                            title="The President" 
                            icon={<Landmark size={32}/>}
                            desc="The Number One Student. The President is the Chief Executive Officer of the Union, responsible for the general administration and representing the Union in all capacities."
                            isDark
                        />
                        <RoleCard 
                            title="General Secretary" 
                            icon={<Book size={32}/>}
                            desc="The Scribe of the Union. Responsible for the Union's correspondence, keeping records, and managing the Secretariat."
                        />
                        <RoleCard 
                            title="Vice President" 
                            icon={<Trophy size={32}/>}
                            desc="Constitutional head of the Academic and Welfare Committee. The VP deputizes for the President and traditionally oversees academic competitions."
                        />
                         <RoleCard 
                            title="Treasurer" 
                            icon={<Coins size={32}/>}
                            desc="Custodian of the Union's funds. Ensures that all monies are banked and keeps strict records of income and expenditure."
                        />
                        <RoleCard 
                            title="Asst. General Secretary" 
                            icon={<Book size={32}/>}
                            desc="Assists the General Secretary and records minutes of meetings. Often in charge of specific internal duties within the Secretariat."
                        />
                        <RoleCard 
                            title="House Secretary" 
                            icon={<Shield size={32}/>}
                            desc="The Minister of Welfare. Responsible for the maintenance of the Union building (SUB) and general welfare of students in halls."
                        />
                        <RoleCard 
                            title="Public Relations" 
                            icon={<Mic size={32}/>}
                            desc="The Image Maker. Responsible for information dissemination, press releases, and managing the Union's public image."
                        />
                        <RoleCard 
                            title="Sports Secretary" 
                            icon={<Trophy size={32}/>}
                            desc="Organizes sporting activities, the Dean's Cup, and the Inter-Hall games. Promotes physical fitness among Uites."
                        />
                    </div>
                </motion.div>
            )}

            {activeTab === 'src' && (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white p-10 rounded-sm border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="lg:col-span-2 relative z-10">
                            <h3 className="font-serif text-4xl md:text-5xl mb-6 text-ui-blue">The Students' Representative Council</h3>
                            <p className="text-xl text-slate-600 leading-relaxed mb-8 font-light">
                                The SRC is the highest policy-making body of the Union. It consists of elected representatives from every Hall of Residence and Faculty Constituency.
                            </p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">Composition</h4>
                                    <p className="text-slate-800 font-serif text-lg">
                                        109 Senators representing the diverse population of Uites.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">Key Powers</h4>
                                    <ul className="space-y-2">
                                        {['Budget Approval', 'Impeachment', 'Bye-Laws', 'Oversight'].map(item => (
                                            <li key={item} className="flex items-center gap-2 text-slate-800 font-medium">
                                                <ArrowRight size={12} className="text-nobel-gold"/> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-slate-100/50 skew-x-12 translate-x-20"></div>
                        <div className="relative z-10 flex items-center justify-center">
                             <Gavel size={120} className="text-slate-200" />
                        </div>
                    </motion.div>
                    
                    <div>
                         <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                             <div className="h-px flex-1 bg-slate-300"></div>
                             <span className="font-serif text-2xl text-ui-blue">Principal Officers</span>
                             <div className="h-px flex-1 bg-slate-300"></div>
                         </motion.div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <RoleCard 
                                title="The Speaker" 
                                icon={<Gavel size={32}/>}
                                desc="The Number Three Student. Presides over all SRC meetings, interprets standing orders, and maintains order in the house."
                                isDark
                            />
                             <RoleCard 
                                title="Deputy Speaker" 
                                icon={<Users size={32}/>}
                                desc="Assists the Speaker and presides in their absence. Often heads key legislative committees."
                            />
                             <RoleCard 
                                title="Clerk of the House" 
                                icon={<Book size={32}/>}
                                desc="The administrative head of the SRC. Records votes, proceedings, and maintains the legislative archives."
                            />
                         </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'committees' && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto space-y-6"
                >
                   {isStaff && (
                     <div className="flex justify-end mb-4">
                       <Button onClick={() => setCommitteeManagementOpen(true)} variant="outline">
                         <Settings className="mr-2" size={16} /> Manage Committees
                       </Button>
                     </div>
                   )}

                   {loadingCommittees ? (
                     <div className="flex items-center justify-center py-16">
                       <Loader2 className="animate-spin text-slate-400" size={32} />
                     </div>
                   ) : (
                     <>
                       <AccordionSection title="Legislative Committees" defaultOpen={true}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dbLegislativeCommittees.length > 0 ? (
                                  dbLegislativeCommittees.map((committee) => (
                                    <CommitteeCard 
                                      key={committee.id} 
                                      title={committee.title}
                                      desc={committee.description || ''}
                                      icon={getIconComponent(committee.icon_name)}
                                      type={committee.type}
                                    />
                                  ))
                                ) : (
                                  legislativeCommittees.map((committee, index) => (
                                    <CommitteeCard key={index} {...committee} />
                                  ))
                                )}
                            </div>
                       </AccordionSection>

                       <AccordionSection title="Executive Committees" defaultOpen={false}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dbExecutiveCommittees.length > 0 ? (
                                  dbExecutiveCommittees.map((committee) => (
                                    <CommitteeCard 
                                      key={committee.id}
                                      title={committee.title}
                                      desc={committee.description || ''}
                                      icon={getIconComponent(committee.icon_name)}
                                      type={committee.type}
                                    />
                                  ))
                                ) : (
                                  executiveCommittees.map((committee, index) => (
                                    <CommitteeCard key={index} {...committee} />
                                  ))
                                )}
                            </div>
                       </AccordionSection>
                     </>
                   )}
                </motion.div>
            )}

        </div>
      </div>

      <CommitteeManagement 
        isOpen={committeeManagementOpen}
        onClose={() => setCommitteeManagementOpen(false)}
        onUpdate={fetchCommittees}
      />
    </div>
  );
};
