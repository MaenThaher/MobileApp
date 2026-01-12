# Authentication Setup Guide

This document describes the authentication setup for the React Native mobile app.

## Prerequisites

### Required Packages

The following packages are required for authentication:

1. **Core packages** (already installed):
   - `@react-native-async-storage/async-storage` - For token storage
   - All other core dependencies are already in package.json

2. **Google OAuth packages** (need to be installed):
   ```bash
   npx expo install expo-auth-session expo-web-browser
   ```

### API Configuration

The app uses environment variables or app.json configuration for the API base URL:

- Default: `http://localhost:3000` (for development)
- For physical devices: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
- For production: Set `EXPO_PUBLIC_API_URL` environment variable

You can also configure it in `app.json` under `extra.apiUrl`.

### Google OAuth Setup (Optional)

To enable Google OAuth:

1. **Create Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials:
     - Web client ID (for web platform)
     - iOS client ID (for iOS apps)
     - Android client ID (for Android apps)

2. **Configure environment variables:**
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Web client ID
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` - iOS client ID (optional for iOS)
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` - Android client ID (optional for Android)

   Or add them to `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "googleWebClientId": "your-web-client-id",
         "googleIosClientId": "your-ios-client-id",
         "googleAndroidClientId": "your-android-client-id"
       }
     }
   }
   ```

3. **Install required packages:**
   ```bash
   npx expo install expo-auth-session expo-web-browser
   ```

## Authentication Features

### Email/Password Authentication

✅ **Fully implemented and working**

- Login: `POST /api/auth/token`
- Signup: `POST /api/authentication/signup/email`
- Logout: `POST /api/authentication/logout`
- Token is stored in AsyncStorage and sent as `Authorization: Bearer <token>` header

### Google OAuth Authentication

✅ **Implemented, requires package installation**

- Uses `expo-auth-session` for Google OAuth
- Sends ID token to backend: `POST /api/authentication/google`
- Backend validates domain (only `@najah.edu` and `@najah.edu.jo` emails allowed)
- Automatically creates account if user doesn't exist
- Links Google account to existing email if user exists

## API Endpoints

All authentication endpoints are documented in `API_DOCS.md`.

Key endpoints:
- `POST /api/auth/token` - Email/password login
- `POST /api/authentication/signup/email` - Email/password signup
- `POST /api/authentication/google` - Google OAuth (requires ID token)
- `POST /api/authentication/logout` - Logout
- `GET /api/auth/me` - Get current user (requires Bearer token)

## Usage

### In Components

```typescript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, isLoading, isAuthenticated, login, signup, googleLogin, logout } = useAuth();

  // Login
  await login(email, password);

  // Signup
  await signup(email, password, fullName, "student");

  // Google OAuth (requires expo-auth-session)
  await googleLogin(idToken);

  // Logout
  await logout();
}
```

### Token Storage

Tokens are automatically stored in AsyncStorage via `lib/session.ts`:
- `createSession(token)` - Store token
- `getSessionToken()` - Retrieve token
- `deleteSession()` - Remove token
- `getAuthHeader()` - Get Authorization header object

## Troubleshooting

### Google OAuth not working

1. Make sure `expo-auth-session` and `expo-web-browser` are installed
2. Verify Google OAuth credentials are correctly configured
3. Check that the correct client IDs are set for your platform
4. Ensure your Google Cloud Console project has the correct redirect URIs configured

### API connection issues

1. For physical devices, make sure you're using your computer's IP address, not `localhost`
2. Verify the API server is running and accessible
3. Check firewall settings if connection fails
4. For Android emulator, use `10.0.2.2` instead of `localhost`
5. For iOS simulator, `localhost` should work

### Token not persisting

- Verify AsyncStorage is working correctly
- Check that tokens are being stored after successful login/signup
- Ensure the token is being sent in the Authorization header for authenticated requests
