import './index.css'

import { NextUIProvider } from '@nextui-org/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import SDKProvider from './provider/SDKProvider.tsx'
import Router from './router.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <SDKProvider>
        <Router />
      </SDKProvider>
    </NextUIProvider>
  </React.StrictMode>,
)
