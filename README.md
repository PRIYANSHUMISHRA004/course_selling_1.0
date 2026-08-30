# 📚 Course Selling Platform

A simplified, full-stack **Course Selling Platform** built with Next.js, Tailwind CSS, MongoDB, and Razorpay — organized as a **Turborepo monorepo**. It supports two roles: **Admins** (course creators) and **Users** (learners), with course browsing, purchasing, and protected course content delivery.

---

## 🗂️ Project Structure

```
course_selling_1.0/
├── apps/
│   └── admin/             # Next.js app (Admin & User portals + API routes)
├── packages/
│   ├── db/                # Mongoose models (User, Admin, Course) & DB connection
│   ├── store/             # Recoil global state & CourseFormat types
│   ├── ui/                # Shared React component library (Tailwind CSS + SVG icons)
│   ├── auth/              # JWT authentication & verification utilities
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json             # Turborepo pipeline config
└── package.json           # Root workspace config
```

---

## ✨ Core Features & Architecture

### 👩‍💼 Admin Portal
- Secure admin **signup & login** with **bcryptjs password hashing** and 1-day expiring JWTs.
- **Role-isolated auth tokens**: Admin sessions use `adminToken`, completely separate from `userToken`.
- **Create, update, and delete** courses.
- Edit Title, Description (Course Content), Price, Cover Image URL, and Published status.
- **Strict Admin Ownership**: Admins can only view, update, or delete courses they created (`adminId: admin._id`).
- **Dangling Reference Cleanup**: Deleting a course automatically pulls its ID from all users' purchased courses.

### 👤 User Portal
- User **signup & login** with **bcryptjs password hashing** and 1-day expiring JWTs.
- **Public Catalog**: Browse published courses with clean cards (Image + Title).
- **Backend Content Protection**: Public API responses (`GET /api/user/courses`) exclude `description`. Only authenticated purchasers receive the full `description` (course content).
- **Purchase courses** via integrated Razorpay payment flow with strong server-side order-to-course binding.
- View enrolled courses under **My Learning** and read the full course content.

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
| **Password Hashing** | [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Auth** | Custom JWT + `js-cookie` (`adminToken` / `userToken`) |
| **State Management** | [Recoil](https://recoiljs.org/) |
| **Payments** | [Razorpay](https://razorpay.com/) (HMAC SHA-256 + Server Order Verification) |
| **UI Components** | Shared component suite (`packages/ui`) |
| **Monorepo** | [Turborepo](https://turbo.build/) |

---

## 📡 API Routes

All API routes live under `apps/admin/src/pages/api/`.

### Admin Routes (`/api/admin/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/signup` | Register new admin (hashed password) |
| `POST` | `/api/admin/signin` | Admin login & issue JWT |
| `GET` | `/api/admin/me` | Current authenticated admin profile |
| `GET` | `/api/admin/courses` | List admin's courses or get owned course by ID |
| `POST` | `/api/admin/createCourses` | Create course (assigns `adminId` from JWT) |
| `PUT` | `/api/admin/updateCourse` | Update course (verifies `adminId` ownership) |
| `DELETE` | `/api/admin/deleteCourse` | Delete course (verifies `adminId` & cleans up `User.courses`) |

### User Routes (`/api/user/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/user/signup` | Register new user (hashed password) |
| `POST` | `/api/user/signin` | User login & issue JWT |
| `GET` | `/api/user/me` | Current user profile with populated purchased courses |
| `GET` | `/api/user/courses` | Public catalog (excludes `description` for unpurchased) |

### Payment Routes (`/api/payment/*`)
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/payment/create-order` | Validates price & enrollment, creates Razorpay order with course binding notes |
| `POST` | `/api/payment/verify-payment` | Verifies HMAC SHA-256 signature, fetches order from Razorpay to verify course/amount/user binding, and adds course to user |

---

## 🔐 Security & Payment Flow

1. **Authentication & Password Security**:
   - Passwords hashed using bcrypt with salt rounds = 10 before saving to MongoDB.
   - JWT tokens generated with 1-day expiration (`expiresIn: "1d"`).
   - `adminToken` and `userToken` stored in separate cookies to avoid cross-role collision.
2. **Admin Ownership Verification**:
   - Course creation pulls `adminId` strictly from the verified JWT payload.
   - Course retrieval, update, and delete endpoints enforce `{ _id: courseId, adminId: admin._id }`.
3. **Backend Content Protection**:
   - Public requests to `/api/user/courses` return `.select("_id title imageLink price published")`.
   - When a user views `/user/course/[id]`, the server checks whether the user's `courses` array in MongoDB contains the `courseId`.
   - Only verified purchasers receive the `description` content from the API.
4. **Razorpay Payment Verification & Course Binding**:
   - Backend calculates HMAC SHA-256 over `${razorpay_order_id}|${razorpay_payment_id}` using `RAZORPAY_KEY_SECRET`.
   - Backend queries Razorpay order API to verify `order.notes.courseId`, `order.notes.username`, `order.amount === course.price * 100`, and `order.currency === "INR"`.
   - On verified match, course is added to the user's `courses` array using `$addToSet`.

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

> [!NOTE]
> Because passwords are now securely hashed with bcrypt, any old plaintext test accounts in MongoDB should be recreated through the signup pages.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. Build

```bash
npm run build
```
