'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected error',
    };
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-obsidian-base px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Something went wrong</h1>
        <p className="max-w-xl font-mono text-sm text-neutral-400">{this.state.message}</p>
        <button
          type="button"
          onClick={this.handleReload}
          className="border border-magma-ember bg-magma-ember/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-magma-ember transition-colors hover:bg-magma-ember/20"
        >
          Reload
        </button>
      </div>
    );
  }
}
