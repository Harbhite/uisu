/** Shared browser/crawler metadata rules. No database or runtime dependencies. */
export interface SiteDetails {
  siteName: string;
  siteDescription: string;
  socialLinks: { platform: string; url: string }[];
}
export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  type?: string;
}
export const SITE_URL = "https://uisu.space";
export const DEFAULT_SITE_DETAILS: SiteDetails = {
  siteName: "UISU SPACE",
  siteDescription: "The official digital space of the University of Ibadan Students’ Union — connecting students, preserving history, and empowering the community.",
  socialLinks: [{ platform: "X", url: "https://twitter.com/uisu_archive" }],
};
export const routeMetadata: Record<string, PageMetadata> = {
  "/": {
    "title": "UISU SPACE",
    "description": "The official digital space of the University of Ibadan Students' Union (UISU). Preserving legacy, celebrating leadership, powering the future.",
    "image": "/og/og-home.png"
  },
  "/governance": {
    "title": "Governance Structure | UISU Executive & Legislature",
    "description": "Learn how UI Students' Union operates: Executive Council, Students' Representative Council (SRC), Judicial Council, and committee structures. Understand the first student union in Nigeria.",
    "image": "/og/pages-screenshot/governance.png"
  },
  "/past-leaders": {
    "title": "Hall of Fame | Past UISU Presidents Since 1948",
    "description": "Explore 75+ years of UI Students' Union leadership. Discover past presidents, PROs, and executives who shaped Nigerian student activism from Wole Soyinka's era to today.",
    "image": "/og/pages-screenshot/past-leaders.png"
  },
  "/current-leaders": {
    "title": "Current Student Leaders | UISU Executive & Legislature 2024/25",
    "description": "Meet the serving UI Students' Union executives, SRC legislators, and hall majority leaders. Contact your representatives, view portfolios, and connect with student government.",
    "image": "/og/pages-screenshot/current-leaders.png"
  },
  "/documents": {
    "title": "Documents Library | UISU Constitution & Historical Records",
    "description": "Access the complete archive of UI Students' Union documents: constitutions, manifestos, election results, speeches, and policy papers from 1948 to present. Download PDFs free.",
    "image": "/og/pages-screenshot/documents.png"
  },
  "/archives": {
    "title": "Archives | UISU Digital Memory",
    "description": "Explore articles, image galleries, timelines, document guides and digital exhibits from the University of Ibadan Students’ Union.",
    "image": "/archive/tekena-tamuno-building.jpg"
  },
  "/campus-map": {
    "title": "Campus Map | UI Halls of Residence & Locations",
    "description": "Interactive map of University of Ibadan campus. Navigate 12+ halls of residence (Kuti, Tedder, Queen's), academic buildings, and landmarks. Find your way around Nigeria's premier university.",
    "image": "/og/pages-screenshot/campus-map.png"
  },
  "/communities": {
    "title": "Student Clubs & Societies | UI Campus Communities",
    "description": "Explore 50+ student organizations at University of Ibadan: departmental associations, religious groups, press clubs, and cultural societies. Find your community and join student life.",
    "image": "/og/pages-screenshot/communities.png"
  },
  "/events": {
    "title": "Events Calendar | UISU Activities & Campus Happenings",
    "description": "Discover upcoming UI Students' Union events, academic calendar dates, cultural activities, and campus happenings. RSVP to lectures, concerts, and student-led initiatives at Ibadan.",
    "image": "/og/pages-screenshot/events.png"
  },
  "/auth": {
    "title": "Sign In",
    "description": "Sign in or create an account to access UISU SPACE features, contribute to the Inks Vault, and stay connected with the student union.",
    "image": "/og/pages-screenshot/auth.png"
  },
  "/admin": {
    "title": "Admin Dashboard",
    "description": "Manage events, announcements, documents, clubs, and more.",
    "image": "/og/og-home.png"
  },
  "/announcements": {
    "title": "Official Announcements | UISU News & Updates",
    "description": "Get the latest official news from UI Students' Union: policy updates, election notices, academic calendar changes, and important campus announcements. Stay informed, Uite.",
    "image": "/og/pages-screenshot/announcements.png"
  },
  "/inks-vault": {
    "title": "Inks Vault",
    "description": "Explore articles, essays, poetry, and reports from the University of Ibadan Students' Union. A collection of student voices and intellectual discourse.",
    "image": "/og/pages-screenshot/inks-vault.png"
  },
  "/halls": {
    "title": "The Republics - Halls of Residence | UISU",
    "description": "Explore the Halls of Residence of the University of Ibadan. Discover the autonomous republics, their histories, leadership, and vibrant cultures.",
    "image": "/og/og-campus-map.png"
  },
  "/resources": {
    "title": "Student Resources",
    "description": "Access a wealth of resources including academic materials, career tips, scholarships, and more.",
    "image": "/og/pages-screenshot/resources.png"
  },
  "/resources/academic-bank": {
    "title": "Academic Bank - Resources",
    "description": "Access lecture notes, past questions, and academic materials from all 13 faculties of University of Ibadan."
  },
  "/resources/career-hub": {
    "title": "Career Hub - Resources",
    "description": "Find jobs, internships, and career resources for UI students."
  },
  "/resources/scholarships": {
    "title": "Scholarship Finder - Resources",
    "description": "Find local and international scholarships available to University of Ibadan students."
  },
  "/resources/mental-wellness": {
    "title": "Mental Wellness - Resources",
    "description": "Mental health resources and support for University of Ibadan students."
  },
  "/resources/study-tools": {
    "title": "Study Tools - Resources",
    "description": "Discover the best apps and tools to boost your academic productivity."
  },
  "/resources/skill-up": {
    "title": "Skill Up - Resources",
    "description": "Free YouTube tutorials and courses to build valuable skills."
  },
  "/resources/student-mart": {
    "title": "Student Mart",
    "description": "Buy, sell, and swap textbooks, gadgets, and essentials within campus."
  },
  "/resources/freshers-guide": {
    "title": "Fresher's Guide - Resources",
    "description": "Everything you need to know as a new student at the University of Ibadan."
  },
  "/resources/career-pathfinder": {
    "title": "Career Pathfinder - Resources",
    "description": "Explore career paths and alumni journeys from the University of Ibadan."
  },
  "/resources/campus-health": {
    "title": "Campus Health",
    "description": "Clinic schedules, emergency contacts, and physical health resources."
  },
  "/resources/gpa-calculator": {
    "title": "University of Ibadan CGPA Calculator — GPA Calculator for UI Students",
    "description": "Free CGPA & GPA calculator for University of Ibadan students. Supports UI's 7.0, 5.0 and 4.0 grading scales — calculate semester GPA, cumulative CGPA and predict your class of degree."
  },
  "/resources/calculator-suite": {
    "title": "Calculator Suite - Resources",
    "description": "A comprehensive collection of calculators for everyday calculations."
  },
  "/resources/study-buddy": {
    "title": "StudyBuddy AI - Smart Study Tool",
    "description": "AI-powered study companion that explains, plans, summarizes, and creates flashcards across all fields of knowledge."
  },
  "/resources/ai-quiz": {
    "title": "AI Quiz - Test Your Knowledge",
    "description": "Upload study materials and get 25 tailor-made quiz questions powered by AI."
  },
  "/resources/flashcards": {
    "title": "AI Flashcards - Study Smart",
    "description": "Generate flashcards from any topic or material using AI."
  },
  "/resources/essay-check": {
    "title": "AI Essay Checker",
    "description": "Get structured AI feedback on your essay — grammar, structure, argument strength, and citations."
  },
  "/resources/study-aide": {
    "title": "AI Study Aide — UISU SPACE",
    "description": "Generate key points, summaries, outlines, and concept maps from your study materials using AI.",
    "image": "/og/og-home.png"
  },
  "/resources/tinywiki": {
    "title": "TinyWiki - AI Wiki Generator",
    "description": "Turn any topic or study material into a structured, easy-to-read wiki with a glossary and an AI study assistant."
  },
  "/resources/timetable": {
    "title": "Timetable Builder - Resources",
    "description": "Build your weekly class timetable with conflict detection and export."
  },
  "/resources/gpa-tracker": {
    "title": "GPA Tracker - Resources",
    "description": "Track your GPA across semesters with projections and what-if scenarios."
  },
  "/resources/past-questions": {
    "title": "University of Ibadan Past Questions — UI Past Questions & AI Solutions",
    "description": "Browse University of Ibadan past exam questions across faculties, departments and courses — with AI-generated solutions, explanations and study notes for UI students."
  },
  "/resources/alumni-network": {
    "title": "Alumni Network",
    "description": "Connect with past students, find mentors, and explore alumni stories."
  },
  "/style-guide": {
    "title": "Visual Registry & Aluta Protocol",
    "description": "The comprehensive design manual and component registry for the UISU SPACE platform.",
    "image": "/og/pages-screenshot/style-guide.png"
  },
  "/search": {
    "title": "Search",
    "description": "Search across leaders, documents, events, and more.",
    "image": "/og/pages-screenshot/search.png"
  },
  "/history": {
    "title": "History - University of Ibadan Students' Union",
    "description": "The evolution of student unionism from global origins to the University of Ibadan.",
    "image": "/og/pages-screenshot/history.png"
  },
  "/constitution": {
    "title": "The Constitution | UISU SPACE",
    "description": "The Supreme Constitution of the University of Ibadan Students' Union. Digital Legislative Registry.",
    "image": "/og/pages-screenshot/constitution.png"
  },
  "/constitution1": {
    "title": "Constitution (Modern Design) | UISU SPACE",
    "description": "The Constitution of UISU - Modern Card-Based Design",
    "image": "/og/pages-screenshot/constitution.png"
  },
  "/constitution2": {
    "title": "Constitution (Timeline Design) | UISU SPACE",
    "description": "The Constitution of UISU - Elegant Timeline-Based Design",
    "image": "/og/pages-screenshot/constitution.png"
  },
  "/constitution3": {
    "title": "Constitution (Accordion Design) | UISU SPACE",
    "description": "The Constitution of UISU - Interactive Accordion-Based Design",
    "image": "/og/pages-screenshot/constitution.png"
  },
  "/constitution4": {
    "title": "Constitution (Multi-Column Design) | UISU SPACE",
    "description": "The Constitution of UISU - Multi-Column Comparison View",
    "image": "/og/pages-screenshot/constitution.png"
  },
  "/profile-card": {
    "title": "Profile Card | UISU",
    "description": "Digital Profile Card Showcase for the University of Ibadan Students' Union.",
    "image": "/screenshots/index.png"
  },
  "/privacy-policy": {
    "title": "Privacy Policy | UISU SPACE",
    "description": "Learn how UISU SPACE collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
    "image": "/og/pages-screenshot/privacy-policy.png"
  },
  "/terms-of-service": {
    "title": "Terms of Service | UISU SPACE",
    "description": "Read the terms and conditions for using UISU SPACE. Understand your rights and responsibilities as a user of our platform.",
    "image": "/og/pages-screenshot/terms-of-service.png"
  },
  "/unsubscribe": {
    "title": "Unsubscribe — UISU SPACE",
    "description": "Unsubscribe from the UISU SPACE newsletter"
  },
  "/newsletter": {
    "title": "The Dispatch | UISU Newsletter",
    "description": "Piping hot updates from the Union—history, drama, and everything in between. No spam, just substance. Join 2,000+ Uites.",
    "image": "/og/pages-screenshot/newsletter.png"
  },
  "/forms": {
    "title": "Forms — UISU SPACE",
    "description": "Create and manage forms, surveys, waitlists and registrations. Track responses with analytics."
  },
  "/polls": {
    "title": "Polls & Voting | UISU SPACE",
    "description": "Vote on governance decisions, club elections, and community feedback."
  },
  "/lost-found": {
    "title": "Lost & Found - UISU SPACE",
    "description": "Report lost items or post found items on campus"
  },
  "/academic-calendar": {
    "title": "Academic Calendar - UISU SPACE",
    "description": "Important academic dates, exams, deadlines, and countdowns"
  },
  "/complaints": {
    "title": "Complaints & Petitions - UISU SPACE",
    "description": "Submit and track complaints, petitions, and feedback"
  },
  "/budget": {
    "title": "Budget Tracker - UISU SPACE",
    "description": "Track your personal income and expenses"
  },
  "/sitemap": {
    "title": "Site Directory | UISU SPACE",
    "description": "Browse all pages and features of the UISU SPACE platform. Find governance tools, student resources, AI study tools, and more."
  },
  "/feedback": {
    "title": "Anonymous Feedback | UISU SPACE",
    "description": "Share your suggestions and feedback anonymously with the Students' Union."
  },
  "/planner": {
    "title": "Academic Planner | UISU",
    "description": "Build your weekly timetable"
  },
  "/confessions": {
    "title": "Confessions | UISU",
    "description": "Anonymous confessions board"
  },
  "/elections": {
    "title": "Elections | UISU",
    "description": "Student union elections and voting"
  },
  "/quicklinks": {
    "title": "Quicklinks — Essential University of Ibadan Links for Students",
    "description": "A curated directory of 40+ useful University of Ibadan links: student portal, LMS, Kenneth Dike Library, faculties, bursary, NYSC, JAMB, scholarships and more.",
    "image": "/og/pages-screenshot/quicklinks.png"
  },
  "/resources/quicklinks": {
    "title": "Quicklinks — Essential University of Ibadan Links for Students",
    "description": "A curated directory of 40+ useful University of Ibadan links: student portal, LMS, Kenneth Dike Library, faculties, bursary, NYSC, JAMB, scholarships and more.",
    "image": "/og/pages-screenshot/quicklinks.png"
  },
  "/resources/quizlets": {
    "title": "Quizlets - Community Quiz Bank",
    "description": "Browse and take quizzes created by the community."
  },
  "/tutorials": {
    "title": "Tutorials",
    "description": "Browse tutorials and learn from peer tutors at the University of Ibadan."
  },
  "/tutorials/catalog": {
    "title": "Tutorial Catalog",
    "description": "Browse peer tutorials and academic courses."
  },
  "/tutorials/upload": {
    "title": "Upload Tutorial",
    "description": "Create and manage your tutorial contributions."
  },
  "/gazette": {
    "title": "Gazette",
    "description": "Campus news, student voices, and official notices."
  },
  "/gazette/issues": {
    "title": "Gazette Issues",
    "description": "Browse published issues of the student Gazette."
  },
  "/gazette/editorial-board": {
    "title": "Gazette Editorial Board",
    "description": "Meet the Gazette editorial team."
  },
  "/gazette/bookmarks": {
    "title": "Saved Gazette Articles",
    "description": "Your saved Gazette articles."
  },
  "/gazette/editor/new": {
    "title": "New Gazette Article",
    "description": "Write and manage Gazette articles."
  },
  "/admin/inks-vault/new": {
    "title": "New Piece",
    "description": "Write and publish your content to the Inks Vault."
  }
};

