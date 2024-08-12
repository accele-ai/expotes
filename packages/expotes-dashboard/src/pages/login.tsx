import { Icon } from '@iconify/react'
import { Button, Checkbox, Divider, Input, Link } from '@nextui-org/react'
import React from 'react'
import { tv } from 'tailwind-variants'

import { useSDKMutation } from '@/services/api'
import { sdk } from '@expotes/sdk'

const inputClasses = tv({
  base: 'border-transparent bg-default-50/40 dark:bg-default-50/20 group-data-[focus=true]:border-primary data-[hover=true]:border-foreground/20',
})

const buttonClasses = tv({
  base: 'bg-foreground/10 dark:bg-foreground/20',
})

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const { trigger } = useSDKMutation(sdk.v1.auth.login)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    console.log(email, password)
    await trigger([{ email, password }])
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-2 sm:p-4 lg:p-8">
      <div className="rounded-large bg-background/60 shadow-small dark:bg-default-100/50 flex w-full max-w-sm flex-col gap-4 px-8 pb-10 pt-6 backdrop-blur-md backdrop-saturate-150">
        <p className="pb-2 text-xl font-medium">Log In</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
        >
          <Input
            classNames={{ inputWrapper: inputClasses() }}
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
          />
          <Input
            classNames={{ inputWrapper: inputClasses() }}
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="text-foreground/50 pointer-events-none text-2xl"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="text-foreground/50 pointer-events-none text-2xl"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? 'text' : 'password'}
            variant="bordered"
          />
          <div className="flex items-center justify-between px-1 py-2">
            <Checkbox
              classNames={{
                wrapper: 'before:border-foreground/50',
              }}
              name="remember"
              size="sm"
            >
              Remember me
            </Checkbox>
            <Link className="text-foreground/50" href="#" size="sm">
              Forgot password?
            </Link>
          </div>
          <Button className={buttonClasses()} type="submit">
            Log In
          </Button>
        </form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="text-tiny text-default-500 shrink-0">OR</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className={buttonClasses()}
            startContent={<Icon icon="fe:google" width={24} />}
          >
            Continue with Google
          </Button>
          <Button
            className={buttonClasses()}
            startContent={<Icon icon="fe:github" width={24} />}
          >
            Continue with Github
          </Button>
        </div>
        <p className="text-small text-foreground/50 text-center">
          Need to create an account?&nbsp;
          <Link color="foreground" href="#" size="sm">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
