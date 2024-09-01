import { Button, Divider } from '@nextui-org/react'
import React from 'react'

export const Trusted = () => {
  return (
    <>
      <div className="flex flex-col items-center px-6 pt-20">
        <h2 className="text-center text-3xl font-bold">
          Trusted by over 10000+ customers
        </h2>
        <p className="mt-4 max-w-3xl text-center text-lg text-gray-600 dark:text-gray-300">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="mt-12 grid w-full grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 1</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 2</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 3</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 4</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 5</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 6</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 7</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-lg font-semibold">Company 8</span>
          </div>
        </div>
      </div>

      <Divider className="absolute inset-0 left-0 mt-5" />
    </>
  )
}
