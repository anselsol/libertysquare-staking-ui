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
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MTI4NjYwLCJleHAiOjE2NjcyMTUwNjB9.lPdGNxKd0hEnW1KqasXY1jiN6nRH4vhbcys5dXrYV7lCNH-_8EraQoQhLIz5604_pFLtyeeEyP0SbEqWdWg1peS7jQKNn9TaPqXEn5KU_jb8F-pdb89G8i8SzqjR-hNgdnJKJoY8KueC1BUAwjyudq22dRzdqRixa9fSfK9XYTFbAVo4CYMTX7K3M7Hpt7alqM69FtaEiJHBxFjR3HQTprZgoNrOYgDYZRUTRsjb9rGq3nm57sQnB1DEpZRPt_EWqrhHS1uef5pxkNcc_T_FTNUV69NmsGLpXKZHfjtu2NzrNMyGvhl0Uo4WLDBvn8OhC1JjGwttk5_JvGCIxeueMY3kV023B2-1dk9-hNqIIbzq4E5w6bgzBduABPgA-tu0TNRUOdv_iU8TUvLZdnUV6gy-ckdsQClICUUIZjiH3IV-ER6EJnWs3m3mHr-GJqui6_2SMBREEMinqBHKL6eAeFqJHWX1lpGl_c3kdulCcbWLhWf2rzQLPdVoPXRdcNJHcUl5Tiw907WtENC9qpm83HBDveYtZmC7efSixdL9dXvQIDo9cgOgFuyS85Fw8tQZLC2u71ip5wLyVRn_DZPtsax_bV97Cu2fZtgAbQrYtmmU4b1NeiPD2MXS22R3QJrXdHTVRjkjg_1Uy-SoVCPV3FxDO4AEjnAfhph3tamu7l0`,
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
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MTI4NjYwLCJleHAiOjE2NjcyMTUwNjB9.lPdGNxKd0hEnW1KqasXY1jiN6nRH4vhbcys5dXrYV7lCNH-_8EraQoQhLIz5604_pFLtyeeEyP0SbEqWdWg1peS7jQKNn9TaPqXEn5KU_jb8F-pdb89G8i8SzqjR-hNgdnJKJoY8KueC1BUAwjyudq22dRzdqRixa9fSfK9XYTFbAVo4CYMTX7K3M7Hpt7alqM69FtaEiJHBxFjR3HQTprZgoNrOYgDYZRUTRsjb9rGq3nm57sQnB1DEpZRPt_EWqrhHS1uef5pxkNcc_T_FTNUV69NmsGLpXKZHfjtu2NzrNMyGvhl0Uo4WLDBvn8OhC1JjGwttk5_JvGCIxeueMY3kV023B2-1dk9-hNqIIbzq4E5w6bgzBduABPgA-tu0TNRUOdv_iU8TUvLZdnUV6gy-ckdsQClICUUIZjiH3IV-ER6EJnWs3m3mHr-GJqui6_2SMBREEMinqBHKL6eAeFqJHWX1lpGl_c3kdulCcbWLhWf2rzQLPdVoPXRdcNJHcUl5Tiw907WtENC9qpm83HBDveYtZmC7efSixdL9dXvQIDo9cgOgFuyS85Fw8tQZLC2u71ip5wLyVRn_DZPtsax_bV97Cu2fZtgAbQrYtmmU4b1NeiPD2MXS22R3QJrXdHTVRjkjg_1Uy-SoVCPV3FxDO4AEjnAfhph3tamu7l0`,
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
