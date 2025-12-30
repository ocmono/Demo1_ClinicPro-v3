# ClinicPro v3 - React + Vite

A comprehensive clinic management system built with React and Vite.

## Features

### Authentication System
- **Login Required**: All pages (except iframe booking) require authentication
- **Protected Routes**: Automatic redirection to login for unauthenticated users
- **Session Management**: Persistent login with localStorage and sessionStorage
- **Role-based Access**: Support for different user roles (doctor, receptionist, etc.)
- **Secure Logout**: Proper session cleanup on logout

### Key Components
- **ProtectedRoute**: Wraps all main application routes requiring authentication
- **AuthContext**: Manages authentication state across the application
- **LoginForm**: Handles user authentication with redirect to intended page
- **ProfileModal**: User profile dropdown with logout functionality

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Authentication Flow

1. **Initial Access**: Users are redirected to `/authentication/login` if not authenticated
2. **Login Process**: Users enter credentials and are authenticated against the backend
3. **Redirect**: After successful login, users are redirected to their intended page or dashboard
4. **Session Persistence**: Login state persists across browser sessions
5. **Logout**: Users can logout via the profile dropdown, which clears all session data

## API Endpoints

The application connects to the backend API at `https://bkdemo1.clinicpro.cc/` for:
- User authentication (`/users/token`)
- Patient management
- Appointment scheduling
- Medicine inventory
- And more...

## Project Structure

```
src/
├── components/
│   ├── authentication/     # Login forms and auth components
│   ├── shared/
│   │   └── ProtectedRoute.jsx  # Route protection component
│   └── ...
├── contentApi/
│   └── AuthContext.jsx     # Authentication context provider
├── route/
│   └── router.jsx          # Main router with protected routes
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React 18
- Vite
- React Router DOM
- Bootstrap 5
- React Toastify
- And more... 