import { PrismaClient } from '../generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Initialize database connection
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✓ Prisma connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('✗ Prisma connection error:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;