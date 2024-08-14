import { Icon } from '@iconify/react'
import { Button, Input } from '@nextui-org/react'
import React from 'react'

import { useSDKMutation } from '@/services/api'
import { sdk } from '@expotes/sdk'

export default function CreateApplication() {
  const { trigger } = useSDKMutation(sdk.v1.application.create)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const teamId = formData.get('teamId') as string
    const handle = formData.get('handle') as string
    await trigger([{ name, teamId, handle }])
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-large bg-content1 shadow-small flex w-full max-w-sm flex-col gap-4 px-8 pb-10 pt-6">
        <p className="pb-2 text-xl font-medium">Create Application</p>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <Input
            isRequired
            label="Application Name"
            name="name"
            placeholder="Enter application name"
            type="text"
            variant="bordered"
          />
          <Input
            isRequired
            label="Team ID"
            name="teamId"
            placeholder="Enter team ID"
            type="text"
            variant="bordered"
          />
          <Input
            isRequired
            label="Handle"
            name="handle"
            placeholder="Enter application handle"
            type="text"
            variant="bordered"
          />
          <Button color="primary" type="submit">
            Create Application
          </Button>
        </form>
      </div>
    </div>
  )
}
