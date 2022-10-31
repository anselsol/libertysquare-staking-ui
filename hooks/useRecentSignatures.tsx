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
      Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InBvcnRhbF9hdXRoIn0.eyJwcm94aWVzIjpbIkZSMSJdLCJ1dWlkIjoiYWQ5M2M5ZmMtOGI1My00MDE5LWEyYTEtYWI1ODBiMTdiMWQzIiwidGllciI6MSwiaWF0IjoxNjY3MjA2Nzg5LCJleHAiOjE2NjcyOTMxODl9.itLGVxm_9cTa7PHoWxXlAQK8JZ6LS_QB67hXz8adFmAOdpjYTwJkcCvO_WbhZGLMZtkgiizyNCACk53VopxL0PnjdFG_0KNRyuSLZ4mzRGZWprMIdjOceMrf5tkxoQBmh_J5_X2PSzq81cJIJgM95bBGcuM4qedOi5BKpY3YP09WlkPUFsbMERSpXWokt1TiK0t5xQcs9mL-6E4biod2EUHggkJqUJJJhs4iHooen6ToIifWHD56R5VvwCtogT4E1I0FewopOJgOsZNcWDT6ziw1jdew86hMKZvA1OOhdFjhqehvDwUYbJ1b1M645VfaItJg4mYvTvartVrxxr6ZlKo0g3mmU19PRL9CPuprj_26otvDLDp-5pQAOaDzwqnqiSgUprqLfyJQSQ7SiQX06EQGNnmRt99XPxK6Ih5MEfTSyNcyNMzLBigAIvQZXvEz8tMRU_gpEQFo2nA8DAJhtfPMlBypG1p89ZdUufEWEj8DbVMsEQoBaaoG5tBRV37Tv4gPmXiLjlXt-2yex5UfX9UV154yofiXxbaIhJVepbsaZuDXGw0bqPgXsIZaXAd1twdWuf9yWr8Sd_UcE0qds6P5y5IZf7wZPY1K5u6Hy0FEn0sQZ4t_DZscfClQ9QckoY1987iJrme-l6DrUsiG56tzkaDoJ45jykCRFYKbSKM`,
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
