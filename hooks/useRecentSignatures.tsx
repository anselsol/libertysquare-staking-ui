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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY2ODk1ODMzLCJleHAiOjE2NjY5ODIyMzN9.WAKAXuAtXpGIDMFXtBJjPtgFmcsT7gEScLbk8xRRgLWd7eyQGhSxEoiJPBI2zEZmW9VbMY_DgqCd7bD-yKdUY7hXK-PIGZLXJLujTIOSadZ-9DWRSG-3pF3GbcEZ0ODTDB0gXu414b0L7mb9y-O4dwalp2jeO91gyoD4wN_PHO-XNQ685Y503FrUDV3TzuiYAblzzdEKXhswAtOE5fG-hVxVozPUJ1A0hiVjF8_ds4mtWxpc1XHW9hLHHDOKI_AHfgHXQLfeEUkXVrWoSctrmMRKLIEKm2BwYN6N4TLUjOPivjlvg_vpXEPvNol4L0M8GjJtzvN_RVb1AER_T0M-fWwukzBfFgyInBcnrwdr92HgnVBxgQpLCI-BfqioS3rDbB_0ReggFyflO3GTBD6bbxI697tUXSFY8_j_3Y3DN5zopB1H8rI21ortjL8Jx9ukoznHIzJ5bSrFb89QYhRu7xp62wKzShZFQijsZWnnyBvGbNpMfTwVD4lo2FfVVH93NSkMnZNhLxqHNHFYHUjI1v42tRnx44GwcZR0eSedKDh8ng1QmQccRoaCRloPwhKqRmwYKJfzvLxBwemBjxDluIXKRF3FToGyWwGS_8kMXQogljETmKhmRd2uWeVgR4eXrHERTs-dPKnbI5OcCMB8pFRVDmwgA4wGwv4b9GzwVGM`,
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
