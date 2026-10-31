'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Monitor, LayoutDashboard, PlusCircle, Upload, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
    userEmail?: string
    signOutAction: () => Promise<void>
}

export function MobileHeader({ userEmail, signOutAction }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border shadow-xs">
            <div className="flex items-center justify-between px-4 py-3">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                        <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-sm tracking-tight">ITAM</span>
                        <span className="text-[10px] text-muted-foreground block -mt-0.5">Gestión de Activos TI</span>
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Abrir menú"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-border bg-card space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="space-y-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            asChild
                            onClick={() => setIsOpen(false)}
                        >
                            <Link href="/dashboard">
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            asChild
                            onClick={() => setIsOpen(false)}
                        >
                            <Link href="/assets/new">
                                <PlusCircle className="w-4 h-4" />
                                Nuevo Activo
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            asChild
                            onClick={() => setIsOpen(false)}
                        >
                            <Link href="/import">
                                <Upload className="w-4 h-4" />
                                Carga Masiva
                            </Link>
                        </Button>
                    </nav>

                    <div className="pt-3 border-t border-border">
                        {userEmail && (
                            <p className="text-xs text-muted-foreground mb-2 truncate">
                                {userEmail}
                            </p>
                        )}
                        <form action={signOutAction}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 text-destructive hover:text-destructive"
                                type="submit"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar sesión
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

