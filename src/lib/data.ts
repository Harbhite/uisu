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

export interface ConstitutionSection {
  id: string;
  title?: string;
  content: string;
  subSections?: string[];
}

export interface ConstitutionArticle {
  id: string;
  title: string;
  sections: ConstitutionSection[];
}

export const constitutionData: ConstitutionArticle[] = [
  {
    id: "preamble",
    title: "Preamble",
    sections: [
      {
        id: "preamble-1",
        content: "WE THE STUDENTS of the University of Ibadan, actively conscious of our rights, duties, and responsibilities as citizens of Nigeria and students of this premier university; DETERMINED to promote the welfare of our members, foster academic excellence, and defend the rights of the students; DO HEREBY ENACT, ADOPT AND GIVE TO OURSELVES this Constitution."
      }
    ]
  },
  {
    id: "article-1",
    title: "Article I: Supremacy of the Constitution",
    sections: [
      {
        id: "sec-1-1",
        content: "This Constitution shall be supreme and its provisions shall have binding force on all authorities and persons in the Union."
      },
      {
        id: "sec-1-2",
        content: "If any other law or directive of any organ of the Union is inconsistent with the provisions of this Constitution, this Constitution shall prevail, and that other law shall to the extent of the inconsistency be void."
      }
    ]
  },
  {
    id: "article-2",
    title: "Article II: Aims and Objectives",
    sections: [
      {
        id: "sec-2-1",
        title: "Fundamental Objectives",
        content: "The Union shall be a democratic, independent, and non-partisan organization committed to:",
        subSections: [
          "Promoting the social, intellectual, and cultural heritage of the students.",
          "Defending the rights and privileges of students.",
          "Fostering unity and cooperation among students.",
          "Maintaining good relations with the University authorities and external bodies."
        ]
      }
    ]
  },
  {
    id: "article-3",
    title: "Article III: Membership",
    sections: [
      {
        id: "sec-3-1",
        content: "Membership of the Union shall be open to all matriculated students of the University of Ibadan upon payment of the prescribed Union dues."
      },
      {
        id: "sec-3-2",
        content: "Honorary membership may be conferred on distinguished persons who have contributed significantly to the welfare of the Union, subject to the approval of the Student Representative Council (SRC)."
      }
    ]
  },
  {
    id: "article-4",
    title: "Article IV: Rights and Duties of Members",
    sections: [
      {
        id: "sec-4-1",
        title: "Rights",
        content: "Every member shall have the right to:",
        subSections: [
          "Vote and be voted for in Union elections, subject to constitutional qualifications.",
          "Participate in the activities of the Union.",
          "Use the facilities of the Union.",
          "Freedom of expression, assembly, and association within the Union."
        ]
      },
      {
        id: "sec-4-2",
        title: "Duties",
        content: "Every member shall have the duty to:",
        subSections: [
          "Uphold and defend this Constitution.",
          "Pay Union dues as and when due.",
          "Protect the property of the Union.",
          "Refrain from acts capable of bringing the Union into disrepute."
        ]
      }
    ]
  },
  {
    id: "article-5",
    title: "Article V: The Legislative Council",
    sections: [
      {
        id: "sec-5-1",
        content: "There shall be a Student Representative Council (SRC) which shall be the supreme legislative and policy-making body of the Union."
      },
      {
        id: "sec-5-2",
        content: "The SRC shall consist of elected representatives from each Hall of Residence and Faculty."
      }
    ]
  },
  {
    id: "article-6",
    title: "Article VI: The Executive Council",
    sections: [
      {
        id: "sec-6-1",
        content: "There shall be an Executive Council charged with the day-to-day administration of the Union."
      },
      {
        id: "sec-6-2",
        content: "The Executive Council shall consist of the President, Vice President, General Secretary, Assistant General Secretary, Treasurer, House Secretary, Public Relations Officer, and Sports Secretary."
      }
    ]
  },
  {
    id: "article-7",
    title: "Article VII: The Judicial Council",
    sections: [
      {
        id: "sec-7-1",
        content: "There shall be a Judicial Council vested with the judicial powers of the Union."
      },
      {
        id: "sec-7-2",
        content: "The Judicial Council shall interpret this Constitution and adjudicate on disputes arising from it."
      }
    ]
  },
  {
    id: "article-8",
    title: "Article VIII: Elections",
    sections: [
      {
        id: "sec-8-1",
        content: "There shall be an Electoral Commission independent of the Executive and Legislative arms, charged with conducting free and fair elections."
      },
      {
        id: "sec-8-2",
        content: "Elections into the Executive Council and SRC shall be held annually in the second semester."
      }
    ]
  },
  {
    id: "article-9",
    title: "Article IX: Finance",
    sections: [
      {
        id: "sec-9-1",
        content: "The funds of the Union shall consist of dues, donations, levies, and proceeds from Union activities."
      },
      {
        id: "sec-9-2",
        content: "No expenditure shall be incurred without the approval of the SRC."
      }
    ]
  },
  {
    id: "article-10",
    title: "Article X: Tenure of Office",
    sections: [
      {
        id: "sec-10-1",
        content: "The tenure of all elected officers shall be one academic session."
      },
      {
        id: "sec-10-2",
        content: "No officer shall hold the same office for more than one term."
      }
    ]
  }
];

export interface Amendment {
  id: string;
  date: string;
  articleRef: string;
  description: string;
  status: 'Ratified' | 'Pending' | 'Rejected';
}

export const amendmentsData: Amendment[] = [
  {
    id: "AMDT-2023-01",
    date: "Oct 12, 2023",
    articleRef: "Article IX (Finance)",
    description: "Introduction of electronic payment systems for Union dues to ensure transparency.",
    status: "Ratified"
  },
  {
    id: "AMDT-2024-02",
    date: "Feb 05, 2024",
    articleRef: "Article VIII (Elections)",
    description: "Proposal to adopt full e-voting for all Faculty elections.",
    status: "Pending"
  },
  {
    id: "AMDT-2022-05",
    date: "Nov 20, 2022",
    articleRef: "Article III (Membership)",
    description: "Motion to include Distance Learning Centre (DLC) students as full members.",
    status: "Rejected"
  }
];
