import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, GraduationCap, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface Hall {
  id: string;
  name: string;
  alias: string;
  motto: string;
  desc: string;
  notable: string[];
  color: string;
  position: { top: string; left: string };
  type: 'male' | 'female' | 'mixed';
}

export const halls: Hall[] = [
  {
    id: 'mellamby',
    name: 'Kenneth Mellamby Hall',
    alias: 'Premier Hall',
    motto: 'Primus Inter Pares',
    desc: 'The first hall of residence, named after the first Principal, Kenneth Mellamby. Known for its culture of gentility and excellence. Mellambites are regarded as the "Gentlemen" of the university.',
    notable: ['Wole Soyinka', 'Emeka Anyaoku', 'Gamaliel Onosode'],
    color: '#C5A059',
    position: { top: '70%', left: '42%' },
    type: 'male'
  },
  {
    id: 'tedder',
    name: 'Lord Tedder Hall',
    alias: 'Man O Man',
    motto: 'God and Fatherland',
    desc: 'Strategically located near the academic area. Tedderites are known for their political astuteness and strong defense of their territory.',
    notable: ['Kayode Fayemi', 'Godwin Obaseki'],
    color: '#8B4513',
    position: { top: '70%', left: '52%' },
    type: 'male'
  },
  {
    id: 'kuti',
    name: 'Kuti Hall',
    alias: 'The Fortress',
    motto: 'Dare to Struggle, Dare to Win',
    desc: 'Named after Rev. I.O. Ransome-Kuti. Famous for its radicalism and intellectual contributions to unionism. Kuti Hall is often seen as a bastion of consciousness.',
    notable: ['Femi Falana', 'Babatunde Fashola'],
    color: '#15803d',
    position: { top: '78%', left: '60%' },
    type: 'male'
  },
  {
    id: 'bello',
    name: 'Sultan Bello Hall',
    alias: 'The Sultanate',
    motto: 'Nobility',
    desc: 'Named after Sir Ahmadu Bello. The hall prides itself on leadership ("The Mayor") and the annual "State of the Nation" address. Bellites are called "Nobles".',
    notable: ['Ahmadu Ali', "Shehu Musa Yar'Adua"],
    color: '#1e40af',
    position: { top: '60%', left: '48%' },
    type: 'male'
  },
  {
    id: 'queens',
    name: 'Queen Elizabeth II Hall',
    alias: 'Queens',
    motto: 'Laborare Est Orare',
    desc: 'Opened by Queen Elizabeth II herself in 1956. It is a female hall known for its serenity and elegance. The residents are the "Queens".',
    notable: ['Florence Nwapa', 'Ameyo Adadevoh'],
    color: '#7e22ce',
    position: { top: '55%', left: '30%' },
    type: 'female'
  },
  {
    id: 'idia',
    name: 'Queen Idia Hall',
    alias: 'Amazonia',
    motto: 'Home of Amazons',
    desc: 'Named after the legendary Queen Idia of Benin. It is the largest female hall and known for its vibrant social atmosphere and strong solidarity.',
    notable: ['Funke Akindele', 'Toyin Abraham'],
    color: '#be185d',
    position: { top: '30%', left: '25%' },
    type: 'female'
  },
  {
    id: 'indy',
    name: 'Independence Hall',
    alias: 'Katanga Republic',
    motto: 'Liberty and Service',
    desc: "The \"Headquarters of Aluta\". Established in 1961. Katangese are the fiercest defenders of student rights and the custodians of the union's radical traditions.",
    notable: ['Segun Okeowo', 'Sowore Omoyele'],
    color: '#b91c1c',
    position: { top: '25%', left: '65%' },
    type: 'male'
  },
  {
    id: 'zik',
    name: 'Nnamdi Azikiwe Hall',
    alias: 'Baluba Kingdom',
    motto: 'Zikism',
    desc: "Named after Nigeria's first President. It is the largest hall in UI. Famous for \"Aroism\", Gyration, and a unique culture that blends humor with intellect.",
    notable: ['Basketmouth', 'Godswill Akpabio'],
    color: '#d97706',
    position: { top: '25%', left: '75%' },
    type: 'male'
  },
  {
    id: 'awo',
    name: 'Obafemi Awolowo Hall',
    alias: 'Awo',
    motto: 'Discipline and Integrity',
    desc: 'One of the largest student accommodations in West Africa. It houses both undergraduate and postgraduate students and is a city within a city.',
    notable: ['Biyi Bandele'],
    color: '#0f766e',
    position: { top: '15%', left: '40%' },
    type: 'mixed'
  }
];

