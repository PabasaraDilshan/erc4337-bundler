import { UserOperationStruct } from '@account-abstraction/contracts'
import { PaymasterAPI } from './'
import { hexlify } from '@ethersproject/bytes'
import { resolveProperties } from '@ethersproject/properties'
export default class AAPaymasterAPI extends PaymasterAPI {
  public paymasterUrl?: string
  private readonly forceDisable = false
  async getPaymasterAndData (
    userOp: Partial<UserOperationStruct>
  ): Promise<string | undefined> {
    return userOp.paymasterAndData?.toString()
  }

  async sponsorUserOperation (
    userOp: Partial<UserOperationStruct>,
    _entryPoint: string,
    _pmSpecificData: { type: string, address: string }
  ): Promise<{
      paymasterAndData: string
      preVerificationGas: number
      verificationGasLimit: string
      callGasLimit: string
      maxFeePerGas: string
      maxPriorityFeePerGas: string
    } | null> {
    const newUserOp = await resolveProperties({
      ...userOp,
      signature: '0x',
      paymasterAndData: '0x'
    })
    if (this.paymasterUrl != null && this.paymasterUrl !== undefined) {
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      headers.append(
        'Authorization',
        'Bearer eyJraWQiOiJuNGRIZ2hqaUtHUmJzSEhxYUNXZ0J3TytBdnRJNTdSXC9WQThjVDhtTFBTMD0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiRWdJSVp1X2pZYlc4UHpDdXJyTXpkZyIsInN1YiI6ImM5MTkzM2Q2LTAwYTUtNDA5NC1hYzZkLTIwMWYzMmVkZDUwNiIsImNvZ25pdG86Z3JvdXBzIjpbImFwLXNvdXRoZWFzdC0xX2dwV1ZSaWNyU19Hb29nbGUiXSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTFfZ3BXVlJpY3JTIiwiY29nbml0bzp1c2VybmFtZSI6Imdvb2dsZV8xMDM0NDIwMTk3NjYxNDk3ODk0NDMiLCJnaXZlbl9uYW1lIjoiUGFiYXNhcmEiLCJwaWN0dXJlIjoiaHR0cHM6XC9cL2xoMy5nb29nbGV1c2VyY29udGVudC5jb21cL2FcL0FBY0hUdGZESlUxenZNOGxqRFhDWDh0OHkya1R1ZE10QTVzbEk3ZENReGRKMEdQMWFBPXM5Ni1jIiwib3JpZ2luX2p0aSI6ImMzMWJiYjdmLTUzMGQtNGUxMi05YTU3LTkyMDE2ZjA3NGUyZiIsImF1ZCI6IjFyOGsyaGN2NThwaHB0cm5hanRiNXFqamFsIiwiaWRlbnRpdGllcyI6W3sidXNlcklkIjoiMTAzNDQyMDE5NzY2MTQ5Nzg5NDQzIiwicHJvdmlkZXJOYW1lIjoiR29vZ2xlIiwicHJvdmlkZXJUeXBlIjoiR29vZ2xlIiwiaXNzdWVyIjpudWxsLCJwcmltYXJ5IjoidHJ1ZSIsImRhdGVDcmVhdGVkIjoiMTY4NzIzNDcxNjI0NCJ9XSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2OTA1MzQyMzcsIm5hbWUiOiJQYWJhc2FyYSBQZXJlcmEiLCJleHAiOjE2OTA1MzU5NjIsImlhdCI6MTY5MDUzNTY2MiwiZmFtaWx5X25hbWUiOiJQZXJlcmEiLCJqdGkiOiI0NThiY2E0MC1kOWQwLTQxZGYtYTZlMC1jMTJiM2I3ODBiZDQiLCJlbWFpbCI6InBhYmFzYXJhQGxpdmVyb29tLmRldiJ9.L7RTIOW75xyh7imFN8pn7hLFKF0-d352h_BCBLymXdrs1CkjXjCs4kvX9CJEsUPXvOj2XgPHvb1j-fWmCbZd1bVv-IfsS4WfzejNl56N1Lguz6IpTcvg7-cPhOKbFLjM9WLhT3FUuZmTf6nOX0aJMriUcS4lfIJGercDrMsM2kgsmHV-kUixPO2LJTpZIiBhJeJcc1douoUWlWn3HC0Bn5NBmlfjApPhh8Wea7ISX_XBKa6xKf0UXMIgyiJD1fuIwjO8Qt-KJ6XH9RewnHfDHBvG3T23nOXZObafLz6EwlQMbb5eZEX880DzmrxPMDIw8hASr-s9BxgajhDUWBjhYQ'
      )
      return await fetch(this.paymasterUrl, {
        method: 'POST',
        body: JSON.stringify({ params: [newUserOp] }),
        headers
      })
        .then(async (res) => {
          return await res.json()
        })
        .then((res) => {
          console.log('Recieved userop', res.result)
          return {
            paymasterAndData: res.result.paymasterAndData,
            preVerificationGas: res.result.preVerificationGas,
            verificationGasLimit: res.result.verificationGasLimit,
            callGasLimit: res.result.callGasLimit,
            maxFeePerGas: res.result.maxFeePerGas,
            maxPriorityFeePerGas: res.result.maxPriorityFeePerGas
          }
        })
    }
    return null
  }

  public setPaymaster (url?: string): void {
    this.paymasterUrl = url
  }

  async getDummyPaymasterData (): Promise<string> {
    return this.forceDisable ? '0x' : hexlify(Buffer.alloc(149, 1))
  }
}
