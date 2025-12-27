import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Award, Facebook, Twitter, Instagram, Linkedin, Star, ArrowRight } from 'lucide-react';

interface Leader {
  name: string;
  role: string;
  image: string;
  bio: string;
  email: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const executives: Leader[] = [
  {
    name: "Samuel Samson",
    role: "President",
    image: "/placeholder.svg",
    bio: "Samuel is a final year student of Law, dedicated to student welfare and academic excellence. His vision is to build a union that works for everyone.",
    email: "president@uisu.org",
    socials: { twitter: "#", linkedin: "#" }
  },
  {
    name: "Bolaji Ahmed",
    role: "Vice President",
    image: "/placeholder.svg",
    bio: "Bolaji is passionate about creating a supportive environment for all students. She oversees the Academic and Welfare committee.",
    email: "vp@uisu.org",
    socials: { instagram: "#", linkedin: "#" }
  },
  {
    name: "Chukwuma David",
    role: "General Secretary",
    image: "/placeholder.svg",
    bio: "David ensures the smooth running of the secretariat. He is known for his attention to detail and organizational skills.",
    email: "gensec@uisu.org",
    socials: { twitter: "#" }
  },
   {
    name: "Adebayo Tolu",
    role: "Public Relations Officer",
    image: "/placeholder.svg",
    bio: "Tolu manages the image of the union. He is the bridge between the union and the public.",
    email: "pro@uisu.org",
    socials: { twitter: "#", instagram: "#" }
  },
];

const principalOfficers: Leader[] = [
    {
        name: "Hon. Michael Okpara",
        role: "The Speaker",
        image: "/placeholder.svg",
        bio: "Presiding officer of the SRC. Dedicated to legislative integrity.",
        email: "speaker@uisu.org",
        socials: { linkedin: "#" }
    },
    {
        name: "Hon. Sarah Johnson",
        role: "Deputy Speaker",
        image: "/placeholder.svg",
        bio: "Assists the speaker in all legislative duties.",
        email: "deputy.speaker@uisu.org",
        socials: {}
    },
    {
        name: "Hon. Ibrahim Musa",
        role: "Clerk",
        image: "/placeholder.svg",
        bio: "Head of the legislative administration.",
        email: "clerk@uisu.org",
        socials: {}
    }
];

const legislators = [
    { constituency: "Kenneth Mellamby Hall", name: "Hon. Adekunle Gold", level: "400" },
    { constituency: "Kenneth Mellamby Hall", name: "Hon. Simi Kosoko", level: "300" },
    { constituency: "Lord Tedder Hall", name: "Hon. Burna Boy", level: "500" },
    { constituency: "Lord Tedder Hall", name: "Hon. Davido Adeleke", level: "200" },
    { constituency: "Kuti Hall", name: "Hon. Fela Anikulapo", level: "400" },
    { constituency: "Sultan Bello Hall", name: "Hon. Ahmadu Bello", level: "500" },
    { constituency: "Queen Elizabeth II Hall", name: "Hon. Tiwa Savage", level: "300" },
    { constituency: "Queen Idia Hall", name: "Hon. Yemi Alade", level: "400" },
    { constituency: "Independence Hall", name: "Hon. Femi Kuti", level: "500" },
    { constituency: "Nnamdi Azikiwe Hall", name: "Hon. Phyno Fino", level: "400" },
    { constituency: "Obafemi Awolowo Hall", name: "Hon. Tems Openiyi", level: "300" },
    { constituency: "Faculty of Arts", name: "Hon. Wole Soyinka", level: "500" },
    { constituency: "Faculty of Science", name: "Hon. Chike Obi", level: "400" },
    { constituency: "Faculty of Technology", name: "Hon. Philip Emeagwali", level: "500" },
    { constituency: "Faculty of Law", name: "Hon. Gani Fawehinmi", level: "500" },
];

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

const LeaderCard = ({ leader }: { leader: Leader }) => (
    <motion.div
        variants={itemVariants}
        className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-nobel-gold hover:shadow-lg transition-all duration-300"
    >
        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
             {/* Placeholder for actual image */}
             <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                <User size={64} />
             </div>
             <img src={leader.image} alt={leader.name} className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                 <div className="flex gap-4 text-white">
                     {leader.socials.twitter && <a href={leader.socials.twitter} className="hover:text-nobel-gold transition-colors"><Twitter size={18} /></a>}
                     {leader.socials.linkedin && <a href={leader.socials.linkedin} className="hover:text-nobel-gold transition-colors"><Linkedin size={18} /></a>}
                     {leader.socials.instagram && <a href={leader.socials.instagram} className="hover:text-nobel-gold transition-colors"><Instagram size={18} /></a>}
                 </div>
             </div>
        </div>

        <div className="p-6">
            <div className="text-xs font-bold text-nobel-gold uppercase tracking-widest mb-2">{leader.role}</div>
            <h3 className="font-serif text-xl text-slate-900 mb-3">{leader.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">{leader.bio}</p>

            <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-ui-blue transition-colors uppercase tracking-wider">
                <Mail size={12} /> Email Office
            </a>
        </div>
    </motion.div>
);
