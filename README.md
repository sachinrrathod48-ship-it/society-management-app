# Smart Society Management System

A full-stack, enterprise-grade **Smart Society Management System** built with **Node.js, Express.js, MySQL, EJS, and Bootstrap 5** following strict **MVC Architecture**.

---

## 🌟 Key Features & Modules

### 1. 👑 Admin Module (Full Control)
- **Dashboard**: High-level KPI analytics counters (Total Residents, Security Staff, Visitors Today, Pending Complaints, Unpaid Dues) & recent activity feeds.
- **Resident Management**: Complete CRUD operations to register residents, manage flat allocations, and toggle active/inactive status.
- **Security Management**: Register security personnel, assign badge numbers, manage duty shifts (Morning/Evening/Night).
- **Visitor Master Log**: Real-time monitor of all visitors with entry/exit timestamps and manual checkout actions.
- **Complaint Desk**: View resident complaints, filter by priority, update status (*Pending, In Progress, Resolved, Rejected*), and attach official admin remarks.
- **Maintenance Billing**: Generate single or bulk monthly bills for all society flats, view payment history, and mark bills as paid.
- **Notice Board**: Create, update, and remove digital announcements with category badges (*General, Important, Urgent*).
- **Emergency Directory**: Manage emergency contact numbers for medical, security, plumbing, electrical, and police services.
- **Admin Profile**: Secure credential management and password changes.

---

### 2. 🛡️ Security Module
- **Security Command Dashboard**: Quick visitor check-in desk, live headcount of visitors currently inside the campus.
- **Visitor Entry Desk**: Record visitor details (Name, Mobile, Visiting Flat, Resident Name, Purpose of Visit, Entry Time).
- **Exit Logger**: One-click timestamp exit recorder to mark visitors as *Left*.
- **Visitor History Log**: Interactive historical search log of all visitor entries.

---

### 3. 🏠 Resident Module
- **Resident Dashboard**: Personalized overview displaying flat information, total unpaid maintenance dues, active complaint status, and recent notices.
- **Submit & Track Complaints**: Submit maintenance or security complaints with category selection, description, and priority level.
- **Maintenance Bills**: View monthly dues statement, download status, and simulate online payments (UPI/Card/NetBanking).
- **Notice Board**: Read-only digital society notice board.
- **Emergency Contacts**: Quick dial directory for essential and medical emergency contacts.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome 6, EJS Templating
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+
- **Authentication**: Session-based Login Authentication (`express-session`, `bcryptjs`)
- **Architecture**: Model-View-Controller (MVC)

---

## 🔐 Preloaded Demo Credentials

| Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@society.com` | `admin123` | `/admin/dashboard` |
| **Security** | `security@society.com` | `security123` | `/security/dashboard` |
| **Resident** | `resident@society.com` | `resident123` | `/resident/dashboard` |

> *Tip: On the login page, simply click any of the role buttons (Admin, Security, Resident) to automatically fill the demo credentials!*

---

## 📁 Project Directory Structure (MVC Pattern)

```
society-project/
├── config/
│   ├── db.js                 # MySQL Pool & Auto-Initialization Engine
│   └── authMiddleware.js     # Session Guard & Role-based Access Control
├── controllers/
│   ├── authController.js     # Session login, authentication & logout
│   ├── adminController.js    # Administrative logic for all modules
│   ├── securityController.js # Security gate desk & visitor tracking logic
│   └── residentController.js # Resident portal, complaints & payment logic
├── models/
│   ├── User.js               # Cross-role authentication queries
│   ├── Resident.js           # Resident database operations
│   ├── Security.js           # Security personnel operations
│   ├── Visitor.js            # Visitor entry & exit operations
│   ├── Complaint.js          # Complaints lifecycle operations
│   ├── Maintenance.js        # Maintenance bills operations
│   ├── Notice.js             # Society digital notice board
│   └── Emergency.js          # Emergency contacts directory
├── routes/
│   ├── authRoutes.js         # Authentication endpoints (/login, /logout)
│   ├── adminRoutes.js        # Admin protected endpoints (/admin/*)
│   ├── securityRoutes.js     # Security protected endpoints (/security/*)
│   └── residentRoutes.js     # Resident protected endpoints (/resident/*)
├── views/
│   ├── auth/                 # Login screen
│   ├── admin/                # Admin dashboards & management pages
│   ├── security/             # Security gate desk views
│   ├── resident/             # Resident portal views
│   └── partials/             # Header, Footer, Navbar, and Sidebar partials
├── public/
│   ├── css/style.css         # Modern Green & White custom stylesheet
│   └── js/main.js            # Instant table search filter & modal helpers
├── database/
│   ├── schema.sql            # MySQL table creation scripts
│   └── seed.sql              # Initial test dataset
├── .env                      # Database & Session credentials
├── app.js                    # Express main entry point
└── package.json              # Project dependencies
```

---

## ⚡ Quick Setup & Running Instructions

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Configure MySQL Database
1. Make sure your MySQL Server (e.g. MySQL Workbench, XAMPP, or WAMP) is running on `localhost:3306`.
2. Open `.env` and verify your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=society_db
```
3. *Automatic Database Initialization*: The app automatically creates `society_db`, builds all 8 tables from `database/schema.sql`, and pre-populates sample seed data from `database/seed.sql` on first launch!

*(Optional Manual Setup)*: If you prefer creating the database manually:
```sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3: Launch the Application
Run the application server:
```bash
npm start
```

Open your browser and navigate to: **`http://localhost:3000`**
