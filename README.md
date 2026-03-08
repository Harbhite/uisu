# UISU Archive

The **UISU Archive** is the official digital platform for the **University of Ibadan Students' Union (UISU)**. It serves as a comprehensive management system, a historical archive, and a dynamic hub for student activities, governance, and creative expression.

Designed to preserve the legacy of the union while modernizing its operations, the platform bridges the gap between the students and their leaders, providing transparency, accessibility, and a dedicated space for the "Aluta" spirit to thrive digitally.

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Key Features

### 🏛 Governance & Leadership
- **Current Leaders**: Interactive profiles of the Executive Council, Principal Officers, Hall Leaders, and Student Legislators (SRC).
- **Governance Structure**: Visual breakdowns of the union's hierarchy including the Executive, Legislative, and Judiciary arms (visualized with 3D models).
- **Past Leaders (Hall of Fame)**: A digital museum honoring previous administrations and historical figures.
- **Constitution**: Interactive constitution with real-time search, interactive index, and click-to-copy citations.

### ✍️ Inks Vault (Publication Platform)
A robust content management system for student journalists and creatives.
- **8 Content Types**: Articles, Blogs, Reports, Essays, Poetry, Opinion pieces, Interviews, and Fiction.
- **Writer's Desk**: A secure, distraction-free rich text editor powered by **Editor.js**.
- **Related Content**: Smart suggestions connecting readers to similar pieces.

### 📚 Resource Center & Career Hub
A one-stop hub for academic and survival tools, organized into categories:
- **Academic Bank**: Lecture notes and past questions (Google Drive-style interface).
- **Career Hub**: Focused on internship opportunities, integrating an inline CV Builder with multiple PDF-exportable templates (Tech, Scholar, Compact, Bold, Grid).
- **Student Mart**: Campus marketplace.
- **Freshers' Compass**: Guides for new students.
- **Utilities**: GPA Calculator, Calculator Suite, and more.

### 🎓 Tutorials Ecosystem
A dedicated platform for peer-to-peer learning and academic support.
- **Tutor Profiles & Content**: Video, Audio, Text, and Essay formats from Official and Community tutors.
- **Dual-Mode Backend**: Implements a unique persistence layer using `sql.js` for offline, localized simulation and Supabase for cloud production.
- **Visual Aesthetic**: Features the "Beyond the Canvas" theme, distinct from the main application but adhering to the core design principles.

### 🗺 Campus Map & Halls of Residence
- **Interactive Exploration**: Navigate the University of Ibadan campus.
- **3D Visualization**: Custom 3D pins for Halls of Residence (The Republics) and key landmarks.
- **Hall Lore**: Detailed history and lore for individual halls.

### 🎨 The Aluta Protocol
- **Design System**: A comprehensive style guide (`/style-guide`) documenting the UI/UX language—typography, colors (`nobel` and `ui` palettes), components, and 3D assets (React Three Fiber & GSAP).

### 🔐 Admin Dashboard
- **Role-Based Access**: Secure management for Staff and Moderators.
- **Content Moderation**: Tools to review and publish Inks Vault submissions, Tutor Applications, and Tutorials.

---

## 🛠 Tech Stack

Built with a focus on performance, accessibility, and modern web standards.

| Category | Technology |
|----------|------------|
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) |
| **Offline Storage** | [sql.js](https://sql.js.org/) (for Tutorials offline mode) |
| **State Management** | [TanStack Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) |
| **3D Graphics** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) |
| **Rich Text Editor** | [Editor.js](https://editorjs.io/) |
| **Testing** | [Playwright](https://playwright.dev/) |
| **Package Manager** | [Bun](https://bun.sh/) (Supported & Recommended) |

---

## 📂 Project Architecture

```
src/
├── components/         # Reusable UI components (Navbar, 3D elements, CVBuilder)
│   ├── ui/             # Shadcn primitives (Button, Card, etc.)
│   └── ...
├── hooks/              # Custom React hooks (useToast, useAdminCheck, useTutorials)
├── integrations/       # Supabase client and external services
├── lib/                # Utilities, static data, and DB clients
│   ├── data.ts         # Centralized data for leaders, resources, etc.
│   ├── tutorials-db.ts # Dual-mode (sql.js/Supabase) db logic
│   └── utils.ts        # Helper functions
├── pages/              # Route components
│   ├── halls/          # Hall of Residence details
│   ├── resources/      # Resource category & Career Hub pages
│   ├── tutorials/      # Standalone Tutorials ecosystem
│   └── ...
├── App.tsx             # Main router configuration (includes Code Splitting)
└── main.tsx            # Application entry point
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **Bun** (Highly recommended for dependency management and execution) or **npm**/**yarn**.
- A **Supabase** project (for database and authentication)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/uisu-archive.git
    cd uisu-archive
    ```

2.  **Install dependencies** (Using Bun)
    ```bash
    bun install
    ```
    *Alternatively, use `npm install`.*

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *Note: For live previews on host 0.0.0.0, you may need to export `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`.*

4.  **Start the development server**
    ```bash
    bun run dev
    ```
    *Alternatively, use `npm run dev`.*
    The app will run at `http://localhost:8080` (or `http://localhost:3000` depending on Vite config).

### Available Scripts

- `bun run dev` / `npm run dev`: Start the dev server.
- `bun run build` / `npm run build`: Build for production.
- `bun run preview` / `npm run preview`: Preview the production build.
- `bun run lint` / `npm run lint`: Run ESLint checks.

---

## 🧪 Testing

The project utilizes **Playwright** for end-to-end and component testing.
Current test suites cover critical UI components such as desktop navigation verification and onboarding flows.

To run the Playwright tests:
```bash
npx playwright test
```
*Screenshots from tests are automatically output to `public/` or `test-results/` directories.*

---

## 🤝 Contributing

We welcome contributions to the Aluta spirit!

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please refer to the **Style Guide** (`/style-guide`) locally to ensure consistency with the Aluta Protocol, including adherence to the `nobel` and `ui` color palettes.

---

## 📜 License

Distributed under the MIT License.

---

<p align="center">
  <img src="public/favicon.png" width="50" alt="UISU Logo" />
  <br/>
  <em>Made with 🤎 by Habibi for the Greatest Uites!</em>
</p>