export function normalizePagePath(path: string): string {
  try {
    const pathname = new URL(path, SITE_URL).pathname;
    return pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "/";
  }
}

export function resolvePageMetadata(path: string): PageMetadata {
  const normalized = normalizePagePath(path);
  const exact = routeMetadata[normalized];
  if (exact) return exact;
  const dynamicRoutes: [RegExp, string, string, string][] = [
    [/^\/committee\/[^/]+$/, "Committee", "Union committees and their responsibilities.", "/governance"],
    [/^\/current-leaders\/[^/]+$/, "Leader Profile", "Meet your student representatives.", "/current-leaders"],
    [/^\/archives\/[^/]+$/, "Archive Exhibit", "Explore the Union’s digital memory.", "/archives"],
    [/^\/inks-vault\/piece\/[^/]+$/, "Literary Piece", "Read student writing in the Inks Vault.", "/inks-vault"],
    [/^\/admin\/inks-vault\/edit\/[^/]+$/, "Edit Piece", "Manage your Inks Vault writing.", "/inks-vault"],
    [/^\/profile\/[^/]+$/, "User Profile", "Student profiles and published work.", "/profile-card"],
    [/^\/governance\/hall\/[^/]+$/, "Hall of Residence", "Explore campus halls of residence.", "/halls"],
    [/^\/resources\/quizlets\/[^/]+$/, "Quizlet", "Take a shared community quiz.", "/resources/quizlets"],
    [/^\/forms\/edit\/[^/]+$/, "Form Builder", "Create and edit a form.", "/forms"],
    [/^\/forms\/s\/[^/]+$/, "Shared Form", "Complete a shared form.", "/forms"],
    [/^\/forms\/responses\/[^/]+$/, "Form Responses", "Review individual form responses.", "/forms"],
    [/^\/events\/checkin\/[^/]+$/, "Event Check-In", "Staff event check-in.", "/events"],
    [/^\/study\/shared\/[^/]+$/, "Shared StudyBuddy Output", "View a shared StudyBuddy study output.", "/resources/study-buddy"],
    [/^\/tutorials\/tutor\/[^/]+$/, "Tutor Profile", "Meet a peer tutor.", "/tutorials"],
    [/^\/tutorials\/[^/]+$/, "Tutorial", "Learn with a peer tutorial.", "/tutorials"],
    [/^\/gazette\/article\/[^/]+$/, "Gazette Article", "Read the campus Gazette.", "/gazette"],
    [/^\/gazette\/issues\/[^/]+$/, "Gazette Issue", "Read a published Gazette issue.", "/gazette/issues"],
    [/^\/gazette\/category\/[^/]+$/, "Gazette Category", "Browse Gazette articles by category.", "/gazette"],
    [/^\/gazette\/editor\/[^/]+$/, "Gazette Editor", "Write and manage Gazette articles.", "/gazette"],
  ];
  for (const [pattern, title, description, parent] of dynamicRoutes) {
    if (pattern.test(normalized)) return { title, description, image: routeMetadata[parent]?.image };
  }
  return { title: "Page Not Found", description: "The page you are looking for does not exist.", image: "/og/pages-screenshot/not-found.png" };
}

