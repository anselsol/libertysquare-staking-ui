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
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY2ODk1ODMzLCJleHAiOjE2NjY5ODIyMzN9.WAKAXuAtXpGIDMFXtBJjPtgFmcsT7gEScLbk8xRRgLWd7eyQGhSxEoiJPBI2zEZmW9VbMY_DgqCd7bD-yKdUY7hXK-PIGZLXJLujTIOSadZ-9DWRSG-3pF3GbcEZ0ODTDB0gXu414b0L7mb9y-O4dwalp2jeO91gyoD4wN_PHO-XNQ685Y503FrUDV3TzuiYAblzzdEKXhswAtOE5fG-hVxVozPUJ1A0hiVjF8_ds4mtWxpc1XHW9hLHHDOKI_AHfgHXQLfeEUkXVrWoSctrmMRKLIEKm2BwYN6N4TLUjOPivjlvg_vpXEPvNol4L0M8GjJtzvN_RVb1AER_T0M-fWwukzBfFgyInBcnrwdr92HgnVBxgQpLCI-BfqioS3rDbB_0ReggFyflO3GTBD6bbxI697tUXSFY8_j_3Y3DN5zopB1H8rI21ortjL8Jx9ukoznHIzJ5bSrFb89QYhRu7xp62wKzShZFQijsZWnnyBvGbNpMfTwVD4lo2FfVVH93NSkMnZNhLxqHNHFYHUjI1v42tRnx44GwcZR0eSedKDh8ng1QmQccRoaCRloPwhKqRmwYKJfzvLxBwemBjxDluIXKRF3FToGyWwGS_8kMXQogljETmKhmRd2uWeVgR4eXrHERTs-dPKnbI5OcCMB8pFRVDmwgA4wGwv4b9GzwVGM`,
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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY2ODk1ODMzLCJleHAiOjE2NjY5ODIyMzN9.WAKAXuAtXpGIDMFXtBJjPtgFmcsT7gEScLbk8xRRgLWd7eyQGhSxEoiJPBI2zEZmW9VbMY_DgqCd7bD-yKdUY7hXK-PIGZLXJLujTIOSadZ-9DWRSG-3pF3GbcEZ0ODTDB0gXu414b0L7mb9y-O4dwalp2jeO91gyoD4wN_PHO-XNQ685Y503FrUDV3TzuiYAblzzdEKXhswAtOE5fG-hVxVozPUJ1A0hiVjF8_ds4mtWxpc1XHW9hLHHDOKI_AHfgHXQLfeEUkXVrWoSctrmMRKLIEKm2BwYN6N4TLUjOPivjlvg_vpXEPvNol4L0M8GjJtzvN_RVb1AER_T0M-fWwukzBfFgyInBcnrwdr92HgnVBxgQpLCI-BfqioS3rDbB_0ReggFyflO3GTBD6bbxI697tUXSFY8_j_3Y3DN5zopB1H8rI21ortjL8Jx9ukoznHIzJ5bSrFb89QYhRu7xp62wKzShZFQijsZWnnyBvGbNpMfTwVD4lo2FfVVH93NSkMnZNhLxqHNHFYHUjI1v42tRnx44GwcZR0eSedKDh8ng1QmQccRoaCRloPwhKqRmwYKJfzvLxBwemBjxDluIXKRF3FToGyWwGS_8kMXQogljETmKhmRd2uWeVgR4eXrHERTs-dPKnbI5OcCMB8pFRVDmwgA4wGwv4b9GzwVGM`,
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
