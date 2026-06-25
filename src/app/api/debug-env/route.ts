import { NextResponse } from 'next/server'

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || 'NO DEFINIDA'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO DEFINIDA'
    
    // Ocultar contraseña para seguridad
    const safDbUrl = dbUrl.replace(/:([^:@]+)@/, ':***@')
    
    return NextResponse.json({
        DATABASE_URL: safDbUrl,
        SUPABASE_URL: supabaseUrl,
        NODE_ENV: process.env.NODE_ENV,
    })
}
