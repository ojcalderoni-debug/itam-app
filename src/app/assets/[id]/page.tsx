import prisma from '@/lib/prisma'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { addMaintenanceLog } from '@/app/actions'
import { DeleteAssetButton } from '@/components/DeleteAssetButton'
import { DeleteLogButton } from '@/components/DeleteLogButton'
import { ArrowLeft, Cpu, HardDrive, Monitor, User, Wrench, Clock, Pencil } from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'

const statusColors: Record<string, string> = {
    'Active': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'In Repair': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'Decommissioned': 'bg-red-500/15 text-red-600 dark:text-red-400',
}

const issueColors: Record<string, string> = {
    'Hardware': 'bg-red-500/15 text-red-500',
    'Software': 'bg-blue-500/15 text-blue-500',
    'Upgrade': 'bg-emerald-500/15 text-emerald-500',
    'Maintenance': 'bg-amber-500/15 text-amber-500',
    'Other': 'bg-muted text-muted-foreground',
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
        where: { id },
        include: { maintenance_logs: { orderBy: { date: 'desc' } } },
    })

    if (!asset) notFound()

    // Fetch windowsLicense directly to bypass Prisma client limitations
    const rawData = await prisma.$queryRaw`SELECT "windowsLicense" FROM assets WHERE id = ${id}`
    const windowsLicense = Array.isArray(rawData) && rawData.length > 0 ? (rawData[0] as any).windowsLicense : null

    const addLog = addMaintenanceLog.bind(null)

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{asset.model}</h1>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status] || ''}`}>
                            {asset.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm mt-1">{asset.serial_number}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <Link href={`/assets/${asset.id}/edit`}>
                            <Pencil className="w-4 h-4" />
                            Editar
                        </Link>
                    </Button>
                    <DeleteAssetButton id={asset.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset Details */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Especificaciones</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { icon: Monitor, label: 'Tipo', value: asset.type },
                            { icon: Cpu, label: 'CPU', value: asset.cpu },
                            { icon: HardDrive, label: 'RAM', value: asset.ram },
                            { icon: Monitor, label: 'Sistema Operativo', value: asset.os },
                            { icon: Monitor, label: 'Licencia Windows', value: windowsLicense },
                            { icon: User, label: 'Usuario Asignado', value: asset.owner },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3">
                                <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium">{value || '—'}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Add Maintenance Log Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Registrar Soporte
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={async (fd) => { 'use server'; await addLog(fd); }} className="space-y-4">
                            <input type="hidden" name="asset_id" value={asset.id} />
                            <div className="space-y-2">
                                <Label htmlFor="issue_type">Tipo de Incidencia</Label>
                                <select id="issue_type" name="issue_type" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    {['Hardware', 'Software', 'Upgrade', 'Maintenance', 'Other'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="solution_detail">Descripción / Solución</Label>
                                <textarea id="solution_detail" name="solution_detail" rows={4} placeholder="Describe el problema y la solución aplicada..."
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                            </div>
                            <Button type="submit" className="w-full gap-2">
                                <Wrench className="w-4 h-4" /> Registrar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Maintenance History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Historial de Mantenimiento
                        <span className="ml-auto text-sm font-normal text-muted-foreground">{asset.maintenance_logs.length} registros</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {asset.maintenance_logs.length === 0 ? (
                        <div className="py-10 text-center">
                            <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Sin registros de mantenimiento aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {asset.maintenance_logs.map((log: any) => (
                                <div key={log.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border group relative">
                                    <div className="shrink-0 mt-0.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${issueColors[log.issue_type] || ''}`}>
                                            {log.issue_type}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm">{log.solution_detail || 'Sin descripción'}</p>
                                            <DeleteLogButton id={log.id} assetId={asset.id} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <FormattedDate date={log.date} />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
