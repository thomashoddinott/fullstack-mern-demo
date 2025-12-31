# Backend Firebase Authentication Implementation Plan

## Overview
The frontend has Firebase Authentication fully implemented, but the backend has zero authentication enforcement. All API endpoints are publicly accessible, creating severe security vulnerabilities including user impersonation, data theft, and unauthorized actions.

## Current State Analysis

### Frontend (Already Implemented)
- ✅ Firebase Auth with `AuthProvider` context
- ✅ `ProtectedRoute` component for UI-level protection
- ✅ Login/CreateAccount pages using Firebase SDK
- ✅ `currentUser?.uid` available throughout app
- ❌ **No Authorization headers sent to backend**
- ❌ **No ID tokens transmitted**

### Backend (Critical Gaps)
- ✅ `firebase-admin` package installed (v13.6.0)
- ❌ **Firebase Admin never imported or initialized**
- ❌ **No authentication middleware**
- ❌ **All 20+ endpoints are public**
- ❌ **User ID spoofing possible** (anyone can impersonate users)
- ❌ **No token validation**

### Security Vulnerabilities
1. **User Impersonation** - Anyone can access any user's data by knowing their Firebase UID
2. **Unauthorized Mutations** - Class bookings, avatar uploads, subscription updates unprotected
3. **Data Exposure** - All user data, bookings, and personal info publicly accessible
4. **Payment Bypass** - Stripe checkout sessions can be created for any user
5. **Subscription Fraud** - Subscription extensions can be triggered without payment

## Implementation Plan

### Phase 1: Firebase Admin Setup
**File:** `backend/src/server.js`

1. **Initialize Firebase Admin SDK**
   - Import `firebase-admin` at top of file
   - Initialize with service account credentials (requires new env var)
   - Add `FIREBASE_SERVICE_ACCOUNT_KEY` to `.env` file
   - Update `.env.example` with new variable

### Phase 2: Authentication Middleware
**File:** `backend/src/server.js`

2. **Create `verifyFirebaseToken` Middleware**
   - Extract `Authorization: Bearer <token>` header
   - Verify token using `admin.auth().verifyIdToken()`
   - Attach decoded user (`uid`, `email`) to `req.user`
   - Handle errors: missing token, invalid token, expired token
   - Return 401/403 with clear error messages

3. **Create `requireAuth` Middleware**
   - Simple wrapper that ensures `req.user` exists
   - Returns 401 if not authenticated

4. **Create `requireOwnership` Middleware**
   - Verify that `req.user.uid` matches resource ownership
   - For `:id` route params, check `req.params.id === req.user.uid`
   - Return 403 Forbidden if user doesn't own the resource
   - Support numeric IDs for backward compatibility (migration path)

### Phase 3: Protect API Endpoints
**File:** `backend/src/server.js`

Apply middleware to endpoints based on sensitivity:

**Public Endpoints (No Auth Required):**
- `GET /hello` - Test endpoint
- `GET /api/plans` - View subscription plans
- `GET /api/plans/:planId` - View plan details
- `GET /api/classes` - View class types
- `GET /api/teachers` - View all teachers
- `GET /api/teachers/:id` - View teacher profile
- `GET /api/scheduled-classes` - View schedule
- `GET /api/scheduled-classes/:id` - View scheduled class
- `POST /api/contact` - Contact form

**Authenticated Endpoints (Require Valid Token):**
- `POST /api/users` - Create user (special case: verify token matches creation)
- `POST /api/checkout` - Create Stripe checkout (verify user ID ownership)
- `GET /api/checkout/session` - Get checkout session (verify ownership)

**Authenticated + Ownership Required:**
- `GET /api/users/:id` - Get user profile (must own)
- `GET /api/users/:id/avatar` - Get avatar (must own or make public)
- `PUT /api/users/:id/avatar` - Upload avatar (must own)
- `GET /api/users/:id/booked-classes-id` - Get bookings (must own)
- `PUT /api/users/:id/booked-classes` - Update bookings (must own)
- `PUT /api/scheduled-classes/:id/:action` - Book/cancel class (verify via body)
- `PATCH /api/users/:id/extend-subscription/:plan` - Extend subscription (must own)

### Phase 4: Frontend Token Transmission
**Files:** Multiple frontend files using `fetch()` or `axios`

