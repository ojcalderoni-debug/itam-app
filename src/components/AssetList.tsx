'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormattedDate } from '@/components/FormattedDate'

const statusColors: Record<string, string> = {
    'Active': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'In Repair': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'Decommissioned': 'bg-red-500/15 text-red-600 dark:text-red-400',
}

interface AssetListProps {
    initialAssets: any[]
}

export function AssetList({ initialAssets }: AssetListProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    const filteredAssets = initialAssets.filter(asset => {
        const matchesSearch = 
            asset.serial_number.toLowerCase().includes(search.toLowerCase()) ||
            asset.model.toLowerCase().includes(search.toLowerCase()) ||
            (asset.owner || '').toLowerCase().includes(search.toLowerCase()) ||
            (asset.userName || '').toLowerCase().includes(search.toLowerCase()) ||
            (asset.pcName || '').toLowerCase().includes(search.toLowerCase())
        
        const matchesStatus = statusFilter === 'All' || asset.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="font-semibold text-lg shrink-0">Inventario de Activos</h2>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por serial, modelo, usuario..."
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">Todos los estados</option>
                        <option value="Active">Activo</option>
                        <option value="In Repair">En Reparación</option>
                        <option value="Decommissioned">Dado de Baja</option>
                    </select>
                    <div className="text-muted-foreground text-sm whitespace-nowrap">
                        <span>{filteredAssets.length} registros</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {filteredAssets.length === 0 ? (
                    <div className="py-20 text-center">
                        <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No se encontraron activos</p>
                        <p className="text-muted-foreground text-sm mt-1">Intenta ajustar tu búsqueda o filtros</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Serial</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Modelo</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Tipo</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Usuario</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Estado</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Fecha</th>
                                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.map((asset: any) => (
                                <tr key={asset.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="px-5 py-3 font-mono text-xs">{asset.serial_number}</td>
                                    <td className="px-5 py-3 font-medium">{asset.model}</td>
                                    <td className="px-5 py-3 text-muted-foreground">{asset.type}</td>
                                    <td className="px-5 py-3 text-muted-foreground">{asset.owner || '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status] || ''}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                        <FormattedDate date={asset.created_at} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/assets/${asset.id}`}>Ver</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
