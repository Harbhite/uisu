# UISU SPACE Tutorials System - Comprehensive Guide

This document provides complete documentation for the Tutorials system, covering usage from three perspectives: **Users**, **Tutors**, and **Administrators**. It also includes technical documentation for the **sql.js offline database**.

---

## Table of Contents

1. [User Guide](#user-guide)
2. [Tutor Guide](#tutor-guide)
3. [Administrator Guide](#administrator-guide)
4. [SQL.js Offline Database Guide](#sqljs-offline-database-guide)

---

## User Guide

### Getting Started

1. **Navigate to Tutorials**: Go to `/tutorials` from the main navigation
2. **Browse the Catalog**: The "Discover" tab shows all available tutorials
3. **Filter & Search**: Use the filters to narrow down by:
   - **Format**: Video, Audio, Text, Essay
   - **Level**: Beginner, Intermediate, Advanced
   - **Search**: Type keywords to search titles and descriptions

### Enrolling in a Tutorial

1. Click on any tutorial card to view details
2. Click the **"Enroll Now"** button
3. Once enrolled, you can:
   - Track your progress through modules
   - Mark modules as complete
   - Leave reviews when finished

### Tracking Progress

- Your enrolled tutorials appear in the **"My Learning"** tab
- Each tutorial shows a progress bar indicating completed modules
- Click "Continue Learning" to resume where you left off

### Bookmarking Tutorials

- Click the bookmark icon on any tutorial to save it for later
- View all bookmarked tutorials in the **"My Learning"** tab under "Saved"

### Leaving Reviews

1. Complete at least one module in a tutorial
2. Scroll to the "Reviews" section on the tutorial detail page
3. Select a star rating (1-5)
4. Add an optional comment
5. Click "Submit Review"

### Unenrolling

- On the tutorial detail page, click **"Unenroll"** if you want to leave a tutorial
- Note: Your progress will be lost

---

## Tutor Guide

### Becoming a Tutor

1. Navigate to `/tutorials` and click the **"Become a Tutor"** tab
2. Fill out the application form:
   - **Name**: Your display name
   - **Bio**: Describe your expertise and teaching style
   - **Expertise Areas**: Select relevant topics (GST, Tech, Lifestyle, etc.)
   - **Portfolio URL**: Optional link to your work
3. Submit the application
4. Wait for administrator approval

### Tutor Tiers

| Tier | Description | Features |
|------|-------------|----------|
| **Community** | Default tier for new tutors | Can create tutorials, basic visibility |
| **Verified** | Approved by administrators | Verified badge, higher visibility, priority support |
| **Official** | Union Academic Committee | Top visibility, official branding |

### Creating Tutorials

Once approved as a tutor:

1. Navigate to `/tutorials/upload`
2. Fill in tutorial details:
   - **Title**: Clear, descriptive name
   - **Description**: What students will learn
   - **Format**: Video, Audio, Text, or Essay
   - **Level**: Beginner, Intermediate, or Advanced
   - **Tags**: Add relevant topics
   - **Cover Image**: Upload an attractive thumbnail
3. Add modules with content and duration estimates
4. Save as draft or submit for review

### Managing Your Tutorials

- View your tutorials on your tutor profile (`/tutorials/tutor/[id]`)
- Edit unpublished tutorials anytime
- Track student enrollment and ratings

### Requesting Verification

1. Build a track record with quality tutorials
2. Contact administrators through the platform
3. Verification is based on:
   - Tutorial quality
   - Student feedback
   - Consistency of content

---

## Administrator Guide

### Accessing Admin Functions

Administrators and moderators have access to tutorial management through the admin dashboard.

### Managing Tutors

1. **View Applications**: See pending tutor applications in the Submissions tab
2. **Approve/Reject**: Review applications based on:
   - Quality of bio and expertise
   - Portfolio (if provided)
   - Relevance to student needs
3. **Manage Tiers**: Upgrade tutors to Verified or Official status

### Managing Tutorials

1. **Approval Queue**: New tutorials require admin approval
2. **Review Process**:
   - Check content quality
   - Verify accuracy of information
   - Ensure appropriate categorization
3. **Actions**:
   - Approve: Makes tutorial publicly visible
   - Reject: Tutorial remains unpublished
   - Edit: Modify tutorial details if needed

### Database Operations

Admins can directly manage data through the backend:

```sql
-- View all tutors
SELECT * FROM tutors ORDER BY tier, created_at DESC;

-- Update tutor tier
UPDATE tutors SET tier = 'Verified' WHERE id = 'tutor-uuid';

-- View pending tutorials
SELECT * FROM tutorials WHERE is_published = true AND is_approved = false;

-- Approve a tutorial
UPDATE tutorials SET is_approved = true WHERE id = 'tutorial-uuid';
```

### Monitoring

- Track enrollment counts per tutorial
- Monitor review scores and feedback
- Identify popular content for featuring

---

## SQL.js Offline Database Guide

### Overview

The tutorials system includes a client-side SQLite database using **sql.js** that provides offline functionality when the user is disconnected from the internet.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                      │
├─────────────────────────────────────────────────────────┤
│                  useTutorials Hooks                       │
│         (Detects online/offline automatically)           │
├──────────────────────┬──────────────────────────────────┤
│   Online Mode        │        Offline Mode               │
│   (Supabase)         │        (sql.js)                   │
│                      │                                    │
│   - Real-time sync   │   - Local SQLite                  │
│   - Full features    │   - Seeded data                   │
│   - Auth required    │   - LocalStorage persist          │
└──────────────────────┴──────────────────────────────────┘
```

### File Location

The sql.js implementation is in: `src/lib/tutorials-db.ts`

### Database Schema

The offline database mirrors the Supabase schema:

```typescript
// Tables created in sql.js
- tutors          // Tutor profiles
- tutorials       // Course metadata
- tutorial_modules // Individual lessons
- enrollments     // User enrollments
- progress        // Module completion tracking
- reviews         // Star ratings and comments
- bookmarks       // Saved tutorials
```

### Initialization

```typescript
import { initOfflineDb, offlineDb } from '@/lib/tutorials-db';

// Initialize the database (called automatically by hooks)
const db = await initOfflineDb();

// The database is seeded with initial data on first load
```

### Using the Offline Database

#### Get All Tutorials

```typescript
const tutorials = await offlineDb.getTutorials({
  format: 'Video',      // optional filter
  level: 'Beginner',    // optional filter
  search: 'python'      // optional search
});
```

#### Get Single Tutorial

```typescript
const tutorial = await offlineDb.getTutorial('tutorial-id');
```

#### Enrollment Operations

```typescript
// Enroll in a tutorial
await offlineDb.enroll('user-id', 'tutorial-id');

// Unenroll from a tutorial
await offlineDb.unenroll('user-id', 'tutorial-id');

// Check enrollment status
const isEnrolled = await offlineDb.isEnrolled('user-id', 'tutorial-id');

// Get all enrollments
const enrollments = await offlineDb.getEnrollments('user-id');
```

#### Progress Tracking

```typescript
// Mark module as complete
await offlineDb.markModuleComplete('user-id', 'module-id', 'tutorial-id');

// Get completed modules for a tutorial
const completedModules = await offlineDb.getProgress('user-id', 'tutorial-id');
```

#### Reviews

```typescript
// Add or update review
await offlineDb.addReview('user-id', 'tutorial-id', 5, 'Great course!');

// Get reviews for a tutorial
const reviews = await offlineDb.getReviews('tutorial-id');
```

#### Bookmarks

```typescript
// Toggle bookmark (returns true if added, false if removed)
const isNowBookmarked = await offlineDb.toggleBookmark('user-id', 'tutorial-id');

// Get all bookmarks
const bookmarks = await offlineDb.getBookmarks('user-id');

// Check if bookmarked
const isBookmarked = await offlineDb.isBookmarked('user-id', 'tutorial-id');
```

### Persistence to LocalStorage

```typescript
// Save current database state to localStorage
await offlineDb.saveToStorage();

// Load database from localStorage (on app start)
await offlineDb.loadFromStorage();
```

### Export/Import Binary Data

```typescript
// Export as Uint8Array (for file download)
const data = await offlineDb.exportData();

// Create downloadable file
const blob = new Blob([data], { type: 'application/octet-stream' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'tutorials-backup.db';
a.click();

// Import from Uint8Array
await offlineDb.importData(data);
```

### Complete Export Example

```typescript
import { offlineDb } from '@/lib/tutorials-db';

export const downloadOfflineDatabase = async () => {
  try {
    // Get the binary database
    const data = await offlineDb.exportData();
    
    // Convert to downloadable file
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `tutorials-${new Date().toISOString().split('T')[0]}.db`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error };
  }
};
```

### Complete Import Example

```typescript
import { offlineDb } from '@/lib/tutorials-db';

export const importOfflineDatabase = async (file: File) => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    // Import into sql.js
    await offlineDb.importData(data);
    
    // Persist to localStorage
    await offlineDb.saveToStorage();
    
    return { success: true };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, error };
  }
};

// Usage with file input
<input 
  type="file" 
  accept=".db,.sqlite" 
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) importOfflineDatabase(file);
  }}
