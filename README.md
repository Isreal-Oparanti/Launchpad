# Launchpad 

## 🚀 Features

- **Dual Authentication**: Email/password and Google OAuth
- **Security First**: JWT tokens with httpOnly cookies, rate limiting, account lockout
- **Optimized Performance**: Connection pooling, compression, proper indexing
- **Scalable Architecture**: Clean separation of concerns, error handling
- **Production Ready**: Graceful shutdown, logging, environment configuration

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- Google Cloud Console project (for OAuth)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone repo-url
cd server
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/launchpad

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your-64-char-secret
JWT_REFRESH_SECRET=your-64-char-secret

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client URL
CLIENT_URL=http://localhost:3000
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:5000`
   - **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Secret to your `.env` file

### 4. Database Setup

Start MongoDB locally or use MongoDB Atlas:

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /auth/register
Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "securepassword",
  "fullName": "John Doe",
  "school": "University Name",
  "major": "Computer Science"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@university.edu",
    "fullName": "John Doe",
    "school": "University Name",
    "major": "Computer Science",
    "isEmailVerified": false,
    "profileCompleted": true,
    "role": "student"
  },
  "tokens": {
    "accessToken": "jwt_access_token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { /* user object */ },
  "tokens": {
    "accessToken": "jwt_access_token"
  }
}
```

#### GET /auth/google
Initiate Google OAuth login. Redirects to Google's OAuth consent screen.

**Query Parameters:**
- `redirect` (optional): URL to redirect after successful auth

#### GET /auth/google/callback
Google OAuth callback endpoint. Handles the OAuth response and redirects to client.

#### POST /auth/refresh
Refresh expired access token using httpOnly refresh token cookie.

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_access_token"
}
```

#### POST /auth/logout
Logout user and clear authentication cookies.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/me
Get current authenticated user profile. **Requires authentication.**

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@university.edu",
    "fullName": "John Doe",
    "school": "University Name",
    "major": "Computer Science",
    "profilePicture": "https://avatar-url.com/image.jpg",
    "isEmailVerified": true,
    "profileCompleted": true,
    "role": "student",
    "initials": "JD",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT /auth/profile
Update user profile information. **Requires authentication.**

**Request Body:**
```json
{
  "fullName": "John Smith",
  "school": "New University",
  "major": "Software Engineering"
}
```

#### GET /auth/check
Check if current user is authenticated. **Requires authentication.**

### Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Valid email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**423 Locked:**
```json
{
  "success": false,
  "message": "Account temporarily locked due to multiple failed login attempts",
  "lockUntil": "2024-01-01T14:00:00.000Z"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Too many attempts. Please try again later.",
  "retryAfter": 900
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiry (15m access, 7d refresh)
- httpOnly cookies prevent XSS attacks
- Secure cookie settings for production
- Rate limiting on auth endpoints
- Account lockout after failed attempts

### Password Security
- bcrypt hashing with cost factor 12
- Minimum password length requirement
- Password comparison timing attack protection

### Request Security
- CORS configuration with origin validation
- Helmet.js security headers
- Request size limits
- Input validation and sanitization

## 🏗️ Architecture Overview

### Project Structure
```
├── models/
│   └── User.js              # MongoDB user schema
├── controllers/
│   └── authController.js    # Authentication logic
├── routes/
│   └── auth.js             # Route definitions
├── utils/
│   └── jwt.js              # JWT utilities & middleware
├── config/
│   └── passport.js         # Passport OAuth configuration
├── app.js                  # Express app setup
├── package.json            # Dependencies
└── .env                    # Environment configuration
```

### Database Schema
The User model includes:
- Basic info (fullName, email, profilePicture)
- Academic info (school, major)
- Authentication (password hash, googleId)
- Account status (isEmailVerified, profileCompleted)
- Security (loginAttempts, lockUntil)
- Timestamps and activity tracking

### Middleware Stack
1. **Security**: Helmet, CORS, rate limiting
2. **Authentication**: JWT verification, user loading
3. **Validation**: Input sanitization, schema validation
4. **Error Handling**: Centralized error processing

## 🔧 Development & Testing

### Available Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run lint         # ESLint checking
npm run lint:fix     # Fix linting issues

# Production
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Watch mode testing
```

### Testing Setup

Install additional testing dependencies:

```bash
npm install --save-dev jest supertest mongodb-memory-server
```

Example test file:

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@university.edu',
        password: 'testpassword123',
        fullName: 'Test User',
        school: 'Test University'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
    });
  });
});
```

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/launchpad
JWT_ACCESS_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
GOOGLE_CLIENT_ID=production-google-client-id
GOOGLE_CLIENT_SECRET=production-google-client-secret
CLIENT_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

---

This backend provides a solid foundation for your Launchpad platform with security, scalability, and maintainability built in from the start.
