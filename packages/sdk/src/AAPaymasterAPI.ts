import { UserOperationStruct } from '@account-abstraction/contracts'
import { hexlify } from '@ethersproject/bytes'
import { resolveProperties } from '@ethersproject/properties'
export class AAPaymasterAPI {
  public paymasterUrl?: string
  private headerCreator?: () => Promise<Headers>
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
    if (this.paymasterUrl !== undefined) {
      return await fetch(this.paymasterUrl, {
        method: 'POST',
        body: JSON.stringify({ params: [newUserOp] }),
        headers: (this.headerCreator != null)
          ? await this.headerCreator()
          : {
              'Content-Type': 'application/json'
            }
      })
        .then(async (res) => {
          return await res.json()
        })
        .then((res) => {
          console.log('Recieved userop::', res.result)
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

  public setPaymaster (url?: string, headerCreator?: () => Promise<Headers>): void {
    this.paymasterUrl = url
    this.headerCreator = headerCreator
  }

  async getDummyPaymasterData (): Promise<string> {
    return this.forceDisable ? '0x' : hexlify(Buffer.alloc(149, 1))
  }
}
