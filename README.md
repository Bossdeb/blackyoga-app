# Black Yoga - Minimal Demo App

A minimal black, gray, and white themed yoga class booking application built with Vue 3 and Tailwind CSS, integrated with LINE LIFF for authentication.

## Features

- **LINE LIFF Integration**: Authenticate users with LINE account
- **Minimal Design**: Clean black, gray, and white theme
- **Local Storage**: All data is stored locally in the browser
- **Demo Mode**: Fully functional demo without external dependencies
- **Responsive**: Mobile-first design
- **Booking System**: Book and manage yoga classes
- **Points System**: Track points earned from bookings
- **Admin Panel**: Basic admin functionality for demo

## LINE LIFF Setup

To use LINE authentication:

1. Create a LINE Channel in the LINE Developers Console
2. Set up a LIFF app with your Channel ID
3. Update the `LIFF_CHANNEL_ID` in `src/composables/useAuth.js`
4. Configure your LIFF app's Endpoint URL

## Pages

- **Home**: Browse and book available yoga classes
- **Booking**: View and manage your bookings
- **Points**: Track your points and rewards
- **Profile**: User profile with LINE data (picture, status message)
- **Admin**: System management (demo features)
- **Login**: LINE login or demo login

## Authentication

### LINE Login
- Uses LINE LIFF SDK for authentication
- Gets user profile, picture, and status message
- Works in LINE app and web browser

### Demo Login
- Fallback for testing without LINE
- Accepts any credentials for demo purposes

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- Vue 3
- Vue Router
- Tailwind CSS
- LINE LIFF SDK
- LocalStorage for data persistence

## Demo Features

- LINE authentication with profile data
- Book yoga classes
- View booking history
- Track points earned
- Cancel bookings
- Admin panel with data management
- Responsive mobile design

## User Data from LINE

When users login with LINE, the app gets:
- Display Name
- Profile Picture
- Status Message
- LINE User ID
- Email (if available)

All data is stored locally and will persist between sessions.
