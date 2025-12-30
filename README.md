# UISU Archive

A digital archive and management platform for the University of Ibadan Students' Union (UISU). This application preserves the legacy of the union, provides information about current and past leadership, governance, and campus life, and features a publication platform called "Inks Vault".

## Features

- **Digital Archive**: Access constitutions, manifestos, speeches, and historical records.
- **Leadership Directory**:
  - **Current Leaders**: Profiles of Executives, Principal Officers, Hall Leaders, and Legislators.
  - **Past Leaders**: A "Hall of Fame" celebrating historical figures.
- **Governance**: Detailed information about the union's structure and leadership hierarchy.
- **Inks Vault**: A creative publication platform featuring:
  - Various content types: Articles, Blogs, Reports, Essays, Poetry, Opinions, Interviews, Fiction.
  - **Writer's Desk**: A rich text editor for submitting content.
- **Campus Map**: An interactive map highlighting halls of residence and key locations.
- **Communities**: Information on clubs and societies.
- **Events & Announcements**: Stay updated with the latest union activities.
- **Admin Dashboard**: A protected area for authorized users to manage content.
- **Interactive Elements**: Trivia, 3D visualizations, and timeline diagrams.

## Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend & Authentication**: Supabase
- **State Management**: TanStack Query
- **Animations**: Framer Motion
- **3D Graphics**: Three.js (@react-three/fiber, @react-three/drei)
- **Rich Text Editor**: Editor.js
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js & npm (or bun/yarn)
- A Supabase project (for authentication and database)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    # or
    bun install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:8080` (or whatever port Vite selects).

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Project Structure

```
src/
├── components/         # Reusable UI components (Shadcn UI, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # External integrations (Supabase)
├── lib/                # Utility functions and static data
├── pages/              # Application pages (Routes)
├── App.tsx             # Main application component & Routing
└── main.tsx            # Entry point
```

## License

[MIT](LICENSE)
