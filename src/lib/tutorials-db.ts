import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Initialize sql.js with WebAssembly
export const initOfflineDb = async (): Promise<Database> => {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();
  
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS tutors (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      tier TEXT DEFAULT 'Community',
      bio TEXT,
      avatar TEXT,
      courses_count INTEGER DEFAULT 0,
      students_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0.0,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS tutor_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT NOT NULL,
      expertise TEXT NOT NULL, -- JSON array
      portfolio_url TEXT,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tutorials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      tutor_id TEXT NOT NULL,
      format TEXT DEFAULT 'Video',
      level TEXT DEFAULT 'Beginner',
      cover_image TEXT,
      tags TEXT DEFAULT '[]',
      rating REAL DEFAULT 0.0,
      ratings_count INTEGER DEFAULT 0,
      students_count INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutor_id) REFERENCES tutors(id)
    );
    
    CREATE TABLE IF NOT EXISTS tutorial_modules (
      id TEXT PRIMARY KEY,
      tutorial_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Video',
      content TEXT,
      duration TEXT,
      sort_order INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tutorial_id) REFERENCES tutorials(id)
    );
    
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tutorial_id TEXT NOT NULL,
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      UNIQUE(user_id, tutorial_id)
    );
    
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      tutorial_id TEXT NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, module_id)
    );
    
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      tutorial_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, tutorial_id)
    );
    
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tutorial_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, tutorial_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_tutorials_tutor ON tutorials(tutor_id);
    CREATE INDEX IF NOT EXISTS idx_modules_tutorial ON tutorial_modules(tutorial_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
  `);
  
  // Seed with initial data
  seedOfflineData(db);
  
  return db;
};

const generateUUID = () => crypto.randomUUID();

const seedOfflineData = (database: Database) => {
  // Check if data already exists
  const existing = database.exec("SELECT COUNT(*) FROM tutors");
  if (existing[0]?.values[0][0] as number > 0) return;
  
  // Seed tutors (Enhanced)
  const tutors = [
    { id: 't-official', name: 'Union Academic Committee', tier: 'Official', bio: 'The official academic body of the Student Union.', avatar: '/placeholder.svg' },
    { id: 't-verified-1', name: 'Prof. David West', tier: 'Verified', bio: 'Senior Lecturer in Computer Science.', avatar: '/placeholder.svg' },
    { id: 't-verified-2', name: 'Sarah "Scholar" O.', tier: 'Verified', bio: 'First Class Graduate of Economics.', avatar: '/placeholder.svg' },
    { id: 't-comm-1', name: 'CodeWithEmeka', tier: 'Community', bio: 'Just a 200L guy sharing what I know about Python.', avatar: '/placeholder.svg' },
    { id: 't-comm-2', name: 'Campus Beats', tier: 'Community', bio: 'Curated playlists and audio sessions for studying.', avatar: '/placeholder.svg' },
  ];
  
  tutors.forEach(t => {
    database.run(
      "INSERT INTO tutors (id, name, tier, bio, avatar) VALUES (?, ?, ?, ?, ?)",
      [t.id, t.name, t.tier, t.bio, t.avatar]
    );
  });
  
  // Seed tutorials (Diverse Formats)
  const tutorials = [
    // Video
    { id: 'tut-1', title: 'GST 101: Use of English Masterclass', description: 'A comprehensive guide to mastering GST 101. Covers parts of speech, concord, and common errors.', tutor_id: 't-official', format: 'Video', level: 'Beginner', tags: JSON.stringify(['GST', 'Academic']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/gst101.png' },
    { id: 'tut-2', title: 'Python for Data Science', description: 'Learn Python from scratch with a focus on data analysis. Perfect for beginners.', tutor_id: 't-verified-1', format: 'Video', level: 'Intermediate', tags: JSON.stringify(['Tech', 'Coding']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/python.png' },

    // Audio
    { id: 'tut-3', title: 'Surviving UI: A Fresher\'s Guide', description: 'Essential tips for navigating campus life, from registration to accommodation.', tutor_id: 't-official', format: 'Audio', level: 'Beginner', tags: JSON.stringify(['Lifestyle', 'Guide']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/freshers.png' },
    { id: 'tut-4', title: 'Deep Focus Study Session', description: '1 hour of ambient noise and lo-fi beats to help you concentrate during exam week.', tutor_id: 't-comm-2', format: 'Audio', level: 'All Levels', tags: JSON.stringify(['Music', 'Study', 'Focus']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/lofi.png' },

    // Essay / Article
    { id: 'tut-5', title: 'The Art of Academic Essay Writing', description: 'A structured approach to writing A-grade essays in the humanities and social sciences.', tutor_id: 't-verified-2', format: 'Essay', level: 'Intermediate', tags: JSON.stringify(['Academic', 'Writing']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/writing.png' },
    { id: 'tut-6', title: 'History of the Student Union (1948-2024)', description: 'A detailed text-based course exploring the rich history and evolution of our union.', tutor_id: 't-official', format: 'Text', level: 'Advanced', tags: JSON.stringify(['History', 'Politics']), is_published: 1, is_approved: 1, cover_image: '/og/tutorials/history.png' },
  ];
  
  tutorials.forEach(t => {
    database.run(
      "INSERT INTO tutorials (id, title, description, tutor_id, format, level, cover_image, tags, is_published, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [t.id, t.title, t.description, t.tutor_id, t.format, t.level, t.cover_image, t.tags, t.is_published, t.is_approved]
    );
  });
  
  // Seed modules
  const modules = [
    // GST 101 (Video)
    { id: 'm-1-1', tutorial_id: 'tut-1', title: 'Introduction to Parts of Speech', type: 'Video', duration: '15 mins', sort_order: 1, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'm-1-2', tutorial_id: 'tut-1', title: 'Concord and Agreement Rules', type: 'Video', duration: '20 mins', sort_order: 2, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'm-1-3', tutorial_id: 'tut-1', title: 'Common Grammatical Errors', type: 'Video', duration: '18 mins', sort_order: 3, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },

    // Python (Video)
    { id: 'm-2-1', tutorial_id: 'tut-2', title: 'Environment Setup (Anaconda)', type: 'Video', duration: '10 mins', sort_order: 1, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'm-2-2', tutorial_id: 'tut-2', title: 'Variables and Data Types', type: 'Video', duration: '25 mins', sort_order: 2, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'm-2-3', tutorial_id: 'tut-2', title: 'Control Structures: Loops', type: 'Video', duration: '30 mins', sort_order: 3, content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },

    // Surviving UI (Audio)
    { id: 'm-3-1', tutorial_id: 'tut-3', title: 'Episode 1: The Registration Maze', type: 'Audio', duration: '12 mins', sort_order: 1, content: '/audio/episode1.mp3' },
    { id: 'm-3-2', tutorial_id: 'tut-3', title: 'Episode 2: Finding Accommodation', type: 'Audio', duration: '15 mins', sort_order: 2, content: '/audio/episode2.mp3' },

    // Focus Beats (Audio)
    { id: 'm-4-1', tutorial_id: 'tut-4', title: 'Rainy Day Study Mix', type: 'Audio', duration: '30 mins', sort_order: 1, content: '/audio/rainy.mp3' },
    { id: 'm-4-2', tutorial_id: 'tut-4', title: 'Late Night Library Ambience', type: 'Audio', duration: '30 mins', sort_order: 2, content: '/audio/library.mp3' },

    // Essay Writing (Essay)
    { id: 'm-5-1', tutorial_id: 'tut-5', title: 'Understanding the Prompt', type: 'Essay', duration: '10 mins read', sort_order: 1, content: '<h1>Understanding the Prompt</h1><p>Before writing a single word, you must deconstruct the question...</p>' },
    { id: 'm-5-2', tutorial_id: 'tut-5', title: 'Crafting a Thesis Statement', type: 'Essay', duration: '15 mins read', sort_order: 2, content: '<h1>The Thesis Statement</h1><p>Your thesis is the anchor of your essay. It should be arguable and specific...</p>' },
    { id: 'm-5-3', tutorial_id: 'tut-5', title: 'Structure: The Burger Method', type: 'Essay', duration: '12 mins read', sort_order: 3, content: '<h1>The Burger Method</h1><p>Introduction (Top Bun), Body Paragraphs (Meat/Veg), Conclusion (Bottom Bun)...</p>' },

    // History (Text)
    { id: 'm-6-1', tutorial_id: 'tut-6', title: 'The Founding Fathers (1948)', type: 'Text', duration: '20 mins read', sort_order: 1, content: 'The University of Ibadan Students Union was established in 1948, coinciding with the founding of the university college...' },
    { id: 'm-6-2', tutorial_id: 'tut-6', title: 'The Golden Era (1960-1975)', type: 'Text', duration: '25 mins read', sort_order: 2, content: 'During the post-independence era, the union played a pivotal role in national discourse...' },
  ];
  
  modules.forEach(m => {
    database.run(
      "INSERT INTO tutorial_modules (id, tutorial_id, title, type, content, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [m.id, m.tutorial_id, m.title, m.type, m.content, m.duration, m.sort_order]
    );
  });
};

// Offline database operations
export const offlineDb = {
  // Tutors
  getTutors: async () => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT * FROM tutors ORDER BY tier, name");
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string | null,
      name: row[2] as string,
      tier: row[3] as string,
      bio: row[4] as string,
      avatar: row[5] as string,
      courses_count: row[6] as number,
      students_count: row[7] as number,
      rating: row[8] as number,
      is_verified: Boolean(row[9]),
      created_at: row[10] as string,
      updated_at: row[11] as string,
    })) || [];
  },
  
  getTutor: async (id: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT * FROM tutors WHERE id = ?", [id]);
    if (!result[0]?.values[0]) return null;
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      user_id: row[1] as string | null,
      name: row[2] as string,
      tier: row[3] as string,
      bio: row[4] as string,
      avatar: row[5] as string,
      courses_count: row[6] as number,
      students_count: row[7] as number,
      rating: row[8] as number,
      is_verified: Boolean(row[9]),
    };
  },

  // Tutor Applications
  submitTutorApplication: async (userId: string, name: string, bio: string, expertise: string[], portfolioUrl?: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT INTO tutor_applications (id, user_id, name, bio, expertise, portfolio_url) VALUES (?, ?, ?, ?, ?, ?)",
      [id, userId, name, bio, JSON.stringify(expertise), portfolioUrl || null]
    );
    return { id, user_id: userId, name, bio, expertise, portfolio_url: portfolioUrl, status: 'pending' };
  },

  getTutorApplication: async (userId: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT * FROM tutor_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]);
    if (!result[0]?.values[0]) return null;
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      user_id: row[1] as string,
      name: row[2] as string,
      bio: row[3] as string,
      expertise: JSON.parse(row[4] as string),
      portfolio_url: row[5] as string | null,
      status: row[6] as string,
      created_at: row[7] as string,
    };
  },

  getAllTutorApplications: async (status?: string) => {
    const database = await initOfflineDb();
    let query = "SELECT * FROM tutor_applications";
    const params: string[] = [];
    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }
    query += " ORDER BY created_at DESC";
    const result = database.exec(query, params);
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      name: row[2] as string,
      bio: row[3] as string,
      expertise: JSON.parse(row[4] as string),
      portfolio_url: row[5] as string | null,
      status: row[6] as string,
      created_at: row[7] as string,
    })) || [];
  },

  updateTutorApplicationStatus: async (id: string, status: string) => {
    const database = await initOfflineDb();
    database.run("UPDATE tutor_applications SET status = ? WHERE id = ?", [status, id]);

    // If approved, create a tutor profile
    if (status === 'approved') {
      const appResult = database.exec("SELECT * FROM tutor_applications WHERE id = ?", [id]);
      if (appResult[0]?.values[0]) {
        const app = appResult[0].values[0];
        const userId = app[1] as string;
        const name = app[2] as string;
        const bio = app[3] as string;

        // Check if tutor already exists
        const existing = database.exec("SELECT 1 FROM tutors WHERE user_id = ?", [userId]);
        if (!existing[0]?.values.length) {
          const tutorId = generateUUID();
          database.run(
            "INSERT INTO tutors (id, user_id, name, bio, tier, is_verified) VALUES (?, ?, ?, ?, 'Verified', 1)",
            [tutorId, userId, name, bio]
          );
        }
      }
    }
  },
  
  // Tutorials
  createTutorial: async (tutorial: {
    title: string;
    description: string;
    tutor_id: string;
    format: string;
    level: string;
    cover_image?: string;
    tags: string[];
  }) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT INTO tutorials (id, title, description, tutor_id, format, level, cover_image, tags, is_published, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        tutorial.title,
        tutorial.description,
        tutorial.tutor_id,
        tutorial.format,
        tutorial.level,
        tutorial.cover_image || null,
        JSON.stringify(tutorial.tags),
        0, // Not published by default
        0  // Not approved by default
      ]
    );
    return { id, ...tutorial };
  },

  createModule: async (moduleId: string, tutorialId: string, moduleData: { title: string; type: string; content?: string; duration?: string; sort_order: number }) => {
    const database = await initOfflineDb();
    database.run(
      "INSERT INTO tutorial_modules (id, tutorial_id, title, type, content, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [moduleId, tutorialId, moduleData.title, moduleData.type, moduleData.content || null, moduleData.duration || null, moduleData.sort_order]
    );
  },

  updateTutorialStatus: async (id: string, isPublished: boolean, isApproved: boolean) => {
    const database = await initOfflineDb();
    database.run(
      "UPDATE tutorials SET is_published = ?, is_approved = ? WHERE id = ?",
      [isPublished ? 1 : 0, isApproved ? 1 : 0, id]
    );
  },

  getTutorials: async (filters?: { format?: string; level?: string; search?: string; tutorId?: string; includeUnapproved?: boolean }) => {
    const database = await initOfflineDb();
    let query = "SELECT t.*, tu.name as tutor_name, tu.avatar as tutor_avatar, tu.tier as tutor_tier FROM tutorials t LEFT JOIN tutors tu ON t.tutor_id = tu.id WHERE 1=1";
    const params: (string | number)[] = [];
    
    if (!filters?.includeUnapproved) {
      query += " AND t.is_published = 1 AND t.is_approved = 1";
    }

    if (filters?.format) {
      query += " AND t.format = ?";
      params.push(filters.format);
    }
    if (filters?.level) {
      query += " AND t.level = ?";
      params.push(filters.level);
    }
    if (filters?.tutorId) {
      query += " AND t.tutor_id = ?";
      params.push(filters.tutorId);
    }
    if (filters?.search) {
      query += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += " ORDER BY t.created_at DESC";
    
    const result = database.exec(query, params);
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      title: row[1] as string,
      description: row[2] as string,
      tutor_id: row[3] as string,
      format: row[4] as string,
      level: row[5] as string,
      cover_image: row[6] as string,
      tags: JSON.parse(row[7] as string || '[]'),
      rating: row[8] as number,
      ratings_count: row[9] as number,
      students_count: row[10] as number,
      is_published: Boolean(row[11]),
      is_approved: Boolean(row[12]),
      created_at: row[13] as string,
      tutor: {
        id: row[3] as string,
        name: row[15] as string,
        avatar: row[16] as string,
        tier: row[17] as string,
      }
    })) || [];
  },
  
  getTutorial: async (id: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT * FROM tutorials WHERE id = ?", [id]);
    if (!result[0]?.values[0]) return null;
    const row = result[0].values[0];
    return {
      id: row[0] as string,
      title: row[1] as string,
      description: row[2] as string,
      tutor_id: row[3] as string,
      format: row[4] as string,
      level: row[5] as string,
      cover_image: row[6] as string,
      tags: JSON.parse(row[7] as string || '[]'),
      rating: row[8] as number,
      ratings_count: row[9] as number,
      students_count: row[10] as number,
      is_published: Boolean(row[11]),
      is_approved: Boolean(row[12]),
    };
  },
  
  // Modules
  getModules: async (tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT * FROM tutorial_modules WHERE tutorial_id = ? ORDER BY sort_order",
      [tutorialId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      tutorial_id: row[1] as string,
      title: row[2] as string,
      type: row[3] as string,
      content: row[4] as string,
      duration: row[5] as string,
      sort_order: row[6] as number,
      is_locked: Boolean(row[7]),
    })) || [];
  },
  
  // Enrollments
  enroll: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT OR IGNORE INTO enrollments (id, user_id, tutorial_id) VALUES (?, ?, ?)",
      [id, userId, tutorialId]
    );
    database.run(
      "UPDATE tutorials SET students_count = students_count + 1 WHERE id = ?",
      [tutorialId]
    );
    return { id, user_id: userId, tutorial_id: tutorialId };
  },
  
  unenroll: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    database.run(
      "DELETE FROM enrollments WHERE user_id = ? AND tutorial_id = ?",
      [userId, tutorialId]
    );
    database.run(
      "UPDATE tutorials SET students_count = MAX(0, students_count - 1) WHERE id = ?",
      [tutorialId]
    );
  },
  
  getEnrollments: async (userId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT e.*, t.title, t.cover_image, t.tutor_id, tu.name FROM enrollments e JOIN tutorials t ON e.tutorial_id = t.id JOIN tutors tu ON t.tutor_id = tu.id WHERE e.user_id = ?",
      [userId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      tutorial_id: row[2] as string,
      enrolled_at: row[3] as string,
      completed_at: row[4] as string | null,
      // Nested structure to mimic Supabase
      tutorial: {
        title: row[5] as string,
        cover_image: row[6] as string,
        tutor: {
          name: row[8] as string
        }
      }
    })) || [];
  },
  
  isEnrolled: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT 1 FROM enrollments WHERE user_id = ? AND tutorial_id = ?",
      [userId, tutorialId]
    );
    return (result[0]?.values?.length || 0) > 0;
  },
  
  // Progress
  markModuleComplete: async (userId: string, moduleId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT OR IGNORE INTO progress (id, user_id, module_id, tutorial_id) VALUES (?, ?, ?, ?)",
      [id, userId, moduleId, tutorialId]
    );
    return { id, user_id: userId, module_id: moduleId };
  },
  
  getProgress: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT module_id FROM progress WHERE user_id = ? AND tutorial_id = ?",
      [userId, tutorialId]
    );
    return result[0]?.values.map(row => row[0] as string) || [];
  },
  
  // Reviews
  addReview: async (userId: string, tutorialId: string, rating: number, comment?: string, userName?: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT OR REPLACE INTO reviews (id, user_id, tutorial_id, rating, comment, user_name) VALUES (?, ?, ?, ?, ?, ?)",
      [id, userId, tutorialId, rating, comment || null, userName || null]
    );
    // Update tutorial rating
    const avgResult = database.exec(
      "SELECT AVG(rating), COUNT(*) FROM reviews WHERE tutorial_id = ?",
      [tutorialId]
    );
    if (avgResult[0]?.values[0]) {
      const [avgRating, count] = avgResult[0].values[0];
      database.run(
        "UPDATE tutorials SET rating = ?, ratings_count = ? WHERE id = ?",
        [avgRating, count, tutorialId]
      );
    }
    return { id, user_id: userId, tutorial_id: tutorialId, rating, comment, user_name: userName };
  },
  
  getReviews: async (tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT * FROM reviews WHERE tutorial_id = ? ORDER BY created_at DESC",
      [tutorialId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      user_name: row[2] as string | null, // Added user_name column
      tutorial_id: row[3] as string,
      rating: row[4] as number,
      comment: row[5] as string | null,
      created_at: row[6] as string,
      profile: {
        full_name: row[2] as string || 'Unknown User',
        avatar_url: null
      }
    })) || [];
  },
  
  // Bookmarks
  toggleBookmark: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const existing = database.exec(
      "SELECT 1 FROM bookmarks WHERE user_id = ? AND tutorial_id = ?",
      [userId, tutorialId]
    );
    
    if (existing[0]?.values?.length) {
      database.run(
        "DELETE FROM bookmarks WHERE user_id = ? AND tutorial_id = ?",
        [userId, tutorialId]
      );
      return false; // Unbookmarked
    } else {
      const id = generateUUID();
      database.run(
        "INSERT INTO bookmarks (id, user_id, tutorial_id) VALUES (?, ?, ?)",
        [id, userId, tutorialId]
      );
      return true; // Bookmarked
    }
  },
  
  getBookmarks: async (userId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT b.*, t.title, t.cover_image, t.format FROM bookmarks b JOIN tutorials t ON b.tutorial_id = t.id WHERE b.user_id = ?",
      [userId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      tutorial_id: row[2] as string,
      created_at: row[3] as string,
      tutorial_title: row[4] as string,
      tutorial_cover: row[5] as string,
      tutorial_format: row[6] as string,
    })) || [];
  },
  
  isBookmarked: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT 1 FROM bookmarks WHERE user_id = ? AND tutorial_id = ?",
      [userId, tutorialId]
    );
    return (result[0]?.values?.length || 0) > 0;
  },
  
  // Export/Import for persistence
  exportData: async () => {
    const database = await initOfflineDb();
    return database.export();
  },
  
  importData: async (data: Uint8Array) => {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    db = new SQL.Database(data);
    return db;
  },
  
  // Save to localStorage
  saveToStorage: async () => {
    const data = await offlineDb.exportData();
    localStorage.setItem('tutorials_db', JSON.stringify(Array.from(data)));
  },
  
  // Load from localStorage
  loadFromStorage: async () => {
    const stored = localStorage.getItem('tutorials_db');
    if (stored) {
      const data = new Uint8Array(JSON.parse(stored));
      await offlineDb.importData(data);
    }
  },
};

export type OfflineDb = typeof offlineDb;
