'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteMaintenanceLog } from '@/app/actions'
import { toast } from 'sonner'

export function DeleteLogButton({ id, assetId }: { id: string; assetId: string }) {
    const [pending, setPending] = useState(false)

    async function handleDelete() {
        if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return

        setPending(true)
        try {
            const result = await deleteMaintenanceLog(id, assetId)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Registro eliminado')
            }
        } catch (error) {
            toast.error('Error al eliminar el registro')
        } finally {
            setPending(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={pending}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    )
}
