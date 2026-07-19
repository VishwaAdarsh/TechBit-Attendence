# TechBit 7.0 - IT Committee Attendance System

A modern, responsive, and secure internal attendance management system built for the **TechBit 7.0 IT Events Committee**.

## Project Architecture

- **Frontend**: React (Vite) + Tailwind CSS v4 + Lucide Icons (in `/client`)
- **Backend**: Node.js + Express.js (in `/server`)
- **Database**: SQLite (in `/server/attendance.db`)
- **Authentication**: JWT (JSON Web Tokens) + BcryptJS Password Hashing

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v16.x or higher recommended).

### Environment Configuration

1. Locate or create a `.env` file in the `/server` folder. (A `.env.example` has been provided in the root directory for reference).
2. The server configuration variables are:
   - `PORT`: Port on which the express backend will run (default is `5000`).
   - `JWT_SECRET`: Secret key used for signing JSON Web Tokens.
   - `HEAD_ACCESS_CODE`: Secret authorization key required for IT Head/Admin login. (Predefined as `HEAD_ACCESS_CODE=TECHBIT_HEAD_70`).

---

## Installation & Running Locally

### 1. Run the Backend Server

```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000`. On first start, it will initialize the SQLite database (`server/attendance.db`) and seed the default Admin credentials.

### 2. Run the React Frontend

Open a new terminal tab/window:
```bash
cd client
npm install
npm run dev
```
The frontend dev server will launch (typically at `http://localhost:5173`).

---

## Seeded Admin Accounts (IT Heads)

To access the IT Head Dashboard, use one of the predefined admin credentials along with the head access code.

**Head Access Code**: `ADROSH234`

- **IT Head Alpha**:
  - Email / ID: `alpha@techbit.com` or `TB7-HEAD-01`
  - Password: `AdminPassword70`
- **IT Head Beta**:
  - Email / ID: `beta@techbit.com` or `TB7-HEAD-02`
  - Password: `AdminPassword70`

*Note: Members can register publicly via the registration screen. They will automatically be assigned the `MEMBER` role. Admin accounts cannot be created via public registration.*
