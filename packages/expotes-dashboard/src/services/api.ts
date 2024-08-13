import React from 'react'
import { createSDKServices, IConnection } from 'nestia-swr'

export const SDKContext = React.createContext<IConnection | null>(null)

const { useSDK, useSDKMutation } = createSDKServices(SDKContext)

export { useSDK, useSDKMutation }