export function composePageTitle(title: string, siteName: string): string {
  const name = siteName.trim() || DEFAULT_SITE_DETAILS.siteName;
  let page = title.trim();
  const brands = [DEFAULT_SITE_DETAILS.siteName, "UISU", name];
  if (brands.includes(page)) return name;
  // Strip only a trailing publisher suffix, never brands in a page's own name.
  let changed = true;
  while (changed) {
    changed = false;
    for (const brand of brands) {
      for (const separator of [" | ", " - ", " — ", " – "]) {
        const suffix = separator + brand;
        if (page.endsWith(suffix)) { page = page.slice(0, -suffix.length).trim(); changed = true; }
      }
    }
  }
  return page ? `${page} | ${name}` : name;
}

export function composePageDescription(description: string, siteDescription: string, home = false): string {
  const site = (siteDescription.trim() || DEFAULT_SITE_DETAILS.siteDescription).slice(0, 320);
  const page = description.trim();
  if (home || !page || page === site) return site;
  const available = 320 - site.length - 3;
  if (available <= 0) return site;
  const excerpt = page.slice(0, available).trimEnd();
  return excerpt ? `${excerpt} — ${site}` : site;
}

export function normalizeSocialProfiles(links: SiteDetails["socialLinks"]): SiteDetails["socialLinks"] {
  return links.flatMap((link) => {
    try {
      const parsed = new URL(link.url.trim());
      return ["https:", "http:"].includes(parsed.protocol)
        ? [{ platform: link.platform.trim(), url: parsed.href }] : [];
    } catch { return []; }
  });
}

export function getTwitterHandle(links: SiteDetails["socialLinks"]): string | null {
  for (const link of normalizeSocialProfiles(links)) {
    if (!/^(x|twitter)$/i.test(link.platform)) continue;
    const parsed = new URL(link.url);
    if (!/^(www\.)?(x|twitter)\.com$/i.test(parsed.hostname)) continue;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const handle = parts[0];
    if (parts.length === 1 && handle && /^[a-z0-9_]{1,15}$/i.test(handle)) return handle;
  }
  return null;
}
