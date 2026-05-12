# 🚀 Step-by-Step: Push e-Portal to GitHub

This guide walks you through pushing the full project to GitHub and running it locally.

---

## PART 1 — Prerequisites (install once)

### 1.1 Install Git
Check if already installed:
```bash
git --version
```
If not installed:
- **Windows**: Download from https://git-scm.com/download/win
- **macOS**: `brew install git`
- **Ubuntu/Debian**: `sudo apt install git`

### 1.2 Install Node.js v18+
```bash
node --version   # should show v18 or higher
```
If not installed: https://nodejs.org/en/download

### 1.3 Install MongoDB (local dev)
- Download: https://www.mongodb.com/try/download/community
- OR use **MongoDB Atlas** (free cloud): https://cloud.mongodb.com

### 1.4 Configure Git with your identity (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## PART 2 — Create GitHub Repository

1. Go to https://github.com and log in
2. Click the **+** icon → **New repository**
3. Fill in:
   - **Repository name**: `eportal-case-management`
   - **Description**: `e-Portal for Case Management Hearing System`
   - **Visibility**: Public or Private
   - ❌ Do NOT check "Add a README" (we already have one)
4. Click **Create repository**
5. Copy the repository URL — it will look like:
   ```
   https://github.com/YOUR_USERNAME/eportal-case-management.git
   ```

---

## PART 3 — Initialize and Push the Code

Open a terminal and navigate to where the `eportal/` folder is:

```bash
cd /path/to/eportal
```

### Step 1: Initialize git repository
```bash
git init
```

### Step 2: Add all files
```bash
git add .
```

### Step 3: Verify what will be committed
```bash
git status
```
You should see all project files listed. Make sure `.env` is NOT listed (it's in .gitignore).

### Step 4: Create the first commit
```bash
git commit -m "Initial commit: e-Portal Case Management System

- React frontend with role-based UI
- Express/Node.js REST API
- MongoDB models for Cases, Hearings, Documents, Users
- JWT authentication with role-based access control
- File upload system with Multer
- Email notifications via Nodemailer
- Dashboard with analytics
- Docker support
- GitHub Actions CI/CD"
```

### Step 5: Set main branch
```bash
git branch -M main
```

### Step 6: Link to your GitHub repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/eportal-case-management.git
```
Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 7: Push to GitHub
```bash
git push -u origin main
```

If prompted, enter your GitHub username and a **Personal Access Token** (not your password).
To create a token: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token → check `repo` scope.

---

## PART 4 — Run the Project Locally

### Step 1: Set up the backend

```bash
cd server
npm install
```

Create your `.env` file:
```bash
cp ../.env.example .env
```

Edit `.env` and at minimum set:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eportal_db
JWT_SECRET=change_this_to_a_random_secret_string
```

### Step 2: Seed demo data (optional but recommended)
```bash
node seed.js
```

This creates 4 demo users, 6 cases, and 5 hearings. Login credentials will be printed in the terminal.

### Step 3: Start the backend server
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Step 4: Set up the frontend (new terminal)
```bash
cd client
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## PART 5 — Test the Application

### Demo login credentials (after seeding):

| Role     | Email                | Password   | Access |
|----------|----------------------|------------|--------|
| Admin    | admin@eportal.in     | admin123   | Full access |
| Judge    | judge@eportal.in     | judge123   | Cases, hearings, outcomes |
| Lawyer   | lawyer@eportal.in    | lawyer123  | Register cases, upload docs |
| Litigant | user@eportal.in      | user123    | View own cases |

### Test API directly:
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eportal.in","password":"admin123"}'
```

---

## PART 6 — Run with Docker (optional)

If you have Docker and Docker Compose installed:

```bash
# From the eportal/ root directory
cp .env.example .env
# Edit .env with your values

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

---

## PART 7 — Ongoing Git Workflow

After making changes:

```bash
# See what changed
git status

# Stage changes
git add .

# Commit with a meaningful message
git commit -m "feat: add case search filter by date range"

# Push to GitHub
git push
```

### Recommended branching:
```bash
# Create a feature branch
git checkout -b feature/hearing-calendar

# Work on it, commit, then push
git push origin feature/hearing-calendar

# On GitHub: open a Pull Request → merge to main
```

---

## PART 8 — Deploy to Production (free options)

### Backend → Railway (recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub → select your repo
3. Set root directory to `server`
4. Add environment variables (from your .env)
5. Railway auto-detects Node.js and deploys

### Frontend → Vercel (recommended)
1. Go to https://vercel.com
2. Import Git Repository → select your repo
3. Set root directory to `client`
4. Framework Preset: Create React App
5. Deploy

### MongoDB → MongoDB Atlas (free tier)
1. https://cloud.mongodb.com → Create free cluster
2. Get connection string → set as `MONGO_URI` in Railway

---

## Project Structure Recap

```
eportal/
├── .github/workflows/ci.yml   ← GitHub Actions CI/CD
├── .gitignore
├── .env.example
├── README.md
├── docker-compose.yml
│
├── server/                    ← Node.js / Express Backend
│   ├── server.js              ← Entry point
│   ├── seed.js                ← Demo data seeder
│   ├── Dockerfile
│   ├── models/
│   │   ├── User.js
│   │   ├── Case.js
│   │   ├── Hearing.js
│   │   └── Document.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   ├── hearingController.js
│   │   ├── documentController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cases.js
│   │   ├── hearings.js
│   │   ├── documents.js
│   │   ├── users.js
│   │   └── dashboard.js
│   └── middleware/
│       └── auth.js
│
└── client/                    ← React Frontend
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.js             ← Routing
        ├── index.js
        ├── context/
        │   └── AuthContext.js
        ├── components/
        │   ├── Layout.js      ← Sidebar + nav
        │   └── Layout.css     ← Full design system
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── AuthPages.css
            ├── DashboardPage.js
            ├── CasesPage.js
            ├── NewCasePage.js
            ├── CaseDetailPage.js
            ├── HearingsPage.js
            └── UsersPage.js
```

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on port 27017 | Start MongoDB service: `sudo systemctl start mongod` |
| `JWT_SECRET is not defined` | Make sure `.env` file exists in `/server` directory |
| React shows blank page | Check browser console; ensure backend is running on port 5000 |
| `npm ERR! ERESOLVE` | Run `npm install --legacy-peer-deps` |
| Git push asks for password | Use a Personal Access Token, not your GitHub password |
| Docker: port already in use | Run `docker-compose down` then `docker-compose up --build` |
