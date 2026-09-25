import { Component } from 'react';

/**
 * Catches render-time errors in its subtree and shows a fallback UI instead of
 * unmounting the whole app. `resetKeys` lets a route change clear the error.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Hook point for a logging service (Sentry, LogRocket, ...)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
    return (
      <div className="container page">
        <div className="state-box" role="alert">
          <h2>Something went wrong</h2>
          <p className="muted">{error.message}</p>
          <button className="btn btn--primary" onClick={this.reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }
}
