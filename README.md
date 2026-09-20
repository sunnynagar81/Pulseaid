# PulseAid 🩸
### Real-Time Emergency Blood Response Network

> *"Every Pulse Connected, Every Life Protected."*

A full-stack, real-time system that instantly matches hospital blood requests with compatible, eligible, nearby donors — built on Node.js, Express, Socket.io, MongoDB, and Neo4j.

---

## 📌 The Problem

India faces a chronic blood shortage — most emergency requests still rely on manual phone calls and untargeted social media appeals. Existing platforms (eRaktKosh, MBLOOD, Friends2Support) are largely **directory-based**: the patient searches and contacts donors one by one. PulseAid instead **pushes** a live alert to every matched donor the instant a request is posted.

---

## 🏗️ Architecture

```
┌───────────────────┐     Socket.io + REST     ┌────────────────────┐
│   React Frontend    │◄────────────────────────►│  Node.js + Express  │
│  - Donor Dashboard   │                           │  - Matching Engine   │
│  - Hospital Dashboard│                           │  - Socket.io Hub     │
│  - Live Coverage Map │                           │  - JWT Auth          │
└───────────────────┘                           │  - node-cron Jobs    │
                                                   └──────────┬─────────┘
                                                              │
                                          ┌───────────────────┴───────────────────┐
                                          │                                       │
                                  ┌───────▼───────┐                   ┌───────────▼──────────┐
                                  │    MongoDB      │                   │        Neo4j          │
                                  │  Donors, Hospitals│                 │  Donor-hospital        │
                                  │  Requests, Matches│                 │  proximity graph        │
                                  └────────────────┘                   │  (optional — Mongo geo  │
                                                                        │  fallback if unset)     │
                                                                        └────────────────────────┘

Flow:
1. Hospital posts a request (blood type, units, urgency)
2. Matching engine filters: blood compatibility → 90-day eligibility → proximity (Neo4j graph, Mongo $near fallback)
3. Matched donors get an instant Socket.io alert, scoped to a private room (donor:<id>)
4. Donor accepts/declines — the response is written inside a MongoDB transaction
   (keeps unitsConfirmed and match status consistent under concurrent responses)
5. Hospital dashboard updates live via Socket.io — no refresh needed
6. A node-cron job expires stale requests every 15 minutes
```

---

## ⚙️ Tech Stack

**Backend:** Node.js, Express 5, Socket.io, MongoDB (Mongoose), Neo4j (optional), JWT (access + refresh, httpOnly cookies), Zod validation, express-rate-limit, node-cron

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Zustand, React Hook Form + Zod, Socket.io Client, Leaflet / react-leaflet, Axios, react-hot-toast

**Database:** MongoDB Atlas (replica set — required for transactions), Neo4j AuraDB (optional graph layer for proximity ranking)

---

## ✨ Key Features

- 🚨 **Real-time alerts** — Socket.io push notifications, not a polled list
- 🩸 **Blood compatibility engine** — rule-based matrix (e.g. O− is a universal donor)
- 📅 **Automatic eligibility tracking** — the 90-day donation gap, computed live, never left to memory
- 🗺️ **Live coverage map** — Leaflet map showing each account's location and the actual 15km radius the matching engine searches
- 🔐 **JWT auth with refresh tokens** — httpOnly cookies, silent token refresh on the frontend, role-based route protection on both ends
- 📊 **Live hospital dashboard** — request progress bars and donor response counts update in real time as donors respond
- ⏰ **Automatic request expiry** — a cron job clears stale requests every 15 minutes

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 tier works — must be a replica set for transactions)
- (Optional) A Neo4j AuraDB free-tier instance

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT secrets, and optionally NEO4J_URI/USER/PASSWORD
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# .env should already contain:
#   VITE_API_URL=http://localhost:5000/api
#   VITE_SOCKET_URL=http://localhost:5000
npm run dev
# Runs on http://localhost:5173
```

Both servers need to be running simultaneously for the app to work.

---

## 📁 Project Structure

```
pulseaid/
├── backend/
│   └── src/
│       ├── config/       # MongoDB + Neo4j connections
│       ├── models/       # Donor, Hospital, BloodRequest, Match (Mongoose schemas)
│       ├── middleware/    # auth, validation, rate limiting, error handling
│       ├── services/      # bloodCompatibility, graphProximity, matchingEngine
│       ├── controllers/   # request handlers per resource
│       ├── routes/        # REST endpoints
│       ├── sockets/       # Socket.io auth + room management
│       ├── jobs/          # node-cron request-expiry job
│       ├── app.js         # Express app config
│       └── server.js      # entry point
└── frontend/
    └── src/
        ├── api/            # backend call wrappers, per domain
        ├── store/          # Zustand auth store
        ├── contexts/       # shared Socket.io connection (SocketProvider)
        ├── components/     # design-system UI (Button, Input, Card...) + domain components
        ├── pages/          # auth, donor, hospital screens + public landing page
        └── routes/         # protected-route logic
```

---

## 📸 Screenshots

*(Capture these once you have a clean demo state — see the checklist below)*

| Landing Page | Donor Dashboard | Hospital Dashboard |
|---|---|---|
| ![Landing](docs/screenshot-landing.png) | ![Donor](docs/screenshot-donor.png) | ![Hospital](docs/screenshot-hospital.png) |

| Live Alert | Coverage Map | Post Request |
|---|---|---|
| ![Alert](docs/screenshot-alert.png) | ![Map](docs/screenshot-map.png) | ![New Request](docs/screenshot-new-request.png) |

**To capture these:**
1. Run `db.bloodrequests.deleteMany({})` and `db.matches.deleteMany({})` in Atlas first, for a clean state
2. Open the landing page (`/`) → screenshot
3. Log in as your donor → screenshot the dashboard (with the coverage map visible)
4. Log in as your hospital → post one fresh A+/O+ request → screenshot the toast + dashboard
5. Switch to the donor tab → screenshot the live alert toast and the MatchCard
6. Save all six into a `/docs` folder in your repo, matching the filenames above

---

## 🎥 Demo Video

[Link here once recorded](#) — a 2–3 minute walkthrough: landing page → register → post request → live alert → accept → hospital dashboard updates live is the strongest possible demo for this project.

---

## 🧠 Core Data Model

- **Donor** — name, email, phone, bloodType, location (GeoJSON), lastDonationDate, isAvailable, totalDonations
- **Hospital** — name, email, phone, registrationNumber, location (GeoJSON), verified
- **BloodRequest** — hospital, bloodType, unitsNeeded, urgency, location (snapshot at creation), status, unitsConfirmed, expiresAt
- **Match** — request, donor, status (notified/accepted/declined), distanceKm, respondedAt

---

## 🔮 Future Scope

- SMS/WhatsApp fallback alerts for donors without the app installed
- Admin hospital-verification workflow (currently a manual DB flag)
- Integration with eRaktKosh for blood bank inventory sync
- Predictive analytics for seasonal/regional blood type shortages
- Donor gamification (badges, donation streaks)

---

## 👤 Author

**Sunny Nagar**
B.Tech CSE, Bharat Institute of Technology, Meerut

---

## 📄 License

This project is for academic/educational purposes (college capstone project).