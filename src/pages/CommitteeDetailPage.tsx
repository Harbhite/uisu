import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Scale, FileText, Heart, Trophy, Globe, Briefcase, Building2, Users, Calendar, CheckCircle2, User, UserCheck } from 'lucide-react';

// Replicating data here for lookup (In a full refactor, this should move to src/lib/data.ts)
const committeesData = [
    // Legislative
    {
        title: "Finance & Budget Committee",
        slug: "finance-budget-committee",
        icon: <Coins size={48} />,
        desc: "Scrutinizes the budget proposals of the Executive Council, monitors spending, and ensures financial transparency.",
        type: "Legislative",
        chairperson: "Senator Chairperson",
        secretary: "Senator Secretary",
        mandate: [
            "Review and approve the Union's annual budget.",
            "Monitor financial expenditures of the Executive Council.",
            "Ensure adherence to financial bye-laws.",
            "Investigate financial discrepancies."
        ],
        members: ["3 Members from SRC"]
    },
    {
        title: "Disciplinary Committee",
        slug: "disciplinary-committee",
        icon: <Scale size={48} />,
        desc: "Investigates allegations of misconduct, maintains order, and upholds the constitution and code of conduct.",
        type: "Judicial/Legislative",
        chairperson: "Legal Advisor",
        secretary: "Appointed Secretary",
        mandate: [
            "Hear cases of constitutional violations.",
            "Recommend sanctions for misconduct.",
            "Interpret the Union's Code of Conduct.",
            "Ensure fair hearing for all accused students."
        ],
        members: ["4 Members appointed by SRC"]
    },
    {
        title: "Audit Committee",
        slug: "audit-committee",
        icon: <FileText size={48} />,
        desc: "Independently reviews financial records and ensures compliance with financial regulations.",
        type: "Legislative",
        chairperson: "Senator Chairperson",
        secretary: "Appointed Secretary",
        mandate: [
            "Audit the Union's accounts quarterly.",
            "Verify receipts and payment vouchers.",
            "Report financial anomalies to the House.",
            "Publish audited financial reports."
        ],
        members: ["2 Members from SRC"]
    },
    // Executive
    {
        title: "Student Welfare Board",
        slug: "student-welfare-board",
        icon: <Heart size={48} />,
        desc: "Oversees student accommodation, pricing regulation, and general welfare conditions on campus.",
        type: "Executive",
        chairperson: "House Secretary",
        secretary: "Appointed Secretary",
        mandate: [
            "Monitor prices of goods and services on campus.",
            "Liaise with Hall Management on accommodation issues.",
            "Manage the Union's transportation scheme.",
            "Address student complaints regarding welfare."
        ],
        members: ["Welfare Secretaries of Halls"]
    },
    {
        title: "Sports Council",
        slug: "sports-council",
        icon: <Trophy size={48} />,
        desc: "Organizes the SU Cup, Inter-Faculty Games, and promotes sporting activities across the university.",
        type: "Executive",
        chairperson: "Sports Secretary",
        secretary: "Appointed Secretary",
        mandate: [
            "Organize the annual Dean's Cup and SU Cup.",
            "Maintain the Union's sports equipment.",
            "Select and train the University's sports team.",
            "Promote physical fitness campaigns."
        ],
        members: ["Sports Secretaries of Halls/Faculties"]
    },
    {
        title: "Press & Publicity Committee",
        slug: "press-publicity-committee",
        icon: <Globe size={48} />,
        desc: "Manages the Union's public relations, press releases, social media, and media presence.",
        type: "Executive",
        chairperson: "Public Relations Officer",
        secretary: "Appointed Secretary",
        mandate: [
            "Manage the Union's official social media handles.",
            "Draft and publish press releases.",
            "Organize press conferences.",
            "Maintain the Union's website and notice boards."
        ],
        members: ["Media Team"]
    },
    {
        title: "Academic Committee",
        slug: "academic-committee",
        icon: <Briefcase size={48} />,
        desc: "Liaises with the university management on academic matters, calendars, and library services.",
        type: "Executive",
        chairperson: "Vice President",
        secretary: "Appointed Secretary",
        mandate: [
            "Represent students in Senate Academic meetings.",
            "Organize academic seminars and tutorials.",
            "Advocate for better library facilities.",
            "Address grading and examination complaints."
        ],
        members: ["Academic Directors of Faculties"]
    },
    {
        title: "Projects & Capital Committee",
        slug: "projects-capital-committee",
        icon: <Building2 size={48} />,
        desc: "Oversees the construction, renovation, and maintenance of Union projects and assets.",
        type: "Executive/Ad-hoc",
        chairperson: "The President",
        secretary: "The Treasurer",
        mandate: [
            "Supervise ongoing Union construction projects.",
            "Assess the state of Union properties.",
            "Recommend renovation projects.",
            "Ensure value for money in capital expenditures."
        ],
        members: ["House Secretary"]
    },
    {
        title: "Health Committee",
        slug: "health-committee",
        icon: <ActivityIcon size={48} />,
        desc: "Ensures the Jaja Clinic serves students effectively, organizes health drives, and promotes health awareness.",
        type: "Executive",
        chairperson: "House Secretary",
        secretary: "Appointed Secretary",
        mandate: [
            "Monitor service delivery at the University Health Service.",
            "Organize blood donation and health awareness drives.",
            "Manage the Union's emergency health fund.",
            "Liaise with the Director of Health Services."
        ],
        members: ["Health Representatives"]
    }
];

