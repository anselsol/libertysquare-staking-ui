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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MDM1NjI1LCJleHAiOjE2NjcxMjIwMjV9.UAyTh9I8bwXecVjGwUfntDLFfHqELfbFgGLEzl75WHE7yeVQX-kyQVvFWPee5V95egr84LQTNzT8osMIyOdJp_0PeHvtEhh9QNWsygfeDwiXLOo17WvVhTwrHVxgpleIZy2QwE6cNp2JgDpmAPnxvG-9ODzZP9SdocIP-SPl2QC_8XXMp0NyscGSt1vYkk-uNO2czRET9ud64o7y5eOF4HXWZzqisViTg2hP0Gt3Rx43zDTJ6qTlhNSDNSHtoWhwaQmRuYDC_eKgBPEcz3meGdCGvBU9_wPkjKddgQUrRPQI7LC1wTc9B-btBAkiXqG0YzIh56QoFj_4djcjAFlZoqOfUsEIpGH6DUK177biuV5h6F1GAP4lsVxdwKAGaa78dWpbT0s8kTZ2z_L-GyEp3lG7mkaNEcezcGu6aWgSZIA5U3RrWvmtcorOgiRRJhA3FpV1squwgWucXXN23yvSK-hIhOuc8eM8i0Qgnk-KXWNXvrOkRrqI6x4legafxUs2FsfHoBIPWX8wtrgLyIso1c71Ys3B20dYTGMITB3DJQmAg_HDkpq7wvbsm-wHzYd5UcZDISDsNV2WMA-GUV8vOBSkYDvleQg-33lwClXpzVEJ9c07-Achfv8urMnI25b40YQ_plJBmCEhPg_3VlLzSNuuto8dE0oXuSDb7q0SWmo`,
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
