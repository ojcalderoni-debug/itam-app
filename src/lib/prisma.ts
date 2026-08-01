import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

declare const globalThis: {
    poolGlobal: Pool;
    prismaGlobal: PrismaClient;
} & typeof global;

const pool = globalThis.poolGlobal ?? new Pool({ 
    connectionString,
    max: 1, // Limitar a 1 conexión por instancia serverless (ideal para Vercel)
})

if (process.env.NODE_ENV !== 'production') globalThis.poolGlobal = pool

const prismaClientSingleton = () => {
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export default prisma
