import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Incident detail failed', error, info)
  }

  render() {
    return this.state.hasError ? (
      <div className="error-panel">
        <h2>We couldn&apos;t load this incident</h2>
        <p>Try returning to the incident list or reload the page.</p>
        <Link to="/incidents">Back to incidents</Link>
      </div>
    ) : (
      this.props.children
    )
  }
}
