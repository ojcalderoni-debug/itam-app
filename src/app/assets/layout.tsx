import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card px-8 py-3 flex items-center gap-3">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Button>
                </Link>
            </div>
            {children}
        </div>
    )
}
