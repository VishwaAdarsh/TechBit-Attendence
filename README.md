# TechBit 7.0 - IT Committee Attendance System

A modern, responsive, and secure attendance management system built for the **TechBit 7.0 IT Events Committee**.

The system provides centralized member management, secure role-based authentication, meeting management, and attendance tracking for the TechBit 7.0 IT Committee.

---

## Features

### Member Features
- Secure member registration
- Member login using Email or Member ID
- Personal profile dashboard
- Personal attendance history
- Attendance statistics
- Secure password hashing

### Admin / IT Head Features
- Secure IT Head authentication
- Role-based admin access
- View and search registered members
- Edit member information
- Activate or deactivate members
- Create and manage meetings
- Mark and update attendance
- View attendance records
- View overall attendance statistics
- Multiple authorized admin accounts

---

## Project Architecture

The project follows a separated frontend and backend architecture.

### Frontend
- React
- Vite
- Tailwind CSS
- Lucide Icons
- Deployed on Vercel

Located in:

```text
/client
```

### Backend
- Node.js
- Express.js
- REST API
- Deployed on Render

Located in:

```text
/server
```

### Database
- PostgreSQL
- Hosted using Render PostgreSQL
- Persistent production data storage

The database stores:

- Members
- Admin accounts
- Meetings
- Attendance records

Unlike local SQLite storage, PostgreSQL provides persistent production storage so registered members and attendance data remain available across backend restarts and redeployments.

### Authentication

Authentication and authorization are implemented using:

- JWT (JSON Web Tokens)
- BcryptJS password hashing
- Role-based access control
- Protected Admin API routes

Two primary roles are supported:

```text
ADMIN
MEMBER
```

---

## Project Structure

```text
TechBit-Attendence/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md
```

---

# Getting Started

## Prerequisites

Ensure the following are installed:

- Node.js
- npm
- PostgreSQL for local database development

A modern Node.js LTS version is recommended.

---

# Environment Configuration

## Backend Environment Variables

Create a `.env` file inside the `/server` directory.

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
HEAD_ACCESS_CODE=your_secure_admin_access_code
```

### Environment Variables

#### `PORT`

Defines the port used by the Express backend.

Default:

```text
5000
```

#### `DATABASE_URL`

PostgreSQL database connection string.

In production, this should point to the PostgreSQL database configured for the backend service.

#### `JWT_SECRET`

A secure secret key used for signing and verifying JSON Web Tokens.

Use a strong randomly generated value.

#### `HEAD_ACCESS_CODE`

A private authorization code required for protected IT Head/Admin operations.

Never expose this value publicly.

---

## Frontend Environment Variables

Create the appropriate environment configuration for the frontend.

```env
VITE_API_URL=your_backend_url
```

Example structure:

```text
VITE_API_URL=https://your-backend-service.example.com
```

The frontend uses this variable to communicate with the backend REST API.

---

# Installation & Running Locally

## 1. Install and Run the Backend

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Or run the production server:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

During startup, the backend connects to PostgreSQL and automatically verifies or creates the required database tables.

The initialization process is designed to preserve existing records and should not delete registered members, meetings, or attendance data.

---

## 2. Install and Run the Frontend

Open another terminal and navigate to:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

---

# PostgreSQL Database

The application uses PostgreSQL for persistent data storage.

The following primary tables are automatically initialized:

### USERS

Stores:

- Member accounts
- Admin accounts
- Member IDs
- Email addresses
- Password hashes
- User roles
- Account status
- Class/year
- Committee roles

### MEETINGS

Stores:

- Meeting title
- Date
- Time
- Purpose
- Notes
- Meeting creator

### ATTENDANCE

Stores:

- Meeting ID
- User ID
- Attendance status
- Admin who marked attendance
- Creation and update timestamps

Supported attendance statuses:

```text
PRESENT
ABSENT
LATE
EXCUSED
```

A unique constraint prevents duplicate attendance records for the same member and meeting.

---

# Authentication & Authorization

The system supports separate authentication flows for:

### Members

Members can register through the public registration interface.

New users are assigned the:

```text
MEMBER
```

role by default.

Members can access their own profile and attendance information.

### IT Heads / Admins

Authorized IT Heads use the Admin authentication flow.

Admin routes are protected using:

- JWT authentication
- Database role verification
- Account status verification
- Head Access Code verification where required

Only users with a valid:

```text
ADMIN
```

role can access protected administration functionality.

---

# Admin Account Security

Admin credentials and the Head Access Code must **never be stored directly in this README or committed to a public GitHub repository**.

Store sensitive credentials securely using environment variables or another secure secret-management mechanism.

Example:

```env
HEAD_ACCESS_CODE=your_private_access_code
JWT_SECRET=your_private_jwt_secret
```

If credentials have previously been committed to a public repository, rotate them immediately.

---

# Deployment

## Frontend

The React/Vite frontend can be deployed using Vercel.

Configure:

```text
VITE_API_URL
```

with the production backend URL.

---

## Backend

The Node.js/Express backend can be deployed using Render.

Required backend environment variables:

```text
DATABASE_URL
JWT_SECRET
HEAD_ACCESS_CODE
```

The backend connects to PostgreSQL using the `DATABASE_URL` environment variable.

---

## Database

Production data is stored in PostgreSQL.

Using persistent PostgreSQL storage ensures that:

- Registered members remain stored
- Attendance records remain stored
- Meetings remain stored
- Backend redeployments do not reset application data
- Server restarts do not delete application data

---

# Security

The application implements:

- BcryptJS password hashing
- JWT-based authentication
- Role-based authorization
- Protected Admin routes
- PostgreSQL parameterized queries
- Admin database-role verification
- Environment-based secrets

Sensitive values such as:

```text
JWT_SECRET
HEAD_ACCESS_CODE
DATABASE_URL
```

must never be committed to GitHub.

Ensure `.env` files are included in `.gitignore`.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide Icons |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Security | BcryptJS |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Render PostgreSQL |

---

# TechBit 7.0

Developed as an internal attendance management solution for the **TechBit 7.0 IT Events Committee**.

The platform provides a centralized system for managing committee members, meetings, and attendance throughout the organization and preparation of TechBit 7.0.
