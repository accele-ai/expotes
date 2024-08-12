'use client'

import { Icon } from '@iconify/react'
import { Badge, Button, Input, Spacer, Textarea } from '@nextui-org/react'
import * as React from 'react'

import { cn } from '@/utils/cn'
import { Avatar } from '@nextui-org/avatar'
import { Card, CardBody } from '@nextui-org/card'

interface ProfileSettingCardProps {
  className?: string
}

const ProfileSetting = React.forwardRef<
  HTMLDivElement,
  ProfileSettingCardProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-2', className)} {...props}>
    {/* Profile */}
    <div>
      <p className="text-base font-medium text-default-700">Profile</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        This displays your public profile on the site.
      </p>
      <Card className="mt-4 bg-default-100" shadow="none">
        <CardBody>
          <div className="flex items-center gap-4">
            <Badge
              disableOutline
              classNames={{
                badge: 'w-5 h-5',
              }}
              content={
                <Button
                  isIconOnly
                  className="h-5 w-5 min-w-5 bg-background p-0 text-default-500"
                  radius="full"
                  size="sm"
                  variant="bordered"
                >
                  <Icon className="h-[9px] w-[9px]" icon="solar:pen-linear" />
                </Button>
              }
              placement="bottom-right"
              shape="circle"
            >
              <Avatar
                className="h-16 w-16"
                src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatars/e1b8ec120710c09589a12c0004f85825.jpg"
              />
            </Badge>
            <div>
              <p className="text-sm font-medium text-default-600">Kate Moore</p>
              <p className="text-xs text-default-400">Customer Support</p>
              <p className="mt-1 text-xs text-default-400">
                kate.moore@acme.com
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
    <Spacer y={4} />
    {/* Title */}
    <div>
      <p className="text-base font-medium text-default-700">Title</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        Set your current role.
      </p>
      <Input className="mt-2" placeholder="e.g Customer Support" />
    </div>
    <Spacer y={2} />
    {/* Location */}
    <div>
      <p className="text-base font-medium text-default-700">Location</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        Set your current location.
      </p>
      <Input className="mt-2" placeholder="e.g Buenos Aires, Argentina" />
    </div>
    <Spacer y={4} />
    {/* Biography */}
    <div>
      <p className="text-base font-medium text-default-700">Biography</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        Specify your present whereabouts.
      </p>
      <Textarea
        className="mt-2"
        classNames={{
          input: cn('min-h-[115px]'),
        }}
        placeholder="e.g., 'Kate Moore - Acme.com Support Specialist. Passionate about solving tech issues, loves hiking and volunteering."
      />
    </div>
    <Button className="mt-4 bg-default-foreground text-background" size="sm">
      Update Profile
    </Button>
  </div>
))

ProfileSetting.displayName = 'ProfileSetting'

export default ProfileSetting
