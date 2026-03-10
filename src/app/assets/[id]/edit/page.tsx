'use client'

import { useState, useEffect, use } from 'react'
import { updateAsset } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ASSET_TYPES = ['Laptop', 'Desktop', 'Tablet', 'Server', 'Printer', 'Other']
const STATUS_OPTIONS = ['Active', 'In Repair', 'Decommissioned']

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [pending, setPending] = useState(false)
    const [formData, setFormData] = useState({
        serial_number: '',
        model: '',
        type: 'Laptop',
        cpu: '',
        ram: '',
        os: '',
        owner: '',
        status: 'Active',
        pcName: '',
        userName: '',
        ipAddress: '',
        officeVersion: '',
    })

    useEffect(() => {
        async function fetchAsset() {
            try {
                const res = await fetch(`/api/assets/${id}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setFormData({
                    serial_number: data.serial_number || '',
                    model: data.model || '',
                    type: data.type || 'Laptop',
                    cpu: data.cpu || '',
                    ram: data.ram || '',
                    os: data.os || '',
                    owner: data.owner || '',
                    status: data.status || 'Active',
                    pcName: data.pcName || '',
                    userName: data.userName || '',
                    ipAddress: data.ipAddress || '',
                    officeVersion: data.officeVersion || '',
                })
            } catch (err) {
                toast.error('Error al cargar los datos del activo')
                router.push('/dashboard')
            } finally {
                setLoading(false)
            }
        }
        fetchAsset()
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPending(true)
        const fd = new FormData(e.currentTarget)
        const result = await updateAsset(id, fd)
        if (result?.error) {
            toast.error(result.error)
            setPending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/assets/${id}`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Activo</h1>
                    <p className="text-muted-foreground mt-1">Modifica la información del equipo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información del Equipo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">Número de Serie *</Label>
                                <Input id="serial_number" name="serial_number" required value={formData.serial_number}
                                    onChange={e => setFormData(p => ({ ...p, serial_number: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Modelo *</Label>
                                <Input id="model" name="model" required value={formData.model}
                                    onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <select id="type" name="type" value={formData.type}
                                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <select id="status" name="status" value={formData.status}
                                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cpu">CPU</Label>
                                <Input id="cpu" name="cpu" value={formData.cpu}
                                    onChange={e => setFormData(p => ({ ...p, cpu: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ram">RAM</Label>
                                <Input id="ram" name="ram" value={formData.ram}
                                    onChange={e => setFormData(p => ({ ...p, ram: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="os">Sistema Operativo</Label>
                            <Input id="os" name="os" value={formData.os}
                                onChange={e => setFormData(p => ({ ...p, os: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pcName">Nombre PC (Local)</Label>
                                <Input id="pcName" name="pcName" value={formData.pcName}
                                    onChange={e => setFormData(p => ({ ...p, pcName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ipAddress">Dirección IP</Label>
                                <Input id="ipAddress" name="ipAddress" value={formData.ipAddress}
                                    onChange={e => setFormData(p => ({ ...p, ipAddress: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userName">Usuario (Logon)</Label>
                                <Input id="userName" name="userName" value={formData.userName}
                                    onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner">Usuario Asignado (Responsable)</Label>
                                <Input id="owner" name="owner" value={formData.owner}
                                    onChange={e => setFormData(p => ({ ...p, owner: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="officeVersion">Versión de Office / Licencia</Label>
                            <Input id="officeVersion" name="officeVersion" value={formData.officeVersion}
                                onChange={e => setFormData(p => ({ ...p, officeVersion: e.target.value }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={pending} className="flex-1 gap-2">
                                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {pending ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
