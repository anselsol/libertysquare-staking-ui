import { getAllStakeEntries } from '@cardinal/staking/dist/cjs/programs/stakePool/accounts'
import { Connection } from '@solana/web3.js'
import { firstParam } from 'common/utils'
import type { NextApiHandler } from 'next'
import { ENVIRONMENTS } from 'providers/EnvironmentProvider'

interface GetResponse {
  label: string
  icon: string
}

const get: NextApiHandler<GetResponse> = async (req, res) => {
  const { cluster: clusterParam } = req.query
  let mem: { mintId: string; name: string; floorPrice: number }[] = []
  let tvl = 0

  const foundEnvironment = ENVIRONMENTS.find(
    (e) => e.label === (firstParam(clusterParam) || 'mainnet-beta')
  )
  const connection = new Connection(foundEnvironment!.primary, {
    httpHeaders: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MjA2Nzg5LCJleHAiOjE2NjcyOTMxODl9.itLGVxm_9cTa7PHoWxXlAQK8JZ6LS_QB67hXz8adFmAOdpjYTwJkcCvO_WbhZGLMZtkgiizyNCACk53VopxL0PnjdFG_0KNRyuSLZ4mzRGZWprMIdjOceMrf5tkxoQBmh_J5_X2PSzq81cJIJgM95bBGcuM4qedOi5BKpY3YP09WlkPUFsbMERSpXWokt1TiK0t5xQcs9mL-6E4biod2EUHggkJqUJJJhs4iHooen6ToIifWHD56R5VvwCtogT4E1I0FewopOJgOsZNcWDT6ziw1jdew86hMKZvA1OOhdFjhqehvDwUYbJ1b1M645VfaItJg4mYvTvartVrxxr6ZlKo0g3mmU19PRL9CPuprj_26otvDLDp-5pQAOaDzwqnqiSgUprqLfyJQSQ7SiQX06EQGNnmRt99XPxK6Ih5MEfTSyNcyNMzLBigAIvQZXvEz8tMRU_gpEQFo2nA8DAJhtfPMlBypG1p89ZdUufEWEj8DbVMsEQoBaaoG5tBRV37Tv4gPmXiLjlXt-2yex5UfX9UV154yofiXxbaIhJVepbsaZuDXGw0bqPgXsIZaXAd1twdWuf9yWr8Sd_UcE0qds6P5y5IZf7wZPY1K5u6Hy0FEn0sQZ4t_DZscfClQ9QckoY1987iJrme-l6DrUsiG56tzkaDoJ45jykCRFYKbSKM`,
    },
  })
  const stakeEntries = await getAllStakeEntries(connection)
  const totalStakeEntries = stakeEntries.length
  const mintIds = stakeEntries.map((entry) =>
    entry.parsed.originalMint.toString()
  )

  for (let i = 0; i < mintIds.length; i++) {
    const mintId = mintIds[i]
    console.log(`Mint ${i + 1}/${totalStakeEntries}`)
    let successful = false
    while (!successful) {
      try {
        const foundMint = mem.find((c) => c.mintId === mintId)
        if (foundMint) {
          tvl += Number(foundMint.floorPrice)
          console.log(`Found cached mint id floor price`)
          console.log(foundMint)
          console.log(
            `Updated TVL: ${Number(tvl / 10 ** 9).toLocaleString()}\n`
          )
          continue
        }

        await sleep(1)
        console.log(`Fetching mint ${mintId} data`)
        let resp = await fetch(
          `https://api-mainnet.magiceden.dev/v2/tokens/${mintId}`
        ).then((r) => r.json())
        const collection = resp.collection

        const foundCol = mem.find((c) => c.name === collection)
        if (foundCol) {
          tvl += Number(foundCol.floorPrice)
          console.log(`Found cached collection floor price`)
          console.log(foundCol)
          console.log(
            `Updated TVL: ${Number(tvl / 10 ** 9).toLocaleString()}\n`
          )
          continue
        }

        await sleep(1)
        console.log(`Fetching collection floor price`)
        resp = await fetch(
          `https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`
        ).then((r) => r.json())
        tvl += Number(resp.floorPrice)
        console.log(`Updated TVL: ${Number(tvl / 10 ** 9).toLocaleString()}\n`)
        console.log(resp)
        mem.push({
          mintId: mintId!,
          name: collection,
          floorPrice: Number(resp.floorPrice),
        })
        successful = true
      } catch (e) {
        console.log(`Skipped mint ${mintId} because of error:, ${e}`)
      }
    }
  }
  console.log('TVL:', tvl / 10 ** 9)
  res.status(200).send({
    label: 'hey',
    icon: 'test',
  })
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
