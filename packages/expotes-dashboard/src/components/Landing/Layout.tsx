import React from 'react'

import { NavBar } from './NavBar'

interface LayoutProps {
  children: React.ReactNode
}

export const LandingLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="h-[calc(100vh-8rem)] flex-grow">{children}</main>
      <footer className="h-16 bg-gray-100 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 AprilNEA LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
