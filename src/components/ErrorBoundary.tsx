import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      (error.message && (
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
      ));
    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    const isChunkError =
      error.name === 'ChunkLoadError' ||
      (error.message && (
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
      ));

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem('chunk_failed_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_failed_reload', 'true');
        window.location.reload();
        return;
      }
    }

    // Fire-and-forget error reporting
    if (!isChunkError) {
      import('@/lib/error-reporting').then(({ reportError }) => {
        reportError({
          message: error.message,
          stack: error.stack,
          metadata: { componentStack: errorInfo.componentStack?.substring(0, 2000) },
        });
      }).catch(() => {});
    }
  }

  handleRetry = () => {
    if (this.state.isChunkError) {
      sessionStorage.removeItem('chunk_failed_reload');
      window.location.reload();
    } else {
      this.setState({ hasError: false, error: null, isChunkError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">
              {this.state.isChunkError ? 'App Updated' : 'Something went wrong'}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {this.state.isChunkError
                ? 'A new version of the app is available. Please refresh to continue.'
                : 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-none hover:bg-primary/90 transition-colors"
            >
              <RefreshCcw size={14} />
              {this.state.isChunkError ? 'Refresh Page' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
