# 📚 Next CourseApp

A full-stack **Learning Management System (LMS)** built with Next.js, Tailwind CSS, MongoDB, and Razorpay — organized as a **Turborepo monorepo**. It supports two roles: **Admins** (course creators) and **Users** (learners), with course browsing, purchasing, and lesson viewing.

---

## 🗂️ Project Structure

```
next_courseapp/
├── apps/
│   ├── admin/          # Main Next.js app (Admin + User portals styled with Tailwind CSS)
│   ├── web/            # Public-facing web app
│   └── docs/           # Documentation site
├── packages/
│   ├── db/             # Mongoose models & DB connection
│   ├── store/          # Recoil atoms (global state)
│   ├── ui/             # Shared React component library (Tailwind CSS + SVG icons)
│   ├── auth/           # Authentication utilities
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── docs/
│   └── MUI_TO_TAILWIND_MIGRATION.md # Comprehensive migration & interview documentation
├── turbo.json          # Turborepo pipeline config
└── package.json        # Root workspace config
```

---

## ✨ Features

### 👩‍💼 Admin Portal
- Secure admin **signup & login** (JWT-based)
- **Create, update, and delete** courses
- Upload course thumbnails, set pricing, category, level & tags
- Interactive **curriculum and lesson manager** with custom numeric ordering
- View all created courses with live card previews and status toggles

### 👤 User Portal
- User **signup & login** (JWT-based)
- Browse all published courses with rich metadata and search filtering
- **Purchase courses** via Razorpay payment gateway integration
- Access **purchased courses** with sidebar lesson navigation and ordered lesson reader

### 📦 Course Model
Each course supports:
- Title, description, price, thumbnail/image
- Category (Web Dev, AI/ML, DevOps, etc.)
- Level (Beginner / Intermediate / Advanced)
- Language, duration, tags
- **Embedded lessons** (title, description, order)
- Stats: rating, students enrolled, total lessons

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (Turbopack) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) + Autoprefixer |
| **Database** | MongoDB + [Mongoose](https://mongoosejs.com/) |
| **Auth** | Custom JWT + `js-cookie` |
| **State Management** | [Recoil](https://recoiljs.org/) |
| **Payments** | [Razorpay](https://razorpay.com/) |
| **UI Components** | Custom `packages/ui` component suite with zero-dependency SVG icons |
| **Monorepo** | [Turborepo](https://turbo.build/) |
| **Package Manager** | npm workspaces (npm ≥ 11) |

---

## 🎨 Styling & Architecture: MUI to Tailwind CSS Migration

The presentation layer was migrated from Material UI (MUI v7) and Emotion to **Tailwind CSS**:
- **Zero Runtime Style Engine**: Replaced Emotion runtime stylesheet injection with static CSS compiled at build time.
- **Pure Utility Styling**: Converted MUI `Box`, `Stack`, `Grid`, `Card`, and `Typography` to standard semantic HTML elements styled with Tailwind classes.
- **Zero-Dependency SVG Icons**: Replaced `@mui/icons-material` with an internal, lightweight SVG icon collection in `packages/ui/src/components/icons.tsx`.
- **Preserved Business Logic**: 100% of routes, API handlers, Recoil state, JWT/cookie authentication, and role-based navigation logic were preserved.

📖 *For a complete architecture breakdown, before/after code examples, challenges, trade-offs, and interview Q&A, see [`docs/MUI_TO_TAILWIND_MIGRATION.md`](docs/MUI_TO_TAILWIND_MIGRATION.md).*

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 11
- A running **MongoDB** instance (local or Atlas)
- A **Razorpay** account for payments

### 1. Clone the repository

```bash
git clone https://github.com/PRIYANSHUMISHRA004/next_courseapp.git
cd next_courseapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root and in `apps/admin/`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/courseapp

# JWT Secrets
USER_SECRET=your_user_jwt_secret
ADMIN_SECRET=your_admin_jwt_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Run in development

```bash
npm run dev
```

This starts all apps in parallel via Turborepo. The main app runs at **http://localhost:3000**.

---

## 📡 API Routes

All API routes live under `apps/admin/src/pages/api/`.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/signup` | Admin registration |
| `POST` | `/api/admin/signin` | Admin login |
| `GET` | `/api/admin/me` | Current authenticated admin info |
| `GET` | `/api/admin/courses` | Get all courses / course by ID (admin) |
| `POST` | `/api/admin/createCourses` | Create a new course |
| `PUT` | `/api/admin/updateCourse` | Update course details and lesson curriculum |
| `DELETE` | `/api/admin/deleteCourse` | Delete a course |
| `POST` | `/api/user/signup` | User/learner registration |
| `POST` | `/api/user/signin` | User/learner login |
| `GET` | `/api/user/me` | Current authenticated user info |
| `GET` | `/api/user/courses` | Get all published courses / course by ID |
| `GET` | `/api/user/mycourse` | Get user's purchased courses |
| `POST` | `/api/payment/create-order` | Create Razorpay payment order |
| `POST` | `/api/payment/verify-payment` | Verify Razorpay payment signature & unlock course |

---

## 📦 Shared Packages

### `packages/db`
Mongoose schemas and models:
- `User` — learner accounts with enrolled course references
- `Admin` — course creator accounts
- `Course` — full course document with embedded `Lesson` subdocuments

### `packages/store`
Recoil atoms and shared TypeScript types:
- `userState` — logged-in learner info
- `adminState` — logged-in admin info
- `coursesState` — list of all courses
- `purchasedCoursesState` — learner's purchased courses
- Shared types and constants (`CourseFormat`, `LessonFormat`, `CATEGORIES`, `LEVELS`, `LANGUAGES`)

### `packages/ui`
Shared React presentation components styled with Tailwind CSS:
- `Appbar` — sticky top navigation with role-based links and search
- `Coursecard` / `CoursecardAdmin` — responsive course cards with status tags
- `Login` / `Signup` — accessible authentication forms with show/hide password toggle
- `About` — responsive company information card
- `RoleCard` / `FeatureItem` — landing page presentation components
- `icons.tsx` — zero-dependency SVG icon suite

### `packages/auth`
JWT utility functions for signing and verifying tokens.

---

## 🧰 Available Scripts

Run from the **project root**:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all workspaces with ESLint |
| `npm run check-types` | TypeScript type-check across all packages |

---

## 🏗️ Monorepo Architecture

This project uses **Turborepo** for efficient task orchestration:

```
turbo dev
  └── Runs next dev in apps/admin, apps/web, apps/docs (parallel)

turbo build
  └── Builds packages first (db, store, ui, auth)
  └── Then builds apps (admin, web, docs)
```

---

## 🔐 Authentication Flow

1. **Admin** signs up → credentials stored in MongoDB (`Admin` collection)
2. On login → server validates credentials, issues a **JWT**
3. JWT stored in cookie (`js-cookie`) and validated on every protected API call
4. **Users** follow the same JWT-based authentication flow for protected API calls and route guards

---

## 💳 Payment Flow

1. User clicks "Buy Course"
2. Frontend calls `POST /api/payment/create-order` → Razorpay order created
3. Razorpay checkout opens in browser
4. On success → frontend sends signature to `POST /api/payment/verify-payment`
5. Server verifies signature → course added to user's `purchasedCourses` array in MongoDB

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. Feel free to use and modify it.

---

<div align="center">
  <p>Built with ❤️ using Next.js, Tailwind CSS & Turborepo</p>
</div>
