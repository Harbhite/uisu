import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { LeaderCard } from '@/components/LeaderCard';
import { executives, principalOfficers, hallLeaders, legislators } from '@/lib/data';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface CurrentLeadersProps {
    onBack: () => void;
}

export const CurrentLeaders: React.FC<CurrentLeadersProps> = ({ onBack }) => {
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

        <div className="mb-20">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-4"
             >
                <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Leadership</span>
             </motion.div>

             <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9]"
             >
                Current <br/> <span className="italic text-slate-300">Leaders</span>
             </motion.h1>

             <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light"
             >
                Meet the dedicated individuals serving the student body for the current academic session.
             </motion.p>
        </div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-20"
        >
            {/* Executives Section */}
            <section>
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-serif text-ui-blue">The Executive Council</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {executives.map((leader, index) => (
                        <LeaderCard key={index} leader={leader} />
                    ))}
                </div>
            </section>

             {/* Principal Officers Section */}
             <section>
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-serif text-ui-blue">Principal Officers (SRC)</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {principalOfficers.map((leader, index) => (
                         <LeaderCard key={index} leader={leader} />
                    ))}
                </div>
            </section>

             {/* Hall Majority Leaders Section */}
             <section>
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-serif text-ui-blue">Hall Majority Leaders</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {hallLeaders.map((leader, index) => (
                         <LeaderCard key={index} leader={leader} />
                    ))}
                </div>
            </section>

            {/* Legislators List */}
            <section>
                 <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-serif text-ui-blue">Honourable Members</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Constituency</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {legislators.map((leg, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{leg.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{leg.constituency}</td>
                                        <td className="px-6 py-4 text-slate-500">{leg.level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </motion.div>
      </div>
    </div>
  );
};
