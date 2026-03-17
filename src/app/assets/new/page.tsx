'use client'

import { useState } from 'react'
import { createAsset } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { FileUp, Loader2 } from 'lucide-react'

const ASSET_TYPES = ['Laptop', 'Desktop', 'Tablet', 'Server', 'Printer', 'Other']
const STATUS_OPTIONS = ['Active', 'In Repair', 'Decommissioned']

// removed top-level pdfjs-dist import to avoid DOMMatrix error during SSR

function parseBelarcText(text: string) {
    const extracted: Record<string, string> = {}
    // More aggressive cleanup for better matching
    const cleanText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')
    console.log('--- Analizando texto (primeros 300 caracteres): ---')
    console.log(cleanText.substring(0, 300))

    // OS
    const osMatches = [
        /Operating System\s*\n(.*?)(?:\n|$)/i,
        /Sistema Operativo\s*\n(.*?)(?:\n|$)/i,
        /Windows\s+\d+.*?(?:\n|$)/i,
        /(Windows\s+1[01]\s+\w+)/i
    ]
    for (const re of osMatches) {
        const match = cleanText.match(re)
        const val = match?.[1] || match?.[0]
        if (val) {
            extracted.os = val.trim().substring(0, 100)
            break
        }
    }

    // PC Name
    const pcMatches = [
        /Local Computer Name:\s*(.*?)(?:\(|\n|$)/i,
        /Nombre de la computadora:\s*(.*?)(?:\(|\n|$)/i,
        /Computer Name:\s*(.*?)(?:\(|\n|$)/i
    ]
    for (const re of pcMatches) {
        const match = cleanText.match(re)
        if (match?.[1]) {
            extracted.pcName = match[1].trim().substring(0, 100)
            break
        }
    }

    // User Name
    // User Name
    const userMatches = [
        /(?:Inicio de sesión de Windows|Windows Logon|Current User)\s*[:]?\s*((?:(?!(?:Unidad organizativa|Organizational Unit|Local Computer Name|Logon Server|Dominio|Domain|Roles|Derechos|Perfil|Profile|Active Directory|Sufijo DNS|DNS Suffix)).)+?)(?=\s+(?:Unidad organizativa|Organizational Unit|Local Computer Name|Logon Server|Dominio|Domain|Roles|Derechos|Perfil|Profile|Active Directory|Sufijo DNS|DNS Suffix)|$)/i,
        /Logon Server\s*:?\s*([^\n]+?)(?=\s+(?:Unidad|Current|Domain|Dominio|Roles)|$)/i,
        /(?:Usuario|Logon|Usuario de red)\s*[:]?\s*((?:(?!(?:Unidad|Dominio|Servidor|IP|Dirección|Rol|Módulo|Logon Server)).){1,80})/i
    ]
    for (const re of userMatches) {
        const match = cleanText.match(re)
        if (match?.[1]) {
            extracted.userName = match[1].trim().substring(0, 100)
            break
        }
    }

    // IP Address
    const ipMatches = [
        /primario Dirección IP\s*:?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
        /Primary IP Address\s*:?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
        /primaryAuto IP Address\s*:?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
        /Dirección IP\s*:?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
        /IP\s*Address\s*:?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i,
        /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/
    ]
    for (const re of ipMatches) {
        const match = cleanText.match(re)
        const val = match?.[1] || match?.[0]
        if (val) {
            extracted.ipAddress = val.trim()
            break
        }
    }

    // Model
    const modelMatches = [
        /(?:System Model|Modelo de sistema|Modelo del sistema)\s*[:]?\s*(.+?)(?=\s+(?:System Serial Number|Número de serie|Enclosure|Chasis|Motherboard|Placa|Processor|Procesador|Asset Tag|Etiqueta|Memoria|RAM|$))/i,
        /(?:System Model|Modelo de sistema|Modelo del sistema)\s*[:]?\s*([^]{2,60})/i
    ]
    for (const re of modelMatches) {
        const match = cleanText.match(re)
        const val = match?.[1]
        if (val && val.length > 2) {
            extracted.model = val.replace(/System Model|Modelo de sistema|Modelo del sistema/ig, '').trim().substring(0, 100)
            break
        }
    }

    // ... (Serial Number and CPU parsing skipped for brevity, just updating the relevant block) ...
    // Serial
    const serialMatches = [
        /(?:System Serial Number|Número de serie del sistema|Número de serie)\s*[:]?\s*([A-Za-z0-9\-_]+)/i,
        /Serial Number\s*[:]?\s*([A-Za-z0-9\-_]+)/i,
        /Board Serial Number\s*[:]?\s*([A-Za-z0-9\-_]+)/i,
        /S\/N\s*[:]?\s*([A-Za-z0-9\-_]+)/i
    ]
    for (const re of serialMatches) {
        const match = cleanText.match(re)
        if (match?.[1]) {
            extracted.serial_number = match[1].trim().substring(0, 50)
            break
        }
    }

    // CPU
    const cpuMatches = [
        /(?:Processor[s]?|Procesador)\s*[:]?\s*(.+?)(?=\s+(?:Main Circuit Board|Placa base|Memory|Memoria|Drives|Unidades de|Printers|Impresoras|System Model|Modelo|Local Drive|$))/i,
        /(\d+[\d.,]*\s*(?:gigahertz|megahertz|GHz|MHz)\s+(?:Intel|AMD|Arm).*?)(?=\s+(?:Main|Placa|Memory|Memoria|Drive|Unidad|System|Modelo|$))/i,
        /(Intel\s+Core\s+[^\s]+)/i,
        /(AMD\s+Ryzen\s+[^\s]+)/i
    ]
    for (const re of cpuMatches) {
        const match = cleanText.match(re)
        const val = match?.[1] || match?.[0]
        if (val) {
            extracted.cpu = val.replace(/Processor[s]?|Procesador/ig, '').trim().substring(0, 100)
            break
        }
    }

    // RAM
    const ramMatches = [
        /(?:Memory Modules|Módulos de memoria)\s*.*?(\d+[\d.,]*\s*(?:GB|MB|Gigabytes|Megabytes))/i,
        /(\d+[\d.,]*\s*(?:GB|MB|Gigabytes|Megabytes)\s*(?:Installed\s+Memory|Physical\s+Memory|Memoria\s+física|Usable\s+Installed\s+Memory|Memoria\s+instalada))/i,
        /Physical Memory\s*[:\s]+(\d+[\d.,]*\s*(?:GB|MB|Gigabytes|Megabytes))/i,
        /Memoria\s+física\s*[:\s]+(\d+[\d.,]*\s*(?:GB|MB|Gigabytes|Megabytes))/i
    ]
    for (const re of ramMatches) {
        const match = cleanText.match(re)
        const val = match?.[1] || match?.[0]
        if (val) {
            const lowerVal = val.toLowerCase()
            if (val.toLowerCase().includes('drive') || val.toLowerCase().includes('disk') || val.toLowerCase().includes('disco')) {
                continue
            }
            // Clean up if the match captured the prefix
            let cleanRam = val.replace(/Memory Modules\s*/i, '').replace(/Módulos de memoria\s*/i, '').trim()
            extracted.ram = cleanRam.substring(0, 100)
            break
        }
    }

    // Office
    const officeMatches = [
        /Microsoft - Office Hogar y Empresas 2021.*?(?:Key: [A-Z0-9\-]+|(?:\n|$))/i,
        /Microsoft - Office.*?(?:Key: [A-Z0-9\-]+)/i,
        /Microsoft - Office.*?\n(.*?)(?:\n|$)/i
    ]
    for (const re of officeMatches) {
        const match = cleanText.match(re)
        if (match?.[0]) {
            extracted.officeVersion = match[0].trim().substring(0, 255)
            break
        }
    }

    // Windows License
    const winLicenseMatches = [
        /Microsoft - Windows\s+1[01]\s+(?:Professional|Pro)\s*(?:\(x64\))?.*?(?:Key:\s*([A-Z0-9\-]+))/i,
        /Microsoft - Windows.*?(?:Key:\s*([A-Z0-9\-]+))/i
    ]

    // Look for Windows License string in general if Key is not found
    const winLicenseStringMatches = [
        /Microsoft - Windows\s+1[01]\s+(?:Professional|Pro)\s*(?:\(x64\))?.*/i
    ]

    for (const re of winLicenseMatches) {
        const match = cleanText.match(re)
        if (match?.[1]) { // If we got a direct key match
            extracted.windowsLicense = `Key: ${match[1].trim()}`
            break
        }
    }

    if (!extracted.windowsLicense) {
        for (const re of winLicenseStringMatches) {
            const match = cleanText.match(re)
            if (match?.[0]) {
                // Just grab the whole string, up to 255 chars
                extracted.windowsLicense = match[0].trim().substring(0, 255)
                break
            }
        }
    }

    return extracted
}

export default function NewAssetPage() {
    const [pending, setPending] = useState(false)
    const [pdfParsing, setPdfParsing] = useState(false)
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
        windowsLicense: '',
    })

    const [isDragging, setIsDragging] = useState(false)

    const processPdfFile = async (file: File) => {
        setPdfParsing(true)
        console.log('--- Inicio de Extracción de PDF (Navegador) ---')
        try {
            const arrayBuffer = await file.arrayBuffer()
            console.log('Tamaño del archivo:', file.size, 'ArrayBuffer bytes:', arrayBuffer.byteLength)

            // Import pdfjs-dist dynamically so DOMMatrix is evaluated only in the browser
            const pdfjs = await import('pdfjs-dist')
            
            // Sincronizar versión del worker con la API
            pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

            const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
            const pdfData = await loadingTask.promise
            console.log('PDF cargado exitosamente. Páginas:', pdfData.numPages)

            let fullText = ''
            let totalFragments = 0

            for (let i = 1; i <= pdfData.numPages; i++) {
                const page = await pdfData.getPage(i)
                const textContent = await page.getTextContent()
                totalFragments += textContent.items.length
                console.log(`Página ${i}: ${textContent.items.length} fragmentos encontrados.`)

                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ')
                fullText += pageText + ' \n '
            }

            console.log('Total de fragmentos de texto:', totalFragments)
            console.log('Longitud total extraída:', fullText.trim().length)

            if (totalFragments === 0) {
                toast.error('Este PDF no contiene texto seleccionable. Parece ser una imagen o escaneo.')
                setPdfParsing(false)
                return
            }

            console.log('Snippet (JSON):', JSON.stringify(fullText.substring(0, 200)))

            const extractedFields = parseBelarcText(fullText)
            console.log('Campos detectados:', extractedFields)

            if (Object.keys(extractedFields).length > 0) {
                setFormData(prev => ({ ...prev, ...extractedFields }))
                toast.success('Extracción exitosa. Por favor verifica los datos autocompletados.')
            } else {
                toast.error('No se detectaron campos de Belarc en el texto extraído.')
            }
        } catch (error: any) {
            console.error('Error detallado en el cliente:', error)
            toast.error('Error al procesar el PDF: ' + error.message)
        }
        setPdfParsing(false)
    }

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) await processPdfFile(file)
    }

    const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                await processPdfFile(file)
            } else {
                toast.error('Por favor sube un archivo PDF de Belarc.')
            }
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPending(true)
        const fd = new FormData(e.currentTarget)
        const result = await createAsset(fd)
        if (result?.error) {
            toast.error(result.error)
            setPending(false)
        }
        // On success, the action redirects automatically
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nuevo Activo</h1>
                <p className="text-muted-foreground mt-1">Registra un equipo de forma manual o carga un reporte PDF de Belarc Advisor</p>
            </div>

            {/* PDF Upload Card */}
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-primary" />
                        Extracción automática desde Belarc Advisor
                    </CardTitle>
                    <CardDescription>Sube el reporte PDF de Belarc y los campos se completarán automáticamente</CardDescription>
                </CardHeader>
                <CardContent>
                    <label 
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {pdfParsing ? (
                            <><Loader2 className="w-8 h-8 text-primary animate-spin" /><p className="text-sm text-muted-foreground">Procesando PDF...</p></>
                        ) : (
                            <><FileUp className="w-8 h-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">Haz clic o arrastra aquí el PDF de Belarc</p><p className="text-xs text-muted-foreground">Soporta archivos .pdf</p></>
                        )}
                        <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                    </label>
                </CardContent>
            </Card>

            {/* Manual Form */}
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
                                    onChange={e => setFormData(p => ({ ...p, serial_number: e.target.value }))} placeholder="SN-12345" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Modelo *</Label>
                                <Input id="model" name="model" required value={formData.model}
                                    onChange={e => setFormData(p => ({ ...p, model: e.target.value }))} placeholder="Dell Latitude 5400" />
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
                                    onChange={e => setFormData(p => ({ ...p, cpu: e.target.value }))} placeholder="Intel Core i5-8250U" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ram">RAM</Label>
                                <Input id="ram" name="ram" value={formData.ram}
                                    onChange={e => setFormData(p => ({ ...p, ram: e.target.value }))} placeholder="8 GB" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="os">Sistema Operativo</Label>
                            <Input id="os" name="os" value={formData.os}
                                onChange={e => setFormData(p => ({ ...p, os: e.target.value }))} placeholder="Windows 10 Pro" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pcName">Nombre PC (Local)</Label>
                                <Input id="pcName" name="pcName" value={formData.pcName}
                                    onChange={e => setFormData(p => ({ ...p, pcName: e.target.value }))} placeholder="DESKTOP-ABC123" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ipAddress">Dirección IP</Label>
                                <Input id="ipAddress" name="ipAddress" value={formData.ipAddress}
                                    onChange={e => setFormData(p => ({ ...p, ipAddress: e.target.value }))} placeholder="192.168.1.50" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userName">Usuario (Logon)</Label>
                                <Input id="userName" name="userName" value={formData.userName}
                                    onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))} placeholder="USUARIO-PC\Admin" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner">Usuario Asignado (Responsable)</Label>
                                <Input id="owner" name="owner" value={formData.owner}
                                    onChange={e => setFormData(p => ({ ...p, owner: e.target.value }))} placeholder="Juan García" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="officeVersion">Versión de Office / Licencia</Label>
                            <Input id="officeVersion" name="officeVersion" value={formData.officeVersion}
                                onChange={e => setFormData(p => ({ ...p, officeVersion: e.target.value }))} placeholder="Microsoft Office 2021..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="windowsLicense">Licencia Windows</Label>
                            <Input id="windowsLicense" name="windowsLicense" value={formData.windowsLicense}
                                onChange={e => setFormData(p => ({ ...p, windowsLicense: e.target.value }))} placeholder="Key: XXXX-XXXX..." />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={pending} className="flex-1">
                                {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Guardar Activo'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
