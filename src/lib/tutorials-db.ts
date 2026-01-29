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
  
  // Seed tutors
  const tutors = [
    { id: 't-official', name: 'Union Academic Committee', tier: 'Official', bio: 'The official academic body of the Student Union.', avatar: '/placeholder.svg' },
    { id: 't-verified-1', name: 'Prof. David West', tier: 'Verified', bio: 'Senior Lecturer in Computer Science.', avatar: '/placeholder.svg' },
    { id: 't-verified-2', name: 'Sarah "Scholar" O.', tier: 'Verified', bio: 'First Class Graduate of Economics.', avatar: '/placeholder.svg' },
    { id: 't-comm-1', name: 'CodeWithEmeka', tier: 'Community', bio: 'Just a 200L guy sharing what I know about Python.', avatar: '/placeholder.svg' },
  ];
  
  tutors.forEach(t => {
    database.run(
      "INSERT INTO tutors (id, name, tier, bio, avatar) VALUES (?, ?, ?, ?, ?)",
      [t.id, t.name, t.tier, t.bio, t.avatar]
    );
  });
  
  // Seed tutorials
  const tutorials = [
    { id: 'tut-1', title: 'GST 101: Use of English Masterclass', description: 'A comprehensive guide to mastering GST 101.', tutor_id: 't-official', format: 'Video', level: 'Beginner', tags: JSON.stringify(['GST', 'Academic']), is_published: 1 },
    { id: 'tut-2', title: 'Python for Data Science', description: 'Learn Python from scratch with a focus on data analysis.', tutor_id: 't-verified-1', format: 'Video', level: 'Intermediate', tags: JSON.stringify(['Tech', 'Coding']), is_published: 1 },
    { id: 'tut-3', title: 'Surviving UI: A Fresher\'s Guide', description: 'Essential tips for navigating campus life.', tutor_id: 't-official', format: 'Audio', level: 'Beginner', tags: JSON.stringify(['Lifestyle', 'Guide']), is_published: 1 },
  ];
  
  tutorials.forEach(t => {
    database.run(
      "INSERT INTO tutorials (id, title, description, tutor_id, format, level, tags, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [t.id, t.title, t.description, t.tutor_id, t.format, t.level, t.tags, t.is_published]
    );
  });
  
  // Seed modules
  const modules = [
    { id: 'm-1-1', tutorial_id: 'tut-1', title: 'Introduction to Parts of Speech', type: 'Video', duration: '15 mins', sort_order: 1 },
    { id: 'm-1-2', tutorial_id: 'tut-1', title: 'Concord and Agreement', type: 'Video', duration: '20 mins', sort_order: 2 },
    { id: 'm-2-1', tutorial_id: 'tut-2', title: 'Setup and Installation', type: 'Video', duration: '10 mins', sort_order: 1 },
    { id: 'm-2-2', tutorial_id: 'tut-2', title: 'Variables and Data Types', type: 'Video', duration: '25 mins', sort_order: 2 },
  ];
  
  modules.forEach(m => {
    database.run(
      "INSERT INTO tutorial_modules (id, tutorial_id, title, type, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [m.id, m.tutorial_id, m.title, m.type, m.duration, m.sort_order]
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
  
  // Tutorials
  getTutorials: async (filters?: { format?: string; level?: string; search?: string }) => {
    const database = await initOfflineDb();
    let query = "SELECT * FROM tutorials WHERE is_published = 1";
    const params: (string | number)[] = [];
    
    if (filters?.format) {
      query += " AND format = ?";
      params.push(filters.format);
    }
    if (filters?.level) {
      query += " AND level = ?";
      params.push(filters.level);
    }
    if (filters?.search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    query += " ORDER BY created_at DESC";
    
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
      created_at: row[12] as string,
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
      "SELECT e.*, t.title, t.cover_image FROM enrollments e JOIN tutorials t ON e.tutorial_id = t.id WHERE e.user_id = ?",
      [userId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      tutorial_id: row[2] as string,
      enrolled_at: row[3] as string,
      completed_at: row[4] as string | null,
      tutorial_title: row[5] as string,
      tutorial_cover: row[6] as string,
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
  addReview: async (userId: string, tutorialId: string, rating: number, comment?: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run(
      "INSERT OR REPLACE INTO reviews (id, user_id, tutorial_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [id, userId, tutorialId, rating, comment || null]
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
    return { id, user_id: userId, tutorial_id: tutorialId, rating, comment };
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
      tutorial_id: row[2] as string,
      rating: row[3] as number,
      comment: row[4] as string | null,
      created_at: row[5] as string,
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
