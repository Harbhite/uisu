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
  },
  {
    id: 'studybuddy',
    title: 'StudyBuddy AI',
    description: 'AI-powered tool to explain concepts, plan study schedules, summarize materials, and debate topics.',
    color: 'bg-blue-600',
    path: '/resources/study-buddy'
  },
  {
    id: 'aiquiz',
    title: 'AI Quiz',
    description: 'Upload study materials and get 25 tailor-made quiz questions at your chosen rigidity level.',
    color: 'bg-rose-600',
    path: '/resources/ai-quiz'
  },
  {
    id: 'flashcards',
    title: 'AI Flashcards',
    description: 'Generate smart flashcards from any topic or material. Flip, shuffle, and master concepts.',
    color: 'bg-amber-600',
    path: '/resources/flashcards'
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
    title: "Preamble and Establishment",
    sections: [
      {
        id: "preamble-1",
        content: "RECOGNISING the need to consolidate ourselves into a truly active and progressive association in order to protect the rights of our students and discharge our responsibilities as informed members of the society, subject to the authority of Senate;",
        subSections: [
          "REALISING the need to support by all lawful means the fundamental freedom of thought and expression, association and movement;",
          "APPRECIATING the problems of our society and the role we must play in the maintenance of a democratic, open and progressive educational system whereby every Nigerian citizen shall have equal opportunity to education;",
          "COMMITTED to harnessing the enthusiasm of students for dynamic, purposeful, political, socio-economic and technological development;",
          "DEDICATED to the total liberation of our fatherland (Nigeria) from all forms of domination and the attainment of Nigerian Unity;",
          "DETERMINED to engage our members in the national scheme of social progress aimed at the total mobilization of the Nigerian Students towards realizing National ideals and to draw attention at all times and in all places to any form of exploitation, discrimination, oppression and any other social vices among the students, and to work for the realization of peace in our community."
        ]
      },
      {
        id: "preamble-2",
        content: "We, the students of the University of Ibadan, Ibadan, Federal Republic of Nigeria, having firmly and solemnly resolved to perpetuate and enhance the advancement of the Students’ Union of the aforesaid University, do hereby enact, subject to the approval of Senate, the following Constitution."
      },
       {
        id: "preamble-3",
        content: "This shall be the Constitution of the Students Union, University of Ibadan, Ibadan, hereinafter referred to as the UNION and its provisions shall be binding on all members of the Union."
      }
    ]
  },
  {
    id: "article-1",
    title: "Article I: Establishment and General Purpose",
    sections: [
      {
        id: "art-1-1",
        content: "There shall be a Student Union of the University of Ibadan herein referred to as the Union, which shall serve as the umbrella body for all students in the University and shall be constituted with the provisions of this Constitution."
      },
      {
        id: "art-1-2",
        content: "The offices of the Union will be in the Kunle Adepeju Memorial Building, University of Ibadan, from where the management and general superintendence of the business of the Union shall be carried out."
      }
    ]
  },
  {
    id: "article-2",
    title: "Article II: Aims",
    sections: [
      {
        id: "art-2-1",
        content: "The aims of the Union shall be:",
        subSections: [
          "(a) To promote the social, cultural, intellectual and recreational interests of its members.",
          "(b) To promote the good name of the University of Ibadan and to cherish, uphold and further the traditions of the University;",
          "(c) To maintain contacts and cooperate with other organizations whose aims and objectives are acceptable to the Union and the University;",
          "(d) To foster the interest of its members."
        ]
      }
    ]
  },
  {
    id: "article-3",
    title: "Article III: Membership and Privileges",
    sections: [
      {
        id: "art-3-1",
        title: "Class of Membership",
        content: "Student Union participation is open to every student.",
        subSections: [
            "(i) Ordinary Members: An ordinary member shall be any matriculated student of the University pursuing a full-time degree course of study, provided that such a student shall have paid his/her Union subscriptions.",
            "(ii) Honorary Members: The Students’ Representative Council (SRC) may confer honorary membership on any person or persons by the reason of the interest of such a person or persons in students and academic matters, especially, as relating to the Union and the University of Ibadan. A person shall be conferred with an honorary membership of the Union, through a motion to that effect, supported by not less than 2/3 of the membership of the SRC present and voting at a special meeting. Any persons so conferred with honorary membership of the Union shall be awarded a certificate signed by the President of the Union and the Speaker of the SRC.",
            "(iii) Life Members: Life membership shall be conferred on such past members of the Union as may be appointed by the Students Representative Council to the Roll of Honours of the Students’ Union by reasons of their past activities in the Union and their interest and role in public life. Any person(s) so honoured with such an appointment shall be by a motion supported by 4/5th of the membership of the SRC present at a special meeting of the Council and shall be awarded a certificate signed by the President of the Union and the Speaker of the SRC."
        ]
      },
      {
        id: "art-3-2",
        title: "Privileges",
        content: "",
        subSections: [
          "(i) Ordinary Members shall have the privileges to:",
          "(a) Obtain on first registration, a copy of the Union’s Constitution on payment of prescribed fee.",
          "(b) Use the facilities provided by the Union.",
          "(c) Wear or display the official colours of the Union",
          "(d) Be members of recognized affiliated clubs and societies of the Union subject to the membership requirements of clubs and societies, provided that no club or society shall infringe on the fundamental human rights of any Union member.",
          "(e) Participate in recognized meetings and functions of the Union, subject to the provisions of this Constitution.",
          "(f) Vote and be voted for in approved Union elections.",
          "(g) Append signature to a referendum requesting Extraordinary General Meetings.",
          "(ii) Honorary Members shall have the right to:",
          "(a) Use the facilities provided by the Union.",
          "(b) Attend all meetings of the Union. Such honorary members shall have no voting rights.",
          "(iv) Life Members: A life member shall have the same right and privileges as an honorary member."
        ]
      }
    ]
  },
  {
    id: "article-4",
    title: "Article IV: The Executive Committee",
    sections: [
      {
        id: "art-4-1",
        content: "The Executive Committee of the Union shall consist of the following:",
        subSections: [
          "(a) President",
          "(b) Vice-President",
          "(c) General Secretary",
          "(d) Assistant General Secretary",
          "(e) Treasurer",
          "(f) House Secretary",
          "(g) Public Relations Officer",
          "(h) Sports Secretary"
        ]
      },
      {
        id: "art-4-2",
        title: "Terms of Offices of Union Officials/Officers",
        content: "All officers of the Union shall hold office for one academic year except in case of death, resignation, rustication, expulsion or dissolution by an appropriate University authority or otherwise incapacitated on grounds of ill health."
      }
    ]
  },
  {
    id: "article-5",
    title: "Article V: Duties of Officers",
    sections: [
      {
        id: "art-5-1",
        title: "1. PRESIDENT",
        content: "",
        subSections: [
          "(i) Shall be the first member and head of the Union;",
          "(ii) Shall be the Head of the Executive Committee of the Union;",
          "(iii) Shall harmonise, coordinate and exercise control over all executive aspects of Union activities;",
          "(iv) Shall exercise all such powers and carry out all such other duties hereinafter allocated to his/her office by other articles of this Constitution;",
          "(v) Shall be the Chairman/Chairperson of all meetings held under the auspices of the Union, except those of the SRC or where there are duly elected Chairmen;",
          "(vi) Shall direct the General Secretary to summon all meetings of the Executive Committee and the General Meetings of the Union as recognized by this Constitution;",
          "(vii) Shall present the budget of the Union to the Council for approval."
        ]
      },
      {
        id: "art-5-2",
        title: "2. VICE-PRESIDENT",
        content: "",
        subSections: [
          "(i) Shall be responsible for the organization of the Union Week as the Chairman/Chairperson of the Union Week Committee;",
          "(ii) Shall assist and advise the President in the performance of his/her duties and shall act for him in his absence, or when s/he is unable or incapable of discharging his duties under this Constitution;",
          "(iii) Shall be the Chairman/Chairperson of the Academic Committee of the Union;",
          "(iv) Shall direct and carry out such other activities that may be delegated to him/her from time to time by the President;",
          "(v) Shall automatically become the President if the post becomes vacant before the expiration of the tenure of the President."
        ]
      },
      {
        id: "art-5-3",
        title: "3. GENERAL SECRETARY",
        content: "",
        subSections: [
            "(i) Shall be the head of the Union Secretariat;",
            "(ii) Shall convene all Executive and General Meetings of the Union, at the request of the President;",
            "(iii) Shall keep the attendance books, the minutes and the records of Executive Committee and General Meetings;",
            "(iv) In consultation with the President, s/he shall compile and present first to the Students Representative Council (SRC) and then to the General Meeting (GM) of the Union, a full report of all the activities of the Union within the period of his/her tenure of office, or as may be demanded from time to time by the Council;",
            "(v) Shall carry out such other duties as may be directed from time to time by the Executive Committee and other articles of this Constitution;",
            "(vi) Shall supervise the clerical staff of the Union."
        ]
      },
      {
        id: "art-5-4",
        title: "4. ASSISTANT GENERAL SECRETARY",
        content: "",
        subSections: [
            "(i) Shall coordinate the 'Welcome Week' activities for fresh Students;",
            "(ii) Shall assist the General Secretary in the performance of his/her duties and shall act for the Secretary in his/her absence;",
            "(iii) Shall carry out any such other duties as may be assigned to him/her by the Executive Committee and by other articles of this Constitution;",
            "(iv) Shall coordinate all NANS related activities on Campus in consultation with the President;",
            "(v) Shall automatically become the General Secretary, if the post of the General Secretary becomes vacant before the end of the tenure of the Secretary."
        ]
      },
      {
        id: "art-5-5",
        title: "5. TREASURER",
        content: "",
        subSections: [
            "(i) Shall receive, and account for, all the Union’s monies derived from all sources;",
            "(ii) Shall deposit all monies so received in the Union’s bank account on the next working day after such receipt;",
            "(iii) Shall jointly, with the General Secretary and the President or in his/her absence the acting President, sign cheques for withdrawal of monies within the limit prescribed by the approved budget;",
            "(iv) Shall be responsible to the Executive and Council for the disbursement of the approved expenditure of the Union;",
            "(v) Shall keep all the books of account and other statutory books, cheque books and account vouchers, and present these to the Finance Committee of Council and other bodies set up by the Union and/or the University for such purposes on demand for proper accountability;",
            "(vi) Shall submit at the monthly Executive Committee Meetings, all receipts and payment vouchers and the balances of the Union funds;",
            "(vii) Shall be responsible for keeping of an imprest as may be approved by the Executive from time to time;",
            "(viii) Shall advise the Executive Committee on financial matters."
        ]
      },
      {
        id: "art-5-6",
        title: "6. HOUSE SECRETARY",
        content: "",
        subSections: [
            "(i) Shall be the Chairman/Chairperson of the Welfare Committee of the Union.",
            "(ii) Shall maintain a proper inventory of all union properties.",
            "(iii) Shall be responsible for the maintenance of the Union Building and other properties of the Union.",
            "(iv) Shall supervise all contractors and ensure the efficient and thorough execution of every Union contract.",
            "(v) Shall supervise all the non-clerical staff of the Union.",
            "(vi) Shall submit to the Executive Committee and Council a statement of account of the Students Union Building shops and spaces, in conjunction with the Union Treasurer every semester and at any other time, on demand."
        ]
      },
      {
        id: "art-5-7",
        title: "7. PUBLIC RELATIONS OFFICER",
        content: "",
        subSections: [
            "(i) Shall be the Chairman/Chairperson of the following Committees/Clubs of the Union: (a) Publicity Committee (b) Press Club (c) Library and Publications",
            "(ii) Shall coordinate the literary and debating activities of the Union.",
            "(iii) Shall be in charge of the Union Library.",
            "(iv) Shall make such press statements on behalf of the Union as deemed fit by the Executive Committee and in consultation with the President."
        ]
      },
      {
        id: "art-5-8",
        title: "8. SPORTS SECRETARY",
        content: "",
        subSections: [
            "(i) Shall be the Chairman of the Sports Committee",
            "(ii) Shall coordinate all sporting activities and clubs of the Union",
            "(iii) Shall, after the first meeting of the Sports Committee and in full consultation with the Sports Council present the Union with a programme of sporting activities for the session. He shall display the approved programmes on all notice boards."
        ]
      }
    ]
  },
  {
    id: "article-6",
    title: "Article VI: Accountability of Union Officials",
    sections: [
        {
            id: "art-6-1",
            content: "",
            subSections: [
                "(i) In their conduct of the affairs of the Union, officials shall be individually or jointly responsible for any act or omission perpetrated in the performance of their duties.",
                "(ii) Every Union official shall be financially accountable for expenses incurred on behalf of the Union and Union Secretariat in respect of his office.",
                "(iii) Every official of the Union shall take due care and give proper account of any Union properties entrusted to his/her care and hand over same to his/her successor by means of a well prepared document designed for the purpose.",
                "(iv) A successor to an office shall lodge immediate complaints to the SRC about any Union property which cannot be traced. If such a successor for any reason should fail to lodge the necessary complaint s/he shall be held accountable for such a property."
            ]
        },
        {
            id: "art-6-2",
            title: "Audit Committee",
            content: "There should be an Audit Committee composed of: Deputy Registrar (Students) – Chairman; A nominee of the University’s Chief Internal Auditor (CIA); Student Union Treasurer; The Speaker of SRC.",
            subSections: [
                "FUNCTIONS: To audit the account of the Students Union once every six months and to present a Report to both the Students Union Parliament and University Authorities through the Dean of Students for appropriate action."
            ]
        }
    ]
  },
  {
    id: "article-7",
    title: "Article VII: Duties of the Executive Committee",
    sections: [
      {
        id: "art-7-1",
        content: "Subject to the provisions of this Constitution, the executive powers of the Union shall be vested in the Executive Committee, which shall be competent to represent the Union in all matters affecting students. The Executive Committee shall accordingly:",
        subSections: [
          "i. Carry out the day-to-day running of the Union",
          "ii. Keep the Council constantly informed of its actions and be responsible to same for such actions.",
          "iii. Subject to the control and approval of the Council and ultimately the Union’s General Meetings (Congress), seek all concessions, grants and authorizations from the University or from outside the University after due notification of, and approval by, the University Authorities.",
          "iv. Take proper care of Union Property (including Union funds).",
          "v. Refer cases of misconduct relating to (iii) and (iv) above through the Council to the SDC."
        ]
      }
    ]
  },
  {
    id: "article-8",
    title: "Article VIII: Termination of Membership of the Executive Committee",
    sections: [
        {
            id: "art-8-1",
            content: "",
            subSections: [
                "(i) Any member of the Executive Committee may, after giving, at least, one month’s notice, resign his/her seat.",
                "(i) Notice referred to in (i) above shall, in the case of the President, be given to the General Secretary and in the case of any other member of the Executive Committee to the President who shall notify the Council. In the case of the President and General Secretary, the Vice-President and the Assistant General Secretary automatically step in. Where there is no deputy, a bye-election should be organized within 30 days.",
                "(ii) A member of the Executive Committee shall be suspended from office after a prima facie case of misconduct has been established by a Committee of the SRC (Council), a resolution passed by 2/3 majority of the members voting at an ordinary meeting of Council.",
                "(iii) The Council shall sit after 21 days to review its earlier decision on such a suspended officer.",
                "(iv) The expiration of the term of office, resignation or removal of a member of the Executive shall not absolve him/her from liabilities or irregularities committed by him/her during his/her term of office."
            ]
        }
    ]
  },
  {
    id: "article-9",
    title: "Article IX: Meetings of the Executive Committee",
    sections: [
        {
            id: "art-9-1",
            content: "",
            subSections: [
                "(i) The Executive Committee of the Union shall meet as often as necessary but, at least, once in a month for the effective running of the Union.",
                "(ii) It shall be the duty of the President, acting through the Secretary, to summon the meetings of the Executive Committee.",
                "(iii) The President, or by his/her permission, his/her deputy, the Secretary or his/her Assistant and any other two members shall constitute a quorum at any Executive Committee meeting.",
                "(iv) The President shall cause a meeting of the Executive Committee to be convened within 3 days of the receipt of a request signed by at least any three members of the Executive Committee.",
                "(v) The Executive Committee shall decide the manner in which it shall vote on any matter before it.",
                "(vi) It shall be the duty of the General Secretary or in his/her absence, the Assistant General Secretary, to take minutes of meetings of the Executive Committee and circulate same to members within 3 days of the sitting of such meetings.",
                "(vii) A member of the Executive Committee who, without reasonable cause, absents himself/herself from three consecutive monthly meetings of the Executive shall be deemed to have vacated his/her office and the Council should be notified of such."
            ]
        }
    ]
  },
  {
    id: "article-10",
    title: "Article X: Elections",
    sections: [
        {
            id: "art-10-1",
            content: "",
            subSections: [
                "(i) Elections shall normally be held not later than 30 days after resumption in a new session.",
                "(ii) Any Union officer wishing to contest at any Union election shall have resigned any previous political appointments, and such resignations shall have been made public before the close of nominations.",
                "(iii) Candidates must neither be in their first year of registration nor in their final year.",
                "(iv) Candidates must have a minimum CGPA of 3.5 or no reference at all in the case of students in Medicine and Dentistry.",
                "(v) Any member of the Union who has been found guilty of gross misconduct as stipulated in the Student Information Handbook shall not be eligible to contest any Union election."
            ]
        }
    ]
  },
  {
    id: "article-11",
    title: "Article XI: Electoral Commission",
    sections: [
        {
            id: "art-11-1",
            content: "(i) Union election shall be conducted by an Electoral Commission constituted for election purposes.",
        },
        {
            id: "art-11-2",
            content: "(ii) The Electoral Commission shall consist of the following:",
            subSections: [
                "· Chairman, who will be Deputy Registrar (Students)",
                "· One Representative from each Hall of Residence",
                "· One Representative from each Faculty."
            ]
        }
    ]
  },
  {
    id: "article-12",
    title: "Article XII: Powers of the Electoral Commission",
    sections: [
        {
            id: "art-12-1",
            content: "",
            subSections: [
                "(i) It shall draw up electoral regulations and guidelines subject to the provisions of this Constitution and other relevant rules and regulations of the University. Such rules and regulations shall be published at least 14 days before the date of election.",
                "(ii) It shall screen all aspirants, have the powers to clear or reject the candidature of any aspirant and make clear, the basis for its decision either way.",
                "(iii) Shall listen to complaints arising from electoral petitions before the conduct of any election.",
                "(iv) There shall be an Electoral Petition Tribunal set up by the Vice-Chancellor and with the Dean of Students as chairman. Any complaints after the election shall be referred to the Electoral Petition Tribunal for arbitration. All electoral petitions shall be heard and determined within 14 days of the election for the post in question."
            ]
        }
    ]
  },
  {
    id: "article-13",
    title: "Article XIII: General Meetings of the Union",
    sections: [
        {
            id: "art-13-1",
            title: "(Hereinafter referred to as the Congress)",
            content: "",
            subSections: [
                "(a) President shall be the Chairman of Congress. In his absence, the Vice-President or in that order the Speaker or any member elected by a validly constituted Congress.",
                "(b) Congress shall be summoned by the Chairman on the approval of the Council. The President, on the receipt of 250 signatories of the students, shall direct the General Secretary to summon the Congress.",
                "(c) Congress shall also be summoned by a resolution of Council.",
                "(d) Voting shall be by a show of hands or otherwise as requested by Congress.",
                "(e) Congress shall meet at least once in an academic year.",
                "(f) The quorum for a valid meeting of Congress shall be 500."
            ]
        }
    ]
  },
  {
    id: "article-14",
    title: "Article XIV: Powers of the Congress",
    sections: [
        {
            id: "art-14-1",
            content: "",
            subSections: [
                "(a) The Congress shall have the power to rescind any decision of the Executive and Council.",
                "(b) The decision of the Congress on any matter shall be final.",
                "(c) It shall have the power to suspend/dismiss from office any member of the Union Executive found guilty of any misconduct. Such dismissal should be subject to 2/3 of the members present at the meeting.",
                "(d) In the event of the Union not having a validly constituted executive committee and SRC, the Vice-Chancellor, on the recommendation of the Dean of Students, shall set up a Caretaker Committee.",
                "(e) The duration of the Caretaker Committee’s operation shall not exceed 3 months.",
                "(f) Whenever an officer of the Union is dismissed by Congress, election of a new officer shall be held not later than 30 days after such dismissal, unless otherwise provided for by this Constitution."
            ]
        }
    ]
  },
  {
    id: "article-15",
    title: "Article XV: Union Missions and Delegations",
    sections: [
        {
            id: "art-15-1",
            content: "",
            subSections: [
                "(i) All Union Missions and/or Delegations to any standing, ordinary, national and/or international meeting, conference, seminar, etc. shall be led by the Union President or his representative.",
                "(ii) Whenever more than one person is required for any particular mission and/or delegation, the number in excess of one shall be nominated by the Executive.",
                "(iii) Immediately upon their return, the leader of any Union mission and/or delegation shall present a written report to the next meeting of Council."
            ]
        }
    ]
  },
  {
    id: "article-16",
    title: "Article XVI: Forfeiture of Seats, Resignations and Bye-Elections",
    sections: [
        {
            id: "art-16-1",
            content: "",
            subSections: [
                "(i) A Councillor shall be deemed to have forfeited his/her seat in Council should s/he absent himself/herself from three consecutive meetings of Council without a written explanation to the Speaker. This shall be announced to the Council by the Speaker who shall inform the Electoral Commission for a bye-election.",
                "(ii) A Councillor shall be deemed to have forfeited his/her seat on receipt of a demand to that effect signed by, at least, 2/3 majority of members of his constituency, provided that such a demand shall contain the reason(s) for his removal.",
                "(iii) A Councillor wishing to resign his membership of Council shall, in the first instance, do so in his constituency through his majority leader and from that constituency, thereafter, he shall communicate his decision to the Speaker who shall promptly inform the Council.",
                "(iv) A co-opted councilor wishing to resign his membership of Council shall send his/her letter of resignation to the Speaker.",
                "(v) A Councillor shall automatically vacate his/her seat on ceasing to be a member of the Union or during his suspension for misconduct from the Hall or the University. In the case of suspension, Council shall decide, by a majority vote, whether he should forfeit his seat permanently or not.",
                "(vi) A Councillor who forfeits his/her seat in Council shall automatically forfeit his membership of any Union Committee.",
                "(vii) The Speaker shall, through the Electoral Commission, fill the vacancies in Council arising from forfeiture of seats or resignation. Such vacancies shall normally be filled within forty days."
            ]
        }
    ]
  },
  {
    id: "article-17",
    title: "Article XVII: The Students' Representative Council",
    sections: [
        {
            id: "art-17-1",
            content: "There shall be a Students’ Representative Council (SRC) hereinafter referred to as the “Council” which shall be the representative policy making body of the Union. Membership of Council shall consist of:",
            subSections: [
                "(i) Representatives elected from the respective Halls of Residence, on the basis of one member representing not less than 100 students.",
                "(ii) Not more than five persons, at least two of whom shall be foreign students, to be co-opted by the Executive Committee to represent interests, which may not be adequately represented in Council.",
                "(iii) The representative from each hall who scores the highest number of votes shall be called “majority leader”.",
                "(iv) The Presidents of Faculty Students Associations are automatic members of the Council.",
                "(v) The quorum shall be 1/3 of the entire number of members.",
                "(vi) All House Committees shall be constituted by the Council.",
                "(vii) The tenure of the SRC shall be one academic session."
            ]
        }
    ]
  },
  {
    id: "article-18",
    title: "Article XVIII: The Speaker",
    sections: [
        {
            id: "art-18-1",
            content: "",
            subSections: [
                "(i) The speaker shall be elected in the first Council meeting by a simple majority of members of Council present and voting in the first or any other meeting called for that purpose.",
                "(ii) He/She shall be an elected member of the Council and not in the Executive.",
                "(iii) The Speaker, acting through the Clerk of the Council, shall cause resolutions of the House to be circulated.",
                "(iv) Unless previously removed, a Speaker shall hold office until the election of a new Speaker in the following session. He/She shall preside over the election of a new Speaker.",
                "(v) The Speaker may be suspended or removed from office by a resolution adopted at a meeting of the Council by a 2/3 majority of all the members of the House and voting at a special meeting only."
            ]
        }
    ]
  },
  {
    id: "article-19",
    title: "Article XIX: Deputy Speaker",
    sections: [
        {
            id: "art-19-1",
            content: "",
            subSections: [
                "(i) There shall be a Deputy Speaker who shall assist the Speaker in the performance of his/her duties.",
                "(ii) The Deputy Speaker who shall be an elected member of the Council shall be elected by a simple majority of members at a meeting called for that purpose.",
                "(iii) In case of (ii) above, the candidates for the Deputy Speakership must have indicated their intention in writing to Council. The nomination shall bear the name of the proposing Councillor and his/her seconder.",
                "(iv) In the event that the Speaker is unable to attend a Council meeting, the Deputy Speaker shall act on his/her behalf.",
                "(v) In case of the removal of the Speaker, the Deputy Speaker shall automatically become the substantive Speaker until the expiration of the latter’s term of office.",
                "(vi) Whenever the Deputy Speaker becomes the substantive Speaker, the Council shall elect a new Deputy Speaker as laid down in Article XI(ii).",
                "(vii) The Deputy Speaker may be suspended or removed as in Article XI(v)."
            ]
        }
    ]
  },
  {
    id: "article-20",
    title: "Article XX: Clerk of Council",
    sections: [
        {
            id: "art-20-1",
            content: "",
            subSections: [
                "(i) Shall be elected by the Council from among its members by a simple majority.",
                "(ii) Shall take minutes and keep proper records of the proceedings of all Council meetings.",
                "(iii) Shall at the request of the Speaker, cause the circulars and agenda for meetings of the Council to be sent to each member at least one week before any Council meeting.",
                "(iv) Shall perform any other functions as may be specified by the Speaker from time to time."
            ]
        }
    ]
  },
  {
    id: "article-21",
    title: "Article XXI: Chief Whip",
    sections: [
        {
            id: "art-21-1",
            content: "",
            subSections: [
                "(i) There shall be for the Council a Chief Whip who shall be an elected member of the Council.",
                "(ii) The Speaker shall present to the Council, a nominee for the post of Chief Whip.",
                "(iii) The appointment of the Chief Whip shall be subject to an approval by 2/3 majority of members voting at the first or any other ordinary Council meeting.",
                "(iv) It shall be the duty of the Chief Whip to maintain order at Council meetings.",
                "(v) It shall be the duty of the Chief Whip to bring to the notice of the Speaker any transgression of the standing orders or any other matter that might obstruct the good governance of Council and Council meetings.",
                "(vi) In the absence of the Chief Whip, a meeting of the Council may elect one of its members by a simple majority to act at that particular meeting only."
            ]
        }
    ]
  },
  {
    id: "article-22",
    title: "Article XXII: Term of Office of Council",
    sections: [
        {
            id: "art-22-1",
            content: "The term of office of Council shall expire at the swearing-in of a new Council, in the following session."
        }
    ]
  },
  {
    id: "article-23",
    title: "Article XXIII: Ordinary Meetings of Council",
    sections: [
        {
            id: "art-23-1",
            content: "",
            subSections: [
                "(i) The inaugural meeting of the Council shall normally be held not later than two weeks after its election and it shall immediately follow the swearing in of members.",
                "(ii) Meetings of Council shall be held as often as necessary for effective running of the Union. There shall, be at least, 2 meetings of Council every semester.",
                "(iii) The officers of the Council shall be the Speaker, Deputy Speaker, Clerk of the Council and the Chief Whip.",
                "(iv) It shall be the duty of the Speaker, acting through the Clerk of the Council, to summon meetings of the Council. Notice of all such meetings shall be circulated to all members, and such notices announcing same shall be pasted conspicuously in the halls and notice boards, at least, one week before the time of sitting.",
                "(v) One third of the total membership shall constitute a quorum for all ordinary Council meetings.",
                "(vi) Voting at Council meetings shall be by show of hands except when members press for a ballot.",
                "(vii) Except as otherwise provided for in the Constitution, every question or proposal shall be decided by a simple majority of votes of members of Council.",
                "(viii) Minutes of Council meetings shall be recorded by the Clerk of Council in a book kept for that purpose. Such minutes shall after approval by Council, be signed by the Speaker and the Clerk of the meeting at which they are read, and displayed on all students’ notice boards in the Halls, Students Union Buildings, Faculties and such other places as Council may direct. Every such minutes, when so recorded and signed, shall be considered a correct record of proceedings.",
                "(ix) In the absence of the Clerk of Council, the meeting may elect one of its members to act at that particular meeting only.",
                "(x) The Speaker shall announce, at every ordinary Council session, the names of members who have sent in apologies to the Clerk to absent themselves."
            ]
        }
    ]
  },
  {
    id: "article-24",
    title: "Article XXIV: Emergency Meetings of Council",
    sections: [
        {
            id: "art-24-1",
            content: "",
            subSections: [
                "(i) The Speaker shall have power to summon emergency meeting(s) of Council whenever s/he considers it necessary.",
                "(ii) The Speaker shall cause an emergency meeting of the Council to be summoned at the request of the President or on receipt of a written request signed by one third of the entire membership of Council within 48 hours of the receipt of such a request.",
                "(iii) Notice of an emergency meeting shall, as much as possible, be delivered by hand into the rooms of all members of Council (where possible) and shall be conspicuously displayed on the notice boards in all Halls of Residence, Faculties, and the Union Building, at least, twelve hours before the time of the sitting and such a notice shall include the agenda for the meeting.",
                "(iv) One third of the entire membership of Council shall constitute a quorum at its emergency meeting.",
                "(v) Procedure at emergency meetings shall be the same as in ordinary meetings of Council."
            ]
        }
    ]
  },
  {
    id: "article-25",
    title: "Article XXV: Powers of Council",
    sections: [
        {
            id: "art-25-1",
            content: "",
            subSections: [
                "(i) The Council shall be the policy making body of the Union.",
                "(ii) The Council shall take cognizance of any report which may be brought before it involving the conduct of any member of the Union which affects the reputation of the Union, and refer such matters to a Committee set up for that purpose.",
                "(iii) The Council shall have the power to:",
                "(a) Summon a general meeting of the Union by a resolution passed by two thirds of members voting at an ordinary meeting;",
                "(b) Set up after consultation with the University Authorities, a Caretaker Executive Committee when the elected Executive Committee has been dissolved by Congress or impeached for any other reason;",
                "(c) Bring before a general meeting of the Union, any matter it considers material to the Union, her objectives or interests as stated in this Constitution, or which appears to affect the same and to make recommendations in relation thereto;",
                "(d) Set up such standing and ad-hoc committees as it may deem fit, subject to the provisions of this Constitution;",
                "(e) Suspend or remove member(s) of any committee(s) set up by it;",
                "(f) Elect Union representatives on any statutory University Board(s) or Committee(s) if required to do so;",
                "(g) Approve the budget presented to it by the Executive Committee on behalf of the Union;",
                "(h) Appoint any Union member or employee of the University approved by the authorities, or any expert to serve the Union in any advisory or administrative capacity, with such powers as Council may deem fit. The University authority shall be notified of such appointment;",
                "(i) Appoint members of any Union missions and or delegations to attend on its behalf, any standing, ad-hoc/national or international meetings, without prejudice to any Article of this Constitution and after due consultation with the University Authorities;",
                "(j) Approve or reject the candidature of any student representing the Union in any external election of any organization to which the Union is affiliated. This shall be by a simple majority vote at the Council meeting after such a student should have notified the Council through the Clerk in writing. Without such an approval, no member of the Union shall be allowed to contest to represent the Union;",
                "(k) Review the Union Constitution and present such to the Congress and the University Senate for approval. It shall also have the power to regulate its standing orders;",
                "(l) Employ the services of a legal practitioner who shall advise the Union on legal matters, provided that all mechanisms for internal resolutions of disputes shall have been exhausted."
            ]
        }
    ]
  },
  {
    id: "article-26",
    title: "Article XXVI: Affiliated Clubs and Societies",
    sections: [
        {
            id: "art-26-1",
            content: "",
            subSections: [
                "(i) Any Club or Society within the University having as its primary objective(s) the development of students’ life in the University may affiliate to the Union.",
                "(ii) Rules for Affiliation:",
                "(a) The membership of the Club or Society shall be open to all interested members of the Union.",
                "(b) The Club or Society seeking affiliation shall apply in writing, enclosing its Constitution, a report of its activities, as well as an accurate statement of accounts for the preceding session. Such Clubs/Societies shall pay a prescribed registration fee.",
                "(c) The Club or Society shall provide the Union at the beginning of the session with its approved scheme of activities for the session.",
                "(d) The Club or Society shall keep the Union informed of its officers at the beginning of each session and changes of its officers from time to time.",
                "(e) The Club or Society shall communicate to the Union any changes in its Constitution.",
                "(f) Except the Club or Society abides by every provision of these rules, the rights and privileges of affiliation shall be withdrawn.",
                "(iii) In the case of conflict between this Constitution and the rules and regulations of any affiliated Clubs or Societies, the provision of the Union Constitution shall prevail. The Executive Committee shall have the power to refuse the application of any Club or Society for affiliation when it is convinced that the Club or Society is not designed to serve the best interest of students as provided for in this Constitution. In such a case, such a Club or Society shall have the right of appeal to the SRC against such a decision. The ruling of the SRC shall be final and binding.",
                "(iv) Privileges of Affiliation:",
                "(A) Representation on appropriate Union committee.",
                "(B) The use of Union property and the enjoyment of Union patronage in relating with the University Administration."
            ]
        }
    ]
  },
  {
    id: "article-27",
    title: "Article XXVII: Committees",
    sections: [
        {
            id: "art-27-1",
            title: "(A) STANDING COMMITTEES",
            content: "No Faculty/Hall shall have more than one member on any committee and no member of the Council shall normally be a member of more than one committee. There shall be the following standing committees of the Union:",
            subSections: [
                "(i) FINANCE COMMITTEE: The Finance Committee shall be composed of one member, for each Hall of Residence, with the Union’s Treasurer as Secretary. The Committee shall appoint a Chairman from among its members at its first meeting. The functions of such a committee shall be as follows: (a) Scrutinise and approve the budget of the Union. (b) Approve any extra budgetary expenditure. (c) Consider the Report of the Audit Committee, and make appropriate recommendations to Council.",
                "(ii) WELFARE COMMITTEE: The Welfare Committee shall consist of the House Secretary as Chairman, the Speaker and the Chairman of each Hall of Residence or his/her representative by invocation of Article XV (iii)(g) of this Constitution. The Committee shall advise the Council on transportation and other services provided by the University. It shall be the duty of the Committee to represent the interest of the members of the Union as a body, on the Student Welfare Board or any body or bodies in charge of the welfare of students. Nothing in this section shall violate the powers of the Council in the appointment of members of the Committee to serve in any other bodies.",
                "(iii) LIBRARY AND PUBLICATIONS COMMITTEE: This Committee shall comprise the Union Public Relations Officer (PRO) as Chairman, a member, selected by the Council amongst its members and the Secretaries of all registered literary and debating societies. It shall regulate the activities of the Press Club and be responsible for all publications and periodicals of the Union and for the Union library. The Committee shall be responsible to the Council and be guided by the code of conduct adopted by the Press Council.",
                "(iv) UNION STAFF COMMITTEE: The Committee shall be made up of seven (7) members who shall be members of the Council. It shall comprise the General Secretary as Chairman, Treasurer, Assistant General Secretary and four other members appointed by the Council. The functions of the Committee shall be: (a) Appointment, promotion and conditions of service of all Union staff. (b) Examination of confidential reports from the General Secretary (in case of clerical staff) and the House Secretary (in case o non-clerical staff) and pass on its recommendations to the Council. (c) Examination of complaints from staff and take proper care of staff general welfare. (d) Refering erring members of staff to the Disciplinary Committee. (e) Consulting with the University of Ibadan’s Deputy Registrar (Establishments) and the Registry for advice on personnel matters.",
                "(v) DISCIPLINARY COMMITTEE: Members of this Committee shall be members of the Council. (a) It shall comprise: (i) Chief Whip as a member (ii) A member of the Executive Committee (iii) Three elected members of Council (b) It shall have the power to appoint its Chairman and Secretary. (c) It shall be solely responsible for disciplinary actions against members and any erring officers of the Union. (d) The Secretary shall cause any erring member of the Council to appear before it. Where and when an erring member fails to appear before the Committee, without justifiable reasons, he/she shall be suspended from the Council until he/she appears. (e) The decision of the Committee shall be final and binding on any erring member except reviewed by the Council. (f) Difficult cases shall be reported to the University Authorities through the Dean of Students.",
                "(vi) SPORTS COMMITTEE: The Sports Committee shall consist of Sports Secretary as Chairman, with all Sports Commissioners of all the Halls of Residence as members. It shall assist the Sports Secretary in discharging his/her duties and other such functions that may be allotted to him from time to time.",
                "(vii) ACADEMIC COMMITTEE: (i) There shall be an Academic Committee of the Students’ Union consisting of the Vice-President as the Chairman and President of each Faculty or their representatives as members. (ii) Members shall present all academic problems facing the students of their respective Faculties to the Committee for deliberation. (iii) It shall be responsible for planning ways and means of procuring a good academic environment for the students. (iv) The Committee shall, through its Chairman, advise the Council of the Union on its decisions on academic matters. (v) The Committee shall perform such other duties incidental to its functions and its decisions shall be by a simple majority."
            ]
        },
        {
            id: "art-27-2",
            title: "(B) AD-HOC COMMITTEES",
            content: "The Executive Committee or the Council shall have powers to set up Ad-Hoc Committees from time to time. Union members wishing to serve on such Committees shall indicate their intention in writing through the Clerk of the House, in the case of the Council, and Assistant Secretary, in the case of the Executive Committee. The setting up of an Ad-Hoc Committee shall be widely advertised and shall not duplicate the functions of Standing Committees."
        },
        {
            id: "art-27-3",
            title: "(C) STANDING ORDERS OF COMMITTEES",
            content: "",
            subSections: [
                "(i) The Chairman/Chairperson shall coordinate the activities of the Committee and shall in his/her neutral position not vote unless there is a tie.",
                "(ii) Voting shall be by show of hands except where a member presses for a ballot, and such shall be granted.",
                "(iii) Decisions shall be reached by a simple majority of votes.",
                "(iv) Decisions of Committees shall be binding on the Executive directly concerned except the Council rescinds such.",
                "(v) Except as specially provided in Article XXIV, Subsection V(e) for Disciplinary Committee, all other Committees shall be responsible to the Council for all their actions."
            ]
        }
    ]
  },
  {
    id: "article-28",
    title: "Article XXVIII: Finances",
    sections: [
        {
            id: "art-28-1",
            title: "(A) SOURCES OF INCOME",
            content: "",
            subSections: [
                "(i) Membership dues as recommended by the Council from time to time subject to the approval of Senate.",
                "(ii) Other dues as determined by the Council subject to the approval of Senate. The Faculties shall be empowered to collect Union subscriptions and 2% (two percent) of such dues shall be remitted to the Faculty purse as Union allocation to Faculties. It shall also remit all such monies collected on behalf of the Union from all registered students by the Union to the Union account.",
                "(iii) Donations: All donations should be made to the Union.",
                "(iv) Income: All incomes due or accruing from activities organized by the Union as well as utilities provided by the Union within the premises of the Students Union Building.",
                "(v) Proceeds from any undertakings that the Union may deem fit to embark upon from time to time subject to University approval.",
                "(vi) Grants made by the University or any other body in aid of the Union.",
                "(vii) Any other monies coming in to the funds of the Union from any other LAWFUL sources."
            ]
        },
        {
            id: "art-28-2",
            title: "(B) EXPENDITURE OF UNION FUNDS",
            content: "The Executive Committee shall have power to expend Union funds only for the purpose of the Union and subject to budgetary provision, taking note of the following:",
            subSections: [
                "(i) Stationery and equipment for running the Union Secretariat.",
                "(ii) Furnishing and maintenance of Union Building.",
                "(iii) Salaries of approved Union employees.",
                "(iv) Expenses in respect of approved functions and other activities of the Union.",
                "(v) Approved Grant-in-Aid made to affiliated Clubs and Societies.",
                "(vi) Such other expenses as may be recommended by the Finance Committee and approved by the Council from time to time.",
                "(vii) The Executive Committee through the Union Treasurer shall lay before the Finance Committee budget(s) showing estimates of Income and Expenditure for any period not exceeding one session, for approval by the Council.",
                "(viii) Expenditure must fall within the budgetary heads and the limits provided for, in the main or supplementary budget approved by the Council.",
                "(ix) Any Union official who, in his/her official capacity is guilty of improper expenditure, shall be liable for such misconduct and shall be referred to the Disciplinary Committee.",
                "(x) The Treasurer’s Statement of Account of the Union shall be published at least once every semester."
            ]
        },
        {
            id: "art-28-3",
            title: "(C) PROCEDURE FOR DISBURSEMENT OF UNION FUNDS",
            content: "",
            subSections: [
                "(i) The following shall be signatories to all withdrawals from the Union’s Bank Account: (1) The President or in his/her absence the Vice-President (2) The General Secretary (3) The Treasurer",
                "(ii) The Treasurer shall be empowered to keep an imprest account of not more than N2,000.00 for the Executive Committee monthly.",
                "(iii) All vouchers and purchase orders on any capital project shall be duly scrutinized and countersigned by the President and the Treasurer.",
                "(iv) Applications for Grants-in-Aid to affiliated societies shall be made on an ‘Application for Funds’ form obtainable from the Treasurer.",
                "(v) Council shall approve the Budget of the Union on the recommendation of the Finance Committee.",
                "(vi) Copies of the approved Budget shall be conspicuously displayed on Hall and Faculty Notice Boards and in the Union Building for a period of, at least, two weeks.",
                "(vii) Once approved by the Council, no amendment shall be made in the allocation of Union funds except with the approval of the Finance Committee subject to final approval by Council."
            ]
        },
        {
            id: "art-28-4",
            title: "(D) RECEIPTS",
            content: "Union receipts duly signed by the Treasurer and stamped shall be made out in acknowledgement of funds received by the Union while receipt shall be issued for all demands made from the Treasurer."
        },
        {
            id: "art-28-5",
            title: "(E) SINKING FUNDS",
            content: "The Union shall establish a sinking fund to stabilize the finance of the Union. At least 2.5% of the Union Fund shall go into the Sinking Fund every year. The Fund shall be kept in a fixed deposit account in a bank approved by the Council or in such stocks as may be advised by the bank and approved by the Council. Withdrawals from the Sinking Fund shall be made only with the approval of the Council at its Ordinary Meeting."
        },
        {
            id: "art-28-6",
            title: "(F) AUDIT",
            content: "",
            subSections: [
                "(i) Accounts of the Union shall be audited every semester by the Audit Committee.",
                "(ii) The Audit Committee’s Report shall be submitted to the Finance Committee of the Council, and such audited account shall be sent to the University authorities for necessary action.",
                "(iii) The Audit Committee’s Report and Statements of Account shall be published by the Union Treasurer not later than 14 days from the date of receipt thereof."
            ]
        }
    ]
  },
  {
    id: "article-29",
    title: "Article XXIX: Amendments",
    sections: [
        {
            id: "art-29-1",
            content: "",
            subSections: [
                "(i) Written notice of any motion to amend this Constitution or the Standing Orders shall be given to the Clerk of the House, at least, 30 days before the date of the meeting of the Council at which such a motion shall be debated and notice thereof shall be given by the Clerk of the House in the manner prescribed by this Constitution.",
                "(ii) A copy of the motion for amendment of this Constitution shall forthwith be lodged with the Dean of Students",
                "(iii) The Union shall have the power to amend its Constitution. No amendment to this Constitution shall be valid unless it is passed by a 2/3 majority of the entire membership of the Council. Such amendment(s) shall become operative following the approval of the University Senate."
            ]
        }
    ]
  },
  {
    id: "article-30",
    title: "Article XXX: Miscellaneous",
    sections: [
        {
            id: "art-30-1",
            title: "Procedure at Meetings",
            content: "",
            subSections: [
                "(a) Apart from the Committee Standing Orders herein provided, the Executive Committee, the Council and the Congress shall have the right to regulate their own procedures at meetings without prejudice to the relevant sections of the Constitution.",
                "(i) Standing Committees and Ad-Hoc Committees of the Union shall have the power to make bye-laws for the efficient discharge of their duties subject to the approval of the Council and the University Senate.",
                "(ii) Approved bye-laws made by any of such bodies, subject to the provisions of this Constitution, shall be conspicuously displayed on Notice Boards in the Students’ Union Building, Halls of Residence and Faculties."
            ]
        }
    ]
  },
  {
    id: "article-31",
    title: "Article XXXI: Effective Date & Citation",
    sections: [
        {
            id: "art-31-1",
            title: "Effective Date",
            content: "This Constitution shall become operative and be regarded as the Constitution of the University of Ibadan Students’ Union on the appointed date after it has been approved by the Senate of the University."
        },
        {
            id: "art-31-2",
            title: "Citation",
            content: "This Constitution shall be cited as the Constitution of the Students’ Union, University of Ibadan, Ibadan, 2001 and expressly repeals the former Constitution of the Students’ Union, University of Ibadan."
        }
    ]
  },
  {
    id: "appendix-1",
    title: "Appendix: Management of Student Union Finances",
    sections: [
        {
            id: "app-1",
            title: "Policies and Regulations",
            content: "The Student Welfare Board has laid down the following policies and regulations for the management of Student Union finances:",
            subSections: [
                "1. The Student Union shall continue to have powers to determine its budget and the allocation of funds within its income. The financial procedures for the disbursement of funds in Departments of the University shall be introduced. The Union should keep proper accounting records.",
                "2. Surpluses from the Student Union shall be put in a sinking fund, i.e a savings account. The Student Union shall have the right to determine what to do with such savings.",
                "3. The expenditure headings and the budget for each shall be submitted to the Bursary after approval by the Students’ Representative Council. The Senior Treasurer shall have powers to restrict expenditure to the amount agreed to, under each heading. Professional advice shall be made available by the Bursary to the Student Union when drawing up their budgets.",
                "4. All purchases and payments for amount greater than #100.000 shall be made through the system currently used by the Bursary for the regulation of University Expenditure. Any imprest account kept by the Union Treasurer shall be subject to a system of continuous rigid audit. Before a new imprest is granted, the old account shall have been audited.",
                "5. All purchases shall be made by Internal Orders and/or Local Purchase Orders. The Senior Treasurer shall countersign all such Internal Orders.",
                "6. It shall be made mandatory for all student publications to be printed by the University Press. Where, for any reason, the Student Union has to use the services of outside printers, the Senior Treasurer shall be convinced that there is good cause for this and shall ensure that prices are reasonable. Cases of default shall be handled accordingly.",
                "7. The Student Union Bar and Buttery shall be given out on contract, in order that it may be profitably run as a major source of Student Union revenue.",
                "8. The provision of the Student Union constitution, especially as regards finance, shall always be strictly enforced.",
                "9. Illegal structures are not allowed within the Student Union complex."
            ]
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
