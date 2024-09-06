import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'
import { Link } from 'wouter'

import { useTheme } from '../../hooks/useDarkMode'

// import { ModalLogin } from '../modal'

// import { AcmeLogo } from './logo'

export const NavBar = () => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const collapseItems = ['Features', 'Customers', 'Pricing', 'Company', 'Legal']

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              {/* <AcmeLogo /> */}
              <span className="ml-2 hidden text-xl font-bold text-gray-900 sm:block dark:text-white">
                Expotes
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <div className="relative">
                <button className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  Features
                </button>
                {/* Dropdown menu can be implemented here */}
              </div>
              <Link
                href="#"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                Customers
              </Link>
              <Link
                href="#"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                Company
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* <ModalLogin /> */}
            <Link
              href="#"
              className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Start free trial
            </Link>
            <a
              href="https://github.com/Siumauricio/landing-template-nextui"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">GitHub</span>
              <Icon icon="fe:github" width={24} />
            </a>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="relative ml-3 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="switch"
              aria-checked={isDark}
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                aria-hidden="true"
                className={`${isDark ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu button */}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="space-y-1 pb-3 pt-2">
          {collapseItems.map((item) => (
            <Link
              key={item}
              href="#"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {item}
            </Link>
          ))}
          <a
            href="https://github.com/Siumauricio/landing-template-nextui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Icon icon="fe:github" className="mr-3 h-6 w-6" />
            GitHub
          </a>
          <div className="flex items-center px-3 py-2">
            <span className="mr-3 text-sm text-gray-500 dark:text-gray-300">
              Theme
            </span>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="switch"
              aria-checked={isDark}
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                aria-hidden="true"
                className={`${isDark ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
