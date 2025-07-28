# 🚨 Fix: MongoDB Connecting to Localhost Instead of Atlas

## Error: `connect ECONNREFUSED 127.0.0.1:27017`

This error means your app is trying to connect to **localhost** instead of **MongoDB Atlas**. Your `MONGODB_URI` environment variable is either missing or incorrectly set in Vercel.

## 🔍 **Step 1: Check Your Environment Variables**

Visit this endpoint on your deployed app to see what's wrong:
```
https://your-app-name.vercel.app/api/check-env-vars
```

This will show you exactly what `MONGODB_URI` is set to (or if it's missing).

## 🛠️ **Step 2: Fix in Vercel Dashboard**

### **Go to Vercel Dashboard:**
1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click on your project** (AnonChat)
3. **Go to Settings** → **Environment Variables**

### **Check if MONGODB_URI exists:**
- **If missing**: Add it (see Step 3)
- **If exists but wrong**: Edit or delete and re-add
- **Make sure it's set for**: Production, Preview, and Development

## 🔗 **Step 3: Get Your Correct MongoDB Atlas Connection String**

### **From MongoDB Atlas:**
1. **Go to [cloud.mongodb.com](https://cloud.mongodb.com)**
2. **Click "Database"** in the left sidebar
3. **Click "Connect"** on your cluster
4. **Choose "Connect your application"**
5. **Copy the connection string** (looks like this):

```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

### **Important Replacements:**
- Replace `<password>` with your **actual database user password**
- Replace `<database_name>` with your **actual database name** (e.g., `anonchat`)

**Example of correct format:**
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/anonchat
```

## ⚙️ **Step 4: Add/Update in Vercel**

### **In Vercel Environment Variables:**
1. **Variable Name**: `MONGODB_URI` (exactly, case-sensitive)
2. **Value**: Your complete MongoDB Atlas connection string
3. **Environments**: Select **all three**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
4. **Click "Save"**

## 🚀 **Step 5: Redeploy**

**Critical: You MUST redeploy after changing environment variables**

1. **Go to Deployments tab** in Vercel
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. **Wait for deployment to complete**

## ✅ **Step 6: Verify Fix**

After redeployment, test:
```
https://your-app-name.vercel.app/api/check-env-vars
```

Should show:
```json
{
  "variables": {
    "MONGODB_URI": {
      "exists": true,
      "isAtlas": true,
      "format": "Valid MongoDB format"
    }
  },
  "diagnosis": "MONGODB_URI appears to be correctly formatted for MongoDB Atlas"
}
```

## 🚨 **Common Mistakes to Avoid:**

### **❌ Wrong Connection String Formats:**
```
mongodb://localhost:27017/mydb              ← Local database
mongodb+srv://cluster.mongodb.net/mydb      ← Missing credentials
mongodb://cluster.mongodb.net/mydb          ← Should use mongodb+srv
```

### **✅ Correct Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

### **❌ Environment Variable Issues:**
- Using lowercase `mongodb_uri` instead of `MONGODB_URI`
- Not setting for all environments (Production, Preview, Development)
- Forgetting to redeploy after changes

## 🔧 **MongoDB Atlas Requirements:**

### **Network Access:**
- **Go to MongoDB Atlas** → **Network Access**
- **Add IP Address**: `0.0.0.0/0` (Allow access from anywhere)
- **Required for Vercel!**

### **Database User:**
- **Go to MongoDB Atlas** → **Database Access**
- **Verify user exists** with correct username/password
- **Permissions**: "Read and write to any database"

## 🧪 **Test Connection:**

After fixing, test these endpoints:
1. `https://your-app.vercel.app/api/check-env-vars` - Check environment variables
2. `https://your-app.vercel.app/api/quick-db-test` - Test MongoDB connection
3. `https://your-app.vercel.app/api/test-signup-flow` - Test signup flow

## 📋 **Quick Checklist:**

- [ ] Got correct connection string from MongoDB Atlas
- [ ] Added `MONGODB_URI` in Vercel Dashboard
- [ ] Set for Production, Preview, and Development
- [ ] Connection string includes username and password
- [ ] Connection string uses `mongodb+srv://` format
- [ ] Added `0.0.0.0/0` to Network Access in MongoDB Atlas
- [ ] Redeployed Vercel app after changes
- [ ] Tested with debug endpoints

**Your database will connect to MongoDB Atlas after these fixes!** 🎉 