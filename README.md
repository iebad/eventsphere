# EventSphere – Event & Expo Management Platform

EventSphere is a full-stack event and expo management platform designed to simplify event organization and participation. It provides dedicated dashboards for administrators, exhibitors, and attendees, allowing them to manage events, applications, booth reservations, schedules, and registrations through a centralized platform.

## ✨ Key Features

### 👤 Attendee Portal
- Browse available events and expos.
- View event details, exhibitors, and schedules.
- Register for events.
- Explore available sessions.
- Bookmark sessions and manage personal schedules.
- Receive email reminders for bookmarked sessions.

### 🏢 Exhibitor Portal
- Apply to participate in available events.
- Create and manage exhibitor profiles.
- Apply for booth reservations.
- Track application approval status.
- View exhibitor dashboard information.

### 🛠️ Administrator Dashboard
- Create, update, and manage events.
- Manage exhibitor applications.
- Approve or reject exhibitor applications.
- Manage and assign exhibition booths.
- Create and manage event sessions.
- Monitor dashboard statistics.

## 💻 Technology Stack

### Frontend
- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS
- React Toastify

### Backend
- Node.js
- Express.js 5
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- Zod
- Nodemailer
- Node Cron
- Multer

## 📁 Project Structure

```text
eventsphere/
│
├── client/
│   └── my-react-app/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── layout/
│       │   ├── pages/
│       │   └── store/
│       └── package.json
│
├── server/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── validator/
│   └── package.json
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Make sure the following software is installed on your system:

- [Node.js](https://nodejs.org/) (Version 20 or newer)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/iebad/eventsphere.git
```

### 2. Navigate to the Project Directory

```bash
cd eventsphere
```

### 3. Install Dependencies

Install the root, backend, and frontend dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client/my-react-app
```

## ▶️ Running the Application

### Start Both Frontend and Backend

If the root `package.json` is configured with Concurrently, run:

```bash
npm run dev
```

### Run Separately

**Start the Backend:**

```bash
npm run dev --prefix server
```

**Start the Frontend:**

```bash
npm run dev --prefix client/my-react-app
```

### Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| API Base URL | http://localhost:3000/api |

## 🔗 API Modules

The backend provides REST API endpoints organized into different modules:

| API Route | Description |
|---|---|
| `/api/auth` | User registration, login, logout, and password recovery |
| `/api/form` | Contact inquiries |
| `/api/events` | Event management and event-related operations |
| `/api/sessions` | Session management and bookmarks |
| `/api/admin` | Administrator operations and application management |
| `/api/exhibitor` | Exhibitor profiles, applications, and dashboard operations |
| `/api/booths` | Exhibition booth management and reservations |
| `/uploads` | Access to uploaded assets |

## 🔐 User Roles

EventSphere supports three main user roles:

- **Admin:** Manages events, exhibitors, booths, and schedules.
- **Exhibitor:** Applies for events, manages profiles, and reserves booths.
- **Attendee:** Explores events, registers, and manages personal schedules.

Role-based middleware helps protect restricted backend routes.

## 📌 Future Enhancements

- Advanced event analytics and reporting.
- Improved real-time event updates.
- Additional event engagement features.
- Enhanced notification management.

## 👨‍💻 Development

This project was developed as part of the Aptech Diploma in Advanced Software Engineering (ADSE) program, demonstrating full-stack web development using the MERN stack.

## 📄 License

This project is developed for educational purposes. No open-source license has been specified.

## 🔗 GitHub Repository

[https://github.com/iebad/eventsphere](https://github.com/iebad/eventsphere)
