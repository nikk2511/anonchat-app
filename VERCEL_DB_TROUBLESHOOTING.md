# 🔧 Vercel Database Connection Troubleshooting

## 🚨 Database Not Connecting on Vercel? Fix It!

### 🔍 **Step 1: Test Your Deployment**

Visit this debug endpoint on your deployed app:
```
https://your-app-name.vercel.app/api/debug-vercel
```

This will show you exactly what's wrong with your database connection.

### 🛠️ **Common Issues & Solutions**

#### ❌ **Issue: "MONGODB_URI environment variable is missing"**

**✅ Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `MONGODB_URI` is actually added
3. Make sure it's set for "Production, Preview, and Development"
4. **Redeploy** after adding the variable

#### ❌ **Issue: "Authentication failed"**

**✅ Solutions:**
1. **Check MongoDB Atlas Username/Password:**
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/database
   ```
   - Verify username is correct
   - Verify password is correct (no special URL encoding needed in Vercel)

2. **Create New Database User:**
   - Go to MongoDB Atlas → Database Access
   - Add New Database User
   - Set username/password (avoid special characters)
   - Give "Read and write to any database" permissions

#### ❌ **Issue: "Network timeout" or "Server selection timeout"**

**✅ Solutions:**
1. **Check MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - This is required for Vercel's dynamic IPs

2. **Update Connection String:**
   - Make sure you're using the correct cluster URL
   - Use `mongodb+srv://` format (not `mongodb://`)

#### ❌ **Issue: "Invalid connection string"**

**✅ Check Your MONGODB_URI Format:**
```
❌ Wrong formats:
mongodb://localhost:27017/mydb
mongodb+srv://cluster.mongodb.net/mydb

✅ Correct format:
mongodb+srv://username:password@cluster.mongodb.net/database
```

### 🔍 **Step 2: Verify Environment Variables**

**Check in Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Verify these exist:

| Variable | Status | Example |
|----------|--------|---------|
| `MONGODB_URI` | ✅ Must exist | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_URL` | ✅ Must exist | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | ✅ Must exist | `your-secret-key` |

**Important:**
- Variables are **case-sensitive**
- Select **"Production, Preview, and Development"**
- **Redeploy** after changing variables

### 🔍 **Step 3: Check MongoDB Atlas Settings**

#### **Database Access:**
1. Go to MongoDB Atlas → Database Access
2. Click "Add New Database User"
3. **Username**: Choose simple name (no special chars)
4. **Password**: Choose strong password (no special chars)
5. **Database User Privileges**: "Read and write to any database"

#### **Network Access:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add: `0.0.0.0/0` (Allow access from anywhere)
4. **This is required for Vercel!**

#### **Connection String:**
1. Go to MongoDB Atlas → Database → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with your database name

### 🔍 **Step 4: Test Locally First**

**Before deploying to Vercel, test locally:**

1. **Create `.env.local`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-local-secret
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

3. **Test endpoint:**
   ```
   http://localhost:3000/api/debug-vercel
   ```

If it works locally but not on Vercel, it's an environment variable issue.

### 🔍 **Step 5: Debug on Vercel**

**Check Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on any API function
3. Check the logs for error messages

**Common Log Errors:**
```
❌ "MONGODB_URI environment variable is not set"
   → Variable not set in Vercel Dashboard

❌ "authentication failed"
   → Wrong username/password in connection string

❌ "Server selection timed out"
   → Network access not configured (need 0.0.0.0/0)

❌ "Invalid connection string"
   → Wrong MONGODB_URI format
```

### 🔍 **Step 6: Force Redeploy**

After fixing environment variables:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete
5. Test the debug endpoint again

### 🚨 **Emergency Checklist**

If nothing works, go through this checklist:

- [ ] MongoDB Atlas cluster is running (not paused)
- [ ] Database user exists with correct username/password
- [ ] Network access allows 0.0.0.0/0
- [ ] MONGODB_URI is set in Vercel with correct format
- [ ] MONGODB_URI includes username, password, cluster, and database name
- [ ] Environment variables are set for Production, Preview, and Development
- [ ] Redeployed after setting environment variables
- [ ] Debug endpoint `/api/debug-vercel` shows the actual error

### 🛠️ **Still Not Working?**

**Try This:**
1. **Create a new MongoDB Atlas cluster**
2. **Create a new database user with simple credentials**
3. **Copy the exact connection string from Atlas**
4. **Delete and re-add MONGODB_URI in Vercel**
5. **Redeploy**

**Your database WILL connect!** 🎉 