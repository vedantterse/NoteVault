# 🚀 Quick Setup Guide

This guide will help you set up the Multi-Tenant SaaS Notes Application. Follow these steps exactly to avoid any issues.

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js 18+** and **npm** installed
- A **Supabase account** (free tier works perfectly)
- **Git** installed
- A code editor (VS Code recommended)

## 🏗️ Step 1: Project Setup

### 1.1 Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/vedantterse/NoteVault
cd notesapplication

# Install all dependencies
npm install
```

### 1.2 Environment Configuration

```bash
# Copy the environment template
cp .env.example .env.local
```

Now open `.env.local` and fill in your Supabase credentials (we'll get these in the next step).

## 🗄️ Step 2: Supabase Database Setup

### 2.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `notes-app` (or any name you prefer)
   - **Database Password**: Create a strong password and **save it**
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### 2.2 Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values to your `.env.local` file:

```bash
# From Project Settings -> API
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_public_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Generate a random JWT secret (keep this secure!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Local development URL
NEXTAUTH_URL="http://localhost:3000"
```


### 2.3 Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. **Copy and paste the entire contents** of the file [`database/working_setup.sql`](./database/working_setup.sql) into the editor
4. Click **"RUN"** to execute the script

This script will:
- ✅ Create all necessary tables (`tenants`, `users`, `notes`)
- ✅ Set up proper relationships and indexes
- ✅ Insert test data with 4 demo accounts
- ✅ Configure security settings

> 💡 **Why this file?** The `working_setup.sql` contains pre-generated password hashes that are **guaranteed to work** with the application. This ensures consistent authentication across all environments.

## 🏃‍♂️ Step 3: Run the Application

### 3.1 Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 3.2 Verify Everything Works

1. **Health Check**: Visit `http://localhost:3000/api/health`
   - Should return: `{"status":"ok"}`

2. **Seed Additional Data** (Optional but Recommended):
   ```bash
   # This ensures your local environment has all test accounts
   curl -X POST http://localhost:3000/api/seed
   ```
   
   > 📝 **Why use the seed endpoint?** Even though `working_setup.sql` creates test accounts, the `/api/seed` endpoint is useful for:
   > - **Local Development**: Quickly recreate test data if needed
   > - **Hash Consistency**: Uses the same bcrypt library as the app to generate passwords
   > - **Easy Reset**: Allows you to reset test data without running SQL scripts
   > - **Production Safety**: Automatically disabled in production environments

3. **Test Login**: Go to `http://localhost:3000` and try logging in with:

| Email | Password | Role | Company |
|-------|----------|------|---------|
| `admin@acme.test` | `password` | Admin | Acme Corp |
| `user@acme.test` | `password` | Member | Acme Corp |
| `admin@globex.test` | `password` | Admin | Globex Corp |
| `user@globex.test` | `password` | Member | Globex Corp |

## ✅ Step 4: Verify Core Features

After logging in, test these features:

### For Admin Users:
- ✅ Create, edit, delete notes
- ✅ View all notes from your company
- ✅ Access user management (click user icon in top-right)
- ✅ Upgrade subscription plan
- ✅ Access unlimited notes after upgrade

### For Member Users:
- ✅ Create, edit, delete your own notes
- ✅ View all notes from your company
- ✅ Limited to 3 notes on free plan
- ❌ Cannot upgrade subscription (admin only)
- ❌ Cannot access user management

### Tenant Isolation Test:
- ✅ Log in as `admin@acme.test` and create a note
- ✅ Log out and log in as `admin@globex.test`
- ✅ Verify you **cannot see** the Acme note (proves tenant isolation works)

## 🔒 Security Notes

### Password Hash Consistency
The application uses **bcrypt** with salt rounds for password hashing. The `working_setup.sql` file contains pre-generated hashes using the exact same bcrypt configuration as the application, ensuring **100% compatibility**.

**Test Password**: All demo accounts use the password `password`  
**Hash Used**: `$2b$12$LQSlEif8vkBVwHeIn5smGevXfGgQagcyyep6PEnEIS1i4r1OvFNtu`

This hash will work consistently across all environments because:
- ✅ Uses bcrypt version 2b
- ✅ Uses 12 salt rounds (matching app config)
- ✅ Generated with Node.js bcrypt library (same as the app)
