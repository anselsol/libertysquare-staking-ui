import {
  getActiveStakeEntriesForPool,
  getAllStakeEntries,
} from '@cardinal/staking/dist/cjs/programs/stakePool/accounts'
import { Connection } from '@solana/web3.js'
import { firstParam, tryPublicKey } from 'common/utils'
import type { NextApiHandler } from 'next'
import { ENVIRONMENTS } from 'providers/EnvironmentProvider'

interface GetResponse {
  poolId?: string
  tokens?: string
  error?: string
}

const get: NextApiHandler<GetResponse> = async (req, res) => {
  const { cluster: clusterParam, stakePool: stakePoolId } = req.query
  const foundEnvironment = ENVIRONMENTS.find(
    (e) => e.label === (firstParam(clusterParam) || 'mainnet-beta')
  )
  const connection = new Connection(foundEnvironment!.primary, {
    httpHeaders: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MDM1NjI1LCJleHAiOjE2NjcxMjIwMjV9.UAyTh9I8bwXecVjGwUfntDLFfHqELfbFgGLEzl75WHE7yeVQX-kyQVvFWPee5V95egr84LQTNzT8osMIyOdJp_0PeHvtEhh9QNWsygfeDwiXLOo17WvVhTwrHVxgpleIZy2QwE6cNp2JgDpmAPnxvG-9ODzZP9SdocIP-SPl2QC_8XXMp0NyscGSt1vYkk-uNO2czRET9ud64o7y5eOF4HXWZzqisViTg2hP0Gt3Rx43zDTJ6qTlhNSDNSHtoWhwaQmRuYDC_eKgBPEcz3meGdCGvBU9_wPkjKddgQUrRPQI7LC1wTc9B-btBAkiXqG0YzIh56QoFj_4djcjAFlZoqOfUsEIpGH6DUK177biuV5h6F1GAP4lsVxdwKAGaa78dWpbT0s8kTZ2z_L-GyEp3lG7mkaNEcezcGu6aWgSZIA5U3RrWvmtcorOgiRRJhA3FpV1squwgWucXXN23yvSK-hIhOuc8eM8i0Qgnk-KXWNXvrOkRrqI6x4legafxUs2FsfHoBIPWX8wtrgLyIso1c71Ys3B20dYTGMITB3DJQmAg_HDkpq7wvbsm-wHzYd5UcZDISDsNV2WMA-GUV8vOBSkYDvleQg-33lwClXpzVEJ9c07-Achfv8urMnI25b40YQ_plJBmCEhPg_3VlLzSNuuto8dE0oXuSDb7q0SWmo`,
    },
  })
  const stakePoolPubkey = await tryPublicKey(stakePoolId)
  if (stakePoolPubkey) {
    const activeTokens = await getActiveStakeEntriesForPool(
      connection,
      stakePoolPubkey
    )
    res.status(200).send({
      poolId: stakePoolPubkey.toString(),
      tokens: String(activeTokens.length),
    })
  } else {
    res.status(200).send({
      error: 'Invalid stake pool ID provided',
    })
  }
}

const index: NextApiHandler<GetResponse> = async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  if (request.method === 'GET') return get(request, response)
  throw new Error(`Unexpected method ${request.method}`)
}

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, Math.ceil(time * 1000)))
}

export default index
