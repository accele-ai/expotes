import {
  ErrorBoundary as BasicErrorBoundary,
  FallbackProps,
} from 'react-error-boundary'

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <h2 className="mb-2 text-2xl font-bold text-red-700">
        Oops! Something went wrong
      </h2>
      <p className="mb-4 text-red-600">{error.message}</p>
      <pre className="mb-4 overflow-auto rounded bg-red-100 p-3 text-sm text-red-800">
        {error.stack}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <BasicErrorBoundary FallbackComponent={Fallback}>
      {children}
    </BasicErrorBoundary>
  )
}
