import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env for browser environments to avoid "process is not defined" error
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: { API_KEY: '' } };
}

// Global error handler for non-React errors (e.g. script load failures)
window.addEventListener('error', (e) => {
  console.error('Global Application Error:', e.error);
});

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component to catch runtime errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare state property and initialize it here instead of constructor to satisfy TypeScript
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Tajawal, sans-serif',
          backgroundColor: '#f8fafc',
          color: '#1e293b'
        }} dir="rtl">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>عذراً، حدث خطأ غير متوقع</h1>
          <p style={{ marginBottom: '20px', color: '#64748b' }}>حاول تحديث الصفحة، أو تحقق من اتصالك بالإنترنت.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            تحديث الصفحة
          </button>
          {this.state.error && (
            <details style={{ marginTop: '30px', maxWidth: '600px', textAlign: 'left', direction: 'ltr', color: '#ef4444', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              <summary>التفاصيل التقنية (للمطورين)</summary>
              {this.state.error.toString()}
            </details>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);