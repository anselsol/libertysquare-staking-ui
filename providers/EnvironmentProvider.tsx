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
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MjA2Nzg5LCJleHAiOjE2NjcyOTMxODl9.itLGVxm_9cTa7PHoWxXlAQK8JZ6LS_QB67hXz8adFmAOdpjYTwJkcCvO_WbhZGLMZtkgiizyNCACk53VopxL0PnjdFG_0KNRyuSLZ4mzRGZWprMIdjOceMrf5tkxoQBmh_J5_X2PSzq81cJIJgM95bBGcuM4qedOi5BKpY3YP09WlkPUFsbMERSpXWokt1TiK0t5xQcs9mL-6E4biod2EUHggkJqUJJJhs4iHooen6ToIifWHD56R5VvwCtogT4E1I0FewopOJgOsZNcWDT6ziw1jdew86hMKZvA1OOhdFjhqehvDwUYbJ1b1M645VfaItJg4mYvTvartVrxxr6ZlKo0g3mmU19PRL9CPuprj_26otvDLDp-5pQAOaDzwqnqiSgUprqLfyJQSQ7SiQX06EQGNnmRt99XPxK6Ih5MEfTSyNcyNMzLBigAIvQZXvEz8tMRU_gpEQFo2nA8DAJhtfPMlBypG1p89ZdUufEWEj8DbVMsEQoBaaoG5tBRV37Tv4gPmXiLjlXt-2yex5UfX9UV154yofiXxbaIhJVepbsaZuDXGw0bqPgXsIZaXAd1twdWuf9yWr8Sd_UcE0qds6P5y5IZf7wZPY1K5u6Hy0FEn0sQZ4t_DZscfClQ9QckoY1987iJrme-l6DrUsiG56tzkaDoJ45jykCRFYKbSKM`,
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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MjA2Nzg5LCJleHAiOjE2NjcyOTMxODl9.itLGVxm_9cTa7PHoWxXlAQK8JZ6LS_QB67hXz8adFmAOdpjYTwJkcCvO_WbhZGLMZtkgiizyNCACk53VopxL0PnjdFG_0KNRyuSLZ4mzRGZWprMIdjOceMrf5tkxoQBmh_J5_X2PSzq81cJIJgM95bBGcuM4qedOi5BKpY3YP09WlkPUFsbMERSpXWokt1TiK0t5xQcs9mL-6E4biod2EUHggkJqUJJJhs4iHooen6ToIifWHD56R5VvwCtogT4E1I0FewopOJgOsZNcWDT6ziw1jdew86hMKZvA1OOhdFjhqehvDwUYbJ1b1M645VfaItJg4mYvTvartVrxxr6ZlKo0g3mmU19PRL9CPuprj_26otvDLDp-5pQAOaDzwqnqiSgUprqLfyJQSQ7SiQX06EQGNnmRt99XPxK6Ih5MEfTSyNcyNMzLBigAIvQZXvEz8tMRU_gpEQFo2nA8DAJhtfPMlBypG1p89ZdUufEWEj8DbVMsEQoBaaoG5tBRV37Tv4gPmXiLjlXt-2yex5UfX9UV154yofiXxbaIhJVepbsaZuDXGw0bqPgXsIZaXAd1twdWuf9yWr8Sd_UcE0qds6P5y5IZf7wZPY1K5u6Hy0FEn0sQZ4t_DZscfClQ9QckoY1987iJrme-l6DrUsiG56tzkaDoJ45jykCRFYKbSKM`,
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
