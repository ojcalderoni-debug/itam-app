import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Upload, Monitor, Download, Cpu, HardDrive } from 'lucide-react'
import { AssetList } from '@/components/AssetList'

async function getStats() {
    const [total, active, inRepair, decommissioned] = await Promise.all([
        prisma.asset.count(),
        prisma.asset.count({ where: { status: 'Active' } }),
        prisma.asset.count({ where: { status: 'In Repair' } }),
        prisma.asset.count({ where: { status: 'Decommissioned' } }),
    ])
    return { total, active, inRepair, decommissioned }
}

async function getAssets() {
    // We can increase the take limit since we now have client-side filtering/search
    return prisma.asset.findMany({
        orderBy: { created_at: 'desc' },
        take: 200, 
    })
}

export default async function DashboardPage() {
    let stats = { total: 0, active: 0, inRepair: 0, decommissioned: 0 }
    let assets: any[] = []
    let error: string | null = null

    try {
        const [statsData, assetsData] = await Promise.all([getStats(), getAssets()])
        stats = statsData
        assets = assetsData
    } catch (e: any) {
        console.error('Database connection error:', e)
        error = 'No se pudo conectar a la base de datos de activos.'
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl text-center">
                    <Monitor className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-destructive font-bold text-xl mb-2">Error de Conexión</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button variant="outline" className="mt-6" asChild>
                        <Link href="/dashboard">Reintentar</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Inventario de activos de tecnología</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="gap-2" asChild>
                        <a href="/api/export-csv" download="inventario_activos.csv">
                            <Download className="w-4 h-4" /> Exportar CSV
                        </a>
                    </Button>
                    <Button variant="outline" className="gap-2" asChild>
                        <Link href="/import">
                            <Upload className="w-4 h-4" /> Importar
                        </Link>
                    </Button>
                    <Button className="gap-2" asChild>
                        <Link href="/assets/new">
                            <PlusCircle className="w-4 h-4" /> Nuevo Activo
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Activos', value: stats.total, icon: Monitor, color: 'text-blue-500' },
                    { label: 'Activos', value: stats.active, icon: Monitor, color: 'text-emerald-500' },
                    { label: 'En Reparación', value: stats.inRepair, icon: Cpu, color: 'text-amber-500' },
                    { label: 'Dados de Baja', value: stats.decommissioned, icon: HardDrive, color: 'text-red-500' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Assets Table (with client-side filtering) */}
            <AssetList initialAssets={assets} />
        </div>
    )
}
