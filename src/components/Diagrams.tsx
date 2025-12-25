import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Scale, Landmark, BookOpen } from 'lucide-react';

export const TimelineDiagram: React.FC = () => {
  const [activeEra, setActiveEra] = useState<string>('1948');
  
  const eras = [
    { id: '1948', title: 'The Foundation', desc: 'The University College Ibadan is established. The Students Union is formed shortly after as the first in Nigeria, setting the precedent for student activism.', icon: <Landmark size={20}/> },
    { id: '1971', title: 'Kunle Adepeju', desc: 'A dark day. Kunle Adepeju becomes the first student martyr in Nigeria during a protest against cafeteria management and poor welfare conditions.', icon: <Users size={20}/> },
    { id: '1978', title: 'Ali Must Go', desc: 'UI students play a central role in the nationwide "Ali Must Go" protests against education commercialization, solidifying the Aluta spirit.', icon: <Scale size={20}/> },
    { id: '2024', title: 'Digital Era', desc: 'The Union evolves, embracing technology for elections (e-voting) and digital archives while maintaining its fierce advocacy for welfare.', icon: <Calendar size={20}/> },
  ];

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8 w-full relative overflow-hidden">
      <h3 className="font-serif text-2xl mb-2 text-ui-blue relative z-10">Historical Timeline</h3>
      <p className="text-sm text-stone-500 mb-8 text-center max-w-md relative z-10">
        Trace the pivotal moments that shaped the Union.
      </p>
      
      <div className="relative w-full max-w-2xl z-10">
         <div className="absolute top-8 left-0 w-full h-1 bg-stone-200 rounded-full"></div>
         
         <div className="flex justify-between relative z-10 px-2">
             {eras.map((era) => (
                 <motion.button
                    key={era.id}
                    onClick={() => setActiveEra(era.id)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-3 relative group outline-none"
                 >
                     {activeEra === era.id && (
                        <>
                            <motion.div
                                layoutId="glow"
                                className="absolute top-0 w-16 h-16 rounded-full bg-nobel-gold/20 blur-md -z-10"
                                transition={{ duration: 0.3 }}
                            />
                            <motion.div
                                className="absolute top-0 w-16 h-16 rounded-full border-2 border-nobel-gold/50 -z-10"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            />
                        </>
                     )}

                     <motion.div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors duration-300 bg-white z-10 ${
                            activeEra === era.id 
                            ? 'border-nobel-gold text-ui-blue shadow-lg' 
                            : 'border-stone-200 text-stone-400 group-hover:border-ui-blue group-hover:text-ui-blue'
                        }`}
                        animate={{ 
                            borderColor: activeEra === era.id ? '#C5A059' : '#E7E5E4',
                            backgroundColor: activeEra === era.id ? '#FFFFFF' : '#FFFFFF',
                            scale: activeEra === era.id ? 1.1 : 1
                        }}
                     >
                        {era.icon}
                     </motion.div>
                     
                     <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold font-serif transition-colors duration-300 ${activeEra === era.id ? 'text-ui-blue' : 'text-stone-400 group-hover:text-stone-600'}`}>
                            {era.id}
                        </span>
                        {activeEra === era.id && (
                            <motion.div 
                                layoutId="dot" 
                                className="w-1.5 h-1.5 bg-nobel-gold rounded-full mt-1"
                            />
                        )}
                     </div>
                 </motion.button>
             ))}
         </div>
      </div>

      <div className="mt-8 w-full max-w-lg min-h-[140px] text-center perspective-1000 z-10">
         <AnimatePresence mode="wait">
             {eras.map((era) => activeEra === era.id && (
                 <motion.div
                    key={era.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="bg-stone-50 p-6 rounded-lg border border-stone-100 shadow-sm"
                 >
                     <h4 className="font-serif text-xl text-ui-blue mb-2">{era.title}</h4>
                     <p className="text-stone-600 leading-relaxed">{era.desc}</p>
                 </motion.div>
             ))}
         </AnimatePresence>
      </div>
    </div>
  );
};

