# Smart Appointment Booking System

A full-stack appointment booking system built with Angular 17 frontend and ASP.NET Core Web API backend, designed for service-based businesses to manage appointments efficiently.

## 🚀 Live Demo

- **Frontend**: [https://smart-bookings-app.netlify.app](https://smart-bookings-app.netlify.app)
- **API**: [https://smart-booking-app.azurewebsites.net](https://smart-booking-app.azurewebsites.net)
- **API Documentation**: [https://smart-booking-app.azurewebsites.net/swagger](https://smart-booking-app.azurewebsites.net/swagger)

## 📋 Features

### User Features
- **User Registration & Authentication** - JWT-based secure authentication
- **Browse Available Slots** - View all available appointment slots
- **Book Appointments** - Select and book available time slots
- **Manage Bookings** - View, cancel, and track appointment status
- **Conflict Prevention** - Automatic detection of time conflicts

### Admin Features
- **Slot Management** - Create, edit, and delete time slots
- **Appointment Overview** - View all appointments across the system
- **Capacity Management** - Set maximum capacity per slot
- **Status Management** - Mark appointments as completed or cancelled

### System Features
- **Real-time Availability** - Dynamic slot availability updates
- **Responsive Design** - Works on desktop and mobile devices
- **Secure API** - JWT authentication with role-based access control
- **Data Validation** - Comprehensive input validation and error handling

## 🏗️ Architecture

### Frontend (Angular 17)
- **Framework**: Angular 17 with standalone components
- **Styling**: Modern CSS with responsive design
- **State Management**: RxJS for reactive programming
- **Authentication**: JWT token-based authentication
- **Routing**: Angular Router with guards

### Backend (ASP.NET Core)
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI
- **Hosting**: Azure App Service

### Database Schema
- **Users**: User accounts with role-based access
- **TimeSlots**: Available appointment slots
- **Appointments**: Booked appointments linking users and slots

## 🛠️ Technology Stack

### Frontend
- Angular 17
- TypeScript 5.2
- RxJS 7.8
- Angular Router
- Angular Forms (Reactive)

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- BCrypt for password hashing
- Swagger/OpenAPI

### Deployment
- **Frontend**: Netlify
- **Backend**: Azure App Service
- **Database**: Azure SQL Database

## 📁 Project Structure

```
smart-appointment/                 # Angular Frontend
├── src/
│   ├── app/
│   │   ├── core/                 # Core services, guards, interceptors
│   │   │   ├── guards/           # Route guards
│   │   │   ├── interceptors/     # HTTP interceptors
│   │   │   ├── models/           # TypeScript interfaces
│   │   │   └── services/         # Core services
│   │   ├── features/             # Feature modules
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── booking/          # Booking components
│   │   │   ├── admin/            # Admin components
│   │   │   └── shared/           # Shared components
│   │   └── environments/         # Environment configurations
│   └── main.ts                   # Application bootstrap

SmartBookingAPI/                   # ASP.NET Core Backend
├── Controllers/                   # API controllers
├── Models/                        # Data models
├── DTOs/                         # Data transfer objects
├── Data/                         # Database context
├── Services/                     # Business logic services
├── Migrations/                   # EF Core migrations
└── Program.cs                    # Application startup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- .NET 8.0 SDK
- SQL Server (local or Azure)
- Git

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-appointment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Update src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7000/api'  # Your local API URL
   };
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200`

### Backend Setup

1. **Navigate to API directory**
   ```bash
   cd SmartBookingAPI
   ```

2. **Configure database connection**
   ```bash
   # Update appsettings.json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SmartBookingDB;Trusted_Connection=true;"
     }
   }
   ```

3. **Install dependencies and run migrations**
   ```bash
   dotnet restore
   dotnet ef database update
   ```

4. **Start the API**
   ```bash
   dotnet run
   ```
   API will be available at `https://localhost:7000`

## 🧪 Testing

### Backend Testing
```bash
cd SmartBookingAPI.Tests
dotnet test --collect:"XPlat Code Coverage"
```

### Test Coverage
- **Line Coverage**: 92.3%
- **Branch Coverage**: 87.5%
- **Method Coverage**: 96.8%

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 📚 API Documentation

### Base URL
- **Production**: `https://smart-booking-app.azurewebsites.net/api`
- **Development**: `https://localhost:7000/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Time Slots
- `GET /api/slots` - Get all available slots
- `POST /api/slots` - Create new slot (Admin only)
- `PUT /api/slots/{id}/toggle` - Toggle slot status (Admin only)
- `DELETE /api/slots/{id}` - Delete slot (Admin only)

#### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `PUT /api/appointments/{id}/complete` - Mark as completed (Admin only)

## 🗄️ Database Schema

The system uses three main entities:
- **Users**: Authentication and user management
- **TimeSlots**: Available appointment slots with capacity management
- **Appointments**: Booked appointments linking users to slots

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for detailed schema documentation.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: User and Admin permissions
- **Password Hashing**: BCrypt for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Configuration**: Restricted cross-origin requests

## 🚀 Deployment

### Frontend (Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder to Netlify
3. Configure environment variables

### Backend (Azure App Service)
1. Publish: `dotnet publish -c Release`
2. Deploy to Azure App Service
3. Configure connection strings and app settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/swagger`
- Review the troubleshooting documentation

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Maintainer**: Development Team