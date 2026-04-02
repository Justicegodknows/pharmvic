'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FileTextIcon, TrashIcon, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from 'react'

type Document = {
    id: string
    doc_type: string
    file_name: string
    file_url: string
    file_size: number | null
    uploaded_at: string
}

const DOC_TYPES = [
    'NAFDAC Registration',
    'Import Permit',
    'Certificate of Analysis',
    'GMP Certificate',
    'Commercial Invoice',
    'Bill of Lading',
    'Form M',
    'Packing List',
    'Other',
]

export default function DocumentsPage(): ReactElement {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [docType, setDocType] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const fetchDocs = useCallback(async () => {
        const res = await fetch('/api/documents')
        if (res.ok) {
            const data = await res.json() as Document[]
            setDocuments(data)
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
        fetchDocs()
    }, [fetchDocs])

    async function handleUpload(e: FormEvent) {
        e.preventDefault()
        if (!file || !docType) return
        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('doc_type', docType)

        const res = await fetch('/api/documents', {
            method: 'POST',
            body: formData,
        })

        if (res.ok) {
            setFile(null)
            setDocType('')
            await fetchDocs()
        }

        setUploading(false)
    }

    async function handleDelete(id: string) {
        const res = await fetch('/api/documents', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        if (res.ok) {
            setDocuments((prev) => prev.filter((d) => d.id !== id))
        }
    }

    function formatSize(bytes: number | null): string {
        if (!bytes) return '—'
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-foreground">Document Vault</h1>

            {/* Upload form */}
            <Card className="mb-8 p-6">
                <h2 className="mb-4 text-lg font-semibold">Upload Document</h2>
                <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                    </div>
                    <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger className="w-full sm:w-56">
                            <SelectValue placeholder="Document type" />
                        </SelectTrigger>
                        <SelectContent>
                            {DOC_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit" disabled={uploading || !file || !docType}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>
            </Card>

            {/* Document list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <Card className="p-8 text-center">
                    <FileTextIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No documents uploaded yet.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <FileTextIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.doc_type} · {formatSize(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doc.id)}
                                aria-label="Delete document"
                            >
                                <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
