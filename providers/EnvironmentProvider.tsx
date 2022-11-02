import { Cluster, Connection } from '@solana/web3.js'
import { firstParam } from 'common/utils'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

export interface Environment {
  label: Cluster
  primary: string
  secondary?: string
}

export interface EnvironmentContextValues {
  environment: Environment
  setEnvironment: (newEnvironment: Environment) => void
  connection: Connection
  secondaryConnection: Connection
}

export const ENVIRONMENTS: Environment[] = [
  // {
  //   label: 'mainnet-beta',
  //   primary: process.env.MAINNET_PRIMARY || 'https://ssc-dao.genesysgo.net',
  //   secondary: 'https://ssc-dao.genesysgo.net',
  // },
  {
    label: 'mainnet-beta',
    primary: process.env.MAINNET_PRIMARY || 'https://eu-west-1.genesysgo.net/ad93c9fc-8b53-4019-a2a1-ab580b17b1d3',
    secondary: 'https://eu-west-1.genesysgo.net/ad93c9fc-8b53-4019-a2a1-ab580b17b1d3',
  },
  {
    label: 'testnet',
    primary: 'https://api.testnet.solana.com',
  },
  {
    label: 'devnet',
    primary: 'https://api.devnet.solana.com',
  },
]

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null)

export const getInitialProps = async ({
  ctx,
}: {
  ctx: NextPageContext
}): Promise<{ cluster: string }> => {
  const host = ctx.req?.headers.host || ctx.query.host
  const cluster = host?.includes('dev')
    ? 'devnet'
    : (ctx.query.project || ctx.query.host)?.includes('test')
      ? 'testnet'
      : ctx.query.cluster || process.env.BASE_CLUSTER
  return {
    cluster: firstParam(cluster),
  }
}

export function EnvironmentProvider({
  children,
  defaultCluster,
}: {
  children: React.ReactChild
  defaultCluster: string
}) {
  const { query } = useRouter()
  const cluster = (query.project || query.host)?.includes('dev')
    ? 'devnet'
    : query.host?.includes('test')
      ? 'testnet'
      : query.cluster || defaultCluster || process.env.BASE_CLUSTER
  const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
  const [environment, setEnvironment] = useState<Environment>(
    foundEnvironment ?? ENVIRONMENTS[0]!
  )

  useMemo(() => {
    const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
    setEnvironment(foundEnvironment ?? ENVIRONMENTS[0]!)
  }, [cluster])

  const connection = useMemo(
    () => new Connection(environment.primary, {
      commitment: 'recent',
      httpHeaders: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3NDMwMTg3LCJleHAiOjE2Njc1MTY1ODd9.WXuSfWnzQVpje5idyb6CdochOZTpaz5Rap9WHHD1OzZr7K-LvL-XSGoowRtZ6afZjDnX_MRaXkpItzCFv1EZz3L-ua9N3kmBxKKgsup61-SbRfx0p8D0OCsX0WD5EAKOte_rBU3H0LbVXX91sXwmCo0rP-bpAF37Aqb282SLPPbywdM4EZPgi7JmgH5ipYTghHh5PpcWyzUR59n-5OowXYbSAaeW-nJ5WBdBFt-t8LXFR3TS3DZ5AtD-L3w1OY4FX6O1Z43k7k1nHgVYmBdHFnyl3XC4ypB7IcL-IjSW-JkkH0PH-3VUHDGSC3PpiHUR9pdM7iTvxx1fapmPz96avaLuBolQT7J9IVZxB2L-xG_1I690ho-Ur1SwD2BTZSwhYQ55j3pK5HbHCDNzUWUBYPwlb6LzNl7jvI18NdxDBMM7lH6JkasVu4g85X3tr5zIjtAK0rBCDW_9YrsOBqJOJaMu_b6ppp5qboO8k0jrScwZQOjLrajy0NQJdFwQgSYYHZ0xGKKPPX1xpwmu2nvhJKwc1qZjQ0F8cUuPI_0iWnclmewbZCMR28WpBT3sXUG2KNNhJKyVpcdb07qo7Pr9dsv0xVnUq7HyHTVVgaMqhb89kANNiX8iesNR8qnCqpVesPjwBCUpgGmWYE0kqQBfWaAzatEaLwmbVwGO-swLAIw`,
      },
    }),
    [environment]
  )

  const secondaryConnection = useMemo(
    () =>
      new Connection(environment.secondary ?? environment.primary, {
        commitment: 'recent',
        httpHeaders: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3NDMwMTg3LCJleHAiOjE2Njc1MTY1ODd9.WXuSfWnzQVpje5idyb6CdochOZTpaz5Rap9WHHD1OzZr7K-LvL-XSGoowRtZ6afZjDnX_MRaXkpItzCFv1EZz3L-ua9N3kmBxKKgsup61-SbRfx0p8D0OCsX0WD5EAKOte_rBU3H0LbVXX91sXwmCo0rP-bpAF37Aqb282SLPPbywdM4EZPgi7JmgH5ipYTghHh5PpcWyzUR59n-5OowXYbSAaeW-nJ5WBdBFt-t8LXFR3TS3DZ5AtD-L3w1OY4FX6O1Z43k7k1nHgVYmBdHFnyl3XC4ypB7IcL-IjSW-JkkH0PH-3VUHDGSC3PpiHUR9pdM7iTvxx1fapmPz96avaLuBolQT7J9IVZxB2L-xG_1I690ho-Ur1SwD2BTZSwhYQ55j3pK5HbHCDNzUWUBYPwlb6LzNl7jvI18NdxDBMM7lH6JkasVu4g85X3tr5zIjtAK0rBCDW_9YrsOBqJOJaMu_b6ppp5qboO8k0jrScwZQOjLrajy0NQJdFwQgSYYHZ0xGKKPPX1xpwmu2nvhJKwc1qZjQ0F8cUuPI_0iWnclmewbZCMR28WpBT3sXUG2KNNhJKyVpcdb07qo7Pr9dsv0xVnUq7HyHTVVgaMqhb89kANNiX8iesNR8qnCqpVesPjwBCUpgGmWYE0kqQBfWaAzatEaLwmbVwGO-swLAIw`,
        },
      }),
    [environment]
  )

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        connection,
        secondaryConnection,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironmentCtx(): EnvironmentContextValues {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return context
}
