import { z } from 'zod'

export const AssetSchema = z.object({
    serial_number: z.string().min(1, 'Serial number is required'),
    model: z.string().min(1, 'Model is required'),
    type: z.enum(['Laptop', 'Desktop', 'Tablet', 'Server', 'Printer', 'Other']),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    os: z.string().optional(),
    pcName: z.string().optional(),
    userName: z.string().optional(),
    ipAddress: z.string().optional(),
    officeVersion: z.string().optional(),
    owner: z.string().optional(),
    status: z.enum(['Active', 'In Repair', 'Decommissioned']).default('Active'),
})

export const MaintenanceLogSchema = z.object({
    asset_id: z.string().uuid(),
    issue_type: z.enum(['Hardware', 'Software', 'Upgrade', 'Maintenance', 'Other']),
    solution_detail: z.string().optional(),
})

export const BulkImportRowSchema = z.object({
    serial_number: z.string().min(1),
    model: z.string().min(1),
    type: z.string().min(1),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    os: z.string().optional(),
    pcName: z.string().optional(),
    userName: z.string().optional(),
    ipAddress: z.string().optional(),
    officeVersion: z.string().optional(),
    owner: z.string().optional(),
    status: z.string().optional(),
})

export type AssetFormData = z.infer<typeof AssetSchema>
export type MaintenanceLogFormData = z.infer<typeof MaintenanceLogSchema>
export type BulkImportRow = z.infer<typeof BulkImportRowSchema>
