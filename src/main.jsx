// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './features/App'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {
    // Clear bad session automatically
    localStorage.clear()
  }
  render() {
    if (this.state.hasError) {
      window.location.href = '/login'
      return null
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)