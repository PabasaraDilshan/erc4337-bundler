import { UserOperationStruct } from '@account-abstraction/contracts'
import { HttpRpcClient } from './'
import { BaseAccountAPI, BaseApiParams } from './BaseAccountAPI'
import { BigNumberish } from '@ethersproject/bignumber'
import { BytesLike } from 'ethers'
import { AccessListish } from 'ethers/lib/utils'
import { UserOperationEventEvent } from '@account-abstraction/contracts/dist/types/EntryPoint'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

export interface UserOperationReceipt extends TransactionReceipt{
  userOpEvent: UserOperationEventEvent
}
export abstract class AccountApiType extends BaseAccountAPI {
  /** sign a message for the use */
  abstract signMessage: (request?: any, context?: any) => Promise<string>

  abstract signUserOpWithContext (
    userOp: UserOperationStruct,
    context?: any,
  ): Promise<UserOperationStruct>
}
export type ContractAddress = string
export interface AccountApiParamsType<T> extends BaseApiParams {
  context?: T
  deserializeState?: any
  privateKey?: string
  bundler: HttpRpcClient
  accountFactory: ContractAddress
  providerUrl: string
  ownerAddress?: string
}
export interface TransactionDetailsForUserOp {
  target: string
  data: string
  value?: BigNumberish
  gasLimit?: BigNumberish
  maxFeePerGas?: BigNumberish
  maxPriorityFeePerGas?: BigNumberish
  nonce?: BigNumberish
  verificationGasLimit?: BigNumberish
}
export interface EthersTransactionRequest {
  to: string
  from?: string
  nonce?: BigNumberish

  gasLimit?: BigNumberish
  gasPrice?: BigNumberish

  data?: BytesLike
  value?: BigNumberish
  chainId?: number

  type?: number
  accessList?: AccessListish

  maxPriorityFeePerGas?: BigNumberish
  maxFeePerGas?: BigNumberish

  customData?: Record<string, any>
  origin?: string
  paymasterUrl?: string
}
export type AccountImplementationType = new (params: AccountApiParamsType<any>) => AccountApiType
