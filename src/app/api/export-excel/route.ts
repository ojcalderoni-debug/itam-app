import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

// All available fields for export
const FIELD_DEFINITIONS: Record<string, { label: string; getValue: (asset: any) => string | number }> = {
    serial_number: { label: 'Serial', getValue: (a) => a.serial_number || '' },
    model: { label: 'Modelo', getValue: (a) => a.model || '' },
    type: { label: 'Tipo', getValue: (a) => a.type || '' },
    cpu: { label: 'CPU', getValue: (a) => a.cpu || '' },
    ram: { label: 'RAM', getValue: (a) => a.ram || '' },
    os: { label: 'Sistema Operativo', getValue: (a) => a.os || '' },
    pcName: { label: 'Nombre PC (Local)', getValue: (a) => a.pcName || '' },
    userName: { label: 'Usuario (Logon)', getValue: (a) => a.userName || '' },
    ipAddress: { label: 'Dirección IP', getValue: (a) => a.ipAddress || '' },
    officeVersion: { label: 'Versión Office', getValue: (a) => a.officeVersion || '' },
    windowsLicense: { label: 'Licencia Windows', getValue: (a) => a.windowsLicense || '' },
    owner: { label: 'Usuario Asignado', getValue: (a) => a.owner || '' },
    status: { label: 'Estado', getValue: (a) => a.status || 'Active' },
    created_at: { label: 'Fecha de Registro', getValue: (a) => a.created_at ? new Date(a.created_at).toLocaleDateString('es-CO') : '' },
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get selected fields from query params (default: all fields)
        const { searchParams } = new URL(request.url)
        const fieldsParam = searchParams.get('fields')
        const allFieldKeys = Object.keys(FIELD_DEFINITIONS)
        const selectedFields = fieldsParam
            ? fieldsParam.split(',').filter(f => allFieldKeys.includes(f))
            : allFieldKeys

        if (selectedFields.length === 0) {
            return new NextResponse('No valid fields selected', { status: 400 })
        }

        const query = await prisma.$queryRaw<any[]>`SELECT * FROM assets ORDER BY created_at DESC`

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'ITAM - Gestión de Activos TI'
        workbook.created = new Date()

        const worksheet = workbook.addWorksheet('Inventario de Activos', {
            properties: { defaultRowHeight: 22 },
            views: [{ state: 'frozen', ySplit: 1 }],
        })

        // Define columns based on selected fields
        worksheet.columns = selectedFields.map(key => ({
            header: FIELD_DEFINITIONS[key].label,
            key,
            width: Math.max(FIELD_DEFINITIONS[key].label.length + 4, 15),
        }))

        // Style header row
        const headerRow = worksheet.getRow(1)
        headerRow.height = 28
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E3A5F' },
            }
            cell.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' },
                size: 11,
                name: 'Calibri',
            }
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
            }
            cell.border = {
                bottom: { style: 'medium', color: { argb: 'FF0D2137' } },
            }
        })

        // Add data rows
        query.forEach((asset, index) => {
            const rowData: Record<string, string | number> = {}
            selectedFields.forEach(key => {
                rowData[key] = FIELD_DEFINITIONS[key].getValue(asset)
            })
            const row = worksheet.addRow(rowData)

            // Alternate row colors
            const fillColor = index % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF'
            row.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor },
                }
                cell.font = { size: 10, name: 'Calibri' }
                cell.alignment = { vertical: 'middle' }
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                }
            })
        })

        // Auto-fit columns based on content
        worksheet.columns.forEach(column => {
            if (!column || !column.eachCell) return
            let maxLength = (column.header as string)?.length || 10
            column.eachCell({ includeEmpty: false }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : ''
                maxLength = Math.max(maxLength, cellValue.length)
            })
            column.width = Math.min(maxLength + 4, 50)
        })

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="inventario_activos.xlsx"',
            },
        })
    } catch (error) {
        console.error('Error generating Excel:', error)
        return new NextResponse('Error generating Excel', { status: 500 })
    }
}
