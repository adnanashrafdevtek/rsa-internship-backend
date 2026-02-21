# JWT Authentication - Frontend Integration Guide

## Overview
The backend now requires JWT authentication for all API endpoints except:
- `POST /login` - Login endpoint
- `POST /api/activate` - Account activation endpoint

## Authentication Flow

### 1. Login and Get Token
Send username/email and password to get a JWT token:

```javascript
// Frontend - Login
const response = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// data.token contains the JWT token
// Store this token in localStorage or sessionStorage
localStorage.setItem('jwtToken', data.token);
```

### 2. Use Token for Protected API Calls
Include the token in the Authorization header for all subsequent API calls:

```javascript
// Frontend - Making authenticated API calls
const token = localStorage.getItem('jwtToken');

const response = await fetch('http://localhost:3000/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

### 3. Verify Token (Get Current User)
Check if the token is still valid and get current user info:

```javascript
// Frontend - Verify token
const token = localStorage.getItem('jwtToken');

const response = await fetch('http://localhost:3000/api/auth/verify', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

if (response.ok) {
  const data = await response.json();
  console.log('Current user:', data.user);
} else {
  // Token is invalid or expired
  localStorage.removeItem('jwtToken');
  // Redirect to login
}
```

### 4. Refresh Token
Get a new token when the current one might be expiring:

```javascript
// Frontend - Refresh token
const token = localStorage.getItem('jwtToken');

const response = await fetch('http://localhost:3000/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('jwtToken', data.token);
}
```

### 5. Logout
Clear the token on the client side:

```javascript
// Frontend - Logout
localStorage.removeItem('jwtToken');
// Redirect to login page
```

## Token Structure
The JWT token contains the following user information:
- `id`: User ID
- `email`: User email
- `role`: User role (student, teacher, admin, etc.)
- `first_name`: User first name
- `last_name`: User last name
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Error Handling

### 401 Unauthorized
- Missing Authorization header
- Invalid token format
- Token is invalid or expired
- **Action**: Clear token and redirect to login

### 403 Forbidden
- User doesn't have permission for this endpoint
- **Action**: Show error message to user

### Other Errors
- 400: Bad request
- 500: Server error
- **Action**: Show error message to user

## Example React Hook for Authentication

```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  const apiCall = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    return response;
  };

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    apiCall,
  };
}

export default useAuth;
```

## Important Notes

1. **Token Storage**: Store tokens in localStorage or sessionStorage. For maximum security, consider using httpOnly cookies.

2. **Token Expiration**: The default token expiration is 7 days (set in .env as `JWT_EXPIRES_IN`). Implement token refresh before expiration.

3. **HTTPS**: In production, always use HTTPS to prevent token interception.

4. **Secret Key**: The JWT_SECRET in .env should be a strong, random string in production.

5. **CORS**: CORS is enabled in the backend. Make sure your frontend domain is trusted.

## Testing the API

You can test the authentication using curl or Postman:

```bash
# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use returned token for protected endpoints
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Verify token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
