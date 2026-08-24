# Adityesh Mishra — Terminal Portfolio

A minimal, high-performance developer portfolio website engineered with **React 18**, **TypeScript**, and **Vite**, powered by **pnpm**.

Built around an authentic **Unix / CLI terminal aesthetic**, featuring window controls, command prompts, a responsive navigation tab bar, interactive project showcases, and a type-safe contact transmission form.

---

## ⚡ Key Features

- **Interactive Terminal Window**:
  - macOS / Unix-style window chrome with functional traffic light buttons:
    - 🔴 **Close**: Terminates the session with a `$ exit` screen and reconnect capability.
    - 🟡 **Minimize**: Collapses the terminal into a compact header bar.
    - 🟢 **Maximize**: Toggles fullscreen edge-to-edge workstation view.
- **Command-Line Navigation & Sections**:
  - `➜ ~ whoami` ➔ Hero section with role overview, status indicator, and quick-action CLI buttons.
  - `➜ ~ cat about.md` ➔ Engineering background and structured tech stack matrix (Frontend, Backend, Databases & Tooling).
  - `➜ ~ ls -la ./projects/` ➔ Interactive project cards with live previews, technology tags, source code links, and demo URLs.
  - `➜ ~ ./send-message.sh` ➔ Interactive CLI-style form with parameter flags and real-time validation powered by `react-hook-form`.
- **Vim / tmux Statusline Footer**: Live status bar displaying editor mode, git branch, environment specs, and navigation shortcuts.
- **Performance & Accessibility**:
  - **100% Self-Hosted Fonts**: Zero render-blocking external font requests using local `.woff2` subsets.
  - **Mobile-Adaptive Layout**: Dynamic tab labels, touch-friendly tap targets (≥ 44px), and zero horizontal overflow across all screen sizes.
  - **WCAG AAA / AA Contrast**: High-contrast syntax tokens for dark mode readability.
  - **Zero Layout Shifts**: Fully optimized image dimensions and static component loading (`CLS = 0.000`).

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[React 18](https://react.dev/)** | Component architecture & modern state primitives |
| **[TypeScript 5.9](https://www.typescriptlang.org/)** | Full end-to-end static type safety |
| **[Vite 6](https://vitejs.dev/)** | Next-generation frontend tooling & lightning-fast ESM bundling |
| **[pnpm 10](https://pnpm.io/)** | Fast, disk-efficient package management |
| **[React Hook Form](https://react-hook-form.com/)** | Lightweight, performant form state & validation |
| **[@fontsource/jetbrains-mono](https://fontsource.org/)** | Self-hosted monospace typography for CLI aesthetics |

---

## 📁 Project Structure

```text
my-portfolio/
├── public/                  # Static web assets & favicons
├── src/
│   ├── components/
│   │   ├── about/           # About section & skill matrix (cat about.md)
│   │   ├── common/          # Reusable ImageLoader, Snackbar notification hooks
│   │   ├── contact/         # Interactive CLI contact form (send-message.sh)
│   │   ├── footer/          # Vim/tmux style statusline footer
│   │   ├── landing/         # Hero identity & social links (whoami)
│   │   ├── loader/          # Terminal spinner animations
│   │   ├── navbar/          # Terminal tab navigation bar
│   │   └── project/         # Project showcase grid (ls -la ./projects/)
│   ├── context/             # Theme & global application contexts
│   ├── icons/               # Typed custom SVG icon definitions
│   ├── prototype/           # Strongly typed project data & external links
│   ├── App.tsx              # Root terminal window container & layout
│   ├── App.css              # Terminal design system, CSS variables & animations
│   ├── main.tsx             # Application bootstrap & self-hosted font imports
│   └── vite-env.d.ts        # Vite TypeScript declarations
├── index.html               # Clean HTML5 entry point
├── package.json             # Dependencies & build scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build & chunking configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node v24)
- **pnpm**: `v9.0.0` or higher (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/Adityesh/my-portfolio.git

# Navigate to project root
cd my-portfolio

# Install dependencies with pnpm
pnpm install
```

### Development Server

Start the Vite development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
# Type-check and build for production
pnpm build

# Preview the production build locally
pnpm preview
```

The optimized production artifacts will be generated in the `dist/` directory.

---

## 📬 Connect

- **GitHub**: [@Adityesh](https://github.com/Adityesh)
- **LinkedIn**: [Adityesh Mishra](https://www.linkedin.com/in/adityesh-mishra-b3446716b/)
- **YouTube**: [Adityesh](https://www.youtube.com/channel/UCsFX7Jk8vV_hQfb0rMeYxZQ)
