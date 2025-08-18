"use client";

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        					<div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10 dark:bg-destructive/20 dark:border-destructive/20">
						<div className="flex items-center gap-2 mb-2">
							<div className="w-2 h-2 bg-destructive rounded-full"></div>
							<span className="text-sm font-medium text-destructive dark:text-destructive">
								Component Error
							</span>
						</div>
						<p className="text-sm text-destructive dark:text-destructive">
            This section encountered an error and couldn't load properly.
          </p>
          {this.props.fallback && this.props.fallback(this.state.error)}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
