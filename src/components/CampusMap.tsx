import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { MapPin, X, GraduationCap, Info, ChevronDown, ChevronUp, Map, Navigation, Sparkles, Users, Crown, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Hall {
  id: string;
  name: string;
  alias: string;
  motto: string;
  desc: string;
  notable: string[];
  color: string;
  position: {top: string;left: string;};
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
}];


const typeIcons = {
  male: Shield,
  female: Crown,
  mixed: Users
};

const typeLabels = {
  male: 'Male Hall',
  female: 'Female Hall',
  mixed: 'Mixed Hall'
};

export const CampusMap: React.FC = () => {
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [mapType, setMapType] = useState<'illustrated' | 'live'>('illustrated');
  const [hoveredHall, setHoveredHall] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Map Type Toggle */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {mapType === 'illustrated' ? 'Click on pins to explore halls' : 'View live campus location'}
        </p>
        <div className="flex gap-2 bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setMapType('illustrated')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            mapType === 'illustrated' ?
            'bg-ui-blue text-white shadow-md' :
            'text-slate-500 hover:text-ui-blue hover:bg-white'}`
            }>
            
            <Map size={14} />
            <span>Illustrated</span>
          </button>
          <button
            onClick={() => setMapType('live')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            mapType === 'live' ?
            'bg-ui-blue text-white shadow-md' :
            'text-slate-500 hover:text-ui-blue hover:bg-white'}`
            }>
            
            <Navigation size={14} />
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {mapType === 'illustrated' ?
      <div className="relative w-full h-[550px] md:h-[650px] bg-gradient-to-br from-slate-100 via-slate-50 to-white overflow-hidden border border-slate-200 shadow-inner group select-none">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: `
              linear-gradient(rgba(0,51,102,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,51,102,0.03) 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px'
        }}></div>

          {/* Decorative Elements */}
          <div className="absolute top-6 left-6 pointer-events-none z-10">
            <div className="text-7xl font-serif font-bold text-ui-blue/5 leading-none">UI</div>
            <div className="text-[10px] tracking-[0.5em] uppercase text-slate-300 mt-1 font-bold">Campus Map</div>
          </div>

          {/* Compass */}
          <div className="absolute top-6 right-6 w-16 h-16 bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-slate-200"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <div className="w-full h-0.5 bg-slate-200"></div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-ui-blue">N</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">S</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">W</div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">E</div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm border border-slate-200 p-4 shadow-sm z-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Shield size={12} className="text-ui-blue" />
                <span>Male Hall</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Crown size={12} className="text-pink-600" />
                <span>Female Hall</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Users size={12} className="text-teal-600" />
                
              </div>
            </div>
          </div>

          {/* Hall Pins */}
          {halls.map((hall, index) => {
          const TypeIcon = typeIcons[hall.type];
          const isHovered = hoveredHall === hall.id;
          const isSelected = selectedHall?.id === hall.id;

          return (
            <motion.button
              key={hall.id}
              className="absolute flex items-center justify-center z-20"
              style={{
                top: hall.position.top,
                left: hall.position.left,
                marginLeft: '-24px',
                marginTop: '-24px'
              }}
              onClick={() => setSelectedHall(hall)}
              onMouseEnter={() => setHoveredHall(hall.id)}
              onMouseLeave={() => setHoveredHall(null)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.15 }}>
              
                {/* Pulse Ring */}
                <motion.div
                className="absolute w-12 h-12 rounded-full"
                style={{ backgroundColor: `${hall.color}20` }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }} />
              
                
                {/* Pin Container */}
                <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSelected ? 'ring-4 ring-offset-2 ring-nobel-gold' : ''}`
                }
                style={{
                  backgroundColor: isHovered || isSelected ? hall.color : 'white',
                  borderWidth: '3px',
                  borderColor: hall.color,
                  boxShadow: isHovered || isSelected ? `0 8px 25px ${hall.color}50` : '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                
                  <TypeIcon
                  size={18}
                  style={{ color: isHovered || isSelected ? 'white' : hall.color }} />
                
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && !selectedHall &&
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-30">
                  
                      <div
                    className="px-4 py-2 text-white text-xs font-bold tracking-wide whitespace-nowrap shadow-xl"
                    style={{ backgroundColor: hall.color }}>
                    
                        <div className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">{hall.alias}</div>
                        {hall.name}
                      </div>
                    </motion.div>
                }
                </AnimatePresence>
              </motion.button>);

        })}

          {/* Selected Hall Panel */}
          <AnimatePresence>
            {selectedHall &&
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute top-4 right-4 bottom-4 w-full max-w-xs md:max-w-sm bg-white shadow-2xl border border-slate-200 overflow-hidden z-40 flex flex-col">
            
                {/* Header with color */}
                <div
              className="p-6 text-white relative overflow-hidden"
              style={{ backgroundColor: selectedHall.color }}>
              
                  <button
                onClick={() => setSelectedHall(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                
                    <X size={16} />
                  </button>
                  
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/20 text-[10px] font-bold uppercase tracking-widest mb-3">
                    {React.createElement(typeIcons[selectedHall.type], { size: 12 })}
                    {typeLabels[selectedHall.type]}
                  </div>
                  
                  <h3 className="font-serif text-2xl leading-tight mb-1">{selectedHall.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{selectedHall.alias}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Motto */}
                  <div className="bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Motto</p>
                    <p className="font-serif italic text-ui-blue text-lg">"{selectedHall.motto}"</p>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={14} className="text-nobel-gold" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">About</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedHall.desc}
                    </p>
                  </div>

                  {/* Notable Alumni */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={14} className="text-nobel-gold" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Notable Alumni</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedHall.notable.map((person, i) =>
                  <span
                    key={i}
                    className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 font-medium">
                    
                          {person}
                        </span>
                  )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <Link
                to={`/governance/hall/${selectedHall.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-ui-dark transition-colors">
                
                    <Sparkles size={14} />
                    View Full Profile
                  </Link>
                </div>
              </motion.div>
          }
          </AnimatePresence>

          {/* Mobile hint */}
          <div className="absolute bottom-4 right-4 text-slate-400 text-xs md:hidden pointer-events-none bg-white/80 backdrop-blur-sm px-3 py-2 border border-slate-200">
            <MapPin size={12} className="inline mr-1" />
            Tap pins to explore
          </div>
        </div> :

      <div className="w-full h-[550px] md:h-[650px] bg-slate-100 overflow-hidden border border-slate-200 shadow-inner relative">
          <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.270929286467!2d3.896740614150868!3d7.441852894629474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1039fc7c30000001%3A0x6b40209c11867e35!2sUniversity%20of%20Ibadan!5e0!3m2!1sen!2sng!4v1714574932371!5m2!1sen!2sng"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
          
          {/* Overlay info - moved to top right */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 p-4 shadow-lg max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Navigation size={16} className="text-ui-blue" />
              <p className="text-sm font-bold text-ui-blue">University of Ibadan</p>
            </div>
            <p className="text-xs text-slate-500">
              Oduduwa Road, Ibadan, Oyo State, Nigeria
            </p>
          </div>
        </div>
      }
    </div>);

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
            className={`bg-white border-t-4 shadow-sm cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? 'shadow-lg ring-1 ring-slate-200 row-span-2' : 'hover:shadow-md'}`}
            style={{ borderTopColor: hall.color }}>
            
             <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider border border-slate-200">
                    {hall.alias}
                  </div>
                  <div className="text-slate-400">
                    {isSelected ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
               </div>

               <h3 className="font-serif text-xl font-bold text-ui-blue mb-2">{hall.name}</h3>
               <p className="text-sm text-slate-500 italic font-serif mb-0">"{hall.motto}"</p>

               <AnimatePresence>
                  {isSelected &&
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="border-t border-slate-100 pt-4">
                  
                       <p className="text-slate-700 text-sm leading-relaxed mb-6">
                         {hall.desc}
                       </p>
                       
                       <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <GraduationCap size={14} /> Notable Figures
                          </h4>
                          <div className="flex flex-wrap gap-2">
                             {hall.notable.map((person, idx) =>
                      <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-1.5 font-medium">
                                 {person}
                               </span>
                      )}
                          </div>
                       </div>
                    </motion.div>
                }
               </AnimatePresence>
             </div>
          </motion.div>);

      })}
    </div>);

};