'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquareIcon, XIcon, SendIcon, MinimizeIcon } from 'lucide-react'
import { useState, useRef, type FormEvent, type KeyboardEvent, type ReactElement } from 'react'

const transport = new DefaultChatTransport({
    api: '/api/agent/chat',
})

export function ChatWidget(): ReactElement {
    const [open, setOpen] = useState(false)
    const { messages, sendMessage, status } = useChat({ transport })
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)
    const isLoading = status !== 'ready'

    function handleSubmit(e?: FormEvent) {
        e?.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage({ text: input })
        setInput('')
        setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
        }, 100)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
                aria-label="Open PharmAgent chat"
            >
                <MessageSquareIcon className="h-6 w-6" />
            </button>
        )
    }

    return (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
                <div className="flex items-center gap-2">
                    <MessageSquareIcon className="h-4 w-4 text-primary-foreground" />
                    <span className="text-sm font-semibold text-primary-foreground">PharmAgent</span>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setOpen(false)} className="rounded p-1 text-primary-foreground/80 hover:text-primary-foreground" aria-label="Minimize">
                        <MinimizeIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setOpen(false)} className="rounded p-1 text-primary-foreground/80 hover:text-primary-foreground" aria-label="Close">
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <MessageSquareIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Ask me about pharma imports,<br />NAFDAC, or German suppliers</p>
                        </div>
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground'
                                }`}
                        >
                            {msg.parts.map((part, i) =>
                                part.type === 'text' ? (
                                    <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                                ) : null
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="min-h-[36px] resize-none text-sm"
                    rows={1}
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={isLoading || !input.trim()}>
                    <SendIcon className="h-3.5 w-3.5" />
                </Button>
            </form>
        </Card>
    )
}
