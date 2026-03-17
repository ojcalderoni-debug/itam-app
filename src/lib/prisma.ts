import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL

    if (connectionString) {
        const pool = new Pool({ 
            connectionString,
            ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : false
        })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }

    // Fallback if DATABASE_URL is missing (helpful during build-time static discovery)
    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
