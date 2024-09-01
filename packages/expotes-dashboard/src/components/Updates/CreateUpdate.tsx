import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import type {
  CreateUpdatesDto,
  ManifestsOptions,
} from '@expotes/sdk/structures'

import { useTeam } from '@/provider/SessionProvider'
import { useFetcher, useSDK, useSDKMutation } from '@/services/api'
import { UseDisclosureReturn } from '@/utils/types'
import { sdk } from '@expotes/sdk'

type CreateUpdateFormValues = Omit<CreateUpdatesDto, 'options'> & {
  file: File
  options: ManifestsOptions
}
export function CreateUpdateModal({
  isOpen,
  onClose,
}: Pick<UseDisclosureReturn, 'isOpen' | 'onClose'>) {
  const fetcher = useFetcher()
  const { id: teamId } = useTeam()
  const { data: applications } = useSDK(sdk.v1.application.list, [{ teamId }])
  const [file, setFile] = useState<File | null>(null)

  const { trigger: createUpdate } = useSWRMutation(
    sdk.v1.updates.create.METADATA.path,
    async (url, { arg }: { arg: CreateUpdateFormValues }) => {
      const formData = new FormData()
      formData.append('appId', arg.appId)
      formData.append('runtimeVersion', arg.runtimeVersion)
      formData.append('file', arg.file)
      formData.append('options', JSON.stringify(arg.options))
      return fetcher(url, {
        method: sdk.v1.updates.create.METADATA.method,
        body: formData,
      })
    },
  )

  const { data: storageProviders } = useSDK(
    sdk.v1.provider.storage.listStorageProviders,
    [],
  )
  const { data: cdnProviders } = useSDK(
    sdk.v1.provider.cdn.listCdnProviders,
    [],
  )

  const form = useForm<CreateUpdateFormValues>({
    defaultValues: {
      options: {
        storage: [],
      },
    },
  })

  const onSubmit = async (values: CreateUpdateFormValues) => {
    if (!file) {
      return
    }
    await createUpdate({ ...values, file })
  }

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <form {...form} onSubmit={form.handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              Create New Update
            </ModalHeader>
            <ModalBody>
              <Controller
                name="appId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    label="Select App"
                    placeholder="Choose an app"
                    {...field}
                  >
                    {(applications ?? []).map((application) => (
                      <SelectItem key={application.id} value={application.id}>
                        {application.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="file"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="file"
                    label="Upload File"
                    placeholder="Choose a file"
                    accept=".zip"
                    className="mb-4"
                    {...field}
                    value={field.value.name}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        field.onChange(file.name || '')
                        setFile(file)
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="runtimeVersion"
                control={form.control}
                render={({ field }) => (
                  <Input
                    label="Version"
                    placeholder="Enter runtime version"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              {/* <Controller
              name="releaseNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="Release Notes"
                  placeholder="Enter release notes"
                  className="mb-4"
                  {...field}
                />
              )}
            /> */}
              <Controller
                name="options.storage.0.providerId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    label="Storage Provider"
                    placeholder="Choose a storage provider"
                    className="mb-4"
                    {...field}
                    onChange={(value) => field.onChange(value)}
                    // @ts-ignore
                    value={field.value}
                  >
                    {(storageProviders ?? []).map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="options.storage.0.cdnIds"
                control={form.control}
                render={({ field }) => (
                  <Select
                    label="CDN Providers"
                    placeholder="Choose CDN providers"
                    className="mb-4"
                    selectionMode="multiple"
                    {...field}
                    value={String(field.value)}
                  >
                    {(cdnProviders ?? []).map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}
