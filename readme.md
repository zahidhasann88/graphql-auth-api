# GraphQL TypeScript Authentication API

A secure and feature-rich authentication system built with Node.js, GraphQL, TypeScript, and PostgreSQL.

## Features

- 🔐 Secure JWT Authentication
  - Access and refresh tokens
  - Token versioning
  - HTTP-only cookies
  
- 👤 User Management
  - Registration with email verification
  - Login with rate limiting
  - Password reset functionality
  - Profile management
  
- 🔑 OAuth Integration
  - Google authentication
  - GitHub authentication
  
- 🛡️ Security Features
  - Rate limiting
  - Role-based authorization
  - Password hashing with bcrypt
  - Protection against common attacks
  
- 📧 Email Features
  - Email verification
  - Password reset emails
  - Customizable email templates

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis (for rate limiting)
- SMTP server (for emails)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/graphql-auth-api.git
cd graphql-auth-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/graphql_db

# JWT
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
GMAIL_USER=jahidhasann78@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

4. Initialize the database:
```bash
npm run typeorm migration:run
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Mutations

```graphql
# Register a new user
mutation Register($input: RegisterInput!) {
  register(input: $input)
}

# Login
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    user {
      id
      email
    }
  }
}

# Verify Email
mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token)
}

# Request Password Reset
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}

# Reset Password
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword)
}

# OAuth Login
mutation GoogleAuth($token: String!) {
  googleAuth(token: $token) {
    accessToken
    user {
      id
      email
    }
  }
}
```

### Protected Queries

```graphql
# Get current user
query Me {
  me {
    id
    email
    name
    roles
  }
}
```

## Security Best Practices

1. **Token Management**
   - Short-lived access tokens (15 minutes)
   - Refresh tokens stored in HTTP-only cookies
   - Token versioning for invalidation

2. **Password Security**
   - Bcrypt hashing with salt
   - Password strength requirements
   - Rate limiting on login attempts

3. **API Security**
   - CORS configuration
   - Rate limiting
   - Input validation
   - Role-based access control

## Error Handling

The API uses GraphQL errors with specific codes:
- `UNAUTHENTICATED`: Token missing or invalid
- `FORBIDDEN`: Insufficient permissions
- `BAD_USER_INPUT`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server errors

## Development

```bash
# Run tests
npm run test

# Check types
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request