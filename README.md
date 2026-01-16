# UISU Archive

The **UISU Archive** is the official digital platform for the **University of Ibadan Students' Union (UISU)**. It serves as a comprehensive management system, a historical archive, and a dynamic hub for student activities, governance, and creative expression.

Designed to preserve the legacy of the union while modernizing its operations, the platform bridges the gap between the students and their leaders, providing transparency, accessibility, and a dedicated space for the "Aluta" spirit to thrive digitally.

## 🚀 Key Features

### 🏛 Governance & Leadership
- **Current Leaders**: Interactive profiles of the Executive Council, Principal Officers, Hall Leaders, and Student Legislators (SRC).
- **Governance Structure**: Visual breakdowns of the union's hierarchy including the Executive, Legislative, and Judiciary arms (visualized with 3D models).
- **Past Leaders (Hall of Fame)**: A digital museum honoring previous administrations and historical figures.

### ✍️ Inks Vault (Publication Platform)
A robust content management system for student journalists and creatives.
- **8 Content Types**: Articles, Blogs, Reports, Essays, Poetry, Opinion pieces, Interviews, and Fiction.
- **Writer's Desk**: A secure, distraction-free rich text editor powered by **Editor.js**.
- **Related Content**: Smart suggestions connecting readers to similar pieces.

### 📚 Resource Center
A one-stop hub for academic and survival tools, organized into 12 categories:
- **Academic Bank**: Lecture notes and past questions (Google Drive-style interface).
- **Career Hub & Scholarship Finder**: Opportunities for growth.
- **Student Mart**: Campus marketplace.
- **Freshers' Compass**: Guides for new students.
- **Utilities**: GPA Calculator, Calculator Suite, and more.

### 🗺 Campus Map
- **Interactive Exploration**: Navigate the University of Ibadan campus.
- **3D Visualization**: Custom 3D pins for Halls of Residence (The Republics) and key landmarks.

### 🎨 The Aluta Protocol
- **Design System**: A comprehensive style guide (`/style-guide`) documenting the UI/UX language—typography, colors, components, and 3D assets.

### 🔐 Admin Dashboard
- **Role-Based Access**: Secure management for Staff and Moderators.
- **Content Moderation**: Tools to review and publish Inks Vault submissions.

---

## 🛠 Tech Stack

Built with a focus on performance, accessibility, and modern web standards.

| Category | Technology |
|----------|------------|
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Backend & Auth** | [Supabase](https://supabase.com/) |
| **State Management** | [TanStack Query](https://tanstack.com/query) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **3D Graphics** | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) |
| **Rich Text Editor** | [Editor.js](https://editorjs.io/) |
| **Testing** | [Playwright](https://playwright.dev/) |
| **SEO** | [React Helmet Async](https://github.com/staylor/react-helmet-async) |

---

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn primitives (Button, Card, etc.)
│   └── ...             # Feature-specific components (Navbar, Footer, etc.)
├── hooks/              # Custom React hooks (useToast, useAdminCheck)
├── integrations/       # Supabase client and external services
├── lib/                # Utilities, static data, and type definitions
│   ├── data.ts         # Centralized data for leaders, resources, etc.
│   └── utils.ts        # Helper functions
├── pages/              # Route components
│   ├── halls/          # Hall of Residence details
│   ├── resources/      # Resource category pages
│   ├── AdminDashboard.tsx
│   ├── InkEditorPage.tsx
│   └── ...
├── App.tsx             # Main router configuration
└── main.tsx            # Application entry point
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**, **yarn**, or **bun**
- A **Supabase** project (for database and authentication)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/uisu-archive.git
    cd uisu-archive
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:8080`.

### Available Scripts

- `npm run dev`: Start the dev server.
- `npm run build`: Build for production.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint checks.

---

## 🤝 Contributing

We welcome contributions to the Aluta spirit!

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please refer to the **Style Guide** (`/style-guide`) locally to ensure consistency with the Aluta Protocol.

---

## 📜 License

Distributed under the MIT License.

---

<p align="center">
  <img src="public/favicon.png" width="50" alt="UISU Logo" />
  <br/>
  <em>Greatest Uites!</em>
</p>