export const StructureDiagram: React.FC = () => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center p-8 bg-[#F5F4F0] rounded-xl border border-stone-200 my-8 w-full">
      <h3 className="font-serif text-xl mb-4 text-ui-blue">Structure of the Union</h3>
      <p className="text-sm text-stone-600 mb-8 text-center max-w-md">
        The three arms of government ensuring checks and balances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <motion.div 
            className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm cursor-default relative overflow-hidden group"
            onMouseEnter={() => setHoveredSection('cec')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-nobel-gold"></div>
             <motion.div 
                className="mb-4 text-nobel-gold"
                animate={{ rotateY: hoveredSection === 'cec' ? 360 : 0 }}
                transition={{ duration: 0.6 }}
             >
                <Landmark size={32}/>
             </motion.div>
             <h4 className="font-bold text-stone-900 mb-2">The CEC</h4>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Executive Council</p>
             <p className="text-sm text-stone-600">Headed by the President. Responsible for daily administration, welfare, and implementation of policies.</p>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm cursor-default relative overflow-hidden group"
            onMouseEnter={() => setHoveredSection('src')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-stone-800"></div>
             <motion.div 
                className="mb-4 text-stone-800"
                animate={{ scale: hoveredSection === 'src' ? 1.2 : 1 }}
                transition={{ type: 'spring' }}
             >
                <Users size={32}/>
             </motion.div>
             <h4 className="font-bold text-stone-900 mb-2">The SRC</h4>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Representative Council</p>
             <p className="text-sm text-stone-600">Composed of representatives from all faculties and halls. They make laws and check the executive.</p>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm cursor-default relative overflow-hidden group"
            onMouseEnter={() => setHoveredSection('judiciary')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-900"></div>
             <motion.div 
                className="mb-4 text-blue-900"
                animate={{ rotate: hoveredSection === 'judiciary' ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
             >
                <Scale size={32}/>
             </motion.div>
             <h4 className="font-bold text-stone-900 mb-2">The Judiciary</h4>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Student Court</p>
             <p className="text-sm text-stone-600">Interprets the constitution and settles disputes. Ensures justice prevails in union affairs.</p>
          </motion.div>
      </div>
    </div>
  );
};

export const PopulationChart: React.FC = () => {
    const data = [
        { year: 1948, count: 1, label: 'Pioneers' },
        { year: 1960, count: 3, label: 'Independence' },
        { year: 1990, count: 6, label: 'Expansion' },
        { year: 2024, count: 8, label: 'Present Day' }
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-ui-blue text-stone-100 rounded-xl my-8 border border-ui-dark shadow-lg w-full">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-serif text-xl mb-2 text-nobel-gold">The Growing Legion</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    From a humble beginning of 104 students in 1948, the Union now represents the interests of over 35,000 intellectuals. "Greatest Uites" are a force to be reckoned with.
                </p>
                <div className="flex items-center gap-3 mt-4">
                    <BookOpen className="text-nobel-gold" size={20} />
                    <span className="text-xs font-bold tracking-widest uppercase text-stone-500">Knowledge & Service</span>
                </div>
            </div>
            
            <div className="relative w-full md:w-96 h-64 bg-ui-dark/50 rounded-xl border border-ui-dark/50 overflow-hidden p-6">
               <div className="flex items-end justify-around h-full px-4 pb-0">
                    {data.map((item, i) => (
                        <div key={item.year} className="flex flex-col items-center gap-2">
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${item.count * 10}%` }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                                className={`w-12 md:w-16 rounded-t-md ${i === 3 ? 'bg-nobel-gold' : 'bg-white/20'}`}
                            ></motion.div>
                            <span className="text-xs font-mono text-stone-400">{item.year}</span>
                        </div>
                    ))}
               </div>
            </div>
        </div>
    )
};
