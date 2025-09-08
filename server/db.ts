// Import Prisma configuration
export { prisma, connectDB } from '@shared/db';

// Re-export all types from shared schema for backward compatibility
export * from '@shared/schema';