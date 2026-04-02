'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2Icon, CircleIcon } from 'lucide-react'
import { useCallback, useState, type ReactElement } from 'react'

type ChecklistItem = {
    id: string
    label: string
    description: string
    completed: boolean
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
    {
        id: 'nafdac-reg',
        label: 'NAFDAC Product Registration',
        description: 'Register the pharmaceutical product with NAFDAC for import approval.',
        completed: false,
    },
    {
        id: 'import-permit',
        label: 'Obtain Import Permit',
        description: 'Apply for and receive NAFDAC import permit for the specific products.',
        completed: false,
    },
    {
        id: 'form-m',
        label: 'Complete Form M',
        description: 'File Form M with your bank for foreign exchange allocation (Central Bank of Nigeria).',
        completed: false,
    },
    {
        id: 'pre-shipment',
        label: 'Pre-Shipment Inspection',
        description: 'Arrange SONCAP or relevant pre-shipment inspection for the cargo.',
        completed: false,
    },
    {
        id: 'coa',
        label: 'Certificate of Analysis (CoA)',
        description: 'Obtain CoA from the German manufacturer for each product batch.',
        completed: false,
    },
    {
        id: 'gmp-cert',
        label: 'GMP / WHO-GMP Certificate',
        description: 'Confirm the supplier holds a valid GMP or WHO-GMP certificate.',
        completed: false,
    },
    {
        id: 'commercial-invoice',
        label: 'Commercial Invoice',
        description: 'Get a detailed commercial invoice with HS codes, quantities, and pricing.',
        completed: false,
    },
    {
        id: 'packing-list',
        label: 'Packing List',
        description: 'Obtain a detailed packing list matching the commercial invoice.',
        completed: false,
    },
    {
        id: 'bill-of-lading',
        label: 'Bill of Lading / Airway Bill',
        description: 'Secure shipping documentation from the freight forwarder.',
        completed: false,
    },
    {
        id: 'customs-declaration',
        label: 'Nigerian Customs Declaration',
        description: 'File the Single Goods Declaration (SGD) with Nigerian Customs Service.',
        completed: false,
    },
    {
        id: 'duty-payment',
        label: 'Pay Import Duties & Tariffs',
        description: 'Calculate and pay applicable customs duties based on HS codes.',
        completed: false,
    },
    {
        id: 'nafdac-clearance',
        label: 'NAFDAC Port Clearance',
        description: 'Obtain NAFDAC clearance at the port of entry for the pharmaceutical cargo.',
        completed: false,
    },
]

export default function ChecklistPage(): ReactElement {
    const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST)

    const toggle = useCallback((id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        )
    }, [])

    const completedCount = items.filter((i) => i.completed).length
    const progress = Math.round((completedCount / items.length) * 100)

    return (
        <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
                Regulatory Import Checklist
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Track your progress through the Nigerian pharmaceutical import process.
            </p>

            {/* Progress */}
            <Card className="mb-8 p-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                        {completedCount} of {items.length} steps completed
                    </span>
                    <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </Card>

            {/* Checklist */}
            <div className="space-y-3">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                        onClick={() => toggle(item.id)}
                    >
                        {item.completed ? (
                            <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        ) : (
                            <CircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                        <div>
                            <p className={`text-sm font-medium ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {item.label}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
                This checklist is for general guidance only. Consult a licensed customs broker or
                regulatory consultant for advice specific to your import transaction.
            </p>
        </div>
    )
}
