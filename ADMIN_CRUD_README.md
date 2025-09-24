# Admin CRUD Operations with MongoDB

This project has complete CRUD (Create, Read, Update, Delete) operations for the `admins` table using MongoDB and Mongoose.

## 🗄️ Database Tables

Your project includes these MongoDB collections:

- `admins` - Admin users with authentication and permissions
- `cast` - Cast members information
- `cast_earning` - Cast earnings data
- `country_earning` - Country-wise earnings
- `movies` - Movie information
- `users` - Regular user accounts

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in your project root with your MongoDB connection string:

```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/your_database_name

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your_database_name?retryWrites=true&w=majority
```

### 2. Test the Connection

Run the admin CRUD test to verify everything is working:

```bash
npm run test:admin
```

This will test all CRUD operations and show you the results.

## 📚 Admin Model Schema

```typescript
interface IAdmin {
  username: string; // Unique username
  email: string; // Unique email
  password: string; // Hashed password
  rights: string[]; // Array of permissions
  status: "Active" | "Inactive";
  createdDate: Date; // Auto-generated
  updatedDate: Date; // Auto-generated
}
```

## 🔧 API Endpoints

### GET /api/admins

- **Purpose**: Fetch all admins
- **Response**: Array of admin objects (passwords excluded)
- **Example**:

```bash
curl http://localhost:9002/api/admins
```

### POST /api/admins

- **Purpose**: Create a new admin
- **Body**:

```json
{
  "username": "newadmin",
  "email": "admin@example.com",
  "password": "securepassword123",
  "rights": ["ADD_MOVIE", "DELETE_MOVIE"],
  "status": "Active"
}
```

- **Response**: Created admin object (password excluded)

### GET /api/admins/[id]

- **Purpose**: Fetch admin by ID
- **Response**: Single admin object (password excluded)

### PUT /api/admins/[id]

- **Purpose**: Update admin by ID
- **Body**: Any fields to update
- **Response**: Updated admin object (password excluded)

### DELETE /api/admins/[id]

- **Purpose**: Delete admin by ID
- **Response**: Success confirmation

## 🧪 Testing CRUD Operations

### 1. Create an Admin

```typescript
const newAdmin = {
  username: "superadmin",
  email: "super@example.com",
  password: "mypassword123",
  rights: ["ADD_MOVIE", "DELETE_MOVIE", "MANAGE_USERS", "MANAGE_ADMINS"],
  status: "Active",
};

const response = await fetch("/api/admins", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newAdmin),
});
```

### 2. Read All Admins

```typescript
const response = await fetch("/api/admins");
const { data: admins } = await response.json();
```

### 3. Read Admin by ID

```typescript
const response = await fetch(`/api/admins/${adminId}`);
const { data: admin } = await response.json();
```

### 4. Update Admin

```typescript
const updateData = {
  username: "updatedusername",
  rights: ["ADD_MOVIE", "DELETE_MOVIE", "MANAGE_USERS"],
};

const response = await fetch(`/api/admins/${adminId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updateData),
});
```

### 5. Delete Admin

```typescript
const response = await fetch(`/api/admins/${adminId}`, {
  method: "DELETE",
});
```

## 🔐 Security Features

- **Password Hashing**: All passwords are automatically hashed using bcrypt
- **Password Exclusion**: Passwords are never returned in API responses
- **Input Validation**: Mongoose schema validation ensures data integrity
- **Unique Constraints**: Username and email must be unique

## 🚨 Error Handling

All API endpoints include comprehensive error handling:

- Database connection errors
- Validation errors
- Not found errors
- General server errors

## 📝 Example Usage in Components

```typescript
import { useState, useEffect } from "react";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      const { data } = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (adminData) => {
    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
      });

      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (error) {
      console.error("Error creating admin:", error);
    }
  };

  // ... rest of component
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**

   - Check your `MONGODB_URI` in `.env.local`
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Validation Errors**

   - Check required fields (username, email, password)
   - Ensure email format is valid
   - Verify status is either 'Active' or 'Inactive'

3. **Duplicate Key Errors**
   - Username and email must be unique
   - Check if admin already exists

## 🎯 Next Steps

Your admin CRUD is fully functional! You can now:

1. **Test the API** using the test script
2. **Integrate with your admin UI** components
3. **Add authentication middleware** for protected routes
4. **Implement similar CRUD operations** for other tables (cast, movies, users, etc.)

## 📞 Support

If you encounter any issues:

1. Check the console logs for detailed error messages
2. Verify your MongoDB connection string
3. Ensure all dependencies are installed (`npm install`)
4. Run the test script to isolate issues
