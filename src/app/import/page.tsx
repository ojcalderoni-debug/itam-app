'use client'

import { useState, useCallback } from 'react'
import { bulkImportAssets } from '@/app/actions'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, DownloadCloud } from 'lucide-react'

const TEMPLATE_HEADERS = 'serial_number,model,type,cpu,ram,os,owner,status'
const TEMPLATE_EXAMPLE = 'SN-001,Dell Latitude 5400,Laptop,Intel Core i5-8250U,8 GB,Windows 10 Pro,Juan García,Active\nSN-002,HP EliteDesk 800,Desktop,Intel Core i7-9700,16 GB,Windows 11 Pro,María López,Active'

type ParsedRow = Record<string, string>

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<ParsedRow[]>([])
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<{ count?: number; errors?: string[] } | null>(null)
    const [dragging, setDragging] = useState(false)

    const processFile = useCallback((f: File) => {
        setFile(f)
        setResult(null)
        Papa.parse<ParsedRow>(f, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setPreview(results.data.slice(0, 5))
                toast.info(`${results.data.length} filas detectadas. Revisa la vista previa.`)
            },
            error: () => toast.error('Error al leer el archivo'),
        })
    }, [])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) processFile(f)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) processFile(f)
    }

    const handleImport = async () => {
        if (!file) return
        setImporting(true)

        Papa.parse<ParsedRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const res = await bulkImportAssets(results.data)
                setImporting(false)
                if (res.error) {
                    toast.error(res.error)
                } else {
                    setResult({ count: res.count, errors: res.errors })
                    toast.success(`${res.count} activos importados correctamente`)
                }
            },
        })
    }

    const downloadTemplate = () => {
        const blob = new Blob([`${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE}`], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'plantilla_activos.csv'; a.click()
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Carga Masiva</h1>
                    <p className="text-muted-foreground mt-1">Importa múltiples activos desde un archivo CSV o TXT</p>
                </div>
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                    <DownloadCloud className="w-4 h-4" /> Plantilla CSV
                </Button>
            </div>

            {/* Drop Zone */}
            <label
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
            >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
                    <Upload className={`w-8 h-8 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="text-center">
                    <p className="font-medium">Arrastra tu archivo CSV/TXT aquí</p>
                    <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
                </div>
                {file && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                        <FileText className="w-4 h-4" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                )}
                <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
            </label>

            {/* Preview Table */}
            {preview.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Vista previa (primeras 5 filas)</CardTitle>
                        <CardDescription>Asegúrate de que las columnas están correctas antes de importar</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border">
                                    {Object.keys(preview[0]).map(h => (<th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className="border-b border-border hover:bg-muted/30">
                                        {Object.values(row).map((val, j) => (<td key={j} className="px-3 py-2 truncate max-w-32">{val || '—'}</td>))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {/* Import Button */}
            {file && (
                <Button onClick={handleImport} disabled={importing} size="lg" className="w-full gap-2">
                    {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Importando...</> : <><Upload className="w-4 h-4" />Importar Activos</>}
                </Button>
            )}

            {/* Result */}
            {result && (
                <Card className={result.count ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'}>
                    <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            <p className="font-medium">{result.count} activos importados exitosamente</p>
                        </div>
                        {result.errors && result.errors.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-amber-500">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-sm font-medium">{result.errors.length} filas con errores omitidas:</p>
                                </div>
                                {result.errors.map((e, i) => <p key={i} className="text-xs text-muted-foreground pl-6">{e}</p>)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
