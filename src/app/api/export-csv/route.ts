import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const query = await prisma.$queryRaw<any[]>`SELECT * FROM assets ORDER BY created_at DESC`

        const data = query.map(asset => ({
            'Serial': asset.serial_number || '',
            'Modelo': asset.model || '',
            'Tipo': asset.type || '',
            'CPU': asset.cpu || '',
            'RAM': asset.ram || '',
            'Sistema Operativo': asset.os || '',
            'Nombre PC (Local)': asset.pcName || '',
            'Usuario (Logon)': asset.userName || '',
            'Dirección IP': asset.ipAddress || '',
            'Versión Office': asset.officeVersion || '',
            'Licencia Windows': asset.windowsLicense || '',
            'Usuario Asignado': asset.owner || '',
            'Estado': asset.status || 'Active',
            'Fecha de Registro': asset.created_at ? new Date(asset.created_at).toLocaleDateString('es-CO') : ''
        }))

        // Add UTF-8 BOM so Excel opens it correctly with accents
        const csv = '\uFEFF' + Papa.unparse(data)

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="inventario_activos.csv"'
            }
        })
    } catch (error) {
        console.error('Error generating CSV:', error)
        return new NextResponse('Error generating CSV', { status: 500 })
    }
}
