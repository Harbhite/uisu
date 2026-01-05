import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark, Users, Scale, Gavel, Mic, Book, Coins, Shield, Trophy, Star, ArrowRight, MapPin } from 'lucide-react';
import { halls } from '@/components/CampusMap';

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

export const GovernancePage: React.FC<GovernanceProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'cec' | 'src' | 'halls'>('cec');

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
            {['cec', 'src', 'halls'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as 'cec' | 'src' | 'halls')}
                    className={`pb-6 text-sm font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === tab ? 'text-ui-blue' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <span className="flex items-center gap-3">
                        {tab === 'cec' && "The Executive"}
                        {tab === 'src' && "The Legislative"}
                        {tab === 'halls' && "The Republics"}
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

            {activeTab === 'halls' && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {halls.map((hall) => (
                        <Link to={`/governance/hall/${hall.id}`} key={hall.id}>
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                                className="bg-white border group relative overflow-hidden h-full shadow-sm hover:shadow-xl transition-all duration-500"
                                style={{ borderColor: `${hall.color}30` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: hall.color }} />
                                <div className="p-8 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 rounded-full bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                            <MapPin size={24} style={{ color: hall.color }} />
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                                            {hall.alias}
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-serif text-slate-800 mb-2 group-hover:text-ui-blue transition-colors">
                                        {hall.name}
                                    </h3>
                                    <p className="font-serif italic text-slate-400 text-sm mb-6">"{hall.motto}"</p>

                                    <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">
                                        {hall.desc}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ui-blue group-hover:gap-4 transition-all">
                                        Explore Republic <ArrowRight size={14} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: hall.color }} />
                            </motion.div>
                        </Link>
                    ))}
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

        </div>
      </div>
    </div>
  );
};

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
