import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLocation } from 'wouter'

import { useSDKMutation } from '@/services/api'
import { usePersistStore } from '@/store/persist'
import { sdk } from '@expotes/sdk'
import { OmitCreateTeamDtouserId } from '@expotes/sdk/structures'

type FormInputs = OmitCreateTeamDtouserId

export default function CreateTeam() {
  const [, setLocation] = useLocation()
  const { teamId, setTeamId } = usePersistStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>()
  const {
    trigger: createTeam,
    isMutating,
    error,
  } = useSDKMutation(sdk.v1.team.create)

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      await createTeam([data])
      setTeamId(teamId)
      setLocation('/app/teams')
    } catch (err) {
      console.error('Failed to create team:', err)
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create New Team</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Team Name"
            placeholder="Enter team name"
            {...register('name', { required: 'Team name is required' })}
            className="mb-4"
          />
          {errors.name && (
            <p className="mb-2 text-red-500">{errors.name.message}</p>
          )}
          <Input
            label="Team Handle"
            placeholder="Enter team handle"
            {...register('handle', { required: 'Team handle is required' })}
            className="mb-4"
          />
          {errors.handle && (
            <p className="mb-2 text-red-500">{errors.handle.message}</p>
          )}
          {error && <p className="mb-4 text-red-500">{error.message}</p>}
          <Button
            type="submit"
            color="primary"
            isLoading={isMutating}
            disabled={isMutating}
          >
            Create Team
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
