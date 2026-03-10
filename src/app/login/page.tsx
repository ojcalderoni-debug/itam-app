'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Monitor } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Sesión iniciada correctamente')
            router.push('/dashboard')
            router.refresh()
        }
        setLoading(false)
    }

    const handleSignUp = async () => {
        if (!email || !password) { toast.error('Ingresa email y contraseña'); return }
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Cuenta creada. Revisa tu email para confirmar.')
        }
        setLoading(false)
    }

    const handleResetPassword = async () => {
        if (!email) {
            toast.error('Por favor ingresa tu email para recuperar la contraseña')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Correo de recuperación enviado. Revisa tu bandeja de entrada.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
                        <Monitor className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">ITAM</h1>
                    <p className="text-muted-foreground">Sistema de Gestión de Activos TI</p>
                </div>

                <Card className="shadow-xl border-border/50">
                    <CardHeader>
                        <CardTitle>Iniciar Sesión</CardTitle>
                        <CardDescription>Accede al panel de administración</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@empresa.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required={!loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Iniciando...' : 'Ingresar'}
                            </Button>

                            <div className="flex flex-col space-y-2 pt-2">
                                <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                                    Crear cuenta
                                </Button>
                                <Button type="button" variant="link" className="text-xs text-muted-foreground" onClick={handleResetPassword} disabled={loading}>
                                    ¿Olvidaste tu contraseña? Recuperar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
