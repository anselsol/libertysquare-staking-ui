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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3NDMwMTg3LCJleHAiOjE2Njc1MTY1ODd9.WXuSfWnzQVpje5idyb6CdochOZTpaz5Rap9WHHD1OzZr7K-LvL-XSGoowRtZ6afZjDnX_MRaXkpItzCFv1EZz3L-ua9N3kmBxKKgsup61-SbRfx0p8D0OCsX0WD5EAKOte_rBU3H0LbVXX91sXwmCo0rP-bpAF37Aqb282SLPPbywdM4EZPgi7JmgH5ipYTghHh5PpcWyzUR59n-5OowXYbSAaeW-nJ5WBdBFt-t8LXFR3TS3DZ5AtD-L3w1OY4FX6O1Z43k7k1nHgVYmBdHFnyl3XC4ypB7IcL-IjSW-JkkH0PH-3VUHDGSC3PpiHUR9pdM7iTvxx1fapmPz96avaLuBolQT7J9IVZxB2L-xG_1I690ho-Ur1SwD2BTZSwhYQ55j3pK5HbHCDNzUWUBYPwlb6LzNl7jvI18NdxDBMM7lH6JkasVu4g85X3tr5zIjtAK0rBCDW_9YrsOBqJOJaMu_b6ppp5qboO8k0jrScwZQOjLrajy0NQJdFwQgSYYHZ0xGKKPPX1xpwmu2nvhJKwc1qZjQ0F8cUuPI_0iWnclmewbZCMR28WpBT3sXUG2KNNhJKyVpcdb07qo7Pr9dsv0xVnUq7HyHTVVgaMqhb89kANNiX8iesNR8qnCqpVesPjwBCUpgGmWYE0kqQBfWaAzatEaLwmbVwGO-swLAIw`,
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
