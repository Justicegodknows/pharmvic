'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isToolUIPart, getToolName } from 'ai'
import type { ToolUIPart, DynamicToolUIPart } from 'ai'
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
    Tool,
    ToolHeader,
    ToolContent,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool'
import {
    Suggestions,
    Suggestion,
} from '@/components/ai-elements/suggestion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquareIcon, SendIcon } from 'lucide-react'
import { useState, useRef, type FormEvent, type ReactElement, type KeyboardEvent } from 'react'

const TOOL_LABELS: Record<string, string> = {
    searchKnowledgeBase: 'Searching knowledge base',
    searchWeb: 'Searching the web',
    fetchWebPage: 'Reading web page',
    searchSuppliers: 'Searching suppliers',
    lookupProducts: 'Looking up products',
}

// Stitch MCP tools are dynamically provided — map common prefixes/patterns
// to friendly labels. Falls back to a humanised version of the tool name.
function getToolLabel(toolName: string): string {
    if (TOOL_LABELS[toolName]) return TOOL_LABELS[toolName]
    // Common Stitch tool patterns
    if (toolName.includes('screen')) return 'Fetching design screens'
    if (toolName.includes('snapshot')) return 'Creating UI snapshot'
    if (toolName.includes('design') || toolName.includes('stitch')) return 'Working with design'
    if (toolName.includes('generate') || toolName.includes('code')) return 'Generating code'
    // Fallback: convert snake_case/camelCase to readable text
    return toolName
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
}

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

function isHtmlOutput(output: unknown): output is string {
    return typeof output === 'string' && /^\s*<!DOCTYPE|^\s*<html/i.test(output)
}

function DesignPreview({ html }: { html: string }): ReactElement {
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Design Preview
            </h4>
            <iframe
                srcDoc={html}
                sandbox="allow-scripts"
                className="h-100 w-full rounded-md border bg-white"
                title="Stitch design preview"
            />
        </div>
    )
}

function ToolPartRenderer({ part }: { part: ToolUIPart | DynamicToolUIPart }): ReactElement {
    const toolName = getToolName(part)
    const label = getToolLabel(toolName)

    return (
        <Tool defaultOpen={false}>
            <ToolHeader
                title={label}
                type={part.type as 'dynamic-tool'}
                state={part.state}
                toolName={toolName}
            />
            <ToolContent>
                <ToolInput input={part.input} />
                {part.state === 'output-available' && isHtmlOutput(part.output) && (
                    <DesignPreview html={part.output} />
                )}
                {part.state === 'output-available' && !isHtmlOutput(part.output) && (
                    <ToolOutput
                        output={part.output}
                        errorText={undefined}
                    />
                )}
                {part.state === 'output-error' && (
                    <ToolOutput
                        output={undefined}
                        errorText={part.errorText}
                    />
                )}
            </ToolContent>
        </Tool>
    )
}

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
                    Your AI assistant for pharmaceutical import guidance — powered by RAG and web search
                </p>
            </div>

            <Conversation className="flex-1 rounded-lg border border-border bg-background">
                <ConversationContent className="p-4">
                    {messages.length === 0 ? (
                        <ConversationEmptyState
                            title="Welcome to PharmAgent"
                            description="Ask me anything about importing pharmaceuticals from Germany to Nigeria — NAFDAC registration, customs procedures, required documents, and more. I can search our knowledge base, look up suppliers, and browse the web for the latest information."
                            icon={<MessageSquareIcon className="h-10 w-10" />}
                        />
                    ) : (
                        messages.map((message) => (
                            <Message key={message.id} from={message.role}>
                                <MessageContent>
                                    {message.parts.map((part, index) => {
                                        if (part.type === 'text') {
                                            return (
                                                <div key={index} className="whitespace-pre-wrap">{part.text}</div>
                                            )
                                        }
                                        if (isToolUIPart(part)) {
                                            return <ToolPartRenderer key={index} part={part} />
                                        }
                                        return null
                                    })}
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
