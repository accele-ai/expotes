import { Button, Input } from '@nextui-org/react'
import React from 'react'

const Hero = () => {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-3 px-6 sm:mt-20 sm:flex-row">
        <div className="pt-13 flex flex-col gap-5">
          <div className="max-w-[600px]">
            <h1 className="inline">The modern landing page </h1>
            <h1 className="inline">for </h1>
            <h1 className="text-primary inline">React developers</h1>
          </div>

          <span className="max-w-[400px] text-lg text-gray-500">
            The easiest way to build React Landing page in seconds. Save time
            and focus on your project.
          </span>

          <div className="flex flex-wrap gap-8 pt-4">
            <Input placeholder="Enter your email address" size="lg" />
            <Button>Start Free Trial</Button>
          </div>
          <div className="flex flex-wrap gap-8 py-7 sm:py-4">
            <div className="flex items-center text-gray-500">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              No credit card required.
            </div>
            <div className="flex items-center text-gray-500">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              14-day free trial.
            </div>
            <div className="flex items-center text-gray-500">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cancel anytime.
            </div>
          </div>
        </div>
        <div className="w-full max-w-[775px]">
          <img src="mock.png" alt="Mock" className="w-full object-contain" />
        </div>
      </div>
      <hr className="absolute inset-0 left-0 mt-10" />
    </>
  )
}

export default Hero
