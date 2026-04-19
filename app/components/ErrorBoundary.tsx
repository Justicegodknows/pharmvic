"use client"
import React from "react"

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Optionally log error to an external service
        if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.error("ErrorBoundary caught error:", error, info)
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="p-4 text-red-600 bg-red-50 rounded">
                    <h2 className="font-bold">Something went wrong.</h2>
                    <pre className="text-xs whitespace-pre-wrap">{this.state.error?.message}</pre>
                </div>
            )
        }
        return this.props.children
    }
}
