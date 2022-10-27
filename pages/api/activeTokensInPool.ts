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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY2ODk1ODMzLCJleHAiOjE2NjY5ODIyMzN9.WAKAXuAtXpGIDMFXtBJjPtgFmcsT7gEScLbk8xRRgLWd7eyQGhSxEoiJPBI2zEZmW9VbMY_DgqCd7bD-yKdUY7hXK-PIGZLXJLujTIOSadZ-9DWRSG-3pF3GbcEZ0ODTDB0gXu414b0L7mb9y-O4dwalp2jeO91gyoD4wN_PHO-XNQ685Y503FrUDV3TzuiYAblzzdEKXhswAtOE5fG-hVxVozPUJ1A0hiVjF8_ds4mtWxpc1XHW9hLHHDOKI_AHfgHXQLfeEUkXVrWoSctrmMRKLIEKm2BwYN6N4TLUjOPivjlvg_vpXEPvNol4L0M8GjJtzvN_RVb1AER_T0M-fWwukzBfFgyInBcnrwdr92HgnVBxgQpLCI-BfqioS3rDbB_0ReggFyflO3GTBD6bbxI697tUXSFY8_j_3Y3DN5zopB1H8rI21ortjL8Jx9ukoznHIzJ5bSrFb89QYhRu7xp62wKzShZFQijsZWnnyBvGbNpMfTwVD4lo2FfVVH93NSkMnZNhLxqHNHFYHUjI1v42tRnx44GwcZR0eSedKDh8ng1QmQccRoaCRloPwhKqRmwYKJfzvLxBwemBjxDluIXKRF3FToGyWwGS_8kMXQogljETmKhmRd2uWeVgR4eXrHERTs-dPKnbI5OcCMB8pFRVDmwgA4wGwv4b9GzwVGM`,
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
