'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, X, Check, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'

const EXPORT_FIELDS = [
    { key: 'serial_number', label: 'Serial', defaultChecked: true },
    { key: 'model', label: 'Modelo', defaultChecked: true },
    { key: 'type', label: 'Tipo', defaultChecked: true },
    { key: 'cpu', label: 'CPU', defaultChecked: true },
    { key: 'ram', label: 'RAM', defaultChecked: true },
    { key: 'os', label: 'Sistema Operativo', defaultChecked: true },
    { key: 'pcName', label: 'Nombre PC (Local)', defaultChecked: true },
    { key: 'userName', label: 'Usuario (Logon)', defaultChecked: true },
    { key: 'ipAddress', label: 'Dirección IP', defaultChecked: true },
    { key: 'officeVersion', label: 'Versión Office', defaultChecked: true },
    { key: 'windowsLicense', label: 'Licencia Windows', defaultChecked: true },
    { key: 'owner', label: 'Usuario Asignado', defaultChecked: true },
    { key: 'status', label: 'Estado', defaultChecked: true },
    { key: 'created_at', label: 'Fecha de Registro', defaultChecked: true },
]

export function ExportModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFields, setSelectedFields] = useState<Set<string>>(
        new Set(EXPORT_FIELDS.map(f => f.key))
    )
    const [isExporting, setIsExporting] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            setIsOpen(false)
        }
    }

    const toggleField = (key: string) => {
        setSelectedFields(prev => {
            const next = new Set(prev)
            if (next.has(key)) {
                next.delete(key)
            } else {
                next.add(key)
            }
            return next
        })
    }

    const selectAll = () => {
        setSelectedFields(new Set(EXPORT_FIELDS.map(f => f.key)))
    }

    const selectNone = () => {
        setSelectedFields(new Set())
    }

    const handleExport = async () => {
        if (selectedFields.size === 0) return

        setIsExporting(true)
        try {
            const fieldsParam = Array.from(selectedFields).join(',')
            const url = `/api/export-excel?fields=${fieldsParam}`

            const response = await fetch(url)
            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = 'inventario_activos.xlsx'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(downloadUrl)

            setIsOpen(false)
        } catch (error) {
            console.error('Export error:', error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <>
            <Button
                id="export-excel-button"
                variant="outline"
                className="gap-2"
                onClick={() => setIsOpen(true)}
            >
                <Download className="w-4 h-4" /> Exportar Excel
            </Button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleBackdropClick}
                    style={{ animation: 'fadeIn 0.15s ease-out' }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div
                        ref={modalRef}
                        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        style={{ animation: 'slideUp 0.2s ease-out' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Exportar a Excel</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona los campos a incluir
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 px-6 pt-4">
                            <button
                                onClick={selectAll}
                                className="text-xs font-medium text-primary hover:underline transition-colors"
                            >
                                Seleccionar todos
                            </button>
                            <span className="text-muted-foreground text-xs">·</span>
                            <button
                                onClick={selectNone}
                                className="text-xs font-medium text-primary hover:underline transition-colors"
                            >
                                Deseleccionar todos
                            </button>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {selectedFields.size} de {EXPORT_FIELDS.length} campos
                            </span>
                        </div>

                        {/* Field Checkboxes */}
                        <div className="p-6 pt-3 max-h-[50vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {EXPORT_FIELDS.map((field) => {
                                    const isChecked = selectedFields.has(field.key)
                                    return (
                                        <label
                                            key={field.key}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                                                transition-all duration-150 select-none
                                                ${isChecked
                                                    ? 'bg-primary/5 border border-primary/20'
                                                    : 'bg-muted/30 border border-transparent hover:bg-muted/60'
                                                }
                                            `}
                                        >
                                            <div
                                                className={`
                                                    flex items-center justify-center w-5 h-5 rounded-md
                                                    transition-all duration-150 shrink-0
                                                    ${isChecked
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border-2 border-muted-foreground/30'
                                                    }
                                                `}
                                            >
                                                {isChecked && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className="text-sm font-medium truncate">
                                                {field.label}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleExport}
                                disabled={selectedFields.size === 0 || isExporting}
                                className="gap-2 min-w-[160px]"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Descargar Excel
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    )
}
