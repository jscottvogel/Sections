/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 * This prevents the entire app from crashing and showing a white screen.
 */
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg">
                    <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
                    <pre className="bg-white p-4 rounded border border-red-100 overflow-auto text-sm text-red-900">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}
