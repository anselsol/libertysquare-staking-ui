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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MjA2Nzg5LCJleHAiOjE2NjcyOTMxODl9.itLGVxm_9cTa7PHoWxXlAQK8JZ6LS_QB67hXz8adFmAOdpjYTwJkcCvO_WbhZGLMZtkgiizyNCACk53VopxL0PnjdFG_0KNRyuSLZ4mzRGZWprMIdjOceMrf5tkxoQBmh_J5_X2PSzq81cJIJgM95bBGcuM4qedOi5BKpY3YP09WlkPUFsbMERSpXWokt1TiK0t5xQcs9mL-6E4biod2EUHggkJqUJJJhs4iHooen6ToIifWHD56R5VvwCtogT4E1I0FewopOJgOsZNcWDT6ziw1jdew86hMKZvA1OOhdFjhqehvDwUYbJ1b1M645VfaItJg4mYvTvartVrxxr6ZlKo0g3mmU19PRL9CPuprj_26otvDLDp-5pQAOaDzwqnqiSgUprqLfyJQSQ7SiQX06EQGNnmRt99XPxK6Ih5MEfTSyNcyNMzLBigAIvQZXvEz8tMRU_gpEQFo2nA8DAJhtfPMlBypG1p89ZdUufEWEj8DbVMsEQoBaaoG5tBRV37Tv4gPmXiLjlXt-2yex5UfX9UV154yofiXxbaIhJVepbsaZuDXGw0bqPgXsIZaXAd1twdWuf9yWr8Sd_UcE0qds6P5y5IZf7wZPY1K5u6Hy0FEn0sQZ4t_DZscfClQ9QckoY1987iJrme-l6DrUsiG56tzkaDoJ45jykCRFYKbSKM`,
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
