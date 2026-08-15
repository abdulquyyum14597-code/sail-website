# SAIL — Software Analysis & Intelligence Lab Website & Backend

A full-stack, responsive website and content management system for the **Software Analysis & Intelligence Lab (SAIL)** at SEECS, NUST.

---

## Features

- **Full REST API**: Clean CRUD endpoints for Team, Publications, Research Areas, Projects, Gallery, Lab Settings, and Contact Messages.
- **SQLite Database**: Zero-configuration, file-based relational database that automatically seeds from `/data/*.json` files on first run.
- **JWT Authentication**: Secure login system with bcrypt password hashing protecting all write endpoints (POST/PUT/DELETE) and admin routes.
- **Image & Media Uploads**: Built-in file upload handling (`multer`) saving directly to `/uploads` with immediate image previews.
- **Interactive Admin Panel**: Add, edit, reorder, delete content, upload photos, and view contact submissions in real-time.
- **Free-Tier Cloud Ready**: Designed to deploy at **zero cost** on Render, Railway, or Vercel.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already pre-configured for local dev):
```bash
PORT=8000
NODE_ENV=development
JWT_SECRET=sail_lab_jwt_super_secret_key_2026_change_in_production
ADMIN_EMAIL=sail@seecs.nust.edu.pk
ADMIN_PASSWORD=sail2026
CORS_ORIGIN=*
```

### 3. Run the Server
```bash
npm start
```
or with auto-reload:
```bash
npm run dev
```

Visit the website at:
- **Public Site**: [http://localhost:8000](http://localhost:8000)
- **Admin Panel**: [http://localhost:8000/admin/login.html](http://localhost:8000/admin/login.html)
- **Default Admin Password**: `sail2026`

---

## 📡 REST API Documentation

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/team` | List all team members |
| `GET` | `/api/publications` | List all publications |
| `GET` | `/api/research` | List all research areas |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/gallery` | List all gallery photos |
| `GET` | `/api/settings` | Get lab settings & PI info |
| `POST` | `/api/contact` | Submit contact inquiry |
| `POST` | `/api/auth/login` | Authenticate admin (`{ password }`) |

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Verify session token |
| `POST` | `/api/auth/change-password` | Change admin password |
| `POST` | `/api/{collection}` | Add new item (`team`, `publications`, `research`, `projects`, `gallery`) |
| `PUT` | `/api/{collection}/:id` | Update item |
| `DELETE` | `/api/{collection}/:id` | Delete item |
| `PUT` | `/api/settings` | Update lab settings |
| `POST` | `/api/upload` | Upload image (`multipart/form-data`, key: `file`) |
| `GET` | `/api/contact/messages` | List received contact inquiries |
| `PUT` | `/api/contact/messages/:id/read` | Mark message as read |
| `DELETE` | `/api/contact/messages/:id` | Delete message |

---

## ☁️ Free 100% Zero-Cost Deployment Guide

### Option 1: Unified All-in-One Service on Render (Recommended & Simplest)
Because the Express server serves both the static frontend and REST API, you can deploy the entire site on Render for free with one click:
1. Push your repository to GitHub.
2. Sign up / log in to [Render](https://render.com) (Free tier).
3. Click **New +** &rarr; **Web Service**.
4. Connect your GitHub repository.
5. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Under **Environment Variables**, add:
   - `JWT_SECRET` = (a strong random string)
   - `ADMIN_PASSWORD` = (your desired admin password)
   - `NODE_ENV` = `production`
7. Click **Create Web Service**. Your website is live with HTTPS and custom domain support!

---

### Option 2: Split Deployment (Vercel Frontend + Render Backend)
If you prefer hosting the static frontend on Vercel:
1. Deploy the Node/Express backend to Render as described in Option 1 (note your backend URL, e.g. `https://sail-backend.onrender.com`).
2. Deploy the repository to [Vercel](https://vercel.com).
3. In your Vercel project or frontend HTML header, configure `window.__BASE_PATH__ = 'https://sail-backend.onrender.com';` (or point `API_BASE`).
4. Set `CORS_ORIGIN` in Render to your Vercel domain.

---

## 📁 Project Structure

```
sail-website/
├── admin/                 # Admin panel HTML & client JS
│   ├── css/admin.css
│   ├── js/
│   │   ├── auth.js        # JWT authentication logic
│   │   ├── store.js       # CRUD API client & upload helper
│   │   ├── team.js, publications.js, projects.js, etc.
│   │   └── messages.js    # Contact message inbox
│   ├── login.html         # Admin login
│   ├── index.html         # Admin dashboard
│   └── messages.html      # Message management
├── assets/                # Static images & fonts
├── css/                   # Public stylesheets
├── data/                  # Seed JSON files & SQLite database (sail.db)
├── js/                    # Public frontend scripts
│   ├── api.js             # Frontend API client
│   ├── contact.js         # Contact form handler
│   └── home.js, team.js, projects.js, etc.
├── server/                # Node.js backend
│   ├── db/database.js     # SQLite schema & auto-seed
│   ├── middleware/        # JWT auth & multer upload
│   ├── routes/            # REST API route handlers
│   └── server.js          # Express entry point
├── uploads/               # Uploaded photos & images
├── package.json
└── vercel.json
```
