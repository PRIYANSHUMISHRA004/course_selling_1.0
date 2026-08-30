# 📚 Next CourseApp

A simplified, full-stack **Course Selling Platform** built with Next.js, Tailwind CSS, MongoDB, and Razorpay — organized as a **Turborepo monorepo**. It supports two roles: **Admins** (course creators) and **Users** (learners), with course browsing, purchasing, and protected course content delivery.

---

## 🗂️ Project Structure

```
next_courseapp/
├── apps/
│   └── admin/          # Next.js app (Admin & User portals + API routes)
├── packages/
│   ├── db/             # Mongoose models (User, Admin, Course) & DB connection
│   ├── store/          # Recoil global state & CourseFormat types
│   ├── ui/             # Shared React component library (Tailwind CSS + SVG icons)
│   ├── auth/           # JWT authentication utilities
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json          # Turborepo pipeline config
└── package.json        # Root workspace config
```

---

## ✨ Core Features & Architecture

### 👩‍💼 Admin Portal
- Secure admin **signup & login** (JWT-based)
- **Create, update, and delete** courses
- Edit Title, Description (Course Content), Price, Cover Image URL, and Published status
- Admin Course Ownership: Admins can only edit or delete courses they created (`adminId: admin._id`)
- View created courses with live preview

### 👤 User Portal
- User **signup & login** (JWT-based)
- Browse published courses with Title, Price, and Cover Image
- **Backend Content Protection**: Public API responses (`GET /api/user/courses`) exclude `description`. Only authenticated users who have purchased the course receive the full `description` (course content).
- **Purchase courses** via integrated Razorpay payment flow
- View enrolled courses under **My Learning** and read the full course content

### 📦 Minimal Course Model
Each course contains only the fields actually needed:
- `title`: String
- `description`: String (Acts as the full course content / material)
- `price`: Number
- `imageLink`: String
- `published`: Boolean
- `adminId`: ObjectId (References the Admin who created the course)
- `timestamps`: Created & updated timestamps

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js](https://nextjs.org/) (Pages Router) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | MongoDB + [Mongoose](https://mongoosejs.com/) |
| **Auth** | Custom JWT + `js-cookie` |
| **State Management** | [Recoil](https://recoiljs.org/) |
| **Payments** | [Razorpay](https://razorpay.com/) (HMAC SHA-256 verification) |
| **UI Components** | Shared component suite (`packages/ui`) |
| **Monorepo** | [Turborepo](https://turbo.build/) |

---

## 📡 API Routes

All API routes live under `apps/admin/src/pages/api/`.

### Admin Routes (`/api/admin/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/signup` | Register new admin |
| `POST` | `/api/admin/signin` | Admin login & issue JWT |
| `GET` | `/api/admin/me` | Current authenticated admin profile |
| `GET` | `/api/admin/courses` | List admin's courses or get course by ID |
| `POST` | `/api/admin/createCourses` | Create course (assigns `adminId` from JWT) |
| `PUT` | `/api/admin/updateCourse` | Update course (verifies `adminId` ownership) |
| `DELETE` | `/api/admin/deleteCourse` | Delete course (verifies `adminId` ownership) |

### User Routes (`/api/user/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/user/signup` | Register new user |
| `POST` | `/api/user/signin` | User login & issue JWT |
| `GET` | `/api/user/me` | Current user profile with populated purchased courses |
| `GET` | `/api/user/courses` | Public catalog (excludes `description` for unpurchased) |

### Payment Routes (`/api/payment/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/payment/create-order` | Creates Razorpay order for `course.price * 100` |
| `POST` | `/api/payment/verify-payment` | Verifies HMAC SHA-256 signature and adds course to user |

---

## 🔐 Authorization & Content Protection Flow

1. **Admin Authorization**:
   - Course creation pulls `adminId` strictly from the verified JWT payload.
   - Course updates and deletes filter by `{ _id: courseId, adminId: admin._id }`.
2. **Content Protection**:
   - Public requests to `/api/user/courses` return `.select("_id title imageLink price published")`.
   - When a user views `/user/course/[id]`, the server checks whether the user's `courses` array in MongoDB contains the `courseId`.
   - Only verified purchasers receive the `description` content from the API.
3. **Razorpay Verification**:
   - On checkout completion, backend calculates HMAC SHA-256 over `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.
   - On signature match, course is added to the user's `courses` array using `$addToSet`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 11
- Running **MongoDB** instance
- **Razorpay** account credentials

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` in the root and in `apps/admin/`:

```env
MONGODB_URI=mongodb://localhost:27017/courseapp
USER_SECRET=your_user_jwt_secret
ADMIN_SECRET=your_admin_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. Build

```bash
npm run build
```
