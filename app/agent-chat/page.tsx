'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
    Message,
    MessageContent,
} from '@/components/ai-elements/message'
import {
    Suggestions,
    Suggestion,
} from '@/components/ai-elements/suggestion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquareIcon, SendIcon } from 'lucide-react'
import { useState, useRef, type FormEvent, type ReactElement, type KeyboardEvent } from 'react'

const SUGGESTED_QUESTIONS = [
    'What documents do I need to import drugs from Germany?',
    'How do I register a product with NAFDAC?',
    'Show me GMP-certified German manufacturers of antibiotics.',
    'What are the customs duties on pharmaceutical imports to Nigeria?',
    'Explain the Form M process for pharma imports.',
]

const transport = new DefaultChatTransport({
    api: '/api/agent/chat',
})

export default function AgentChatPage(): ReactElement {
    const { messages, sendMessage, status } = useChat({ transport })
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const isLoading = status !== 'ready'

    function handleSubmit(e?: FormEvent) {
        e?.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage({ text: input })
        setInput('')
    }

    function handleSuggestion(suggestion: string) {
        sendMessage({ text: suggestion })
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col px-4 py-4">
            <div className="mb-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                    <MessageSquareIcon className="h-6 w-6 text-primary" />
                    PharmAgent
                </h1>
                <p className="text-sm text-muted-foreground">
                    Your AI assistant for pharmaceutical import guidance
                </p>
            </div>

            <Conversation className="flex-1 rounded-lg border border-border bg-background">
                <ConversationContent className="p-4">
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            title="Welcome to PharmAgent"
                            description="Ask me anything about importing pharmaceuticals from Germany to Nigeria — NAFDAC registration, customs procedures, required documents, and more."
                            icon={<MessageSquareIcon className="h-10 w-10" />}
                        />
                    ) : (
                        messages.map((message) => (
                            <Message key={message.id} from={message.role}>
                                <MessageContent>
                                    {message.parts.map((part, index) =>
                                        part.type === 'text' ? (
                                            <div key={index} className="whitespace-pre-wrap">{part.text}</div>
                                        ) : null
                                    )}
                                </MessageContent>
                            </Message>
                        ))
                    )}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>

            {/* Suggestions */}
            {messages.length === 0 && (
                <div className="mt-3">
                    <Suggestions>
                        {SUGGESTED_QUESTIONS.map((q) => (
                            <Suggestion key={q} suggestion={q} onClick={handleSuggestion} />
                        ))}
                    </Suggestions>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask PharmAgent a question..."
                    className="min-h-[48px] resize-none"
                    rows={1}
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <SendIcon className="h-4 w-4" />
                </Button>
            </form>

            <p className="mt-2 text-center text-xs text-muted-foreground">
                PharmAgent provides informational guidance only. Consult licensed professionals for regulatory advice.
            </p>
        </div>
    )
}
