import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL

    if (connectionString) {
        // Direct connection is more stable on Vercel
        return new PrismaClient({
            datasourceUrl: connectionString
        } as any)
    }

    // Fallback for build-time
    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
