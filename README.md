# Customer Portal POC

A functional proof-of-concept (POC) for a minimal Customer Portal.

---

## 🚀 Setup Instructions (TL;DR)

```powershell
# 1. Install dependencies
cd backend
npm install
cd ../frontend
npm install

# 2. Set your ServiceM8 API key (get from Settings > API Keys in ServiceM8)
$env:SERVICEM8_API_KEY = "smk-your-api-key-here"

# 3. Start backend (Terminal 1)
cd backend
node src/index.js

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open http://localhost:3000
# Login: customer@example.com / 0400123456
```

> **Note:** Without the API key, the app uses mock data. With the key, you see real ServiceM8 data.

---

## Features

- ✅ **Customer Login** - Authentication using email and phone number
- ✅ **Bookings List** - View all customer bookings/jobs from ServiceM8
- ✅ **Booking Details** - Access detailed information for each booking
- ✅ **File Attachments** - View photos and download files from ServiceM8
- ✅ **Messaging** - Send and view messages related to bookings (persisted)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Express.js, Node.js |
| API Integration | ServiceM8 REST API |
| Authentication | JWT tokens |
| Data Storage | JSON file (messages) |

---

## Quick Start

### Prerequisites

- **Node.js 18+** installed ([download](https://nodejs.org))
- **npm** (comes with Node.js)

### Step 1: Install Dependencies

```powershell
# Clone/download the project, then:

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Start the Backend

```powershell
cd backend
node src/index.js
```

You should see:
```
🚀 Customer Portal Backend running on http://localhost:3001
```

### Step 3: Start the Frontend (New Terminal)

```powershell
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.4
- Local: http://localhost:3000
✓ Ready
```

### Step 4: Open the App

1. Open browser: **http://localhost:3000**
2. Login with demo credentials:
   - **Email**: `customer@example.com`
   - **Phone**: `0400123456`

---

## What You'll See

The demo includes **real data from ServiceM8**:

- **Sample Job**: "Install new basin mixer in staff bathroom"
- **Real Photos**: Actual images from the job
- **Job Details**: Address, date, work completed notes
- **Working Messages**: Send messages that persist to the backend

---

## Using Your Own ServiceM8 Account (Optional)

If you want to test with your own ServiceM8 data:

1. Create a free account at [servicem8.com](https://www.servicem8.com)
2. Go to **Settings** → **API Keys** → **Add API Key**
3. Select **"Full Access"** and click **Create**
4. Copy the API key (format: `smk-xxxxx-xxxxx...`)
5. Start the backend with your key:

**Windows PowerShell:**
```powershell
$env:SERVICEM8_API_KEY = "smk-your-api-key-here"
cd backend
node src/index.js
```

**Mac/Linux:**
```bash
SERVICEM8_API_KEY=smk-your-api-key-here node src/index.js
```

---

## Project Structure

```
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.js        # Login/logout
│   │   │   ├── bookings.js    # Booking data
│   │   │   ├── attachments.js # File handling
│   │   │   └── messages.js    # Messaging
│   │   ├── services/
│   │   │   └── servicem8.js   # ServiceM8 API client
│   │   └── middleware/
│   │       └── auth.js        # JWT verification
│   └── data/
│       └── messages.json      # Stored messages
│
├── frontend/                   # Next.js App
│   └── src/
│       ├── pages/             # App pages
│       │   ├── login.js       # Login screen
│       │   ├── index.js       # Bookings list
│       │   └── booking/[id].js # Booking detail
│       ├── components/        # UI components
│       ├── context/           # React context
│       ├── lib/               # API utilities
│       └── styles/            # CSS
│
├── README.md                   # This file
├── TECH_NOTES.md              # Technical documentation
└── package.json               # Root scripts
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + phone |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/:id` | Get booking details |
| GET | `/api/attachments/booking/:id` | Get attachments |
| GET | `/api/attachments/:id/view` | View attachment file |
| GET | `/api/attachments/:id/download` | Download attachment |
| GET | `/api/messages/booking/:id` | Get messages |
| POST | `/api/messages/booking/:id` | Send message |

---

## Troubleshooting

### "Port 3000/3001 already in use"
Kill existing Node processes:
```powershell
taskkill /F /IM node.exe
```

### "Cannot find module" errors
Reinstall dependencies:
```powershell
cd backend && npm install
cd ../frontend && npm install
```

### Images not loading
Check backend is running on port 3001. The frontend fetches images from the backend.

---

## Documentation

See **[TECH_NOTES.md](TECH_NOTES.md)** for:
- Architecture decisions
- Assumptions made
- Potential improvements
- AI assistance details
