import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Initialize sql.js with WebAssembly
export const initOfflineDb = async (): Promise<Database> => {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  // Try to load from localStorage first
  const stored = localStorage.getItem('tutorials_db');
  if (stored) {
    try {
      const data = new Uint8Array(JSON.parse(stored));
      db = new SQL.Database(data);
    } catch (e) {
      console.error("Failed to load DB from storage, creating new one", e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }
  
  // Create tables (Idempotent)
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
      expertise TEXT NOT NULL,
      portfolio_url TEXT,
      status TEXT DEFAULT 'pending',
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
      section_title TEXT DEFAULT 'General', -- New column for grouping
      title TEXT NOT NULL,
      type TEXT DEFAULT 'Video',
      content TEXT, -- Can be URL or File ID from IndexedDB
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
  `);
  
  // Seed only if empty
  const existing = db.exec("SELECT COUNT(*) FROM tutors");
  if (existing[0]?.values[0][0] as number === 0) {
    seedOfflineData(db);
    saveDb(db);
  }
  
  return db;
};

const saveDb = (database: Database) => {
  const data = database.export();
  const json = JSON.stringify(Array.from(data));
  localStorage.setItem('tutorials_db', json);
};

const generateUUID = () => crypto.randomUUID();

const seedOfflineData = (database: Database) => {
  // Seed tutors
  const tutors = [
    { id: 't-official', name: 'Union Academic Committee', tier: 'Official', bio: 'The official academic body of the Student Union.', avatar: '/placeholder.svg' },
    { id: 't-verified-1', name: 'Prof. David West', tier: 'Verified', bio: 'Senior Lecturer in Computer Science.', avatar: '/placeholder.svg' },
  ];
  
  tutors.forEach(t => {
    database.run(
      "INSERT INTO tutors (id, name, tier, bio, avatar) VALUES (?, ?, ?, ?, ?)",
      [t.id, t.name, t.tier, t.bio, t.avatar]
    );
  });
  
  // Seed tutorials (GST 101)
  const gstTutorialId = 'tut-1';
  database.run(
    "INSERT INTO tutorials (id, title, description, tutor_id, format, level, cover_image, tags, is_published, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [gstTutorialId, 'GST 101: Use of English', 'Complete semester guide for GST 101.', 't-official', 'Video', 'Beginner', '/og/tutorials/gst101.png', JSON.stringify(['GST', 'Academic']), 1, 1]
  );

  // Seed modules with Sections
  const modules = [
    { section: 'Section 1: Introduction', title: 'Course Overview', type: 'Text', content: 'Welcome to GST 101...' },
    { section: 'Section 1: Introduction', title: 'Parts of Speech Video', type: 'Video', content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { section: 'Section 2: Grammar', title: 'Concord Rules', type: 'Video', content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { section: 'Section 2: Grammar', title: 'Common Errors Quiz', type: 'Text', content: 'Quiz content here...' },
  ];

  modules.forEach((m, idx) => {
    database.run(
      "INSERT INTO tutorial_modules (id, tutorial_id, section_title, title, type, content, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [generateUUID(), gstTutorialId, m.section, m.title, m.type, m.content, idx]
    );
  });
};

export const offlineDb = {
  // --- Tutors ---
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

  // --- Tutorials ---
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
        0, 0
      ]
    );
    saveDb(database);
    return { id, ...tutorial };
  },

  createModule: async (moduleId: string, tutorialId: string, moduleData: { title: string; section_title?: string; type: string; content?: string; duration?: string; sort_order: number }) => {
    const database = await initOfflineDb();
    database.run(
      "INSERT INTO tutorial_modules (id, tutorial_id, section_title, title, type, content, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [moduleId, tutorialId, moduleData.section_title || 'General', moduleData.title, moduleData.type, moduleData.content || null, moduleData.duration || null, moduleData.sort_order]
    );
    saveDb(database);
  },

  getTutorials: async (filters?: { format?: string; level?: string; search?: string; tutorId?: string; includeUnapproved?: boolean }) => {
    const database = await initOfflineDb();
    let query = "SELECT t.*, tu.name as tutor_name, tu.avatar as tutor_avatar, tu.tier as tutor_tier FROM tutorials t LEFT JOIN tutors tu ON t.tutor_id = tu.id WHERE 1=1";
    const params: (string | number)[] = [];
    
    if (!filters?.includeUnapproved) {
      query += " AND t.is_published = 1 AND t.is_approved = 1";
    }
    if (filters?.format) { query += " AND t.format = ?"; params.push(filters.format); }
    if (filters?.level) { query += " AND t.level = ?"; params.push(filters.level); }
    if (filters?.tutorId) { query += " AND t.tutor_id = ?"; params.push(filters.tutorId); }
    if (filters?.search) { query += " AND (t.title LIKE ? OR t.description LIKE ?)"; params.push(`%${filters.search}%`, `%${filters.search}%`); }
    
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
      tutor: { id: row[3] as string, name: row[15] as string, avatar: row[16] as string, tier: row[17] as string }
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

  getModules: async (tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT * FROM tutorial_modules WHERE tutorial_id = ? ORDER BY sort_order",
      [tutorialId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      tutorial_id: row[1] as string,
      section_title: row[2] as string,
      title: row[3] as string,
      type: row[4] as string,
      content: row[5] as string,
      duration: row[6] as string,
      sort_order: row[7] as number,
      is_locked: Boolean(row[8]),
    })) || [];
  },

  // --- Enrollments & Progress ---
  enroll: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run("INSERT OR IGNORE INTO enrollments (id, user_id, tutorial_id) VALUES (?, ?, ?)", [id, userId, tutorialId]);
    database.run("UPDATE tutorials SET students_count = students_count + 1 WHERE id = ?", [tutorialId]);
    saveDb(database);
    return { id };
  },

  unenroll: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    database.run("DELETE FROM enrollments WHERE user_id = ? AND tutorial_id = ?", [userId, tutorialId]);
    database.run("UPDATE tutorials SET students_count = MAX(0, students_count - 1) WHERE id = ?", [tutorialId]);
    saveDb(database);
  },

  isEnrolled: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT 1 FROM enrollments WHERE user_id = ? AND tutorial_id = ?", [userId, tutorialId]);
    return (result[0]?.values?.length || 0) > 0;
  },

  markModuleComplete: async (userId: string, moduleId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run("INSERT OR IGNORE INTO progress (id, user_id, module_id, tutorial_id) VALUES (?, ?, ?, ?)", [id, userId, moduleId, tutorialId]);
    saveDb(database);
    return { id };
  },

  getProgress: async (userId: string, tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT module_id FROM progress WHERE user_id = ? AND tutorial_id = ?", [userId, tutorialId]);
    return result[0]?.values.map(row => row[0] as string) || [];
  },

  getEnrollments: async (userId: string) => {
    const database = await initOfflineDb();
    const result = database.exec(
      "SELECT e.*, t.title, t.cover_image, t.tutor_id, tu.name FROM enrollments e JOIN tutorials t ON e.tutorial_id = t.id JOIN tutors tu ON t.tutor_id = tu.id WHERE e.user_id = ?",
      [userId]
    );
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      tutorial_id: row[2] as string,
      enrolled_at: row[3] as string,
      completed_at: row[4] as string | null,
      tutorial: { title: row[5] as string, cover_image: row[6] as string, tutor: { name: row[8] as string } }
    })) || [];
  },

  // --- Tutor Applications ---
  submitTutorApplication: async (userId: string, name: string, bio: string, expertise: string[], portfolioUrl?: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run("INSERT INTO tutor_applications (id, user_id, name, bio, expertise, portfolio_url) VALUES (?, ?, ?, ?, ?, ?)", [id, userId, name, bio, JSON.stringify(expertise), portfolioUrl || null]);
    saveDb(database);
    return { id, status: 'pending' };
  },

  getAllTutorApplications: async (status?: string) => {
    const database = await initOfflineDb();
    let query = "SELECT * FROM tutor_applications";
    const params: string[] = [];
    if (status) { query += " WHERE status = ?"; params.push(status); }
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
    // Auto-create tutor if approved logic...
    if (status === 'approved') {
        const appResult = database.exec("SELECT * FROM tutor_applications WHERE id = ?", [id]);
        if (appResult[0]?.values[0]) {
            const app = appResult[0].values[0];
            const userId = app[1] as string;
            const name = app[2] as string;
            const bio = app[3] as string;
            const existing = database.exec("SELECT 1 FROM tutors WHERE user_id = ?", [userId]);
            if (!existing[0]?.values.length) {
                database.run("INSERT INTO tutors (id, user_id, name, bio, tier, is_verified) VALUES (?, ?, ?, ?, 'Verified', 1)", [generateUUID(), userId, name, bio]);
            }
        }
    }
    saveDb(database);
  },
  
  // --- Admin ---
  updateTutorialStatus: async (id: string, isPublished: boolean, isApproved: boolean) => {
    const database = await initOfflineDb();
    database.run("UPDATE tutorials SET is_published = ?, is_approved = ? WHERE id = ?", [isPublished ? 1 : 0, isApproved ? 1 : 0, id]);
    saveDb(database);
  },
  
  // --- Reviews ---
  addReview: async (userId: string, tutorialId: string, rating: number, comment?: string, userName?: string) => {
    const database = await initOfflineDb();
    const id = generateUUID();
    database.run("INSERT OR REPLACE INTO reviews (id, user_id, tutorial_id, rating, comment, user_name) VALUES (?, ?, ?, ?, ?, ?)", [id, userId, tutorialId, rating, comment || null, userName || null]);
    // Recalc rating
    const avg = database.exec("SELECT AVG(rating), COUNT(*) FROM reviews WHERE tutorial_id = ?", [tutorialId]);
    if (avg[0]?.values[0]) {
      database.run("UPDATE tutorials SET rating = ?, ratings_count = ? WHERE id = ?", [avg[0].values[0][0], avg[0].values[0][1], tutorialId]);
    }
    saveDb(database);
    return { id };
  },

  getReviews: async (tutorialId: string) => {
    const database = await initOfflineDb();
    const result = database.exec("SELECT * FROM reviews WHERE tutorial_id = ? ORDER BY created_at DESC", [tutorialId]);
    return result[0]?.values.map(row => ({
      id: row[0] as string,
      user_id: row[1] as string,
      user_name: row[2] as string | null,
      rating: row[4] as number,
      comment: row[5] as string | null,
      created_at: row[6] as string,
      profile: { full_name: row[2] as string || 'Student', avatar_url: null }
    })) || [];
  },
};
