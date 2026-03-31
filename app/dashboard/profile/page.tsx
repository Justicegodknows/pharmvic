'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from 'react'

type SupplierProfile = {
    id: string
    company_name: string
    description: string | null
    address: string | null
    website: string | null
    founded_year: number | null
    export_markets: string[]
    certifications: string[]
    verified: boolean
}

export default function SupplierProfilePage(): ReactElement {
    const [profile, setProfile] = useState<SupplierProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form state
    const [companyName, setCompanyName] = useState('')
    const [description, setDescription] = useState('')
    const [address, setAddress] = useState('')
    const [website, setWebsite] = useState('')
    const [foundedYear, setFoundedYear] = useState('')
    const [exportMarkets, setExportMarkets] = useState('')
    const [certifications, setCertifications] = useState('')

    const fetchProfile = useCallback(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('suppliers')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (data) {
            setProfile(data)
            setCompanyName(data.company_name)
            setDescription(data.description ?? '')
            setAddress(data.address ?? '')
            setWebsite(data.website ?? '')
            setFoundedYear(data.founded_year?.toString() ?? '')
            setExportMarkets(data.export_markets.join(', '))
            setCertifications(data.certifications.join(', '))
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
        fetchProfile()
    }, [fetchProfile])

    async function handleSave(e: FormEvent) {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const updates = {
            company_name: companyName,
            description: description || null,
            address: address || null,
            website: website || null,
            founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
            export_markets: exportMarkets.split(',').map((s) => s.trim()).filter(Boolean),
            certifications: certifications.split(',').map((s) => s.trim()).filter(Boolean),
        }

        if (profile) {
            await supabase.from('suppliers').update(updates).eq('id', profile.id)
        } else {
            await supabase.from('suppliers').insert({ ...updates, user_id: user.id })
        }

        setSuccess(true)
        setSaving(false)
        await fetchProfile()
    }

    if (loading) {
        return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-foreground">Company Profile</h1>

            <Card className="p-6">
                <form onSubmit={handleSave} className="space-y-4">
                    {success && (
                        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                            Profile saved successfully!
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Address</label>
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Website</label>
                            <Input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder="https://" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Founded Year</label>
                        <Input value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} type="number" min={1800} max={2026} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Export Markets (comma-separated)</label>
                        <Input value={exportMarkets} onChange={(e) => setExportMarkets(e.target.value)} placeholder="Nigeria, Ghana, Kenya" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Certifications (comma-separated)</label>
                        <Input value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="GMP, WHO-GMP, ISO 9001" />
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
