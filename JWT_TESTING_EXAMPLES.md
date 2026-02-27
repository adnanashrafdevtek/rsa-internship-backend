# JWT Authentication - Testing & Usage Examples

## Quick Start

### 1. Start the Server
```bash
cd c:\Users\Yusuf\OneDrive\Documents\GitHub\rsa-internship-backend
npm start
```

Server runs on: `http://localhost:3000`

### 2. Login to Get Token
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Response Example:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "student@example.com",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Copy the token** (everything after `"token": "..."`). You'll use this for all API calls.

---

## API Endpoint Examples

All examples use `TOKEN` as a placeholder. Replace with your actual JWT token.

### 1. Get All Users
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN"
```

### 2. Get All Students
```bash
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer TOKEN"
```

### 3. Get All Teachers
```bash
curl -X GET http://localhost:3000/api/teachers \
  -H "Authorization: Bearer TOKEN"
```

### 4. Get All Classes
```bash
curl -X GET http://localhost:3000/api/classes \
  -H "Authorization: Bearer TOKEN"
```

### 5. Get Teacher Availability
```bash
curl -X GET http://localhost:3000/api/teacher-availability/1 \
  -H "Authorization: Bearer TOKEN"
```

### 6. Get Teacher's Classes
```bash
curl -X GET http://localhost:3000/api/teachers/1/classes \
  -H "Authorization: Bearer TOKEN"
```

### 7. Get Student's Classes
```bash
curl -X GET http://localhost:3000/api/students/1/classes \
  -H "Authorization: Bearer TOKEN"
```

### 8. Create New Class
```bash
curl -X POST http://localhost:3000/api/classes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathematics 101",
    "class_code": "MATH101",
    "description": "Introduction to Mathematics",
    "teacher_id": 1,
    "grade_level": "10"
  }'
```

### 9. Get Class Details
```bash
curl -X GET http://localhost:3000/api/classes/1 \
  -H "Authorization: Bearer TOKEN"
```

### 10. Update Class
```bash
curl -X PUT http://localhost:3000/api/classes/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathematics 101 (Updated)",
    "description": "Updated description"
  }'
```

### 11. Delete Class
```bash
curl -X DELETE http://localhost:3000/api/classes/1 \
  -H "Authorization: Bearer TOKEN"
```

### 12. Add Student to Class
```bash
curl -X POST http://localhost:3000/api/classes/1/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1
  }'
```

---

## Authentication Endpoints

### Check Token Status
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  },
  "message": "Token is valid"
}
```

### Refresh Token (Get New Token)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...},
  "message": "Token refreshed successfully"
}
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Responses

### Missing Token
```bash
curl http://localhost:3000/api/users
```

**Response (401):**
```json
{
  "success": false,
  "error": "Missing Authorization header",
  "message": "Please provide a JWT token in the Authorization header"
}
```

### Invalid Token
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "message": "Token is invalid or has expired. Please login again."
}
```

### Wrong Header Format
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: TOKEN_WITHOUT_BEARER"
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid Authorization header format",
  "message": "Use format: Authorization: Bearer <token>"
}
```

---

## JavaScript/Fetch Examples

### Login and Store Token
```javascript
async function login() {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('jwtToken', data.token);
    console.log('Logged in as:', data.user.first_name);
  }
}
```

### Make Protected API Call
```javascript
async function getUsers() {
  const token = localStorage.getItem('jwtToken');
  
  const response = await fetch('http://localhost:3000/api/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    console.log('Token expired, please login again');
    localStorage.removeItem('jwtToken');
    return;
  }
  
  const data = await response.json();
  console.log('Users:', data);
}
```

### Reusable Fetch Function with Auth
```javascript
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('jwtToken');
  
  if (!token) {
    throw new Error('No auth token found');
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login'; // Redirect to login
  }
  
  return response;
}

// Usage
const users = await authenticatedFetch('http://localhost:3000/api/users');
const data = await users.json();
```

---

## Testing with Postman

1. **Login Request**
   - URL: `POST http://localhost:3000/login`
   - Body (JSON): 
     ```json
     {
       "email": "student@example.com",
       "password": "password123"
     }
     ```
   - Copy token from response

2. **Setup Token in Postman**
   - Go to the collection settings
   - Under "Authorization" tab, select "Bearer Token"
   - Paste your token
   - Or manually add header: `Authorization: Bearer <token>`

3. **Make Protected Request**
   - URL: `GET http://localhost:3000/api/users`
   - Headers will automatically include the Bearer token
   - Send request

---

## Common Issues

### "Missing Authorization header"
- **Cause**: You didn't include the `Authorization` header
- **Fix**: Add header: `Authorization: Bearer YOUR_TOKEN`

### "Invalid or expired token"
- **Cause**: Token is malformed, invalid, or expired
- **Fix**: Get a new token by logging in again

### "Invalid Authorization header format"
- **Cause**: Header format is wrong (missing "Bearer" or space)
- **Fix**: Use exactly: `Authorization: Bearer TOKEN` (with space)

### Token Works but Request Still Fails
- **Cause**: You might not have permission for that endpoint (if role middleware is enforce)
- **Fix**: Check your user role and endpoint requirements

---

## Token Information

To see what's inside your token (for debugging):
```javascript
// In browser console
const token = localStorage.getItem('jwtToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log(decoded);
```

This will show:
```javascript
{
  id: 1,
  email: "student@example.com",
  role: "student",
  first_name: "John",
  last_name: "Doe",
  iat: 1234567890,
  exp: 1241234567
}
```

- `iat`: Issued at (timestamp when token was created)
- `exp`: Expiration (timestamp when token expires)

---

## Production Checklist

- [ ] Change `JWT_SECRET` in `.env` to a strong random value
- [ ] Use HTTPS in production (not HTTP)
- [ ] Consider using httpOnly cookies instead of localStorage
- [ ] Implement token refresh logic (refresh before expiration)
- [ ] Add request timeout handling
- [ ] Implement rate limiting on `/login` endpoint
- [ ] Hash passwords in database (currently stored plaintext)
- [ ] Add request logging and monitoring
