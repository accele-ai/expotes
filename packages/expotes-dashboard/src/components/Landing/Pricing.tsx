import { Icon } from '@iconify/react'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Link,
  Spacer,
  Tab,
  Tabs,
} from '@nextui-org/react'
import React from 'react'
import type { ButtonProps } from '@nextui-org/react'

import { cn } from '@/utils/cn'

export enum FrequencyEnum {
  Yearly = 'yearly',
  Quarterly = 'quarterly',
}

export enum TiersEnum {
  Free = 'free',
  Pro = 'pro',
  Team = 'team',
}

export type Frequency = {
  key: FrequencyEnum
  label: string
  priceSuffix: string
}

export type Tier = {
  key: TiersEnum
  title: string
  price:
    | {
        [FrequencyEnum.Yearly]: string
        [FrequencyEnum.Quarterly]: string
      }
    | string
  priceSuffix?: string
  href: string
  description?: string
  mostPopular?: boolean
  featured?: boolean
  features?: string[]
  buttonText: string
  buttonColor?: ButtonProps['color']
  buttonVariant: ButtonProps['variant']
}

export const frequencies: Array<Frequency> = [
  { key: FrequencyEnum.Yearly, label: 'Pay Yearly', priceSuffix: 'per year' },
  {
    key: FrequencyEnum.Quarterly,
    label: 'Pay Quarterly',
    priceSuffix: 'per quarter',
  },
]

export const tiers: Array<Tier> = [
  {
    key: TiersEnum.Free,
    title: 'Free',
    price: 'Free',
    href: '#',
    featured: false,
    mostPopular: false,
    description: 'For starters and hobbyists that want to try out.',
    features: [
      '10 users included',
      '2 GB of storage',
      'Help center access',
      'Email support',
    ],
    buttonText: 'Continue with Free',
    buttonColor: 'default',
    buttonVariant: 'flat',
  },
  {
    key: TiersEnum.Pro,
    title: 'Pro',
    description: 'For small teams that have less that 10 members.',
    href: '#',
    mostPopular: true,
    price: {
      yearly: '$72',
      quarterly: '$24',
    },
    featured: false,
    features: [
      '20 users included',
      '10 GB of storage',
      'Help center access',
      'Priority email support',
    ],
    buttonText: 'Get started',
    buttonColor: 'primary',
    buttonVariant: 'solid',
  },
  {
    key: TiersEnum.Team,
    title: 'Team',
    href: '#',
    featured: true,
    mostPopular: false,
    description: 'For large teams that have more than 10 members.',
    price: {
      yearly: '$90',
      quarterly: '$120',
    },
    priceSuffix: 'per user',
    features: [
      '50 users included',
      '30 GB of storage',
      'Help center access',
      'Phone & email support',
    ],
    buttonText: 'Contact us',
    buttonColor: 'default',
    buttonVariant: 'flat',
  },
]

export default function Pricing() {
  const [selectedFrequency, setSelectedFrequency] = React.useState(
    frequencies[0],
  )

  const onFrequencyChange = (selectedKey: React.Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey)

    setSelectedFrequency(frequencies[frequencyIndex])
  }

  return (
    <div className="flex max-w-4xl flex-col items-center py-24">
      <div className="flex max-w-xl flex-col text-center">
        <h2 className="text-primary font-medium">Pricing</h2>
        <h1 className="text-4xl font-medium tracking-tight">
          Get unlimited access.
        </h1>
        <Spacer y={4} />
        <h2 className="text-large text-default-500">
          Discover the ideal plan, beginning at under $2 per week.
        </h2>
      </div>
      <Spacer y={8} />
      <Tabs
        classNames={{
          tab: 'data-[hover-unselected=true]:opacity-90',
        }}
        radius="full"
        size="lg"
        onSelectionChange={onFrequencyChange}
      >
        <Tab
          key={FrequencyEnum.Yearly}
          aria-label="Pay Yearly"
          className="pr-1.5"
          title={
            <div className="flex items-center gap-2">
              <p>Pay Yearly</p>
              <Chip color="primary">Save 25%</Chip>
            </div>
          }
        />
        <Tab key={FrequencyEnum.Quarterly} title="Pay Quarterly" />
      </Tabs>
      <Spacer y={12} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.key}
            className={cn('relative p-3', {
              'border-primary shadow-primary/20 border-2 shadow-2xl':
                tier.mostPopular,
              '!border-medium border-default-100 bg-transparent':
                !tier.mostPopular,
            })}
            shadow="none"
          >
            {tier.mostPopular ? (
              <Chip
                classNames={{
                  base: 'absolute top-4 right-4',
                  content: 'font-medium text-primary-500 dark:text-primary-600',
                }}
                color="primary"
                variant="flat"
              >
                Most Popular
              </Chip>
            ) : null}
            <CardHeader className="flex flex-col items-start gap-2 pb-6">
              <h2 className="text-large font-medium">{tier.title}</h2>
              <p className="text-medium text-default-500">{tier.description}</p>
            </CardHeader>
            <Divider />
            <CardBody className="gap-8">
              <p className="flex items-baseline gap-1 pt-2">
                <span className="from-foreground to-foreground-600 inline bg-gradient-to-br bg-clip-text text-4xl font-semibold leading-7 tracking-tight text-transparent">
                  {typeof tier.price === 'string'
                    ? tier.price
                    : tier.price[selectedFrequency.key]}
                </span>
                {typeof tier.price !== 'string' ? (
                  <span className="text-small text-default-400 font-medium">
                    /{selectedFrequency.priceSuffix}
                  </span>
                ) : null}
              </p>
              <ul className="flex flex-col gap-2">
                {tier.features?.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icon className="text-primary" icon="ci:check" width={24} />
                    <p className="text-default-500">{feature}</p>
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter>
              <Button
                fullWidth
                as={Link}
                color={tier.buttonColor}
                href={tier.href}
                variant={tier.buttonVariant}
              >
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Spacer y={12} />
      <div className="flex py-2">
        <p className="text-default-400">
          Are you an open source developer?&nbsp;
          <Link color="foreground" href="#" underline="always">
            Get a discount
          </Link>
        </p>
      </div>
    </div>
  )
}
