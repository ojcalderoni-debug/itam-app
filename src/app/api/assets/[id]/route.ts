import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const asset = await prisma.asset.findUnique({
            where: { id }
        })
        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
        }

        // Fetch windowsLicense directly to bypass Prisma client limitations
        const rawData = await prisma.$queryRaw`SELECT "windowsLicense" FROM assets WHERE id = ${id}`
        const windowsLicense = Array.isArray(rawData) && rawData.length > 0 ? (rawData[0] as any).windowsLicense : null

        return NextResponse.json({ ...asset, windowsLicense })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
