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
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MDM1NjI1LCJleHAiOjE2NjcxMjIwMjV9.UAyTh9I8bwXecVjGwUfntDLFfHqELfbFgGLEzl75WHE7yeVQX-kyQVvFWPee5V95egr84LQTNzT8osMIyOdJp_0PeHvtEhh9QNWsygfeDwiXLOo17WvVhTwrHVxgpleIZy2QwE6cNp2JgDpmAPnxvG-9ODzZP9SdocIP-SPl2QC_8XXMp0NyscGSt1vYkk-uNO2czRET9ud64o7y5eOF4HXWZzqisViTg2hP0Gt3Rx43zDTJ6qTlhNSDNSHtoWhwaQmRuYDC_eKgBPEcz3meGdCGvBU9_wPkjKddgQUrRPQI7LC1wTc9B-btBAkiXqG0YzIh56QoFj_4djcjAFlZoqOfUsEIpGH6DUK177biuV5h6F1GAP4lsVxdwKAGaa78dWpbT0s8kTZ2z_L-GyEp3lG7mkaNEcezcGu6aWgSZIA5U3RrWvmtcorOgiRRJhA3FpV1squwgWucXXN23yvSK-hIhOuc8eM8i0Qgnk-KXWNXvrOkRrqI6x4legafxUs2FsfHoBIPWX8wtrgLyIso1c71Ys3B20dYTGMITB3DJQmAg_HDkpq7wvbsm-wHzYd5UcZDISDsNV2WMA-GUV8vOBSkYDvleQg-33lwClXpzVEJ9c07-Achfv8urMnI25b40YQ_plJBmCEhPg_3VlLzSNuuto8dE0oXuSDb7q0SWmo`,
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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MDM1NjI1LCJleHAiOjE2NjcxMjIwMjV9.UAyTh9I8bwXecVjGwUfntDLFfHqELfbFgGLEzl75WHE7yeVQX-kyQVvFWPee5V95egr84LQTNzT8osMIyOdJp_0PeHvtEhh9QNWsygfeDwiXLOo17WvVhTwrHVxgpleIZy2QwE6cNp2JgDpmAPnxvG-9ODzZP9SdocIP-SPl2QC_8XXMp0NyscGSt1vYkk-uNO2czRET9ud64o7y5eOF4HXWZzqisViTg2hP0Gt3Rx43zDTJ6qTlhNSDNSHtoWhwaQmRuYDC_eKgBPEcz3meGdCGvBU9_wPkjKddgQUrRPQI7LC1wTc9B-btBAkiXqG0YzIh56QoFj_4djcjAFlZoqOfUsEIpGH6DUK177biuV5h6F1GAP4lsVxdwKAGaa78dWpbT0s8kTZ2z_L-GyEp3lG7mkaNEcezcGu6aWgSZIA5U3RrWvmtcorOgiRRJhA3FpV1squwgWucXXN23yvSK-hIhOuc8eM8i0Qgnk-KXWNXvrOkRrqI6x4legafxUs2FsfHoBIPWX8wtrgLyIso1c71Ys3B20dYTGMITB3DJQmAg_HDkpq7wvbsm-wHzYd5UcZDISDsNV2WMA-GUV8vOBSkYDvleQg-33lwClXpzVEJ9c07-Achfv8urMnI25b40YQ_plJBmCEhPg_3VlLzSNuuto8dE0oXuSDb7q0SWmo`,
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
