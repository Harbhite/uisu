export interface Leader {
  id?: string;
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

export const executives: Leader[] = [
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
  {
    name: "Emmanuel Nwachukwu",
    role: "Treasurer",
    image: "/placeholder.svg",
    bio: "The custodian of the union's funds, ensuring transparency and accountability in all financial matters.",
    email: "treasurer@uisu.org",
    socials: { linkedin: "#" }
  },
  {
    name: "Grace Oladipo",
    role: "House Secretary",
    image: "/placeholder.svg",
    bio: "Responsible for the maintenance of the Union building and the general welfare of students in halls.",
    email: "housesecretary@uisu.org",
    socials: { twitter: "#" }
  },
  {
    name: "Tobi Adewale",
    role: "Sport Secretary",
    image: "/placeholder.svg",
    bio: "Promotes physical fitness and organizes sporting activities to foster unity among students.",
    email: "sports@uisu.org",
    socials: { instagram: "#" }
  },
  {
    name: "Zainab Ali",
    role: "Assistant General Secretary",
    image: "/placeholder.svg",
    bio: "Assists the General Secretary and manages the union's correspondence and records.",
    email: "ags@uisu.org",
    socials: { twitter: "#" }
  },
];

export const principalOfficers: Leader[] = [
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
    },
    {
        name: "Hon. Chisom Okafor",
        role: "Deputy Clerk",
        image: "/placeholder.svg",
        bio: "Assists the Clerk in administrative duties and record keeping.",
        email: "deputyclerk@uisu.org",
        socials: {}
    },
    {
        name: "Hon. Bello Yusuf",
        role: "Chief Whip",
        image: "/placeholder.svg",
        bio: "Maintains order and discipline within the house.",
        email: "chiefwhip@uisu.org",
        socials: { twitter: "#" }
    }
];

export const hallLeaders: Leader[] = [
    {
        name: "Hon. John Doe",
        role: "Majority Leader (Mellamby)",
        image: "/placeholder.svg",
        bio: "Leading the Mellamby Hall caucus in the SRC.",
        email: "mellamby.leader@uisu.org",
        socials: {}
    },
    {
        name: "Hon. Jane Smith",
        role: "Majority Leader (Queens)",
        image: "/placeholder.svg",
        bio: "Representing the interests of Queen Elizabeth II Hall.",
        email: "queens.leader@uisu.org",
        socials: {}
    },
    {
        name: "Hon. David Lee",
        role: "Majority Leader (Tedder)",
        image: "/placeholder.svg",
        bio: "Voice of the Tedderites in the house.",
        email: "tedder.leader@uisu.org",
        socials: {}
    },
    {
        name: "Hon. Amina Bello",
        role: "Majority Leader (Idia)",
        image: "/placeholder.svg",
        bio: "Championing the cause of Queen Idia Hall residents.",
        email: "idia.leader@uisu.org",
        socials: {}
    }
];

