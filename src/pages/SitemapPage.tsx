import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Landmark, Users, BookOpen, GraduationCap, Brain, FlaskConical,
  Shield, Scale, ArrowUpRight, ArrowLeft, Search, Compass, Hash
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";

interface SitemapSection {
  title: string;
  tag: string;
  icon: React.ReactNode;
  accent: string;
  links: { label: string; path: string; description?: string }[];
}

const sections: SitemapSection[] = [
  {
    title: "Main",
    tag: "01",
    accent: "from-accent/20 to-accent/5",
    icon: <Home size={18} />,
    links: [
      { label: "Home", path: "/", description: "Landing page" },
      { label: "Search", path: "/search", description: "Search across all content" },
      { label: "History", path: "/history", description: "Union history & timeline" },
    ],
  },
  {
    title: "Governance",
    tag: "02",
    accent: "from-primary/15 to-primary/5",
    icon: <Landmark size={18} />,
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
    tag: "03",
    accent: "from-accent/20 to-accent/5",
    icon: <Users size={18} />,
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
    tag: "04",
    accent: "from-primary/15 to-primary/5",
    icon: <BookOpen size={18} />,
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
    tag: "05",
    accent: "from-accent/20 to-accent/5",
    icon: <GraduationCap size={18} />,
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
    tag: "06",
    accent: "from-primary/15 to-primary/5",
    icon: <Brain size={18} />,
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
    tag: "07",
    accent: "from-accent/20 to-accent/5",
    icon: <FlaskConical size={18} />,
    links: [
      { label: "Tutorials Home", path: "/tutorials", description: "Browse tutorials" },
      { label: "Tutorial Catalog", path: "/tutorials/catalog", description: "All courses" },
    ],
  },
  {
    title: "Account & More",
    tag: "08",
    accent: "from-primary/15 to-primary/5",
    icon: <Shield size={18} />,
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
    tag: "09",
    accent: "from-accent/20 to-accent/5",
    icon: <Scale size={18} />,
    links: [
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Service", path: "/terms-of-service" },
      { label: "Style Guide", path: "/style-guide" },
    ],
  },
];

const SitemapPage = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        links: s.links.filter(
          (l) =>
            l.label.toLowerCase().includes(q) ||
            l.path.toLowerCase().includes(q) ||
            (l.description ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.links.length > 0);
  }, [query]);

  const totalPages = sections.reduce((n, s) => n + s.links.length, 0);

  return (
    <div className="min-h-screen bg-background mt-[72px] md:mt-[88px] pb-20">
      <SEO
        title="Site Directory | UISU SPACE"
        description="Browse all pages and features of the UISU SPACE platform. Find governance tools, student resources, AI study tools, and more."
      />

      {/* HERO */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto px-6 pt-12 pb-16 max-w-6xl relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground/60 hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft size={12} />
            Back to Home
          </Link>

          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Compass size={14} className="text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                  Platform Directory
                </span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Site <span className="italic text-accent">Map</span>
              </h1>
              <p className="mt-5 text-primary-foreground/70 max-w-xl font-light leading-relaxed">
                Every page, every tool, every corner of UISU SPACE — organised
                into nine editorial sections for quick navigation.
              </p>
            </div>

            <div className="flex md:flex-col gap-6 md:gap-3 md:text-right">
              <div>
                <div className="font-serif text-4xl text-accent tabular-nums">
                  {totalPages}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary-foreground/50">
                  Total Pages
                </div>
              </div>
              <div>
                <div className="font-serif text-4xl text-accent tabular-nums">
                  {sections.length}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary-foreground/50">
                  Sections
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mt-10 relative max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/50 pointer-events-none z-10"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, tools, descriptions..."
              className="pl-11 bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-2xl h-12 focus-visible:border-accent"
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="container mx-auto px-6 max-w-6xl mt-12">
        <Breadcrumbs />

        {/* Section anchors */}
        <div className="flex flex-wrap gap-2 mb-10">
          {sections.map((s) => (
            <a
              key={s.title}
              href={`#${s.title.toLowerCase().replace(/\s|&/g, "-")}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Hash size={10} />
              {s.title}
            </a>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Search size={28} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-serif text-xl text-foreground">No matches</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((section, i) => (
              <motion.section
                key={section.title}
                id={section.title.toLowerCase().replace(/\s|&/g, "-")}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.5 }}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/50 hover:shadow-xl transition-all"
              >
                {/* Accent gradient strip */}
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${section.accent} pointer-events-none`} />

                <header className="relative p-6 pb-4 border-b border-border/60">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-accent">
                      № {section.tag}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                      {section.links.length} pages
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary text-accent">
                      {section.icon}
                    </div>
                    <h2 className="font-serif text-2xl text-foreground leading-tight">
                      {section.title}
                    </h2>
                  </div>
                </header>

                <ul className="relative divide-y divide-border/50">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="group/link flex items-start justify-between gap-3 px-6 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground group-hover/link:text-accent transition-colors truncate">
                            {link.label}
                          </div>
                          {link.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {link.description}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight
                          size={14}
                          className="mt-1 text-muted-foreground opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:text-accent transition-all flex-shrink-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapPage;
