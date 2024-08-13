import { Icon } from '@iconify/react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Select,
  SelectItem,
  SelectSection,
  Spacer,
  User,
} from '@nextui-org/react'
import { useMemo } from 'react'
import { hash as md5 } from 'spark-md5'
import { useLocation } from 'wouter'
import type { SidebarItem } from './Sidebar'

import { useSession } from '@/provider/SessionProvider'
import { useSDK } from '@/services/api'
import { usePersistStore } from '@/store/persist'
import { sdk } from '@expotes/sdk'

// import {AcmeIcon} from "./acme";

import NotificationsCard from './NotificationCard'
import Sidebar from './Sidebar'

const sidebarItems: SidebarItem[] = [
  {
    key: 'home',
    href: 'home',
    icon: 'solar:home-2-linear',
    title: 'Home',
  },
  {
    key: 'applications',
    href: 'applications',
    icon: 'solar:widget-2-outline',
    title: 'Applications',
    // endContent: (
    //   <Icon
    //     className="text-default-400"
    //     icon="solar:add-circle-line-duotone"
    //     width={24}
    //   />
    // ),
  },
  {
    key: 'updates',
    href: 'updates',
    icon: 'solar:checklist-minimalistic-outline',
    title: 'Updates',
    // endContent: (
    //   <Icon
    //     className="text-default-400"
    //     icon="solar:add-circle-line-duotone"
    //     width={24}
    //   />
    // ),
  },
  {
    key: 'team',
    href: 'team',
    icon: 'solar:users-group-two-rounded-outline',
    title: 'Team',
  },
  // {
  //   key: 'tracker',
  //   href: '#',
  //   icon: 'solar:sort-by-time-linear',
  //   title: 'Tracker',
  //   endContent: (
  //     <Chip size="sm" variant="flat">
  //       New
  //     </Chip>
  //   ),
  // },
  // {
  //   key: 'analytics',
  //   href: '#',
  //   icon: 'solar:chart-outline',
  //   title: 'Analytics',
  // },
  // {
  //   key: 'expenses',
  //   href: '#',
  //   icon: 'solar:bill-list-outline',
  //   title: 'Expenses',
  // },
  // {
  //   key: 'settings',
  //   href: '#',
  //   icon: 'solar:settings-outline',
  //   title: 'Settings',
  // },
]

const workspaces = [
  {
    value: '0',
    label: 'Acme Inc.',
    items: [
      {
        value: '1',
        label: 'Core workspace',
      },
      {
        value: '2',
        label: 'Design workspace',
      },
      {
        value: '3',
        label: 'Dev. workspace',
      },
      {
        value: '4',
        label: 'Marketing workspace',
      },
    ],
  },
]

const users = [
  {
    id: 1,
    name: 'Kate Moore',
    role: 'Customer Support',
    team: 'Customer Support',
    avatar:
      'https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatars/e1b8ec120710c09589a12c0004f85825.jpg',
    email: 'kate.moore@example.com',
  },
  {
    id: 2,
    name: 'John Doe',
    role: 'Product Designer',
    team: 'Design',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c',
    email: 'john.doe@example.com',
  },
  {
    id: 3,
    name: 'Jane Doe',
    role: 'Product Manager',
    team: 'Product',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e22026708c',
    email: 'jane.doe@example.com',
  },
]

