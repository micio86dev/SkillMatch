# VibeSync - Professional IT Networking Platform

## 🚀 Overview

VibeSync is a comprehensive full-stack web application designed to connect IT professionals with companies and projects. The platform serves as a networking hub where professionals can showcase their skills, companies can post projects, and both parties can engage through a social feed and messaging system.

## 🏗️ Architecture

- **Frontend**: React 18 with TypeScript, Wouter routing, Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless)
- **Authentication**: Replit OpenID Connect (OIDC)
- **AI Integration**: OpenAI GPT-4o for job processing and career insights
- **Real-time**: WebSocket support for messaging

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- OpenAI API key (for AI features)

### Environment Setup
```bash
# Required environment variables
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your-domain.replit.app
```

### Installation & Setup
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 🗄️ Database Management

### Schema Operations

#### Push Schema to Database
```bash
# Sync schema changes to database
npm run db:push

# Force push (overrides warnings)
npm run db:push --force
```

#### Database Backup & Restore
```bash
# Create complete database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

#### Schema Introspection
```bash
# Generate schema from existing database
npx drizzle-kit introspect

# Pull current database schema
npx drizzle-kit pull
```

### Data Seeding

#### Manual Seeding via API
```bash
# Create test users
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","userType":"professional"}'

# Create professional profile
curl -X POST http://localhost:5000/api/professional-profiles \
  -H "Content-Type: application/json" \
  -d '{"title":"Senior Developer","bio":"Experienced developer","skills":["JavaScript","React","Node.js"]}'
```

#### Seed Database via Script
```bash
# Run the seeding script (if available)
npm run seed

# Or use the database tools directly
node scripts/seed-database.js
```

## 🤖 AI-Powered Job Import System

### Overview
The platform includes an AI-powered job import system that automatically scrapes, processes, and imports job postings using OpenAI GPT-4o.

### Configuration

#### Cron Scheduler
The job import runs automatically every 30 minutes:
```typescript
// Configured in server/cron-scheduler.ts
cron.schedule('*/30 * * * *', async () => {
  await jobImportService.importJobsFromWeb();
});
```

#### Manual Job Import
```bash
# Trigger manual job import
curl -X POST http://localhost:5000/api/admin/import-jobs \
  -H "Authorization: Bearer your_admin_token"
```

### Job Processing Pipeline

1. **Web Scraping**: Extracts job postings from configured sources
2. **AI Processing**: Uses OpenAI GPT-4o to:
   - Normalize job titles
   - Clean and enhance descriptions
   - Extract required skills
   - Determine seniority levels
   - Set appropriate budgets
3. **Database Storage**: Saves processed jobs to PostgreSQL
4. **Duplicate Prevention**: Checks existing jobs to avoid duplicates

### AI Processing Configuration

```typescript
// OpenAI model configuration
const completion = await openai.chat.completions.create({
  model: "gpt-4o", // Latest OpenAI model
  messages: [
    {
      role: "system",
      content: `You are a professional job posting processor...`
    },
    {
      role: "user", 
      content: jobDescription
    }
  ],
  response_format: { type: "json_object" }
});
```

### Job Import API Endpoints

```bash
# Get job import statistics
GET /api/job-imports/stats

# Get recent job imports
GET /api/job-imports/recent

# Trigger manual import (admin only)
POST /api/admin/import-jobs

# Get import history
GET /api/admin/import-history
```

## 🔄 Database Migrations

### Schema Evolution
```bash
# After modifying shared/schema.ts, push changes
npm run db:push

# Handle data loss warnings carefully
# Review changes before confirming
```

### Safe Migration Practices

#### 1. Always Backup First
```bash
pg_dump $DATABASE_URL > pre_migration_backup.sql
```

#### 2. Test Schema Changes
```bash
# Use force flag for testing
npm run db:push --force
```

#### 3. Handle Data Type Changes
```typescript
// Example: Converting arrays to JSONB
// OLD (PostgreSQL array)
skills: text("skills").array()

// NEW (JSONB for better querying)
skills: jsonb("skills")

// Migration requires data transformation
```

### Common Migration Scenarios

#### Adding New Columns
```typescript
// Add column with default value
newColumn: varchar("new_column").default("default_value")
```

#### Modifying Existing Columns
```bash
# Always backup before column modifications
pg_dump $DATABASE_URL > backup.sql

