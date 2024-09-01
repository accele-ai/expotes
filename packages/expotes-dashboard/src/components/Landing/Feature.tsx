import { Icon } from '@iconify/react'
import { Divider } from '@nextui-org/react'
import React from 'react'

export const Features1 = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 px-6 pt-20 sm:flex-row sm:justify-around sm:px-32 md:px-64">
        <div className="flex flex-col">
          <span className="text-blue-600">Awesome Feature</span>
          <h3>Your title here</h3>
          <span className="max-w-[400px] text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl, nec
            tincidunt nisl lorem eu nunc. Sed euismod, nisl ut aliquam lacinia,
          </span>

          <div className="flex gap-5 py-10">
            <Icon icon="mdi:box" />
            <div className="flex flex-col">
              <h4 className="font-medium">Your title here</h4>
              <span className="max-w-[400px] text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
              </span>
            </div>
          </div>
          <div className="flex gap-5 py-10">
            <Icon icon="mdi:box" />
            <div className="flex flex-col">
              <h4 className="font-medium">Your title here</h4>
              <span className="max-w-[400px] text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
              </span>
            </div>
          </div>
          <div className="flex gap-5 py-10">
            <Icon icon="mdi:box" />
            <div className="flex flex-col">
              <h4 className="font-medium">Your title here</h4>
              <span className="max-w-[400px] text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                condimentum, nisl ut aliquam lacinia, nisl nisl aliquet nisl,
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Icon icon="mdi:feature" width={400} height={400} />
        </div>
      </div>
      <Divider className="absolute inset-0 left-0 mt-5" />
    </>
  )
}