/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [location, setLocation] = useLocation()
  const currentPath = location.split('/')?.[1]

  const { name, email } = useSession()
  const { teamId, setTeamId } = usePersistStore()
  const { data: teams } = useSDK(sdk.v1.team.list, [], {
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const avatarUrl = useMemo(() => {
    return `https://www.gravatar.com/avatar/${md5(email)}?d=identicon`
  }, [email])

  return (
    <div className="flex h-dvh flex-row">
      <div className="border-r-small border-divider relative flex h-full w-72 flex-1 grow-0 flex-col p-6">
        <div className="flex items-center justify-between">
          {/* User Menu */}
          <Dropdown showArrow placement="bottom-start">
            <DropdownTrigger>
              <Button
                disableRipple
                className="-mr-1"
                radius="full"
                variant="light"
              >
                <Avatar
                  className="h-6 w-6 cursor-pointer"
                  name="Kate Moore"
                  src={avatarUrl}
                />
                <span className="text-tiny font-bold uppercase">
                  {name || email}
                </span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Custom item styles"
              disabledKeys={['profile']}
            >
              <DropdownSection showDivider aria-label="Profile & Actions">
                <DropdownItem
                  key="profile"
                  isReadOnly
                  className="h-14 gap-2 opacity-100"
                  textValue="Signed in as"
                >
                  <User
                    avatarProps={{
                      size: 'sm',
                      imgProps: {
                        className: 'transition-none',
                      },
                      src: avatarUrl,
                    }}
                    classNames={{
                      name: 'text-default-600',
                      description: 'text-default-500',
                    }}
                    description="Customer Support"
                    name={name || email}
                  />
                </DropdownItem>
                {/* <DropdownItem key="dashboard">Dashboard</DropdownItem> */}
                {/* <DropdownItem key="settings">Settings</DropdownItem> */}
                {/* <DropdownItem
                  key="new_project"
                  endContent={
                    <Icon className="text-large" icon="lucide:plus" />
                  }
                >
                  New Project
                </DropdownItem> */}
              </DropdownSection>

              <DropdownSection showDivider aria-label="Preferences">
                {/* <DropdownItem key="quick_search" shortcut="⌘K">
                  Quick search
                </DropdownItem> */}
                <DropdownItem
                  key="theme"
                  isReadOnly
                  className="cursor-default"
                  endContent={
                    <select
                      className="border-small border-default-300 text-tiny text-default-500 group-data-[hover=true]:border-default-500 dark:border-default-200 z-10 w-16 rounded-md bg-transparent py-0.5 outline-none"
                      id="theme"
                      name="theme"
                    >
                      <option>System</option>
                      <option>Dark</option>
                      <option>Light</option>
                    </select>
                  }
                >
                  Theme
                </DropdownItem>
              </DropdownSection>

              <DropdownSection aria-label="Help & Feedback">
                {/* <DropdownItem key="help_and_feedback">
                  Help & Feedback
                </DropdownItem> */}
                <DropdownItem key="logout">Log Out</DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
          {/* Notifications */}
          {/* <Popover offset={12} placement="bottom-start">
            <PopoverTrigger>
              <Button
                disableRipple
                isIconOnly
                className="overflow-visible"
                radius="full"
                variant="light"
              >
                <Badge color="danger" content="5" showOutline={false} size="md">
                  <Icon
                    className="text-default-500"
                    icon="solar:bell-linear"
                    width={22}
                  />
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
              <NotificationsCard className="w-full shadow-none" />
            </PopoverContent>
          </Popover> */}
        </div>

        <Spacer y={8} />

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            defaultSelectedKey="home"
            selectedKeys={[currentPath]}
            iconClassName="group-data-[selected=true]:text-primary-foreground"
            itemClasses={{
              base: 'data-[selected=true]:bg-primary-400 dark:data-[selected=true]:bg-primary-300 data-[hover=true]:bg-default-300/20 dark:data-[hover=true]:bg-default-200/40',
              title: 'group-data-[selected=true]:text-primary-foreground',
            }}
            items={sidebarItems}
          />
          <Spacer y={8} />
          {/* <Card className="mx-2 overflow-visible" shadow="sm">
            <CardBody className="items-center py-5 text-center">
              <h3 className="text-medium text-default-700 font-medium">
                Upgrade to Pro
                <span aria-label="rocket-emoji" className="ml-2" role="img">
                  🚀
                </span>
              </h3>
              <p className="text-small text-default-500 p-4">
                Get 1 month free and unlock all the features of the pro plan.
              </p>
            </CardBody>
            <CardFooter className="absolute -bottom-8 justify-center">
              <Button className="px-10" color="primary" radius="full">
                Upgrade
              </Button>
            </CardFooter>
          </Card> */}
        </ScrollShadow>
        <div className="flex flex-col gap-y-2">
          <Select
            selectedKeys={teamId ? [teamId] : []}
            onChange={(e) => setTeamId(e.target.value)}
            disableSelectorIconRotation
            aria-label="Select team"
            className="px-1"
            classNames={{
              trigger:
                'min-h-14 bg-transparent border-small border-default-200 dark:border-default-100 data-[hover=true]:border-default-500 dark:data-[hover=true]:border-default-200 data-[hover=true]:bg-transparent',
            }}
            items={teams}
            listboxProps={{
              bottomContent: (
                <Button
                  className="bg-default-100 text-foreground text-center"
                  size="sm"
                  onPress={() => console.log('on create workspace')}
                >
                  New Team
                </Button>
              ),
            }}
            placeholder="Select team"
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="ml-1 flex flex-col gap-y-0.5">
                  <span className="text-tiny leading-4">Acme Inc.</span>
                  <span className="text-tiny text-default-400">
                    {item.data?.name}
                  </span>
                </div>
              ))
            }}
            selectorIcon={
              <Icon
                color="hsl(var(--nextui-default-500))"
                icon="lucide:chevrons-up-down"
              />
            }
            startContent={
              <div className="border-small border-default-300 relative h-10 w-10 flex-none rounded-full">
                <Icon
                  className="text-default-500 ml-2 mt-2"
                  icon="solar:users-group-rounded-linear"
                  width={24}
                />
              </div>
            }
          >
            {(item) => (
              <SelectItem
                key={item.id}
                aria-label={item.name}
                textValue={item.id}
              >
                <div className="flex flex-row items-center justify-between gap-1">
                  <span>{item.handle}</span>
                  <div className="border-small border-default-300 flex h-6 w-6 items-center justify-center rounded-full">
                    <Icon
                      className="text-default-500"
                      icon="solar:users-group-rounded-linear"
                      width={16}
                    />
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>
      </div>
      <div className="grow p-4">{children}</div>
    </div>
  )
}
