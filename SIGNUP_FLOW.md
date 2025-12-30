# User Signup Flow

## What's Been Implemented

A complete signup flow that creates users in both Firebase and MongoDB.

## Frontend Changes

### CreateAccountPage.jsx
- Added **name** input field
- Added **rank** dropdown (White/Blue/Purple/Brown/Black Belt)
- On signup:
  1. Creates Firebase user with email/password
  2. Gets the Firebase UID
  3. Calls backend to create MongoDB user record with Firebase UID as the `id`

## Backend Changes

### POST /api/users
New endpoint to create users in MongoDB:

**Request:**
```json
{
  "id": "firebase-uid-string",
  "name": "John Doe",
  "rank": "Blue Belt"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "firebase-uid-string",
    "name": "John Doe",
    "rank": "Blue Belt",
    "subscription": {
      "status": "Inactive",
      "plan_id": null,
      "expiry": null,
      "start": null
    },
    "stats": {
      "classes_this_month": 0,
      "total_classes": 0,
      "favorite_class": null
    },
    "booked_classes_id": []
  }
}
```

### GET /api/users/:id
Updated to support both:
- Numeric IDs (legacy, for user0): `/api/users/0`
- Firebase UIDs (new users): `/api/users/xK3mP9QzR5fY2cN8...`

## User Document Structure

New users are created with this structure:
```javascript
{
  id: "firebase-uid",           // Firebase UID (string)
  name: "User Name",
  rank: "Belt Color",
  subscription: {
    status: "Inactive",
    plan_id: null,
    expiry: null,
    start: null
  },
  stats: {
    classes_this_month: 0,
    total_classes: 0,
    favorite_class: null
  },
  booked_classes_id: []
}
```

## Testing

1. Go to `/create-account`
2. Fill in:
   - Name
   - Belt rank
   - Email
   - Password
3. Click "Create Account"
4. User is created in Firebase
5. User record is created in MongoDB with Firebase UID
6. Redirected to home page

## Next Steps

To fully integrate authentication:
1. Store logged-in user's Firebase UID in app state
2. Replace hardcoded `userId: 0` with actual Firebase UID from auth
3. Add auth checks to routes
4. Update all API calls to use authenticated user's ID

For now, the app still uses `userId: 0` for existing functionality, but new users are properly created and linked!
