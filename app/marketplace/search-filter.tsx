'use client'

import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SearchIcon, XIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, type FormEvent, type ReactElement } from 'react'

const CATEGORIES = [
    'All Categories',
    'Antibiotics',
    'Cardiovascular',
    'Analgesics',
    'Anti-inflammatories',
    'Biologics',
    'Vaccines',
    'Oncology',
    'Diagnostics',
    'Medical Devices',
    'APIs',
]

const CERTIFICATIONS = [
    'All Certifications',
    'GMP',
    'WHO-GMP',
    'ISO 9001',
    'CE Mark',
    'EU GMP',
    'PEI Approved',
]

export function SearchFilter(): ReactElement {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get('q') ?? '')
    const [category, setCategory] = useState(searchParams.get('category') ?? '')
    const [certification, setCertification] = useState(searchParams.get('cert') ?? '')

    const applyFilters = useCallback(
        (e?: FormEvent) => {
            e?.preventDefault()
            const params = new URLSearchParams()
            if (search) params.set('q', search)
            if (category && category !== 'All Categories') params.set('category', category)
            if (certification && certification !== 'All Certifications') params.set('cert', certification)
            router.push(`/marketplace?${params.toString()}`)
        },
        [search, category, certification, router]
    )

    const clearFilters = useCallback(() => {
        setSearch('')
        setCategory('')
        setCertification('')
        router.push('/marketplace')
    }, [router])

    const hasFilters = search || (category && category !== 'All Categories') || (certification && certification !== 'All Certifications')

    return (
        <form onSubmit={applyFilters} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search suppliers or products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v); }}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={certification} onValueChange={(v) => { setCertification(v); }}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Certification" />
                </SelectTrigger>
                <SelectContent>
                    {CERTIFICATIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button type="submit" size="default">
                Search
            </Button>
            {hasFilters && (
                <Button type="button" variant="ghost" size="icon" onClick={clearFilters} aria-label="Clear filters">
                    <XIcon className="h-4 w-4" />
                </Button>
            )}
        </form>
    )
}