export const legislators = [
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

export interface InksPiece {
  id: string;
  type: 'Article' | 'Blog' | 'Report' | 'Essay' | 'Poetry' | 'Opinion' | 'Interview' | 'Fiction';
  title: string;
  author: string;
  role: string;
  date: string;
  summary: string;
  content: string; // HTML or Markdown string
  coverImage?: string;
  tags?: string[];
}

export const inksPieces: InksPiece[] = [
    // Articles
    {
        id: "art-001",
        type: "Article",
        title: "The Future of Student Unionism",
        author: "Comrade Adeolu",
        role: "Student Thinker",
        date: "2024-05-15",
        summary: "Exploring the evolving dynamics of student activism in the digital age.",
        content: "<p>Student unionism in Nigeria has evolved significantly over the decades...</p><p>With the advent of social media, the mobilization of students has taken a new dimension...</p>",
        tags: ["Activism", "Digital", "Union"]
    },
    {
        id: "art-002",
        type: "Article",
        title: "Campus Security: A Collective Responsibility",
        author: "Security Committee",
        role: "Committee Report",
        date: "2024-04-10",
        summary: "An in-depth look at the security measures in place and how students can contribute.",
        content: "<p>Security is not just the job of the Abefele...</p>",
        tags: ["Security", "Welfare"]
    },

    // Blogs
    {
        id: "blog-001",
        type: "Blog",
        title: "My First Week on Campus",
        author: "Chinedu Okeke",
        role: "Fresher",
        date: "2024-02-01",
        summary: "Navigating the maze of registration and finding the best cafeteria.",
        content: "<p>I arrived at the gate with two heavy bags and a heart full of hope...</p>",
        tags: ["Fresher", "Lifestyle"]
    },
    {
        id: "blog-002",
        type: "Blog",
        title: "Exam Season Survival Guide",
        author: "Funke Akindele",
        role: "Medical Student",
        date: "2024-06-01",
        summary: "Tips and tricks to stay healthy and focused during the marathon.",
        content: "<p>Coffee is your friend, but sleep is your lover...</p>",
        tags: ["Academics", "Health"]
    },

    // Reports
    {
        id: "rep-001",
        type: "Report",
        title: "Semester Financial Report",
        author: "Office of the Treasurer",
        role: "Official",
        date: "2024-07-20",
        summary: "Detailed breakdown of income and expenditure for the first semester.",
        content: "<h3>Income</h3><ul><li>Dues: N10m</li><li>Donations: N5m</li></ul><h3>Expenditure</h3>...",
        tags: ["Finance", "Transparency"]
    },
    {
        id: "rep-002",
        type: "Report",
        title: "Welfare Committee Findings",
        author: "Welfare Secretary",
        role: "Official",
        date: "2024-03-15",
        summary: "Report on the state of hostel facilities and recommendations.",
        content: "<p>The state of the tanks in Idia Hall requires urgent attention...</p>",
        tags: ["Welfare", "Infrastructure"]
    },

    // Essays
    {
        id: "ess-001",
        type: "Essay",
        title: "The Role of the Intellectual in Politics",
        author: "Prof. Wole Soyinka (Guest)",
        role: "Guest Writer",
        date: "2023-11-05",
        summary: "A philosophical treatise on why students must engage with governance.",
        content: "<p>The man dies in all who keep silent in the face of tyranny...</p>",
        tags: ["Politics", "Philosophy"]
    },

    // Poetry
    {
        id: "poet-001",
        type: "Poetry",
        title: "Ode to the Greatest Uite",
        author: "Simi The Poet",
        role: "Student",
        date: "2024-01-01",
        summary: "Verses celebrating the resilience and spirit of the UI student.",
        content: "<p class='text-center italic'>In the heat of the sun,<br/>We march as one.<br/>Greatest Uites!<br/>We fear no fight.</p>",
        tags: ["Culture", "Art"]
    },

    // Opinion
    {
        id: "op-001",
        type: "Opinion",
        title: "Why We Need E-Voting",
        author: "Tech Enthusiast",
        role: "Student",
        date: "2024-05-20",
        summary: "Arguing for a full transition to digital ballots for transparency.",
        content: "<p>The era of paper ballots is over. It is prone to snatching and delay...</p>",
        tags: ["Technology", "Elections"]
    },

    // Interview
    {
        id: "int-001",
        type: "Interview",
        title: "Sitting Down with the VC",
        author: "Press Club",
        role: "Journalist",
        date: "2024-08-10",
        summary: "An exclusive conversation with the Vice Chancellor on tuition fees.",
        content: "<p><strong>Press:</strong> Sir, why the hike?</p><p><strong>VC:</strong> Inflation affects us all...</p>",
        tags: ["Administration", "Exclusive"]
    },

    // Fiction
    {
        id: "fic-001",
        type: "Fiction",
        title: "The Ghost of Tedder Hall",
        author: "Storyteller X",
        role: "Student Writer",
        date: "2023-10-31",
        summary: "A spooky short story set in the corridors of Lord Tedder Hall.",
        content: "<p>It was a dark and stormy night. The lights flickered in Block C...</p>",
        tags: ["Fiction", "Horror"]
    }
];

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  path: string;
}

export const resourceCategories: ResourceCategory[] = [
  {
    id: 'academic',
    title: 'Academic Bank',
    description: 'E-library with course materials, past questions, and general knowledge resources.',
    color: 'bg-blue-500',
    path: '/resources/academic-bank'
  },
  {
    id: 'career',
    title: 'Career Hub',
    description: 'Job listings, internship opportunities, CV templates, and career advice.',
    color: 'bg-green-500',
    path: '/resources/career-hub'
  },
  {
    id: 'scholarship',
    title: 'Scholarship Finder',
    description: 'Database of local and international funding opportunities for students.',
    color: 'bg-yellow-500',
    path: '/resources/scholarships'
  },
  {
    id: 'wellness',
    title: 'Mental Wellness',
    description: 'Resources for mental health, counseling services, and self-care tools.',
    color: 'bg-rose-500',
    path: '/resources/mental-wellness'
  },
  {
    id: 'study',
    title: 'Study Tools',
    description: 'Productivity apps, study techniques, and time management tools.',
    color: 'bg-purple-500',
    path: '/resources/study-tools'
  },
  {
    id: 'skills',
    title: 'Skill Up',
    description: 'Workshops, tutorials, and certification courses to boost your portfolio.',
    color: 'bg-orange-500',
    path: '/resources/skill-up'
  },
  {
    id: 'market',
    title: 'Student Mart',
    description: 'Buy and sell textbooks, gadgets, and hostel essentials within the campus.',
    color: 'bg-teal-500',
    path: '/resources/student-mart'
  },
  {
    id: 'freshers',
    title: 'Freshers\' Compass',
    description: 'Orientation guides, campus maps, and survival tips for new students.',
    color: 'bg-indigo-500',
    path: '/resources/freshers-guide'
  },
  {
    id: 'alumni',
    title: 'Career Pathfinder',
    description: 'Discover career paths, explore trajectories by department, and learn from UI alumni journeys.',
    color: 'bg-cyan-500',
    path: '/resources/career-pathfinder'
  },
  {
    id: 'health',
    title: 'Campus Health',
    description: 'Clinic schedules, emergency contacts, and physical health resources.',
    color: 'bg-red-500',
    path: '/resources/campus-health'
  },
  {
    id: 'gpa',
    title: 'GPA Calculator',
    description: 'Calculate your semester and cumulative GPA with our easy-to-use tool.',
    color: 'bg-emerald-500',
    path: '/resources/gpa-calculator'
  },
  {
    id: 'calculators',
    title: 'Calculator Suite',
    description: 'A collection of 10 calculators: basic, scientific, percentage, unit converter, and more.',
    color: 'bg-violet-500',
    path: '/resources/calculator-suite'
  }
];