export const CampusMap: React.FC = () => {
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [mapType, setMapType] = useState<'illustrated' | 'live'>('illustrated');

  return (
    <div className="space-y-4">
        <div className="flex justify-end space-x-2">
            <button
                onClick={() => setMapType('illustrated')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mapType === 'illustrated' ? 'bg-ui-blue text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
                Illustrated Map
            </button>
            <button
                onClick={() => setMapType('live')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mapType === 'live' ? 'bg-ui-blue text-white' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
                Live Map
            </button>
        </div>

        {mapType === 'illustrated' ? (
            <div className="relative w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner group select-none">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}></div>

            <div className="absolute top-6 left-6 text-slate-300 pointer-events-none">
                <div className="text-6xl font-serif font-bold opacity-20">UI</div>
                <div className="text-xs tracking-[0.5em] uppercase opacity-40 mt-2">Campus Map</div>
            </div>

            {halls.map((hall) => (
                <motion.button
                key={hall.id}
                className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center group/pin cursor-pointer z-10"
                style={{ top: hall.position.top, left: hall.position.left }}
                onClick={() => setSelectedHall(hall)}
                whileHover={{ scale: 1.1 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                >
                <motion.div
                    className="w-full h-full flex items-center justify-center bg-white rounded-full shadow-md border-2 transition-colors group-hover/pin:bg-slate-100 relative"
                    style={{ borderColor: hall.color }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                >
                    <MapPin size={20} style={{ color: hall.color }} />
                </motion.div>

                <div className="absolute top-14 whitespace-nowrap bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-20 font-medium tracking-wide uppercase">
                        {hall.name}
                    </div>
                </motion.button>
            ))}

            <AnimatePresence>
                {selectedHall && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="absolute top-4 right-4 bottom-4 w-full md:w-80 bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-slate-200 p-6 overflow-y-auto z-30 flex flex-col"
                >
                    <button
                    onClick={() => setSelectedHall(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                    <X size={20} />
                    </button>

                    <div className="mb-6">
                        <div className="inline-block px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white mb-3" style={{ backgroundColor: selectedHall.color }}>
                            {selectedHall.alias}
                        </div>
                        <h3 className="font-serif text-2xl text-slate-900 leading-tight">{selectedHall.name}</h3>
                        <div className="h-0.5 w-12 mt-3 bg-slate-200"></div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Info size={12} /> About
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {selectedHall.desc}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motto</h4>
                            <p className="font-serif italic text-slate-800 text-lg">"{selectedHall.motto}"</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <GraduationCap size={12} /> Notable Alumni
                            </h4>
                            <ul className="text-sm text-slate-600 space-y-2">
                                {selectedHall.notable.map((person, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-slate-300">•</span> {person}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 text-center">
                        <button className="text-xs text-ui-blue font-bold uppercase tracking-widest hover:underline">View Hall Anthem</button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs md:hidden pointer-events-none">
                Tap a pin to explore
            </div>
            </div>
        ) : (
            <div className="w-full h-[600px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.270929286467!2d3.896740614150868!3d7.441852894629474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1039fc7c30000001%3A0x6b40209c11867e35!2sUniversity%20of%20Ibadan!5e0!3m2!1sen!2sng!4v1714574932371!5m2!1sen!2sng"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        )}
    </div>
  );
};

export const HallGrid: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {halls.map((hall) => {
        const isSelected = selectedId === hall.id;
        return (
          <motion.div
            key={hall.id}
            layout
            onClick={() => setSelectedId(isSelected ? null : hall.id)}
            className={`bg-white border-t-4 rounded-xl shadow-sm cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? 'shadow-lg ring-1 ring-slate-200 row-span-2' : 'hover:shadow-md'}`}
            style={{ borderTopColor: hall.color }}
          >
             <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-200">
                    {hall.alias}
                  </div>
                  <div className="text-slate-400">
                    {isSelected ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
               </div>

               <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">{hall.name}</h3>
               <p className="text-sm text-slate-500 italic font-serif mb-0">"{hall.motto}"</p>

               <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="border-t border-slate-100 pt-4"
                    >
                       <p className="text-slate-700 text-sm leading-relaxed mb-6">
                         {hall.desc}
                       </p>
                       
                       <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <GraduationCap size={14} /> Notable Figures
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {hall.notable.map((person, idx) => (
                               <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full font-medium">
                                 {person}
                               </span>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
             </div>
          </motion.div>
        );
      })}
    </div>
  );
};
