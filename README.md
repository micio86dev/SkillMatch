# VibeSync - Professional IT Networking Platform 🚀

## 🌟 Overview

**VibeSync** is a comprehensive full-stack web application designed to connect IT professionals with companies and projects. The platform serves as a networking hub where professionals can showcase their skills, companies can post projects, and both parties can engage through a social feed and messaging system.

![VibeSync Platform](https://img.shields.io/badge/Platform-Full%20Stack-brightgreen)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)
![ORM](https://img.shields.io/badge/ORM-Prisma-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61dafb)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6)

## 🏗️ Architecture

### **Frontend**
- **React 18** with TypeScript
- **Wouter** for routing
- **Tailwind CSS** + **shadcn/ui** components
- **Tanstack Query** for state management
- **i18next** for internationalization
- **Framer Motion** for animations

### **Backend**
- **Node.js + Express.js** with TypeScript
- **Prisma ORM** with MongoDB Atlas
- **Socket.IO** for real-time messaging
- **OpenAI GPT-4** for job processing
- **Session-based authentication**
- **File upload** with Google Cloud Storage

### **Database**
- **MongoDB Atlas** (Cloud)
- **Prisma** for type-safe database operations
- **15 interconnected models**
- **Optimized indexing** and relationships

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have these installed:
- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **MongoDB Atlas account** ([Sign up](https://mongodb.com/cloud/atlas))
- **Git** for version control

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/vibesync.git
cd vibesync

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URI="mongodb+srv://username:password@cluster.mongodb.net/vibesync?retryWrites=true&w=majority"

# Authentication
SESSION_SECRET="your-super-secret-session-key-minimum-32-characters"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# File Upload (Optional - Google Cloud Storage)
GOOGLE_CLOUD_PROJECT_ID="your-gcp-project-id"
GOOGLE_CLOUD_KEY_FILE="path/to/service-account-key.json"
GOOGLE_CLOUD_BUCKET_NAME="your-storage-bucket"

# Development
NODE_ENV="development"
PORT="3000"
```

### 3. Database Setup

#### Option A: Use MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://mongodb.com/cloud/atlas)
   - Create a free account
   - Create a new project

2. **Create a Cluster:**
   - Choose **M0 Sandbox** (Free tier)
   - Select your preferred region
   - Create cluster

3. **Setup Database Access:**
   ```
   Security → Database Access → Add New Database User
   - Username: vibesync-user
   - Password: Generate secure password
   - Roles: Read and write to any database
   ```

4. **Setup Network Access:**
   ```
   Security → Network Access → Add IP Address
   - Add Current IP Address: 0.0.0.0/0 (for development)
   ```

5. **Get Connection String:**
   ```
   Database → Connect → Connect your application
   - Copy the connection string
   - Replace <password> with your actual password
   - Replace <dbname> with 'vibesync'
   ```

#### Option B: Local MongoDB (Advanced)

```bash
# Install MongoDB locally (macOS)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Use local connection string
DATABASE_URI="mongodb://localhost:27017/vibesync"
```

### 4. Initialize Database Schema

```bash
# Push schema to database (creates collections)
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development

```bash
# Start development server (with hot reload)
npm run dev

# Or start individual services
npm run dev:server  # Backend only (port 3000)
npm run dev:client  # Frontend only (port 5173)
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555 (when running `npm run db:studio`)

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start full development server
npm run build        # Build for production
npm run start        # Start production server
npm check           # TypeScript type checking
```

### Database Management
```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:studio   # Open Prisma Studio GUI
npm run db:migrate  # Create and apply migrations (if needed)
```

### Utility Scripts
```bash
npm run lint        # Run ESLint
npm run test        # Run tests (when available)
npm run clean       # Clean build artifacts
```

## 🗂️ Project Structure

```
vibesync/
├── 📁 client/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 lib/           # Utility functions
│   │   ├── 📁 contexts/      # React contexts
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── index.html            # HTML template
│   └── vite.config.ts        # Vite configuration
├── 📁 server/                # Node.js backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── auth.ts               # Authentication logic
│   ├── storage.ts            # Database operations
│   ├── notifications.ts     # Notification system
│   └── replitAuth.ts         # OAuth integration
├── 📁 shared/                # Shared code
│   ├── db.ts                 # Prisma configuration
│   └── schema.ts             # Validation schemas
├── 📁 prisma/                # Database schema
│   └── schema.prisma         # Prisma schema definition
├── 📁 generated/             # Generated files
│   └── prisma/               # Prisma client
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎯 Core Features

### **For Professionals**
- 👤 **Profile Management** - Showcase skills, experience, portfolio
- 🔍 **Project Discovery** - Browse and apply to projects
- 💬 **Networking** - Connect with other professionals
- 📱 **Social Feed** - Share updates and insights
- 💼 **Application Tracking** - Manage job applications
- ⭐ **Feedback System** - Receive and give reviews
- 🔔 **Smart Notifications** - Stay updated on opportunities

### **For Companies**
- 🏢 **Company Profiles** - Build your company presence
- 📝 **Project Posting** - Create detailed project listings
- 👥 **Talent Discovery** - Find professionals with specific skills
- 📊 **Application Management** - Review and respond to applications
- 💬 **Direct Messaging** - Communicate with candidates
- 📈 **Analytics Dashboard** - Track project performance
- 🛡️ **Quality Control** - Preventive validation rules

### **Social Features**
- 📰 **Activity Feed** - Real-time updates from your network
- 💭 **Comments & Likes** - Engage with content
- 🔗 **Professional Connections** - Build your network
- 💬 **Direct Messaging** - Private communications
- 🔔 **Notification System** - Customizable alerts
- 🌍 **Multi-language Support** - English, Italian, Spanish

## 🛠️ Database Models

The platform uses **15 interconnected models**:

### **Core Models**
- `User` - Authentication and basic info
- `ProfessionalProfile` - Developer profiles
- `CompanyProfile` - Company information

### **Project & Application Models**
- `Project` - Job postings and freelance projects
- `ProjectApplication` - Applications to projects
- `ProjectSubscription` - Following projects
- `ProjectPreventive` - Custom validation rules

### **Social Models**
- `Post` - Social feed posts
- `PostComment` - Comments on posts
- `PostLike`, `CommentLike`, `ProjectLike` - Engagement

### **Communication Models**
- `Message` - Direct messaging
- `Connection` - Professional networking
- `Feedback` - Reviews and ratings

### **System Models**
- `Notification` - System notifications
- `NotificationPreferences` - User preferences

## 🔐 Authentication & Security

- **Session-based Authentication** with secure cookies
- **OAuth Integration** (Replit, Google, GitHub support)
- **Password Hashing** with bcrypt
- **CSRF Protection** for forms
- **Rate Limiting** on sensitive endpoints
- **Input Validation** with Zod schemas
- **SQL Injection Prevention** through Prisma ORM

## 🌍 Internationalization

VibeSync supports multiple languages:
- 🇺🇸 **English** (Default)
- 🇮🇹 **Italian**
- 🇪🇸 **Spanish**

Language files are located in `client/src/lib/i18n/`.

## 🎨 UI Components

The platform uses **shadcn/ui** components with custom styling:

```tsx
// Example component usage
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function ProjectCard({ project }) {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-accessible">{project.description}</p>
        <Button className="vibesync-button">Apply Now</Button>
      </CardContent>
    </Card>
  )
}
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check your DATABASE_URI in .env
# Ensure IP address is whitelisted in Atlas
# Verify username/password are correct
```

**Prisma Client Not Generated**
```bash
# Regenerate Prisma client
npm run db:generate

# If schema changed, push to database
npm run db:push
```

**TypeScript Errors**
```bash
# Check types
npm run check

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Development Tips

1. **Use Prisma Studio** - Visual database browser at `localhost:5555`
2. **Check Network Tab** - Monitor API calls in browser dev tools
3. **Console Logs** - Backend logs show in terminal
4. **Hot Reload** - Frontend changes reload automatically
5. **Type Safety** - Prisma provides full TypeScript support

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Write **descriptive commit messages**
- Add **JSDoc comments** for functions
- Test your changes before submitting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Support

If you find VibeSync helpful, please consider:
- ⭐ **Starring** the repository
- 🐛 **Reporting bugs** via GitHub Issues  
- 💡 **Suggesting features** via GitHub Discussions
- 🤝 **Contributing** to the codebase

## 📞 Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/yourusername/vibesync/issues)
- **Discussions:** [Community discussions](https://github.com/yourusername/vibesync/discussions)
- **Email:** vibesync@yourcompany.com

---

**Built with ❤️ by developers, for developers**

*Connecting the IT community one project at a time* 🚀