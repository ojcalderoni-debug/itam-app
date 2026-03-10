'use client'

import { useState } from 'react'
import { deleteAsset } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteAssetButton({ id }: { id: string }) {
    const [pending, setPending] = useState(false)

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción no se puede deshacer.')) {
            return
        }

        setPending(true)
        const result = await deleteAsset(id)
        if (result?.error) {
            toast.error(result.error)
            setPending(false)
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={pending}
            onClick={handleDelete}
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar
        </Button>
    )
}
