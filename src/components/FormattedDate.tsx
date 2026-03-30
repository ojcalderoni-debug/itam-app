'use client'

import { useEffect, useState } from 'react'

interface FormattedDateProps {
    date: Date | string
    className?: string
}

export function FormattedDate({ date, className }: FormattedDateProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (!mounted) {
        // Return a placeholder with the same structure to avoid hydration mismatch
        // We can't really guess the client's locale on the server reliably
        return <span className={className}>...</span>
    }

    return (
        <span className={className}>
            {dateObj.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/Bogota'
            })}
        </span>
    )
}
