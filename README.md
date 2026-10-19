# ⚖️ e-Portal for Case Management Hearing

A centralized digital platform to manage legal case hearings — enabling case registration, document submission, hearing scheduling, real-time tracking, and secure communication between parties.

## 👩‍💻 My Contribution — Bhavana Biradar (ECE)

**Role:** Signal Processing, Communication Systems Research & Future Scope

My contribution focused on analyzing the communication and signal-processing aspects of the e-Portal and researching potential future integrations relevant to Electronics and Communication Engineering (ECE).

### Key Contributions

- **System Analysis:** Contributed to analyzing network bandwidth requirements, data transmission specifications, server load and communication requirements.

- **WebRTC-Based Virtual Courtroom:** Researched and proposed real-time audio/video communication for remote hearings, with potential live transcription using speech-to-text processing.

- **Multilingual Voice Interface:** Proposed a voice-based interface using speech recognition and natural language processing to improve accessibility for users who prefer regional languages.

- **Data Encryption in Transit:** Researched TLS/SSL-based secure communication and the protection of data transmitted between clients and servers.

- **Performance Analysis:** Contributed to the analysis of network throughput, latency measurement and data transmission reliability.

- **ECE Future Scope:** Contributed to the communication-systems and ECE-related future-scope sections of the project.
---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Notifications | Nodemailer (email alerts) |
| File Uploads | Multer |

---

## 🗂️ Project Structure

```
eportal/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level pages
│       ├── context/      # Auth & global state
│       └── utils/        # API helpers
├── server/          # Express backend
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── controllers/  # Business logic
│   └── middleware/   # Auth, error handling
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/eportal-case-management.git
cd eportal-case-management
```

### 2. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Run the application
```bash
# In /server
npm run dev

# In /client (separate terminal)
npm start
```

App runs at: `http://localhost:3000`  
API runs at: `http://localhost:5000`

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage users, all cases, hearings |
| **Judge / Bench** | View assigned cases, update hearing outcomes |
| **Lawyer** | Register cases, upload documents, track hearings |
| **Litigant** | View their case status and hearing schedule |

---

## 📋 Key Features

- ✅ Case Registration with document upload
- ✅ Hearing Scheduling with conflict detection
- ✅ Real-time case status tracking
- ✅ Role-based access control (RBAC)
- ✅ Email notifications on hearing updates
- ✅ Secure JWT authentication
- ✅ Document management system
- ✅ Dashboard with case analytics

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/cases` | List all cases (filtered by role) |
| POST | `/api/cases` | Register a new case |
| GET | `/api/cases/:id` | Get case details |
| PUT | `/api/cases/:id` | Update case |
| POST | `/api/hearings` | Schedule a hearing |
| GET | `/api/hearings` | List hearings |
| PUT | `/api/hearings/:id` | Update hearing outcome |
| POST | `/api/documents/upload` | Upload case document |

---

## 🔐 Environment Variables

See `.env.example` for required variables.

---

## 📄 License

MIT License — free to use and modify.
