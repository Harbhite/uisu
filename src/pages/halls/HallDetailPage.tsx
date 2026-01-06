import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, History, Shield, Trophy, Music } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';

// Mock data for halls - In a real app, this might come from Supabase or the existing halls array in CampusMap
// duplicating for now to ensure we have all fields needed for a detail page
const hallsData = {
  mellamby: {
    name: 'Kenneth Mellamby Hall',
    alias: 'Premier Hall',
    motto: 'Primus Inter Pares',
    desc: 'The first hall of residence, named after the first Principal, Kenneth Mellamby. Known for its culture of gentility and excellence.',
    history: "Founded in 1952, Kenneth Mellamby Hall stands as the oldest hall of residence in the University of Ibadan. It was named after the first principal of the University College, Ibadan, Dr. Kenneth Mellamby. The hall has maintained a reputation for excellence and gentility, often referred to as the 'Gentlemen's Hall'.",
    lore: "Tradition holds that Mellambites are the epitome of gentlemanly conduct. The 'Aro' culture, while present, is often more subtle here compared to other male halls.",
    leadership: [
      { role: 'Hall Chairman', name: 'Student Name' },
      { role: 'Information Minister', name: 'Student Name' }
    ],
    images: ['/placeholder.svg'],
    color: '#C5A059'
  },
  tedder: {
    name: 'Lord Tedder Hall',
    alias: 'Man O Man',
    motto: 'God and Fatherland',
    desc: 'Strategically located near the academic area. Tedderites are known for their political astuteness.',
    history: "Named after Lord Tedder, a Marshal of the Royal Air Force and Chancellor of the University (1950-1967). It is known for its proximity to the academic areas and has produced numerous student union leaders.",
    lore: "Tedderites pride themselves on being politically savvy and intellectually sound. The 'Tedder Box' is a famous spot for debates and public speaking.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#8B4513'
  },
  kuti: {
    name: 'Kuti Hall',
    alias: 'The Fortress',
    motto: 'Dare to Struggle, Dare to Win',
    desc: 'Named after Rev. I.O. Ransome-Kuti. Famous for its radicalism and intellectual contributions.',
    history: "Dedicated to the memory of the late Rev. Israel Oludotun Ransome-Kuti, a distinguished Nigerian educationist. The hall is renowned for its activism and strong stance on student welfare.",
    lore: "Kuti Hall is known as the 'Fortress' due to its unified front in times of struggle. The 'Ancestral Grove' is a sacred ground for hall meetings.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#15803d'
  },
  bello: {
    name: 'Sultan Bello Hall',
    alias: 'The Sultanate',
    motto: 'Nobility',
    desc: 'Named after Sir Ahmadu Bello. The hall prides itself on leadership and annual state address.',
    history: "Opened in 1962 by Sir Ahmadu Bello, the Sardauna of Sokoto. It is known for its 'State of the Nation' address delivered by the Hall Mayor, a tradition that attracts dignitaries from across the country.",
    lore: "Bellites are referred to as 'Nobles' and the hall is governed by a Mayor rather than a Chairman, emphasizing its unique administrative structure.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#1e40af'
  },
  queens: {
    name: 'Queen Elizabeth II Hall',
    alias: 'Queens',
    motto: 'Laborare Est Orare',
    desc: 'Opened by Queen Elizabeth II herself. A female hall known for serenity and elegance.',
    history: "Inaugurated by Her Majesty Queen Elizabeth II in 1956. It was the first female hall of residence and has hosted numerous prominent Nigerian women during their university days.",
    lore: "The hall is known for its beautiful architecture and gardens. The 'Queens' are seen as the matriarchs of the student body.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#7e22ce'
  },
  idia: {
    name: 'Queen Idia Hall',
    alias: 'Amazonia',
    motto: 'Home of Amazons',
    desc: 'Named after Queen Idia of Benin. Largest female hall, vibrant social atmosphere.',
    history: "Named after the warrior Queen Idia of the Benin Kingdom. It is the largest female hall and a hub of social activities and sports within the university.",
    lore: "Idia Hall residents refer to themselves as 'Amazons', reflecting strength and resilience. The hall's gyration and social events are legendary.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#be185d'
  },
  indy: {
    name: 'Independence Hall',
    alias: 'Katanga Republic',
    motto: 'Liberty and Service',
    desc: 'The "Headquarters of Aluta". Established in 1961.',
    history: "Built to commemorate Nigeria's independence in 1960 and officially opened in 1961. It is often referred to as the 'Katanga Republic', asserting a spirit of autonomy and resistance.",
    lore: "Indy Hall is the heartbeat of student activism ('Aluta'). The 'Katangese' are known for their solidarity and the famous 'Aro' culture which is deeply embedded here.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#b91c1c'
  },
  zik: {
    name: 'Nnamdi Azikiwe Hall',
    alias: 'Baluba Kingdom',
    motto: 'Zikism',
    desc: 'Named after Nigeria\'s first President. Largest hall in UI. Famous for "Aroism".',
    history: "Named after Dr. Nnamdi Azikiwe. It is the largest male hall and is located at a distance from the main academic area, giving it a unique, independent character.",
    lore: "Zik Hall is the capital of 'Baluba Kingdom'. Residents are 'Zikites'. The hall is famous for its distinct dialect of 'Aroism' and vigorous gyration sessions.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#d97706'
  },
  awo: {
    name: 'Obafemi Awolowo Hall',
    alias: 'Awo',
    motto: 'Discipline and Integrity',
    desc: 'Largest student accommodation. A city within a city.',
    history: "Named after Chief Obafemi Awolowo. It is a mixed hall (with separate blocks) and accommodates both undergraduate and postgraduate students. It is the largest hall in terms of population.",
    lore: "Awo Hall is often described as a 'City within a City' due to its size and self-sufficiency. It has its own unique political ecosystem.",
    leadership: [],
    images: ['/placeholder.svg'],
    color: '#0f766e'
  }
};

const HallDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hall = id ? hallsData[id as keyof typeof hallsData] : null;

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Hall Not Found</h2>
          <Button onClick={() => navigate('/governance')}>Return to Governance</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO
        title={`${hall.name} - UISU Archive`}
        description={hall.desc}
      />

      {/* Hero Section with Parallax-like effect */}
      <div className="relative h-[60vh] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hall.images[0]})`, backgroundColor: hall.color }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-20 px-6 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                {hall.alias}
              </span>
              <div className="h-px w-10 bg-white/50" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              {hall.name}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-serif italic max-w-2xl">
              "{hall.motto}"
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 -mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 shadow-xl border-t-4"
              style={{ borderTopColor: hall.color }}
            >
              <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                <History size={16} /> History & Origins
              </div>
              <p className="text-lg text-slate-700 leading-relaxed font-light">
                {hall.history}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 text-slate-300 p-10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Shield size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <Shield size={16} /> Hall Lore & Traditions
                </div>
                <p className="text-lg leading-relaxed font-light">
                  {hall.lore}
                </p>
              </div>
            </motion.div>

            {/* Gallery placeholder */}
            <div className="grid grid-cols-2 gap-4">
               {[1, 2].map((i) => (
                 <div key={i} className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative group">
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-white font-bold uppercase tracking-widest text-xs">View</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 shadow-lg border border-slate-100"
            >
              <h3 className="font-serif text-2xl text-slate-800 mb-6 border-b border-slate-100 pb-4">
                Hall Leadership
              </h3>

              {hall.leadership.length > 0 ? (
                <div className="space-y-6">
                  {hall.leadership.map((leader, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Users size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{leader.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{leader.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Leadership information coming soon.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 border border-slate-200 p-8"
            >
               <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">
                 Quick Facts
               </h3>
               <ul className="space-y-4 text-sm text-slate-600">
                 <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                   <span>Established</span>
                   <span className="font-bold">19XX</span>
                 </li>
                 <li className="flex justify-between items-center border-b border-slate-200 pb-2">
                   <span>Capacity</span>
                   <span className="font-bold">~1000 Students</span>
                 </li>
                 <li className="flex justify-between items-center pt-2">
                   <span>Type</span>
                   <span className="font-bold capitalize">Mixed / Male / Female</span>
                 </li>
               </ul>
            </motion.div>

            <Button onClick={() => navigate('/governance')} variant="outline" className="w-full gap-2">
              <ArrowLeft size={14} /> Back to Governance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailPage;
