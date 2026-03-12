# 🗓️ SmartBook – Smart Appointment Booking System
### Angular 17 Hackathon Project

---

## 🚀 Quick Start

```bash
npm install
ng serve
# Open: http://localhost:4200
```

---

## 🔐 Demo Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@smartbook.com    | Admin@123  |
| User  | Register a new account | (any)      |

---

## ✨ Features

### 👤 Authentication
- **Registration** with form validation (name, email, phone, password)
  - Password strength meter (Weak / Fair / Strong)
  - Email uniqueness check
  - Password confirmation match
- **Login** with credential validation
- **Role-based access** (User vs Admin)
- **Route Guards** (`authGuard`, `adminGuard`, `guestGuard`)
- JWT-style token stored in localStorage

### 📅 User – Booking Flow
- **Date picker** with horizontal scroll showing next 10 weekdays
- **Service filter** chips (Consultation, Checkup, Follow-up, Dental, Therapy)
- **Slot cards** showing time, service, duration, availability badge
- **Book Appointment** screen with phone + notes form
- **Conflict Detection** — prevents:
  - Duplicate booking of the same slot
  - Overlapping time conflicts on the same day
- **Confirmation screen** with booking ID and all details
- **My Appointments** list with cancel option

### 🛠️ Admin – Management
- **Dashboard** with stats: Total Slots, Confirmed, Completed, Cancelled
- **All Appointments Table** with filter tabs (All / Confirmed / Completed / Cancelled)
  - Mark as Complete
  - Cancel appointment
- **Manage Slots** page:
  - Create new time slots with form validation
  - Filter slots by date
  - Activate / Deactivate slots
  - Delete slots (blocked if active bookings exist)
  - Booking progress bar per slot

---

## 🏗️ Architecture

```
src/app/
├── core/
│   ├── models/
│   │   └── models.ts           # User, TimeSlot, Appointment interfaces
│   ├── services/
│   │   ├── auth.service.ts     # Auth logic (login, register, logout)
│   │   └── slot.service.ts     # Slot CRUD + conflict detection
│   └── guards/
│       └── auth.guard.ts       # authGuard, adminGuard, guestGuard
│
├── features/
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── booking/
│   │   ├── slot-list/          # Browse & filter slots (user home)
│   │   ├── book-appointment/   # Booking form + slot summary
│   │   └── confirmation/       # Success screen with booking details
│   ├── admin/
│   │   ├── dashboard/          # Stats + all appointments table
│   │   └── manage-slots/       # Create/toggle/delete slots
│   └── shared/
│       └── components/
│           └── header/         # Sticky navbar with role-aware nav
│
├── app.routes.ts               # Lazy-loaded routes
├── app.config.ts               # provideRouter + provideAnimations
└── app.component.ts            # Root with <app-header> + <router-outlet>
```

---

## 🧠 Conflict Detection Logic (`slot.service.ts`)

```typescript
private hasConflict(slotId, userId) {
  // 1. Slot exists and is active
  // 2. Slot has capacity remaining
  // 3. User hasn't already booked this exact slot
  // 4. No TIME OVERLAP with user's other bookings on same date
  //    → Compares startTime/endTime in minutes
}
```

---

## 🎨 Design System

| Token           | Value                  |
|-----------------|------------------------|
| `--ink`         | `#0D0D0D`              |
| `--accent`      | `#C8A96E` (gold)       |
| `--paper`       | `#FAFAF8`              |
| `--font-display`| Clash Display          |
| `--font-body`   | DM Sans                |

---

## 📦 Tech Stack

- **Angular 17** — Standalone components, Signals, `@if`/`@for` control flow
- **Angular Router** — Lazy loading + View Transitions API
- **Angular Forms** — Reactive Forms with custom validators
- **localStorage** — Client-side persistence (no backend required)
- **SCSS** — CSS custom properties, responsive grid, animations

---

## 📱 Responsive Design
- Mobile-first layout
- Split-panel auth pages (hidden on mobile)
- Responsive tables with column hiding
- Touch-friendly slot cards