# Push schema changes
npm run db:push --force
```

#### Adding Indexes
```typescript
// Add indexes in schema.ts
export const projectsTable = pgTable("projects", {
  // ... columns
}, (table) => ({
  titleIndex: index("idx_projects_title").on(table.title),
  skillsIndex: index("idx_projects_skills").using("gin", table.requiredSkills)
}));
```

## 🔧 Development Workflow

### Code Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configs
├── server/                # Express backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── auth.ts            # Authentication logic
│   ├── job-import-service.ts  # AI job import system
│   └── cron-scheduler.ts  # Background tasks
├── shared/                # Shared code
│   └── schema.ts          # Database schema definitions
└── drizzle.config.ts      # Drizzle ORM configuration
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

### Database Development
```bash
# View current schema
npx drizzle-kit introspect

# Generate migrations (if needed)
npx drizzle-kit generate

# Studio for database browsing
npx drizzle-kit studio
```

## 📊 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
Body: {"email": "user@example.com", "password": "password"}

# Register
POST /api/auth/register
Body: {"email": "user@example.com", "password": "password", "userType": "professional"}

# Get current user
GET /api/auth/user
```

### Projects
```bash
# Get all projects
GET /api/projects

# Create project
POST /api/projects
Body: {"title": "Project Title", "description": "...", "requiredSkills": ["React", "Node.js"]}

# Get project by ID
GET /api/projects/:id

# Update project
PUT /api/projects/:id

# Delete project
DELETE /api/projects/:id
```

### Professional Profiles
```bash
# Get all professionals
GET /api/professionals

# Create professional profile
POST /api/professional-profiles
Body: {"title": "Senior Developer", "bio": "...", "skills": ["JavaScript", "React"]}

# Get professional by ID
GET /api/professionals/:id
```

### Social Features
```bash
# Get posts feed
GET /api/posts

# Create post
POST /api/posts
Body: {"content": "Post content", "isPublic": true}

# Like/unlike post
POST /api/posts/:id/like

# Get post comments
GET /api/posts/:id/comments

# Add comment
POST /api/posts/:id/comments
Body: {"content": "Comment content"}
```

### Statistics
```bash
# Get platform statistics
GET /api/stats
Response: {"activeProfessionals": 45, "openProjects": 135, ...}
```

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify environment variables
echo $DATABASE_URL
```

#### Schema Sync Issues
```bash
# Force schema push (careful with data loss)
npm run db:push --force

# Check for conflicting migrations
npx drizzle-kit introspect
```

#### AI Job Import Errors
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# View import logs
tail -f logs/job-import.log

# Manual test import
curl -X POST http://localhost:5000/api/admin/import-jobs
```

#### Array/JSONB Conversion Issues
```typescript
// Fix array handling in job import
requiredSkills: Array.isArray(skills) ? skills : [skills]

// Store as JSONB in database
await db.insert(projects).values({
  ...data,
  requiredSkills: JSON.stringify(data.requiredSkills)
});
```

### Performance Optimization

#### Database Indexes
```sql
-- Add indexes for common queries
CREATE INDEX idx_projects_skills ON projects USING gin(required_skills);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

#### Query Optimization
```typescript
// Use select() to limit returned columns
const projects = await db
  .select({
    id: projects.id,
    title: projects.title,
    description: projects.description
  })
  .from(projects)
  .where(eq(projects.status, "open"))
  .limit(20);
```

## 🚀 Production Deployment

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:password@prod_host:5432/prod_db
OPENAI_API_KEY=prod_openai_key
SESSION_SECRET=secure_session_secret
```

### Database Setup
```bash
# Create production database
createdb vibesync_production

# Run migrations
npm run db:push

# Seed initial data
npm run seed:production
```

### Performance Monitoring
```bash
# Monitor database performance
SELECT * FROM pg_stat_activity;

# Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## 📝 Contributing

### Code Style
- Use TypeScript for type safety
- Follow existing naming conventions
- Write descriptive commit messages
- Add tests for new features

### Database Changes
1. Always backup before schema changes
2. Test migrations on development data
3. Document breaking changes
4. Use `npm run db:push --force` carefully

### AI Features
1. Test OpenAI integration thoroughly
2. Handle API rate limits gracefully
3. Validate AI responses before storage
4. Monitor AI processing costs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy coding with VibeSync! 🎯**

For additional support or questions, please check the logs or create an issue.