# AnonChat Setup Guide

## Issues Fixed

✅ **Database Connection**: Improved error handling and validation  
✅ **Signup Process**: Enhanced error handling and validation  
✅ **Email Service**: Better error handling for verification emails  

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/anonchat
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/anonchat

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# NextAuth Configuration  
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# AI Service (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
NODE_ENV=development
```

## Setup Steps

### 1. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/your/data/directory

# Your MONGODB_URI should be:
MONGODB_URI=mongodb://localhost:27017/anonchat
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster
3. Get connection string and replace in MONGODB_URI
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/anonchat`

### 2. Email Service Setup (Resend)

1. Sign up at [Resend](https://resend.com/)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. Authentication Setup

Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```
Add to `.env.local`:
```env
NEXTAUTH_SECRET=your_generated_secret_here
```

### 4. AI Service Setup (Optional)

1. Get Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Testing

1. Check environment variables:
   ```bash
   curl http://localhost:3000/api/debug
   ```

2. Test signup process by creating a new account

## Common Issues

### Database Connection Failed
- ✅ **Fixed**: Better error handling and validation
- Check if MongoDB is running
- Verify MONGODB_URI is correct
- Check network connectivity for Atlas

### Email Service Failed  
- ✅ **Fixed**: Better error handling for missing API keys
- Verify RESEND_API_KEY is correct
- Check Resend account limits

### Signup Validation Errors
- ✅ **Fixed**: Added comprehensive validation
- Username must be at least 3 characters
- Password must be at least 6 characters
- Email must be valid format

## Changes Made

### Database Connection (`src/lib/dbConnect.ts`)
- Added proper error handling when MONGODB_URI is missing
- Added connection options for better reliability
- Improved logging and error messages
- Proper error propagation

### Signup Route (`src/app/api/sign-up/route.ts`)
- Added input validation for all fields
- Better error handling for database operations
- Improved logging for debugging
- Specific error messages for different failure types
- Enhanced duplicate user handling

### Email Service (`src/helpers/sendVerificationEmail.ts`)
- Added validation for required parameters
- Better error handling for missing API keys
- Specific error messages for different failure types
- Improved logging

Run the debug endpoint to check your current configuration:
```bash
curl http://localhost:3000/api/debug
``` 