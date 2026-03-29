'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-dark-brown mb-2">
            משהו השתבש
          </h2>
          <p className="text-stone-500 font-hebrew text-sm mb-6 max-w-xs leading-relaxed">
            {this.state.error?.message || 'אירעה שגיאה בלתי צפויה. נסה לרענן את הדף.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-champagne-500 text-white font-hebrew font-semibold text-sm hover:bg-champagne-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            רענן דף
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
