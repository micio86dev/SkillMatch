# DevConnect - Professional IT Networking Platform

## Overview

DevConnect is a comprehensive full-stack web application designed to connect IT professionals with companies and projects. The platform serves as a networking hub where professionals can showcase their skills, companies can post projects, and both parties can engage through a social feed and messaging system. Built with modern web technologies, it features a React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and integrates Replit's authentication system for secure user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Styling**: CSS variables for theming with dark/light mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with structured route organization
- **Session Management**: Express sessions with PostgreSQL storage
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Well-structured relational design supporting users, profiles, projects, posts, and messaging
- **Sessions**: Dedicated session storage table for authentication persistence

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Strategy**: Passport.js with custom OIDC strategy
- **Security**: HTTP-only cookies with secure session management
- **User Management**: Automatic user creation and profile management

### Key Features Architecture

**User Profiles**: Dual profile system supporting both professional and company profiles with separate schemas and validation

**Project Management**: Full CRUD operations for project posting with filtering, search capabilities, and status tracking

**Social Feed**: Post creation, interaction system with likes and comments, and real-time engagement features

**Search & Discovery**: Advanced filtering system for professionals and projects with skill-based matching

**Messaging System**: Foundation laid for direct communication between users (implementation pending)

### Development Workflow
- **Build System**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with error overlay for enhanced debugging
- **Production**: Optimized builds with static asset serving and proper caching strategies
- **Type Safety**: Shared TypeScript schemas between frontend and backend for consistency

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection with WebSocket support
- **drizzle-orm & drizzle-kit**: Type-safe ORM with migration management
- **@tanstack/react-query**: Powerful data synchronization for React applications

### UI and Styling
- **@radix-ui**: Comprehensive set of accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe variant management for components

### Authentication and Security
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware with custom strategies
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Form and Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema declaration and validation

### Development Tools
- **vite**: Next-generation frontend tooling with fast HMR
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution engine for Node.js development