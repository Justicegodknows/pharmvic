'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useState, type FormEvent, type ReactElement } from 'react'

type InquiryFormProps = {
    supplierId: string
    supplierName: string
}

export function InquiryForm({ supplierId, supplierName }: InquiryFormProps): ReactElement {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'login'>('idle')

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        setStatus('idle')

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setStatus('login')
            setLoading(false)
            return
        }

        // Get vendor record
        const { data: vendor } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!vendor) {
            setStatus('error')
            setLoading(false)
            return
        }

        const { error } = await supabase.from('inquiries').insert({
            vendor_id: vendor.id,
            supplier_id: supplierId,
            subject,
            message,
        })

        if (error) {
            setStatus('error')
        } else {
            setStatus('success')
            setSubject('')
            setMessage('')
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'success' && (
                <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                    Inquiry sent to {supplierName}! They will respond soon.
                </div>
            )}
            {status === 'error' && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Failed to send inquiry. Make sure you have a vendor account.
                </div>
            )}
            {status === 'login' && (
                <div className="rounded-md bg-accent/50 p-3 text-sm text-accent-foreground">
                    Please <a href="/auth/login" className="font-medium underline">sign in</a> to send an inquiry.
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                    id="subject"
                    placeholder="e.g., Amoxicillin bulk order inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                    id="message"
                    placeholder="Describe what you're looking for, quantities, timeline..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Inquiry'}
            </Button>
        </form>
    )
}
