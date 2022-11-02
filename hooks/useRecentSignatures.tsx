import { ConfirmedSignatureInfo, PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useQuery } from 'react-query'

export const useRecentSignatures = (address: PublicKey | undefined) => {
  const { environment } = useEnvironmentCtx()
  const connection = new Connection(environment.primary, {
    commitment: 'confirmed',
    httpHeaders: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3NDMwMTg3LCJleHAiOjE2Njc1MTY1ODd9.WXuSfWnzQVpje5idyb6CdochOZTpaz5Rap9WHHD1OzZr7K-LvL-XSGoowRtZ6afZjDnX_MRaXkpItzCFv1EZz3L-ua9N3kmBxKKgsup61-SbRfx0p8D0OCsX0WD5EAKOte_rBU3H0LbVXX91sXwmCo0rP-bpAF37Aqb282SLPPbywdM4EZPgi7JmgH5ipYTghHh5PpcWyzUR59n-5OowXYbSAaeW-nJ5WBdBFt-t8LXFR3TS3DZ5AtD-L3w1OY4FX6O1Z43k7k1nHgVYmBdHFnyl3XC4ypB7IcL-IjSW-JkkH0PH-3VUHDGSC3PpiHUR9pdM7iTvxx1fapmPz96avaLuBolQT7J9IVZxB2L-xG_1I690ho-Ur1SwD2BTZSwhYQ55j3pK5HbHCDNzUWUBYPwlb6LzNl7jvI18NdxDBMM7lH6JkasVu4g85X3tr5zIjtAK0rBCDW_9YrsOBqJOJaMu_b6ppp5qboO8k0jrScwZQOjLrajy0NQJdFwQgSYYHZ0xGKKPPX1xpwmu2nvhJKwc1qZjQ0F8cUuPI_0iWnclmewbZCMR28WpBT3sXUG2KNNhJKyVpcdb07qo7Pr9dsv0xVnUq7HyHTVVgaMqhb89kANNiX8iesNR8qnCqpVesPjwBCUpgGmWYE0kqQBfWaAzatEaLwmbVwGO-swLAIw`,
    },
  })
  return useQuery<ConfirmedSignatureInfo[] | undefined>(
    ['useRecentSignatures', address?.toString()],
    async () => {
      if (!address) return
      return connection.getSignaturesForAddress(
        address,
        { limit: 10 },
        'confirmed'
      )
    },
    { refetchInterval: 3000 }
  )
}
