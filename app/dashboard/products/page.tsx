'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { PackageIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from 'react'

type Product = {
    id: string
    name: string
    description: string | null
    hs_code: string | null
    category: string
    min_order_qty: number | null
    unit: string | null
    certifications: string[]
}

const CATEGORIES = [
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
    'Other',
]

export default function ProductsPage(): ReactElement {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form fields
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [hsCode, setHsCode] = useState('')
    const [category, setCategory] = useState('')
    const [moq, setMoq] = useState('')
    const [unit, setUnit] = useState('units')
    const [certs, setCerts] = useState('')

    const fetchProducts = useCallback(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: supplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (supplier) {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('supplier_id', supplier.id)
                .order('name')
            setProducts(data ?? [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
        fetchProducts()
    }, [fetchProducts])

    async function handleAdd(e: FormEvent) {
        e.preventDefault()
        setSaving(true)

        const res = await fetch('/api/suppliers/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description: description || undefined,
                hs_code: hsCode || undefined,
                category,
                min_order_qty: moq ? parseInt(moq, 10) : undefined,
                unit,
                certifications: certs.split(',').map((s) => s.trim()).filter(Boolean),
            }),
        })

        if (res.ok) {
            setName('')
            setDescription('')
            setHsCode('')
            setCategory('')
            setMoq('')
            setCerts('')
            setShowForm(false)
            await fetchProducts()
        }
        setSaving(false)
    }

    async function handleDelete(id: string) {
        const supabase = createClient()
        await supabase.from('products').delete().eq('id', id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Products</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8 p-6">
                    <h2 className="mb-4 text-lg font-semibold">New Product</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">HS Code</label>
                                <Input value={hsCode} onChange={(e) => setHsCode(e.target.value)} placeholder="e.g., 3004.10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Order Qty</label>
                                <Input value={moq} onChange={(e) => setMoq(e.target.value)} type="number" min={1} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Unit</label>
                                <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Certifications (comma-separated)</label>
                            <Input value={certs} onChange={(e) => setCerts(e.target.value)} placeholder="GMP, WHO-GMP" />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Product'}</Button>
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
                </div>
            ) : products.length === 0 ? (
                <Card className="p-8 text-center">
                    <PackageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No products yet. Add your first product above.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {products.map((product) => (
                        <Card key={product.id} className="flex items-start justify-between p-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-foreground">{product.name}</h3>
                                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                    {product.hs_code && <Badge variant="outline" className="text-xs">HS: {product.hs_code}</Badge>}
                                </div>
                                {product.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                                )}
                                {product.certifications.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {product.certifications.map((c) => (
                                            <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} aria-label="Delete product">
                                <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
