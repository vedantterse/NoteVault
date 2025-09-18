# 📝 Multi-Tenant SaaS Notes Application

A **production-ready, enterprise-grade** multi-tenant SaaS application that demonstrates modern web development best practices. Built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## 🎯 What This Application Does

This is a **complete SaaS notes management platform** where multiple companies (tenants) can securely manage their team's notes with:

- **🏢 Multi-Tenancy**: Complete data isolation between different companies
- **🔐 Role-Based Access**: Admin and member permissions with different capabilities  
- **💳 Subscription Management**: Free and Pro plans with feature gating
- **📱 Modern UI**: Professional interface with dark theme and glassmorphism effects
- **🛡️ Enterprise Security**: JWT authentication, bcrypt password hashing, and database-level security
- **🚀 API-First Design**: RESTful APIs with CORS support for integrations

## 🎥 Live Demo

- **Application URL**: [Deploy to see your live URL]
- **Health Check**: `/api/health` - Returns application status
- **API Documentation**: All endpoints documented below

### 🧪 Test Accounts (Password: `password`)

| Email | Role | Company | Capabilities |
|-------|------|---------|--------------|
| `admin@acme.test` | Admin | Acme Corp | Full access + subscription upgrades |
| `user@acme.test` | Member | Acme Corp | Notes management only |
| `admin@globex.test` | Admin | Globex Corp | Full access + subscription upgrades |
| `user@globex.test` | Member | Globex Corp | Notes management only |

## ✨ Core Features & Capabilities

### 🏢 **Multi-Tenant Architecture**
- **Shared Database with Tenant Isolation**: Cost-effective approach using tenant IDs
- **Zero Cross-Tenant Data Leakage**: Database-level security enforcement
- **Scalable Design**: Supports thousands of tenants on a single instance

### 🔐 **Authentication & Authorization**
- **Custom JWT Implementation**: Secure token-based authentication system
- **Role-Based Permissions**: 
  - **Admins**: Full access + subscription management + user management
  - **Members**: Notes management within their tenant only
- **Secure Password Storage**: bcrypt hashing with salt rounds
- **Session Management**: 24-hour token expiry with automatic refresh

### 📝 **Notes Management System**
- **Full CRUD Operations**: Create, read, update, delete notes
- **User Ownership**: Users can only modify their own notes
- **Tenant Visibility**: Users see all notes within their company
- **Real-Time Updates**: Instant UI feedback for all operations

### 💳 **Subscription & Feature Gating**
- **Free Plan**: Limited to 3 notes per tenant
- **Pro Plan**: Unlimited notes and premium features
- **Instant Upgrades**: Immediate feature unlocking after subscription change
- **Admin-Only Billing**: Only admins can manage subscription upgrades

## 🏗️ System Architecture

### 🗃️ Database Design (Multi-Tenant with Shared Schema)

```sql
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    tenants      │    │     users       │    │     notes       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (UUID, PK)   │◄── ┤ tenant_id (FK)  │◄── ┤ tenant_id (FK)  │
│ name            │    │ id (UUID, PK)   │◄── ┤ user_id (FK)    │
│ slug (unique)   │    │ email (unique)  │    │ id (UUID, PK)   │
│ subscription    │    │ password_hash   │    │ title           │
│ created_at      │    │ role            │    │ content         │
│ updated_at      │    │ created_at      │    │ created_at      │
└─────────────────┘    │ updated_at      │    │ updated_at      │
                       └─────────────────┘    └─────────────────┘
```

**Key Design Principles:**
- **Tenant Isolation**: Every data row includes `tenant_id` for strict separation
- **Performance**: Indexed on `tenant_id` for fast queries
- **Security**: Application-level and database-level access controls
- **Scalability**: Single database handles thousands of tenants efficiently


#### **Authentication Flow**
```http
POST /api/auth
Content-Type: application/json

{
  "email": "admin@acme.test",
  "password": "password"
}

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@acme.test", 
    "role": "admin",
    "tenant": {
      "id": "uuid",
      "name": "Acme Corporation",
      "plan": "free"
    }
  }
}
```

#### **CORS & External API Access**
All API endpoints support CORS for integration with:
- ✅ Automated scripts and dashboards
- ✅ Third-party monitoring tools  
- ✅ External applications and services
- ✅ CLI tools and automation workflows

## � Quick Start

> 📖 **Complete Setup Guide**: For detailed step-by-step instructions, see **[QUICK_SETUP.md](./QUICK_SETUP.md)**

### 1. Clone & Install
```bash
git clone [your-repo-url]
cd notesapplication
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### 3. Set Up Database
1. Create a new Supabase project
2. Run the SQL script: Copy contents of [`database/working_setup.sql`](./database/working_setup.sql) 
3. Paste into Supabase SQL Editor and execute

### 4. Start Development
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Verify Setup
```bash
# Health check
curl http://localhost:3000/api/health

# Seed test data (recommended)
curl -X POST http://localhost:3000/api/seed
```

> ⚠️ **Having Issues?** Check the detailed troubleshooting guide in [QUICK_SETUP.md](./QUICK_SETUP.md)

## 📚 Documentation & Guides

- **[🚀 QUICK_SETUP.md](./QUICK_SETUP.md)** - Complete setup guide (start here!)
- **[🗄️ Database Schema](./database/working_setup.sql)** - SQL script for database setup

---
