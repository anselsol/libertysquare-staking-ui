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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY2ODk1ODMzLCJleHAiOjE2NjY5ODIyMzN9.WAKAXuAtXpGIDMFXtBJjPtgFmcsT7gEScLbk8xRRgLWd7eyQGhSxEoiJPBI2zEZmW9VbMY_DgqCd7bD-yKdUY7hXK-PIGZLXJLujTIOSadZ-9DWRSG-3pF3GbcEZ0ODTDB0gXu414b0L7mb9y-O4dwalp2jeO91gyoD4wN_PHO-XNQ685Y503FrUDV3TzuiYAblzzdEKXhswAtOE5fG-hVxVozPUJ1A0hiVjF8_ds4mtWxpc1XHW9hLHHDOKI_AHfgHXQLfeEUkXVrWoSctrmMRKLIEKm2BwYN6N4TLUjOPivjlvg_vpXEPvNol4L0M8GjJtzvN_RVb1AER_T0M-fWwukzBfFgyInBcnrwdr92HgnVBxgQpLCI-BfqioS3rDbB_0ReggFyflO3GTBD6bbxI697tUXSFY8_j_3Y3DN5zopB1H8rI21ortjL8Jx9ukoznHIzJ5bSrFb89QYhRu7xp62wKzShZFQijsZWnnyBvGbNpMfTwVD4lo2FfVVH93NSkMnZNhLxqHNHFYHUjI1v42tRnx44GwcZR0eSedKDh8ng1QmQccRoaCRloPwhKqRmwYKJfzvLxBwemBjxDluIXKRF3FToGyWwGS_8kMXQogljETmKhmRd2uWeVgR4eXrHERTs-dPKnbI5OcCMB8pFRVDmwgA4wGwv4b9GzwVGM`,
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
