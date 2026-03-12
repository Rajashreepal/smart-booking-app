# Smart Appointment Booking System - Database Schema

## Overview

The Smart Appointment Booking System uses a relational database design with three core entities: Users, TimeSlots, and Appointments. The schema is implemented using Entity Framework Core with SQL Server.

## Database Configuration

- **Database Engine**: Microsoft SQL Server
- **ORM**: Entity Framework Core
- **Connection**: Azure SQL Database (Production) / LocalDB (Development)
- **Migration Strategy**: Code-First with automatic migrations on startup

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │       │    TimeSlots    │       │  Appointments   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ Id (PK)         │◄──────┤ CreatedBy (FK)  │       │ Id (PK)         │
│ Name            │       │ Id (PK)         │◄──────┤ SlotId (FK)     │
│ Email (Unique)  │       │ Date            │       │ UserId (FK)     │──┐
│ PasswordHash    │       │ StartTime       │       │ UserName        │  │
│ Role            │       │ EndTime         │       │ UserEmail       │  │
│ Phone           │       │ Service         │       │ UserPhone       │  │
│ CreatedAt       │       │ Duration        │       │ Service         │  │
└─────────────────┘       │ MaxCapacity     │       │ Date            │  │
                          │ BookedCount     │       │ StartTime       │  │
                          │ IsActive        │       │ EndTime         │  │
                          │ CreatedAt       │       │ Status          │  │
                          └─────────────────┘       │ Notes           │  │
                                                    │ BookedAt        │  │
                                                    └─────────────────┘  │
                                                             │           │
                                                             └───────────┘
```

## Table Definitions

### 1. Users Table

Stores user account information with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `Id` | `nvarchar(450)` | PRIMARY KEY | Unique identifier (format: "user-{timestamp}") |
| `Name` | `nvarchar(100)` | NOT NULL | User's full name |
| `Email` | `nvarchar(100)` | NOT NULL, UNIQUE | User's email address |
| `PasswordHash` | `nvarchar(max)` | NOT NULL | BCrypt hashed password |
| `Role` | `nvarchar(20)` | NOT NULL, DEFAULT 'user' | User role: 'user' or 'admin' |
| `Phone` | `nvarchar(20)` | NULL | User's phone number |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Account creation timestamp |

### 2. TimeSlots Table

Defines available appointment time slots created by administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `Id` | `nvarchar(450)` | PRIMARY KEY | Unique identifier (format: "slot-{timestamp}") |
| `Date` | `nvarchar(max)` | NOT NULL | Appointment date (YYYY-MM-DD format) |
| `StartTime` | `nvarchar(10)` | NOT NULL | Start time (HH:mm format) |
| `EndTime` | `nvarchar(10)` | NOT NULL | End time (HH:mm format) |
| `Service` | `nvarchar(50)` | NOT NULL | Service type/name |
| `Duration` | `int` | NOT NULL | Duration in minutes |
| `MaxCapacity` | `int` | NOT NULL, DEFAULT 1 | Maximum bookings allowed |
| `BookedCount` | `int` | NOT NULL, DEFAULT 0 | Current number of bookings |
| `IsActive` | `bit` | NOT NULL, DEFAULT 1 | Whether slot is available for booking |
| `CreatedBy` | `nvarchar(450)` | NOT NULL, FOREIGN KEY | Admin user who created the slot |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Slot creation timestamp |

### 3. Appointments Table

Records booked appointments linking users to time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `Id` | `nvarchar(450)` | PRIMARY KEY | Unique identifier (format: "appt-{timestamp}") |
| `SlotId` | `nvarchar(450)` | NOT NULL, FOREIGN KEY | Reference to booked time slot |
| `UserId` | `nvarchar(450)` | NOT NULL, FOREIGN KEY | Reference to user who booked |
| `UserName` | `nvarchar(100)` | NOT NULL | User's name (denormalized for performance) |
| `UserEmail` | `nvarchar(100)` | NOT NULL | User's email (denormalized for performance) |
| `UserPhone` | `nvarchar(20)` | NOT NULL | User's phone number |
| `Service` | `nvarchar(50)` | NOT NULL | Service type (copied from slot) |
| `Date` | `nvarchar(max)` | NOT NULL | Appointment date (copied from slot) |
| `StartTime` | `nvarchar(10)` | NOT NULL | Start time (copied from slot) |
| `EndTime` | `nvarchar(10)` | NOT NULL | End time (copied from slot) |
| `Status` | `nvarchar(20)` | NOT NULL, DEFAULT 'confirmed' | Appointment status |
| `Notes` | `nvarchar(500)` | NULL | Additional notes from user |
| `BookedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Booking timestamp |

**Status Values:**
- `confirmed` - Active appointment
- `cancelled` - Cancelled by user or admin
- `completed` - Marked as completed by admin
- `pending` - Awaiting confirmation (future use)

## Relationships

### One-to-Many Relationships

1. **Users → TimeSlots** (Creator)
   - One admin user can create multiple time slots
   - Foreign Key: `TimeSlots.CreatedBy` → `Users.Id`
   - Delete Behavior: RESTRICT (cannot delete user with created slots)

2. **Users → Appointments** (Booker)
   - One user can have multiple appointments
   - Foreign Key: `Appointments.UserId` → `Users.Id`
   - Delete Behavior: RESTRICT (cannot delete user with appointments)

3. **TimeSlots → Appointments**
   - One time slot can have multiple appointments (up to MaxCapacity)
   - Foreign Key: `Appointments.SlotId` → `TimeSlots.Id`
   - Delete Behavior: RESTRICT (cannot delete slot with appointments)

## Data Integrity Constraints

### Business Rules Enforced by Database

1. **Email Uniqueness**: Each email can only be registered once
2. **Foreign Key Constraints**: Prevent orphaned records
3. **Capacity Management**: `BookedCount` cannot exceed `MaxCapacity` (enforced by application logic)
4. **Data Types**: Proper data types ensure data integrity

### Application-Level Constraints

1. **Time Validation**: Start time must be before end time
2. **Date Validation**: Appointments cannot be booked in the past
3. **Conflict Prevention**: Users cannot book overlapping appointments
4. **Duplicate Prevention**: Users cannot book the same slot twice
5. **Capacity Enforcement**: Slots cannot exceed maximum capacity

---

**Schema Version**: 1.0  
**Last Updated**: March 2026  
**Database Engine**: SQL Server 2019+  
**ORM Version**: Entity Framework Core 8.0