# Firebase Authentication Setup (Frontend Only)

This setup adds login/signup UI using real Firebase authentication, but still uses the existing backend with `userId: 0` and unprotected routes.

## What's Been Done

1. ✅ Installed Firebase SDK
2. ✅ Created `src/firebase.js` config file
3. ✅ Created `LoginPage.jsx` and `CreateAccountPage.jsx`
4. ✅ Added routes to App.jsx for `/login` and `/create-account`
5. ✅ Initialized Firebase in `main.jsx`

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing project
3. Follow the setup wizard

### 2. Enable Email/Password Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable it and save

### 3. Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll down to "Your apps"
3. Click the **</>** (Web) icon to add a web app
4. Register your app with a nickname (e.g., "BJJ Academy")
5. Copy the `firebaseConfig` object

### 4. Update frontend/src/firebase.js

Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}
```

## How It Works

### Frontend (Real Firebase Auth)

- Users can create accounts with Firebase
- Users can log in with Firebase
- Firebase manages user authentication state
- **But**: We don't use the Firebase UID or auth token yet

### Backend (Unchanged)

- Still uses hardcoded `userId: 0` for all API calls
- No authentication required
- All existing routes work exactly as before

### Flow

1. User creates account → Firebase creates user
2. User logs in → Firebase authenticates
3. App continues to use existing API with `userId: 0`
4. **Later**: Connect Firebase UID to backend routes (Phase 2)

## Testing

1. Start the app: `npm run dev` (from root)
2. Go to `http://localhost:5173/create-account`
3. Create an account with email/password
4. You'll be redirected to home page
5. User is authenticated with Firebase (check browser console)
6. App still works with existing backend

## Next Steps (Future)

When ready to fully integrate:

1. Update backend to accept Firebase auth tokens
2. Add `authtoken` header to API requests
3. Change from `userId: 0` to actual user's Firebase UID
4. Add protected routes and authorization

For now, enjoy having a working login UI without breaking anything! 🎉
