import { isAddress } from '@ethersproject/address'
import { erc20ABI } from './contracts'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

export const validateEthereumAddress = (address: string): boolean => {
  return isAddress(address)
}
export const getERC20TokenDetails = async (rpcUrl: string, contractAddress: string): Promise<any> => {
  const provider = new JsonRpcProvider(rpcUrl)
  const contract = new Contract(contractAddress, erc20ABI, provider)
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals()
  ])
  return {
    name,
    symbol,
    decimals
  }
}
