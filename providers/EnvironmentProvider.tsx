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
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MzAxMTM1LCJleHAiOjE2NjczODc1MzV9.HlUoK2tmvWalC7zRCV-4mjiGHK214YhNr-hIFhai8VxnQgZX5ot6SBYIPoWg1hQK-St9et1ebuCCb1jXJDkwPBWnoHY2Ri404jtv_RkHRX-xP9NXxMct7r0RatR7UxBCuX8yX3TPK9l3ppdVkiC76cxjOBXYVbI--tImRakSwlHn2rXOzcgstbk8xn7fRzIz7vea9YtPW_HaDlvX-GLVp7aZNfcF-S97bZEadEF1vAQDbSYjIawItN3kZvjuAm9s-6EpeQyPoBDWKiZTU-pMfOS3eDJE7NRuSsE3BWkuUPC3bjsjitNLzfUjPwqV0ZKYU1nz82yu-v1uB69vOMBIM-W8Er3s1w1f_qpME_rqNyvKBqiDakRKzDacWnDIRolSjzy1F2q4Xna0JQrx9hQ8wqHtk5sJoqY0tK6z6k6nK2sLYSAZaJmV1_kdsnKJ1cLi_Lp1VI2WToZyGrRwo33cIgCWhRMjjDA15VgrWdWwmi6arliy2hJz950iAhjZVVWsTsfPWgHNPZAYP7mnzouJ91FkKnprRPO_rggSVP8S6LxQPxZ3mpJzx-CdUjNPApMIecs-_LNmNk8z4Lpi8JfD0siZ9DxKXc_ChiMA2F3H35M178wyUacaAq58sOdLMCrqQXWHUbk0M4NZCwGAVBz5ZsMw8hsSSMn7-Y7ONW3goa0`,
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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MzAxMTM1LCJleHAiOjE2NjczODc1MzV9.HlUoK2tmvWalC7zRCV-4mjiGHK214YhNr-hIFhai8VxnQgZX5ot6SBYIPoWg1hQK-St9et1ebuCCb1jXJDkwPBWnoHY2Ri404jtv_RkHRX-xP9NXxMct7r0RatR7UxBCuX8yX3TPK9l3ppdVkiC76cxjOBXYVbI--tImRakSwlHn2rXOzcgstbk8xn7fRzIz7vea9YtPW_HaDlvX-GLVp7aZNfcF-S97bZEadEF1vAQDbSYjIawItN3kZvjuAm9s-6EpeQyPoBDWKiZTU-pMfOS3eDJE7NRuSsE3BWkuUPC3bjsjitNLzfUjPwqV0ZKYU1nz82yu-v1uB69vOMBIM-W8Er3s1w1f_qpME_rqNyvKBqiDakRKzDacWnDIRolSjzy1F2q4Xna0JQrx9hQ8wqHtk5sJoqY0tK6z6k6nK2sLYSAZaJmV1_kdsnKJ1cLi_Lp1VI2WToZyGrRwo33cIgCWhRMjjDA15VgrWdWwmi6arliy2hJz950iAhjZVVWsTsfPWgHNPZAYP7mnzouJ91FkKnprRPO_rggSVP8S6LxQPxZ3mpJzx-CdUjNPApMIecs-_LNmNk8z4Lpi8JfD0siZ9DxKXc_ChiMA2F3H35M178wyUacaAq58sOdLMCrqQXWHUbk0M4NZCwGAVBz5ZsMw8hsSSMn7-Y7ONW3goa0`,
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
