import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Monitor, LayoutDashboard, Upload, LogOut, PlusCircle } from 'lucide-react'
import { MobileHeader } from '@/components/MobileHeader'

const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

function DesktopSidebar({ userEmail }: { userEmail?: string }) {
    return (
        <aside className="hidden md:flex w-64 min-h-screen bg-card border-r border-border flex-col shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-border">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                    <Monitor className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm">ITAM</p>
                    <p className="text-xs text-muted-foreground">Gestión de Activos TI</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                    <Link href="/dashboard">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                    <Link href="/assets/new">
                        <PlusCircle className="w-4 h-4" />
                        Nuevo Activo
                    </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                    <Link href="/import">
                        <Upload className="w-4 h-4" />
                        Carga Masiva
                    </Link>
                </Button>
            </nav>

            {/* User info */}
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3 truncate">{userEmail}</p>
                <form action={signOut}>
                    <Button variant="outline" size="sm" className="w-full gap-2 text-destructive hover:text-destructive" type="submit">
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </Button>
                </form>
            </div>
        </aside>
    )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            <MobileHeader userEmail={user?.email} signOutAction={signOut} />
            <DesktopSidebar userEmail={user?.email} />
            <main className="flex-1 w-full min-w-0 overflow-x-auto">
                {children}
            </main>
        </div>
    )
}