/>
```

### Hybrid Hook Usage

The `useTutorials` hook automatically switches between online and offline:

```typescript
import { 
  useTutorials, 
  useEnrollment, 
  useBookmark,
  useProgress,
  useReviews 
} from '@/hooks/useTutorials';

// In your component
const { data: tutorials, isLoading } = useTutorials({ format: 'Video' });
const { enroll, unenroll, isEnrolled } = useEnrollment(tutorialId);
const { toggle, isBookmarked } = useBookmark(tutorialId);
const { completedModules, markComplete } = useProgress(tutorialId);
const { reviews, addReview } = useReviews(tutorialId);
```

### Seeded Data

The offline database comes pre-seeded with:

- **4 Tutors**: Official, Verified, and Community tier examples
- **3 Tutorials**: GST, Python, and Fresher's Guide
- **4 Modules**: Sample lessons for the tutorials

### WebAssembly Loading

sql.js requires WebAssembly. The library is loaded from CDN:

```typescript
const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});
```

For offline-first apps, consider hosting the WASM file locally:

```typescript
const SQL = await initSqlJs({
  locateFile: file => `/wasm/${file}`
});
```

---

## Troubleshooting

### Common Issues

1. **"Database not initialized"**
   - Ensure `initOfflineDb()` is called before operations
   - The hooks handle this automatically

2. **"User not authenticated"**
   - Offline operations use a mock user ID
   - Online operations require Supabase auth

3. **"Data not persisting"**
   - Call `saveToStorage()` after modifications
   - Check localStorage quota

4. **"WebAssembly error"**
   - Ensure browser supports WASM
   - Check network access to CDN

### Support

For issues with the tutorials system, contact the development team or open an issue in the repository.
