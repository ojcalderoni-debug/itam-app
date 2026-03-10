import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Upload, Search, Cpu, HardDrive, Monitor } from 'lucide-react'

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
    return prisma.asset.findMany({
        orderBy: { created_at: 'desc' },
        take: 50,
    })
}

const statusColors: Record<string, string> = {
    'Active': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'In Repair': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'Decommissioned': 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export default async function DashboardPage() {
    const [stats, assets] = await Promise.all([getStats(), getAssets()])

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Inventario de activos de tecnología</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/import">
                        <Button variant="outline" className="gap-2">
                            <Upload className="w-4 h-4" /> Importar
                        </Button>
                    </Link>
                    <Link href="/assets/new">
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" /> Nuevo Activo
                        </Button>
                    </Link>
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

            {/* Assets Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Inventario de Activos</h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Search className="w-4 h-4" />
                        <span>{assets.length} registros</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {assets.length === 0 ? (
                        <div className="py-20 text-center">
                            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No hay activos registrados</p>
                            <p className="text-muted-foreground text-sm mt-1">Comienza agregando un nuevo activo o importando desde un archivo</p>
                            <div className="flex gap-3 justify-center mt-6">
                                <Link href="/import"><Button variant="outline" size="sm" className="gap-2"><Upload className="w-4 h-4" />Importar</Button></Link>
                                <Link href="/assets/new"><Button size="sm" className="gap-2"><PlusCircle className="w-4 h-4" />Nuevo Activo</Button></Link>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Serial</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Modelo</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Tipo</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">CPU</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">RAM</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Usuario</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Estado</th>
                                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset: any) => (
                                    <tr key={asset.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs">{asset.serial_number}</td>
                                        <td className="px-5 py-3 font-medium">{asset.model}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{asset.type}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs">{asset.cpu || '—'}</td>
                                        <td className="px-5 py-3 text-muted-foreground text-xs">{asset.ram || '—'}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{asset.owner || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status] || ''}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Link href={`/assets/${asset.id}`}>
                                                <Button variant="ghost" size="sm">Ver</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
