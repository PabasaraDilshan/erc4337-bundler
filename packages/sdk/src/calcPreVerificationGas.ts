import { UserOperationStruct } from '@account-abstraction/contracts'
import { BigNumber } from 'ethers'
import { NotPromise,encodeUserOp, packUserOp, UserOperation } from '@account-abstraction/utils'
import { arrayify, hexlify } from 'ethers/lib/utils'

export interface GasOverheads {
  /**
   * fixed overhead for entire handleOp bundle.
   */
  fixed: number

  /**
   * per userOp overhead, added on top of the above fixed per-bundle.
   */
  perUserOp: number

  /**
   * overhead for userOp word (32 bytes) block
   */
  perUserOpWord: number

  // perCallDataWord: number

  /**
   * zero byte cost, for calldata gas cost calculations
   */
  zeroByte: number

  /**
   * non-zero byte cost, for calldata gas cost calculations
   */
  nonZeroByte: number

  /**
   * expected bundle size, to split per-bundle overhead between all ops.
   */
  bundleSize: number

  /**
   * expected length of the userOp signature.
   */
  sigSize: number
  batchFixed: number
}

export const DefaultGasOverheads: GasOverheads = {
  fixed: 21000,
  perUserOp: 22874,
  perUserOpWord: 25,
  batchFixed: 816,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65
}

/**
 * calculate the preVerificationGas of the given UserOperation
 * preVerificationGas (by definition) is the cost overhead that can't be calculated on-chain.
 * it is based on parameters that are defined by the Ethereum protocol for external transactions.
 * @param userOp filled userOp to calculate. The only possible missing fields can be the signature and preVerificationGas itself
 * @param overheads gas overheads to use, to override the default values
 */
export function calcPreVerificationGas (userOp: Partial<UserOperation>, overheads?: Partial<GasOverheads>): number {
  const ov = { ...DefaultGasOverheads, ...(overheads ?? {}) }

  const p: UserOperation = {
    // dummy values, in case the UserOp is incomplete.
  // dummy value, just for calldata cost
    signature: hexlify(Buffer.alloc(ov.sigSize, 1)),
    ...userOp,

    preVerificationGas: BigNumber.from(100000),
    verificationGasLimit: BigNumber.from(1000000),
    callGasLimit: BigNumber.from(1000000)
  } as any
  const packed = arrayify(encodeUserOp(packUserOp(p), false))
  const lengthInWord = (packed.length + 31) / 32
  const callDataCost = packed.map(x => x === 0 ? ov.zeroByte : ov.nonZeroByte).reduce((sum, x) => sum + x)
  const ret = Math.round(
    callDataCost +
    (ov.fixed + ov.batchFixed) / ov.bundleSize +
    ov.perUserOp +
    ov.perUserOpWord * lengthInWord
  )
  return ret
}
