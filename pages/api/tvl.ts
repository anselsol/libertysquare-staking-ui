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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MzAxMTM1LCJleHAiOjE2NjczODc1MzV9.HlUoK2tmvWalC7zRCV-4mjiGHK214YhNr-hIFhai8VxnQgZX5ot6SBYIPoWg1hQK-St9et1ebuCCb1jXJDkwPBWnoHY2Ri404jtv_RkHRX-xP9NXxMct7r0RatR7UxBCuX8yX3TPK9l3ppdVkiC76cxjOBXYVbI--tImRakSwlHn2rXOzcgstbk8xn7fRzIz7vea9YtPW_HaDlvX-GLVp7aZNfcF-S97bZEadEF1vAQDbSYjIawItN3kZvjuAm9s-6EpeQyPoBDWKiZTU-pMfOS3eDJE7NRuSsE3BWkuUPC3bjsjitNLzfUjPwqV0ZKYU1nz82yu-v1uB69vOMBIM-W8Er3s1w1f_qpME_rqNyvKBqiDakRKzDacWnDIRolSjzy1F2q4Xna0JQrx9hQ8wqHtk5sJoqY0tK6z6k6nK2sLYSAZaJmV1_kdsnKJ1cLi_Lp1VI2WToZyGrRwo33cIgCWhRMjjDA15VgrWdWwmi6arliy2hJz950iAhjZVVWsTsfPWgHNPZAYP7mnzouJ91FkKnprRPO_rggSVP8S6LxQPxZ3mpJzx-CdUjNPApMIecs-_LNmNk8z4Lpi8JfD0siZ9DxKXc_ChiMA2F3H35M178wyUacaAq58sOdLMCrqQXWHUbk0M4NZCwGAVBz5ZsMw8hsSSMn7-Y7ONW3goa0`,
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
