import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card px-8 py-3 flex items-center gap-3">
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                </Button>
            </div>
            {children}
        </div>
    )
}
