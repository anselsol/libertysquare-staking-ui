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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MTI4NjYwLCJleHAiOjE2NjcyMTUwNjB9.lPdGNxKd0hEnW1KqasXY1jiN6nRH4vhbcys5dXrYV7lCNH-_8EraQoQhLIz5604_pFLtyeeEyP0SbEqWdWg1peS7jQKNn9TaPqXEn5KU_jb8F-pdb89G8i8SzqjR-hNgdnJKJoY8KueC1BUAwjyudq22dRzdqRixa9fSfK9XYTFbAVo4CYMTX7K3M7Hpt7alqM69FtaEiJHBxFjR3HQTprZgoNrOYgDYZRUTRsjb9rGq3nm57sQnB1DEpZRPt_EWqrhHS1uef5pxkNcc_T_FTNUV69NmsGLpXKZHfjtu2NzrNMyGvhl0Uo4WLDBvn8OhC1JjGwttk5_JvGCIxeueMY3kV023B2-1dk9-hNqIIbzq4E5w6bgzBduABPgA-tu0TNRUOdv_iU8TUvLZdnUV6gy-ckdsQClICUUIZjiH3IV-ER6EJnWs3m3mHr-GJqui6_2SMBREEMinqBHKL6eAeFqJHWX1lpGl_c3kdulCcbWLhWf2rzQLPdVoPXRdcNJHcUl5Tiw907WtENC9qpm83HBDveYtZmC7efSixdL9dXvQIDo9cgOgFuyS85Fw8tQZLC2u71ip5wLyVRn_DZPtsax_bV97Cu2fZtgAbQrYtmmU4b1NeiPD2MXS22R3QJrXdHTVRjkjg_1Uy-SoVCPV3FxDO4AEjnAfhph3tamu7l0`,
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
