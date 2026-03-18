import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
  adapter: PrismaPg | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

if (!globalForPrisma.adapter) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool as any);
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: globalForPrisma.adapter,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
