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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MzAxMTM1LCJleHAiOjE2NjczODc1MzV9.HlUoK2tmvWalC7zRCV-4mjiGHK214YhNr-hIFhai8VxnQgZX5ot6SBYIPoWg1hQK-St9et1ebuCCb1jXJDkwPBWnoHY2Ri404jtv_RkHRX-xP9NXxMct7r0RatR7UxBCuX8yX3TPK9l3ppdVkiC76cxjOBXYVbI--tImRakSwlHn2rXOzcgstbk8xn7fRzIz7vea9YtPW_HaDlvX-GLVp7aZNfcF-S97bZEadEF1vAQDbSYjIawItN3kZvjuAm9s-6EpeQyPoBDWKiZTU-pMfOS3eDJE7NRuSsE3BWkuUPC3bjsjitNLzfUjPwqV0ZKYU1nz82yu-v1uB69vOMBIM-W8Er3s1w1f_qpME_rqNyvKBqiDakRKzDacWnDIRolSjzy1F2q4Xna0JQrx9hQ8wqHtk5sJoqY0tK6z6k6nK2sLYSAZaJmV1_kdsnKJ1cLi_Lp1VI2WToZyGrRwo33cIgCWhRMjjDA15VgrWdWwmi6arliy2hJz950iAhjZVVWsTsfPWgHNPZAYP7mnzouJ91FkKnprRPO_rggSVP8S6LxQPxZ3mpJzx-CdUjNPApMIecs-_LNmNk8z4Lpi8JfD0siZ9DxKXc_ChiMA2F3H35M178wyUacaAq58sOdLMCrqQXWHUbk0M4NZCwGAVBz5ZsMw8hsSSMn7-Y7ONW3goa0`,
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
