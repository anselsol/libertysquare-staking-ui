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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MzAxMTM1LCJleHAiOjE2NjczODc1MzV9.HlUoK2tmvWalC7zRCV-4mjiGHK214YhNr-hIFhai8VxnQgZX5ot6SBYIPoWg1hQK-St9et1ebuCCb1jXJDkwPBWnoHY2Ri404jtv_RkHRX-xP9NXxMct7r0RatR7UxBCuX8yX3TPK9l3ppdVkiC76cxjOBXYVbI--tImRakSwlHn2rXOzcgstbk8xn7fRzIz7vea9YtPW_HaDlvX-GLVp7aZNfcF-S97bZEadEF1vAQDbSYjIawItN3kZvjuAm9s-6EpeQyPoBDWKiZTU-pMfOS3eDJE7NRuSsE3BWkuUPC3bjsjitNLzfUjPwqV0ZKYU1nz82yu-v1uB69vOMBIM-W8Er3s1w1f_qpME_rqNyvKBqiDakRKzDacWnDIRolSjzy1F2q4Xna0JQrx9hQ8wqHtk5sJoqY0tK6z6k6nK2sLYSAZaJmV1_kdsnKJ1cLi_Lp1VI2WToZyGrRwo33cIgCWhRMjjDA15VgrWdWwmi6arliy2hJz950iAhjZVVWsTsfPWgHNPZAYP7mnzouJ91FkKnprRPO_rggSVP8S6LxQPxZ3mpJzx-CdUjNPApMIecs-_LNmNk8z4Lpi8JfD0siZ9DxKXc_ChiMA2F3H35M178wyUacaAq58sOdLMCrqQXWHUbk0M4NZCwGAVBz5ZsMw8hsSSMn7-Y7ONW3goa0`,
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
