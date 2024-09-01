import './index.css'

import { NextUIProvider } from '@nextui-org/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { ErrorBoundary } from './components/Error.tsx'
import SDKProvider from './provider/SDKProvider.tsx'
import SWRProvider from './provider/SWRProvider.tsx'
import Router from './router.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <NextUIProvider>
        <SWRProvider>
          <SDKProvider>
            <Router />
          </SDKProvider>
        </SWRProvider>
      </NextUIProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
