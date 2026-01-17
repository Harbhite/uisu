import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mic, AlertTriangle, Users } from 'lucide-react';

const events = [
  {
    id: 1,
    year: "1960",
    title: "The Defence Pact",
    icon: Shield,
    color: "bg-blue-600",
    desc: "The Anglo-Nigerian Defence Pact was a proposed agreement that would have allowed Britain to maintain military bases in Nigeria. NUNS mobilized nationwide protests, storming the parliament. The government was forced to abrogate the pact.",
    impact: "Established students as the 'Conscience of the Nation'."
  },
  {
    id: 2,
    year: "1978",
    title: "Ali Must Go",
    icon: Mic,
    color: "bg-red-600",
    desc: "Triggered by a 50k increase in meal ticket prices. The military government deployed soldiers. Several students, including Akintunde Ojo (UNILAG), were killed. Segun Okeowo, NUNS President, was expelled from the Constituent Assembly.",
    impact: "NUNS was banned. The spirit of Aluta was cemented in blood."
  },
  {
    id: 3,
    year: "1980s",
    title: "Birth of NANS",
    icon: Users,
    color: "bg-green-600",
    desc: "Following the ban on NUNS, the National Association of Nigerian Students (NANS) emerged. The 80s saw fierce resistance against SAP (Structural Adjustment Programs) and military dictatorship.",
    impact: "Student unionism became the primary opposition to military rule."
  },
  {
    id: 4,
    year: "1990s",
    title: "The Dark Ages",
    icon: AlertTriangle,
    color: "bg-orange-600",
    desc: "Cultism infiltrated campuses, often sponsored by the state to break student solidarity. Unionism struggled between genuine activism and internal violence. Yet, the voice was never silenced.",
    impact: "A period of resilience amidst infiltration and decay."
  }
];

export const NigerianEvolution = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section className="min-h-screen py-24 px-6 relative bg-ui-dark">
      <div className="container mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <h2 className="text-5xl font-serif font-bold text-white mb-4">Guardians of the Republic</h2>
            <p className="text-slate-400">Tap a card to explore the milestones of Nigerian Student Unionism.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              layoutId={`card-${event.id}`}
              onClick={() => setSelectedId(event.id)}
              className={`cursor-pointer rounded-2xl p-6 ${event.color} bg-opacity-10 border border-white/10 hover:bg-opacity-20 transition-colors h-80 flex flex-col justify-between`}
              whileHover={{ scale: 1.02 }}
            >
              <div>
                 <span className="inline-block p-3 rounded-full bg-white/10 mb-4">
                    <event.icon size={24} className="text-white" />
                 </span>
                 <h3 className="text-4xl font-bold text-white/20 mb-2">{event.year}</h3>
                 <h4 className="text-2xl font-bold text-white">{event.title}</h4>
              </div>
              <p className="text-sm text-white/60">Read more &rarr;</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedId && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedId(null)}
            >
              {events.filter(e => e.id === selectedId).map(event => (
                  <motion.div
                    key={event.id}
                    layoutId={`card-${event.id}`}
                    className="bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-white/20 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                     <div className={`h-32 ${event.color} flex items-center px-8`}>
                        <event.icon size={48} className="text-white opacity-50" />
                        <h2 className="text-4xl font-bold text-white ml-6">{event.title}</h2>
                     </div>
                     <div className="p-8">
                        <div className="flex items-center mb-6">
                            <span className="text-nobel-gold font-mono text-xl">{event.year}</span>
                            <div className="h-px bg-white/10 flex-grow ml-4"></div>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                            {event.desc}
                        </p>
                        <div className="bg-white/5 p-4 rounded-lg border-l-4 border-nobel-gold">
                            <h5 className="text-xs uppercase tracking-widest text-slate-500 mb-1">Impact</h5>
                            <p className="text-white italic">{event.impact}</p>
                        </div>
                        <button
                            onClick={() => setSelectedId(null)}
                            className="mt-8 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                            Close
                        </button>
                     </div>
                  </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
