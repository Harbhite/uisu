export interface Leader {
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
