export type TutorTier = 'Official' | 'Verified' | 'Community';
export type TutorialFormat = 'Video' | 'Audio' | 'Text' | 'Essay';
export type TutorialLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Tutor {
  id: string;
  name: string;
  tier: TutorTier;
  bio: string;
  avatar: string;
  metrics: {
    courses: number;
    students: number;
    rating: number;
  };
}

export interface Module {
  id: string;
  title: string;
  type: TutorialFormat;
  content: string; // URL for video/audio, HTML/Markdown for text/essay
  duration: string; // e.g. "10 mins", "500 words"
  isLocked?: boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  tutorId: string;
  format: TutorialFormat;
  level: TutorialLevel;
  coverImage: string;
  tags: string[];
  rating: number;
  studentsCount: number;
  modules: Module[];
  createdAt: string;
}

export const tutors: Tutor[] = [
  {
    id: 't-official',
    name: 'Union Academic Committee',
    tier: 'Official',
    bio: 'The official academic body of the Student Union, dedicated to providing high-quality educational resources.',
    avatar: '/placeholder.svg',
    metrics: { courses: 12, students: 5000, rating: 4.9 }
  },
  {
    id: 't-verified-1',
    name: 'Prof. David West',
    tier: 'Verified',
    bio: 'Senior Lecturer in Computer Science, passionate about AI and Web Development.',
    avatar: '/placeholder.svg',
    metrics: { courses: 5, students: 1200, rating: 4.8 }
  },
  {
    id: 't-verified-2',
    name: 'Sarah "Scholar" O.',
    tier: 'Verified',
    bio: 'First Class Graduate of Economics. Teaching you how to ace your GSTs.',
    avatar: '/placeholder.svg',
    metrics: { courses: 8, students: 3000, rating: 4.7 }
  },
  {
    id: 't-comm-1',
    name: 'CodeWithEmeka',
    tier: 'Community',
    bio: 'Just a 200L guy sharing what I know about Python.',
    avatar: '/placeholder.svg',
    metrics: { courses: 2, students: 150, rating: 4.2 }
  },
  {
    id: 't-comm-2',
    name: 'Campus Chef',
    tier: 'Community',
    bio: 'Cooking tutorials for students on a budget.',
    avatar: '/placeholder.svg',
    metrics: { courses: 10, students: 800, rating: 4.5 }
  },
  {
    id: 't-comm-3',
    name: 'History Buff',
    tier: 'Community',
    bio: 'Essays on UI history and legends.',
    avatar: '/placeholder.svg',
    metrics: { courses: 3, students: 400, rating: 4.0 }
  }
];

export const tutorials: Tutorial[] = [
  {
    id: 'tut-1',
    title: 'GST 101: Use of English Masterclass',
    description: 'A comprehensive guide to mastering GST 101. Covers grammar, comprehension, and essay writing.',
    tutorId: 't-official',
    format: 'Video',
    level: 'Beginner',
    coverImage: '/placeholder.svg',
    tags: ['GST', 'Academic', 'Freshers'],
    rating: 4.8,
    studentsCount: 2300,
    createdAt: '2024-01-15',
    modules: [
      { id: 'm-1-1', title: 'Introduction to Parts of Speech', type: 'Video', content: 'https://example.com/video1', duration: '15 mins' },
      { id: 'm-1-2', title: 'Concord and Agreement', type: 'Video', content: 'https://example.com/video2', duration: '20 mins' },
      { id: 'm-1-3', title: 'Common Errors in English', type: 'Text', content: '<p>Here are common errors...</p>', duration: '10 mins' }
    ]
  },
  {
    id: 'tut-2',
    title: 'Python for Data Science',
    description: 'Learn Python from scratch with a focus on data analysis libraries like Pandas and NumPy.',
    tutorId: 't-verified-1',
    format: 'Video',
    level: 'Intermediate',
    coverImage: '/placeholder.svg',
    tags: ['Tech', 'Coding', 'Data Science'],
    rating: 4.9,
    studentsCount: 850,
    createdAt: '2024-02-10',
    modules: [
      { id: 'm-2-1', title: 'Setup and Installation', type: 'Video', content: 'https://example.com/py1', duration: '10 mins' },
      { id: 'm-2-2', title: 'Variables and Data Types', type: 'Video', content: 'https://example.com/py2', duration: '25 mins' }
    ]
  },
  {
    id: 'tut-3',
    title: 'Surviving UI: A Fresher\'s Guide',
    description: 'Essential tips for navigating campus life, from registration to finding the best food spots.',
    tutorId: 't-official',
    format: 'Audio',
    level: 'Beginner',
    coverImage: '/placeholder.svg',
    tags: ['Lifestyle', 'Orientation', 'Guide'],
    rating: 4.7,
    studentsCount: 5000,
    createdAt: '2024-01-05',
    modules: [
      { id: 'm-3-1', title: 'The Registration Maze', type: 'Audio', content: 'https://example.com/audio1', duration: '30 mins' },
      { id: 'm-3-2', title: 'Hostel Life Hacks', type: 'Audio', content: 'https://example.com/audio2', duration: '25 mins' }
    ]
  },
  {
    id: 'tut-4',
    title: 'The Architecture of UI: An Essay',
    description: 'An in-depth look at the modernist architecture of the University of Ibadan.',
    tutorId: 't-comm-3',
    format: 'Essay',
    level: 'Advanced',
    coverImage: '/placeholder.svg',
    tags: ['History', 'Architecture', 'Culture'],
    rating: 4.5,
    studentsCount: 120,
    createdAt: '2024-03-20',
    modules: [
      { id: 'm-4-1', title: 'Maxwell Fry and Jane Drew', type: 'Essay', content: '<h3>The Beginning</h3><p>The duo arrived in Ibadan...</p>', duration: '1500 words' }
    ]
  },
  {
    id: 'tut-5',
    title: 'Budget Cooking: N500 Meals',
    description: 'Delicious meals you can cook in your kitchenette for less than N500.',
    tutorId: 't-comm-2',
    format: 'Video',
    level: 'Beginner',
    coverImage: '/placeholder.svg',
    tags: ['Lifestyle', 'Cooking', 'Budget'],
    rating: 4.6,
    studentsCount: 900,
    createdAt: '2024-04-01',
    modules: [
      { id: 'm-5-1', title: 'Spicy Noodles Deluxe', type: 'Video', content: 'https://example.com/cook1', duration: '8 mins' }
    ]
  }
];

export const categories = [
  { id: 'academic', title: 'Academic', icon: 'BookOpen' },
  { id: 'tech', title: 'Tech & Skills', icon: 'Cpu' },
  { id: 'lifestyle', title: 'Lifestyle', icon: 'Coffee' },
  { id: 'culture', title: 'Culture & History', icon: 'Landmark' },
  { id: 'creative', title: 'Creative Arts', icon: 'Palette' },
];
