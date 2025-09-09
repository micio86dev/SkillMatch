# VibeSync - Professional IT Networking Platform 🚀

## ⚠️ Important Setup Note

**Before running the application, you must update the `.env` file with your actual credentials:**
- Replace `DATABASE_URL` with your actual MongoDB connection string
- Replace `SESSION_SECRET` with a strong secret key for session encryption
- Replace `OPENAI_API_KEY` with your OpenAI API key (optional)
- Replace other service credentials as needed

Without valid credentials, the application will not be able to connect to external services.

## 🌟 Overview

**VibeSync** is a comprehensive full-stack web application designed to connect IT professionals with companies and projects. The platform serves as a networking hub where professionals can showcase their skills, companies can post projects, and both parties can engage through a social feed and messaging system.

## 🏗️ Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: Passport.js with local strategy and session management
- **API**: RESTful API with comprehensive endpoints for users, profiles, projects, and social features
- **Real-time**: WebSocket support for messaging and notifications
- **Storage**: Google Cloud Storage for file uploads
- **Email**: SendGrid for email notifications
- **AI**: OpenAI integration for smart matching and content generation

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Custom component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Query for server state, React Context for client state
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next for multi-language support

### DevOps
- **Deployment**: Standard hosting with custom domain support
- **Monitoring**: Integrated logging and error tracking
- **CI/CD**: Automated testing and deployment workflows
- **Security**: HTTPS, secure headers, and input validation

## 🚀 Quick Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Generate Prisma client: `npm run db:generate`
5. Start development server: `npm run dev`

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
- **Session-based authentication** using Passport.js with local strategy
- **File upload** with Google Cloud Storage

// ... rest of the file ...

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/skill-match.git
cd skill-match

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
MONGODB_URI="your-mongodb-connection-string"

# Authentication
SESSION_SECRET="your-secure-session-secret-key-minimum-32-characters"

# OpenAI (Optional - for AI features)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# File Upload (Optional - Google Cloud Storage)
GOOGLE_CLOUD_PROJECT_ID="your-gcp-project-id"
GOOGLE_CLOUD_KEY_FILE="path/to/service-account-key.json"
GOOGLE_CLOUD_BUCKET_NAME="your-storage-bucket"

# Development
NODE_ENV="development"
PORT="5000"
```

### 3. Database Setup

Use MongoDB Atlas (recommended). Create an account, set up a cluster, whitelist IPs, and create a database user with appropriate roles.

### 4. Initialize Database Schema

```bash
# Push schema to database (sets up collections)
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5000 (single combined server)
- **Prisma Studio:** http://localhost:5555 (when running `npm run db:studio`)

## 📋 Available Scripts

### Development
```bash
npm run dev           # Start development server (frontend and backend)
npm run build         # Build for production
npm start             # Start production server
npm run check         # TypeScript checking
```

### Database
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio GUI
```

### Other
```bash
npm run lint          # Run code linter
npm run test          # Run tests (when available)
npm run clean         # Clean build artifacts
```

## 🔐 Authentication & Security

- Uses **Passport.js** with **local strategy** for username/password login
- Session management with **express-session** and MongoDB session storage
- Passwords hashed securely with **bcrypt**
- CSRF protection enabled
- Rate limiting on authentication endpoints to thwart brute force attacks
- Input validation using **Zod** schemas
- Prisma ORM prevents injection attacks

## 🌍 Internationalization

Supports multiple languages with per-user preferences:
- English (default)
- Italian
- Spanish

Language files located in `client/src/lib/i18n/`

## 🤝 Contributing

Please fork the repository, create topic branches, and open pull requests for review. Use TypeScript, maintain clean commits, document functions with JSDoc, and test thoroughly.

## 📞 Contact

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/skill-match/issues)
- Discussions: [Community discussions](https://github.com/yourusername/skill-match/discussions)
- Email: skillmatch@yourcompany.com

---

**Built with ❤️ by developers, for developers**

*Connecting the IT community one project at a time* 🚀