// Helper for the icon in data
function ActivityIcon({ size, className }: { size?: number, className?: string }) {
    return (
         <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    );
}

const CommitteeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Find committee by slug
    const committee = committeesData.find(c => c.slug === id);

    if (!committee) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif text-ui-blue mb-4">Committee Not Found</h2>
                <button onClick={() => navigate('/governance')} className="text-nobel-gold hover:underline">
                    Return to Governance
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-16">
            <div className="container mx-auto px-6 max-w-4xl">
                <Link
                    to="/governance"
                    className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
                >
                    <div className="p-2 rounded-full border border-slate-300 group-hover:border-nobel-gold transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    <span>Back to Structure</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 p-8 md:p-12 shadow-sm rounded-sm"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                        <div className="p-6 bg-slate-50 text-ui-blue rounded-sm border border-slate-100">
                            {committee.icon}
                        </div>
                        <div>
                            <span className="inline-block py-1 px-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 rounded-sm">
                                {committee.type}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-ui-blue mb-6 leading-tight">
                                {committee.title}
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed font-light">
                                {committee.desc}
                            </p>
                        </div>
                    </div>

                    {/* New Leadership Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 p-6 bg-slate-50 border border-slate-100 rounded-sm">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-nobel-gold">
                                 <User size={24} />
                             </div>
                             <div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Chairperson</span>
                                 <h4 className="font-serif text-xl text-ui-blue">{committee.chairperson}</h4>
                             </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-nobel-gold">
                                 <UserCheck size={24} />
                             </div>
                             <div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Secretary</span>
                                 <h4 className="font-serif text-xl text-ui-blue">{committee.secretary}</h4>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                                <CheckCircle2 size={20} className="text-nobel-gold" />
                                Mandate & Duties
                            </h3>
                            <ul className="space-y-4">
                                {committee.mandate.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-slate-600">
                                        <span className="mt-2 w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0"></span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                                <Users size={20} className="text-nobel-gold" />
                                Other Members
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                <ul className="space-y-3">
                                    {committee.members.map((member, index) => (
                                        <li key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                                                {index + 1}
                                            </div>
                                            {member}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8">
                                <h3 className="flex items-center gap-3 text-xl font-serif text-ui-blue mb-6 pb-4 border-b border-slate-100">
                                    <Calendar size={20} className="text-nobel-gold" />
                                    Meeting Schedule
                                </h3>
                                <p className="text-slate-600 italic">
                                    Meetings are held bi-weekly or as summoned by the Chairperson.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CommitteeDetailPage;
