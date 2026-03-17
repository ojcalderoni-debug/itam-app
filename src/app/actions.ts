'use server'

import prisma from '@/lib/prisma'
import { AssetSchema, MaintenanceLogSchema, BulkImportRowSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAsset(formData: FormData) {
    const raw = {
        serial_number: formData.get('serial_number') as string,
        model: formData.get('model') as string,
        type: formData.get('type') as string,
        cpu: formData.get('cpu') as string || undefined,
        ram: formData.get('ram') as string || undefined,
        os: formData.get('os') as string || undefined,
        pcName: formData.get('pcName') as string || undefined,
        userName: formData.get('userName') as string || undefined,
        ipAddress: formData.get('ipAddress') as string || undefined,
        officeVersion: formData.get('officeVersion') as string || undefined,
        windowsLicense: formData.get('windowsLicense') as string || undefined,
        owner: formData.get('owner') as string || undefined,
        status: (formData.get('status') as string) || 'Active',
    }

    const parsed = AssetSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { windowsLicense, ...prismaData } = parsed.data

    let assetId: string | null = null
    try {
        const asset = await prisma.asset.create({ data: prismaData as any })
        assetId = asset.id

        if (windowsLicense !== undefined) {
            await prisma.$executeRaw`UPDATE assets SET "windowsLicense" = ${windowsLicense} WHERE id = ${assetId}`
        }

        revalidatePath('/dashboard')
    } catch (e: unknown) {
        console.error('Error in createAsset:', e)
        if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
            return { error: 'Ya existe un activo con ese número de serie' }
        }
        return { error: 'Error al guardar el activo en la base de datos' }
    }

    if (assetId) {
        redirect(`/assets/${assetId}`)
    }
}

export async function updateAsset(id: string, formData: FormData) {
    const raw = {
        serial_number: formData.get('serial_number') as string,
        model: formData.get('model') as string,
        type: formData.get('type') as string,
        cpu: formData.get('cpu') as string || undefined,
        ram: formData.get('ram') as string || undefined,
        os: formData.get('os') as string || undefined,
        pcName: formData.get('pcName') as string || undefined,
        userName: formData.get('userName') as string || undefined,
        ipAddress: formData.get('ipAddress') as string || undefined,
        officeVersion: formData.get('officeVersion') as string || undefined,
        windowsLicense: formData.get('windowsLicense') as string || undefined,
        owner: formData.get('owner') as string || undefined,
        status: (formData.get('status') as string) || 'Active',
    }

    const parsed = AssetSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { windowsLicense, ...prismaData } = parsed.data

    try {
        await prisma.asset.update({
            where: { id },
            data: prismaData as any
        })

        if (windowsLicense !== undefined) {
            await prisma.$executeRaw`UPDATE assets SET "windowsLicense" = ${windowsLicense} WHERE id = ${id}`
        }

        revalidatePath(`/assets/${id}`)
        revalidatePath('/dashboard')
    } catch (e: unknown) {
        console.error('Error in updateAsset:', e)
        return { error: 'Error al actualizar el activo' }
    }

    redirect(`/assets/${id}`)
}

export async function deleteAsset(id: string) {
    try {
        await prisma.asset.delete({
            where: { id }
        })
        revalidatePath('/dashboard')
    } catch (e: unknown) {
        console.error('Error in deleteAsset:', e)
        return { error: 'Error al eliminar el activo' }
    }

    redirect('/dashboard')
}

export async function addMaintenanceLog(formData: FormData) {
    const raw = {
        asset_id: formData.get('asset_id') as string,
        issue_type: formData.get('issue_type') as string,
        solution_detail: formData.get('solution_detail') as string || undefined,
    }

    const parsed = MaintenanceLogSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    try {
        await prisma.maintenanceLog.create({ data: parsed.data })
        revalidatePath(`/assets/${raw.asset_id}`)
        return { success: true }
    } catch {
        return { error: 'Error al guardar el registro de mantenimiento' }
    }
}

export async function deleteMaintenanceLog(id: string, assetId: string) {
    try {
        await prisma.maintenanceLog.delete({
            where: { id }
        })
        revalidatePath(`/assets/${assetId}`)
        return { success: true }
    } catch (e: unknown) {
        console.error('Error in deleteMaintenanceLog:', e)
        return { error: 'Error al eliminar el registro de mantenimiento' }
    }
}

export async function bulkImportAssets(rows: unknown[]) {
    const validRows = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
        const parsed = BulkImportRowSchema.safeParse(rows[i])
        if (parsed.success) {
            validRows.push({
                serial_number: parsed.data.serial_number,
                model: parsed.data.model,
                type: parsed.data.type,
                cpu: parsed.data.cpu || null,
                ram: parsed.data.ram || null,
                os: parsed.data.os || null,
                pcName: parsed.data.pcName || null,
                userName: parsed.data.userName || null,
                ipAddress: parsed.data.ipAddress || null,
                officeVersion: parsed.data.officeVersion || null,
                owner: parsed.data.owner || null,
                status: parsed.data.status || 'Active',
            })
        } else {
            errors.push(`Fila ${i + 2}: ${parsed.error.issues[0].message}`)
        }
    }

    if (validRows.length === 0) {
        return { error: 'No se encontraron filas válidas', errors }
    }

    try {
        const result = await prisma.asset.createMany({
            data: validRows as any,
            skipDuplicates: true,
        })
        revalidatePath('/dashboard')
        return { success: true, count: result.count, errors }
    } catch {
        return { error: 'Error al importar activos', errors }
    }
}