5. **Update API Request Pattern**
   - Get ID token from Firebase: `await currentUser.getIdToken()`
   - Add `Authorization: Bearer <token>` header to all authenticated requests
   - Handle 401 errors (redirect to login)
   - Handle 403 errors (show "unauthorized" message)

**Files to Update:**
- `frontend/src/pages/CreateAccountPage.jsx` - User creation POST
- `frontend/src/pages/BookClasses.jsx` - Class booking PUT
- `frontend/src/pages/SubscriptionPage.jsx` - Checkout POST
- `frontend/src/components/UserCard.jsx` - Avatar upload PUT
- Any other components making authenticated API calls

6. **Create Auth Utilities**
   - Create `frontend/src/utils/api.js` helper for authenticated requests
   - Centralize token retrieval and header setup
   - Export `authenticatedFetch()` wrapper function

### Phase 5: Error Handling & UX
**Files:** Frontend components + backend error responses

7. **Backend Error Messages**
   - Return clear, consistent error responses:
     - `401 Unauthorized` - "Authentication required" or "Invalid token"
     - `403 Forbidden` - "You don't have permission to access this resource"
   - Include error codes for frontend to handle gracefully

8. **Frontend Error Handling**
   - Catch 401 errors → redirect to `/login`
   - Catch 403 errors → show toast notification
   - Display user-friendly messages (not raw error text)

### Phase 6: Testing & Validation

9. **Manual Testing Checklist**
   - [ ] Unauthenticated requests to protected endpoints return 401
   - [ ] Valid token allows access to owned resources
   - [ ] Invalid/expired tokens return 401
   - [ ] User A cannot access User B's resources (403)
   - [ ] Public endpoints remain accessible without auth
   - [ ] Class booking enforces ownership
   - [ ] Avatar upload requires ownership
   - [ ] Stripe checkout validates user
   - [ ] Subscription extension requires ownership

10. **Automated Tests (Future)**
    - Unit tests for middleware functions
    - Integration tests for protected endpoints
    - E2E tests for auth flows

## Critical Files

### Backend
- `backend/src/server.js` - Main server file (all endpoints + new middleware)
- `backend/.env` - Add `FIREBASE_SERVICE_ACCOUNT_KEY`
- `backend/.env.example` - Document new env var

### Frontend
- `frontend/src/pages/CreateAccountPage.jsx` - User creation with token
- `frontend/src/pages/BookClasses.jsx` - Class booking with token
- `frontend/src/pages/SubscriptionPage.jsx` - Checkout POST
- `frontend/src/components/UserCard.jsx` - Avatar upload PUT
- `frontend/src/utils/api.js` - New file for auth utilities
- Any other files making API calls to protected endpoints

## Environment Variables

**New Required Variable:**
```env
FIREBASE_SERVICE_ACCOUNT_KEY='{...JSON key from Firebase Console...}'
```

**How to Obtain:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Either:
   - Store entire JSON as stringified env var, OR
   - Save to `backend/firebase-service-account.json` and reference path

## Migration Considerations

### Backward Compatibility
- Some users might have numeric IDs (legacy)
- Middleware should support both string (Firebase UID) and numeric IDs
- Database already handles both ID types

### Rollout Strategy
1. **Phase 1-3 (Backend)** - Can deploy without breaking frontend (graceful degradation)
2. **Phase 4 (Frontend)** - Must deploy after backend is ready
3. **Testing** - Use staging environment or feature flags if available

## Success Criteria
- [ ] All protected endpoints require valid Firebase ID tokens
- [ ] Users can only access their own data
- [ ] Public endpoints remain accessible
- [ ] Frontend sends tokens in Authorization headers
- [ ] Clear error messages guide users to login when needed
- [ ] No user impersonation possible
- [ ] Stripe checkout and subscriptions are user-verified

## Estimated Complexity
- **Backend Changes:** ~200-300 lines (middleware + endpoint protection)
- **Frontend Changes:** ~50-100 lines (token transmission + error handling)
- **Testing Effort:** Manual testing per endpoint (automated tests TBD)

## Notes
- This plan focuses on authentication (who you are) and basic authorization (can you access this resource)
- Role-based access control (RBAC) for admin/teacher roles is NOT included
- Rate limiting and advanced security measures are NOT included
- This addresses the immediate security vulnerability of completely open endpoints
