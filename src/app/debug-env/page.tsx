import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function DebugEnvPage() {
    // Forzamos que se cargue como servidor
    await cookies()
    
    const envKeys = Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('URL') || 
        key.includes('SUPABASE') || 
        key.includes('NEXT_PUBLIC')
    )

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>Diagnóstico de Variables (Producción)</h1>
            <p>Estado de las variables en el servidor de Vercel:</p>
            <ul style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                {envKeys.map(key => (
                    <li key={key} style={{ marginBottom: '10px' }}>
                        <strong>{key}:</strong> {process.env[key] ? '✅ CARGADA (Tiene valor)' : '❌ VACÍA'}
                    </li>
                ))}
            </ul>
            <p>Si DATABASE_URL sale como ❌ VACÍA, Vercel no está inyectando la variable a pesar de estar en el panel. </p>
            <p>Total de variables detectadas: {Object.keys(process.env).length}</p>
        </div>
    )
}
