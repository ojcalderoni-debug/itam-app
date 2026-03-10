import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
        return NextResponse.json(asset)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
