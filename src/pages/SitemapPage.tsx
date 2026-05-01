import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Landmark, Users, FileText, MapPin, Megaphone, Calendar,
  BookOpen, GraduationCap, Briefcase, Brain, Calculator, FlaskConical,
  MessageSquare, Shield, Vote, ClipboardList, Search, History,
  Scale, CreditCard, Package, HelpCircle, Mail, Newspaper,
  ArrowLeft, ExternalLink, PenTool, CheckSquare, ListChecks, CalendarDays
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: { label: string; path: string; description?: string }[];
}

const sections: SitemapSection[] = [
  {
    title: "Main",
    icon: <Home size={20} />,
    links: [
      { label: "Home", path: "/", description: "Landing page" },
      { label: "Search", path: "/search", description: "Search across all content" },
      { label: "History", path: "/history", description: "Union history & timeline" },
    ],
  },
  {
    title: "Governance",
    icon: <Landmark size={20} />,
    links: [
      { label: "Governance Overview", path: "/governance", description: "Structure & branches" },
      { label: "Current Leaders", path: "/current-leaders", description: "Serving executives" },
      { label: "Past Leaders", path: "/past-leaders", description: "Historical administrations" },
      { label: "Constitution", path: "/constitution", description: "Union constitution" },
      { label: "Halls of Residence", path: "/halls", description: "All halls" },
      { label: "Elections", path: "/elections", description: "Union elections & voting" },
    ],
  },
  {
    title: "Community",
    icon: <Users size={20} />,
    links: [
      { label: "Communities & Clubs", path: "/communities", description: "Student organizations" },
      { label: "Events Calendar", path: "/events", description: "Upcoming events & RSVP" },
      { label: "Announcements", path: "/announcements", description: "Official notices" },
      { label: "Lost & Found", path: "/lost-found", description: "Lost & found board" },
      { label: "Complaints", path: "/complaints", description: "Submit complaints" },
      { label: "Polls & Voting", path: "/polls", description: "Active polls" },
      { label: "Confessions", path: "/confessions", description: "Anonymous campus stories" },
      { label: "Forms", path: "/forms", description: "Official forms & applications" },
    ],
  },
  {
    title: "Content & Media",
    icon: <BookOpen size={20} />,
    links: [
      { label: "Gazette", path: "/gazette", description: "Student news & journalism" },
      { label: "Gazette Issues", path: "/gazette/issues", description: "Published editions" },
      { label: "Editorial Board", path: "/gazette/editorial-board", description: "Meet the editors" },
      { label: "Inks Vault", path: "/inks-vault", description: "Articles, poetry & creative writing" },
      { label: "Document Library", path: "/documents", description: "Official documents" },
      { label: "Campus Map", path: "/campus-map", description: "Interactive campus map" },
    ],
  },
  {
    title: "Resources & Tools",
    icon: <GraduationCap size={20} />,
    links: [
      { label: "Resources Hub", path: "/resources", description: "All student resources" },
      { label: "Academic Bank", path: "/resources/academic-bank", description: "Past questions & materials" },
      { label: "Study Tools", path: "/resources/study-tools", description: "Productivity tools" },
      { label: "GPA Calculator", path: "/resources/gpa-calculator", description: "Calculate your GPA" },
      { label: "Calculator Suite", path: "/resources/calculator-suite", description: "Academic calculators" },
      { label: "Career Hub", path: "/resources/career-hub", description: "Jobs & internships" },
      { label: "Scholarships", path: "/resources/scholarships", description: "Scholarship listings" },
      { label: "Student Mart", path: "/resources/student-mart", description: "Buy & sell marketplace" },
      { label: "Freshers' Guide", path: "/resources/freshers-guide", description: "New student guide" },
      { label: "Alumni Network", path: "/resources/alumni-network", description: "Connect with graduates" },
      { label: "Past Questions", path: "/resources/past-questions", description: "Exam preparation" },
      { label: "GPA Tracker", path: "/resources/gpa-tracker", description: "Track grades over time" },
      { label: "Timetable Builder", path: "/resources/timetable", description: "Plan your classes" },
    ],
  },
  {
    title: "AI Tools",
    icon: <Brain size={20} />,
    links: [
      { label: "StudyBuddy", path: "/resources/study-buddy", description: "AI study assistant" },
      { label: "Study Aide", path: "/resources/study-aide", description: "Smart study helper" },
      { label: "AI Quiz", path: "/resources/ai-quiz", description: "Generate quizzes from materials" },
      { label: "Quizlets", path: "/resources/quizlets", description: "Interactive quizzes" },
      { label: "Flashcards", path: "/resources/flashcards", description: "AI-generated flashcards" },
      { label: "Essay Check", path: "/resources/essay-check", description: "AI essay review" },
    ],
  },
  {
    title: "Tutorials",
    icon: <FlaskConical size={20} />,
    links: [
      { label: "Tutorials Home", path: "/tutorials", description: "Browse tutorials" },
      { label: "Tutorial Catalog", path: "/tutorials/catalog", description: "All courses" },
    ],
  },
  {
    title: "Account & More",
    icon: <Shield size={20} />,
    links: [
      { label: "Sign In / Sign Up", path: "/auth", description: "Authentication" },
      { label: "Profile Card", path: "/profile-card", description: "Digital ID card" },
      { label: "Academic Planner", path: "/planner", description: "Plan your semesters" },
      { label: "Budget Tracker", path: "/budget", description: "Personal budget tool" },
      { label: "Academic Calendar", path: "/academic-calendar", description: "Semester dates" },
      { label: "Newsletter", path: "/newsletter", description: "Newsletter archive" },
      { label: "Feedback", path: "/feedback", description: "Anonymous suggestions" },
    ],
  },
  {
    title: "Legal",
    icon: <Scale size={20} />,
    links: [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Service", path: "/terms-of-service" },
      { label: "Style Guide", path: "/style-guide" },
    ],
  },
];

const SitemapPage = () => {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <SEO
        title="Site Directory | UISU SPACE"
        description="Browse all pages and features of the UISU SPACE platform. Find governance tools, student resources, AI study tools, and more."
      />
      <div className="container mx-auto px-6">
        <Breadcrumbs />
        <Link
          to="/"
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors mb-12"
        >
          <div className="p-2 border border-border group-hover:border-accent transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="mb-16">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Platform Directory</span>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-[0.9]">
            Site <span className="italic text-muted-foreground">Map</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl">
            A complete directory of all pages and features available on UISU SPACE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="text-accent">{section.icon}</div>
                <h2 className="font-serif text-xl font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center justify-between py-2 px-3 -mx-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium group-hover:text-accent transition-colors">
                          {link.label}
                        </span>
                        {link.description && (
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        )}
                      </div>
                      <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
