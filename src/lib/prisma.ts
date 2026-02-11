// Using in-memory store for demo (Vercel serverless compatible)
// Import/seed data on first load
import { db, seedData } from './db';

// Seed data on module load
seedData().catch(console.error);

export { db as prisma };
