import assert from 'assert'
import { ethers, Signer } from 'ethers'
import { Provider, TransactionReceipt } from '@ethersproject/providers'

import {
  factoryAbi,
  factoryBytecode,
  factoryAddress,
  buildCreate2Address,
  buildBytecode,
  parseEvents,
  saltToHex,
} from './utils'

/**
 * Deploy contract using create2.
 *
 * Deploy an arbitrary contract using a create2 factory. Can be used with an ethers provider on any network.
 *
 */
export async function deployContract({
  salt,
  contractBytecode,
  constructorTypes = [] as string[],
  constructorArgs = [] as any[],
  signer,
}: {
  salt: string | number
  contractBytecode: string
  constructorTypes?: string[]
  constructorArgs?: any[]
  signer: Signer
}) {
  const saltHex = saltToHex(salt)

  const factory = new ethers.Contract(factoryAddress, factoryAbi, signer)
  // console.log("factory: ", factory)
  const bytecode = buildBytecode(
    constructorTypes,
    constructorArgs,
    contractBytecode,
  )
  console.log("SALTHEX: ", saltHex)
  const result = await (await factory.deploy(bytecode, saltHex)).wait()
  // console.log("result: ", result)
  // const computedAddr = buildCreate2Address(saltHex, bytecode)
  // console.log("computedAddr: ", computedAddr)
  const logs = parseEvents(result, factory.interface, 'Deployed')
  // console.log("Hellologs: ", logs[0].args)
  const addr = logs[0].args.addr.toLowerCase()
  // assert.strictEqual(addr, computedAddr)

  return {
    txHash: result.transactionHash as string,
    address: addr as string,
    receipt: result as TransactionReceipt,
  }
}

/**
 * Calculate create2 address of a contract.
 *
 * Calculates deterministic create2 address locally.
 *
 */
export function getCreate2Address({
  salt,
  contractBytecode,
  constructorTypes = [] as string[],
  constructorArgs = [] as any[],
}: {
  salt: string | number
  contractBytecode: string
  constructorTypes?: string[]
  constructorArgs?: any[]
}) {
  return buildCreate2Address(
    saltToHex(salt),
    buildBytecode(constructorTypes, constructorArgs, contractBytecode),
  )
}

/**
 * Determine if a given contract is deployed.
 *
 * Determines if a given contract is deployed at the address provided.
 *
 */
export async function isDeployed(address: string, provider: Provider) {
  const code = await provider.getCode(address)
  return code.slice(2).length > 0
}

/**
 * Deploy create2 factory for local development.
 *
 * Deploys the create2 factory locally for development purposes. Requires funding address `0x2287Fa6efdEc6d8c3E0f4612ce551dEcf89A357A` with eth to perform deployment.
 *
 */
export async function deployFactory(provider: Provider) {
  const key =
    '49790c210ac961174e9d00a5457c6eefda7024e503e66b2fc22bea7931acda53'
  const signer = new ethers.Wallet(key, provider)
  console.log("SIGNNNER: ", signer)
  const Factory = new ethers.ContractFactory(
    factoryAbi,
    factoryBytecode,
    signer,
  )
  const factory = await Factory.deploy()
  // assert.strictEqual(factory.address, factoryAddress)
  return factory.address
}