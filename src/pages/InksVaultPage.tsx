import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, PenTool, FileText, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const InksVaultPage = () => {
  const navigate = useNavigate();

  const articles = [
    { title: "The Future of Student Unionism", author: "Comrade Adeolu", role: "Student Thinker", summary: "Exploring the evolving dynamics of student activism in the digital age." },
    { title: "Budget Analysis 2024", author: "Hon. Sarah James", role: "Speaker", summary: "A critical look at the allocated funds for student welfare and capital projects." },
  ];

  const blogs = [
    { title: "My First Week on Campus", author: "Chinedu Okeke", role: "Fresher", summary: "Navigating the maze of registration and finding the best cafeteria." },
    { title: "Exam Season Survival Guide", author: "Funke Akindele", role: "Medical Student", summary: "Tips and tricks to stay healthy and focused during the marathon." },
  ];

  const reports = [
    { title: "Semester Financial Report", author: "Office of the Treasurer", role: "Official", summary: "Detailed breakdown of income and expenditure for the first semester." },
    { title: "Welfare Committee Findings", author: "Welfare Secretary", role: "Official", summary: "Report on the state of hostel facilities and recommendations." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-16">
      <div className="container mx-auto px-6">
        <button
            onClick={() => navigate('/')}
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
                <BookOpen className="text-nobel-gold w-6 h-6" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500">Publications</span>
             </motion.div>

             <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-serif text-ui-blue leading-[0.9]"
             >
                Inks <br/> <span className="italic text-slate-300">Vault</span>
             </motion.h1>

             <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light"
             >
                A collection of thoughts, reports, and stories from the university community.
             </motion.p>
        </div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-20"
        >
            {/* Articles Section */}
            <section>
                <div className="flex items-center gap-4 mb-10">
                    <PenTool className="text-ui-blue w-6 h-6" />
                    <h2 className="text-3xl font-serif text-ui-blue">Articles</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {articles.map((item, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all group">
                            <div className="text-xs font-bold uppercase tracking-widest text-nobel-gold mb-3">{item.role}</div>
                            <h3 className="text-2xl font-serif text-ui-blue mb-4 group-hover:text-nobel-gold transition-colors">{item.title}</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">{item.summary}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <User size={14} />
                                <span>{item.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* Blogs Section */}
             <section>
                <div className="flex items-center gap-4 mb-10">
                    <User className="text-ui-blue w-6 h-6" />
                    <h2 className="text-3xl font-serif text-ui-blue">Student Blogs</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogs.map((item, index) => (
                         <div key={index} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-all group">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{item.role}</div>
                            <h3 className="text-2xl font-serif text-ui-blue mb-4 group-hover:text-nobel-gold transition-colors">{item.title}</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">{item.summary}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <User size={14} />
                                <span>{item.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* Journals & Reports Section */}
             <section>
                <div className="flex items-center gap-4 mb-10">
                    <FileText className="text-ui-blue w-6 h-6" />
                    <h2 className="text-3xl font-serif text-ui-blue">Journals & Reports</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reports.map((item, index) => (
                         <div key={index} className="bg-slate-50 p-8 rounded-xl border border-slate-200 hover:border-nobel-gold transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-xs font-bold uppercase tracking-widest text-ui-blue bg-ui-blue/5 px-3 py-1 rounded-full">{item.role}</div>
                                <FileText className="text-slate-300 group-hover:text-nobel-gold transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                            <p className="text-slate-600 text-sm mb-4">{item.summary}</p>
                            <div className="text-xs text-slate-400 font-mono uppercase">Authored by {item.author}</div>
                        </div>
                    ))}
                </div>
            </section>

        </motion.div>
      </div>
    </div>
  );
};

export default InksVaultPage;
