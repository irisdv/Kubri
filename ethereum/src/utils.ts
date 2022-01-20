import { Provider, TransactionReceipt } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { Interface } from 'ethers/lib/utils'

export const factoryAddress = '0xc6D26F235659d47CED882A55510d3cc2E3149601'
// export const factoryAddress = '0xaE246700E6284b71728459874cE75C66799019b1'
export const factoryBytecode =
  "0x608060405234801561001057600080fd5b5061031a806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80639c4ae2d014610030575b600080fd5b61004a60048036038101906100459190610120565b61004c565b005b6000818351602085016000f59050803b61006557600080fd5b7fb03c53b28e78a88e31607a27e1fa48234dce28d5d9d9ec7b295aeb02e674a1e18183604051610096929190610192565b60405180910390a1505050565b60006100b66100b1846101e0565b6101bb565b9050828152602081018484840111156100ce57600080fd5b6100d984828561024d565b509392505050565b600082601f8301126100f257600080fd5b81356101028482602086016100a3565b91505092915050565b60008135905061011a816102cd565b92915050565b6000806040838503121561013357600080fd5b600083013567ffffffffffffffff81111561014d57600080fd5b610159858286016100e1565b925050602061016a8582860161010b565b9150509250929050565b61017d81610211565b82525050565b61018c81610243565b82525050565b60006040820190506101a76000830185610174565b6101b46020830184610183565b9392505050565b60006101c56101d6565b90506101d1828261025c565b919050565b6000604051905090565b600067ffffffffffffffff8211156101fb576101fa61028d565b5b610204826102bc565b9050602081019050919050565b600061021c82610223565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b610265826102bc565b810181811067ffffffffffffffff821117156102845761028361028d565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b6102d681610243565b81146102e157600080fd5b5056fea26469706673582212205610ea7444c395dda21b211408bea44132eea1c70243deba2b80dc1123ca6faa64736f6c63430008040033"
export const factoryAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "Deployed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "code",
        "type": "bytes"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "deploy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const buildBytecode = (
  constructorTypes: any[],
  constructorArgs: any[],
  contractBytecode: string,
) =>
  `${contractBytecode}${encodeParams(constructorTypes, constructorArgs).slice(
    2,
  )}`

export const buildCreate2Address = (saltHex: string, byteCode: string) => {
  const factoryAddress = '0xc6D26F235659d47CED882A55510d3cc2E3149601'
  // const factoryAddress = '0xaE246700E6284b71728459874cE75C66799019b1'
  return `0x${ethers.utils
    .keccak256(
      `0x${['ff', factoryAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map((x) => x.replace(/0x/, ''))
        .join('')}`,
    )
    .slice(-40)}`.toLowerCase()
}

export const numberToUint256 = (value: number) => {
  const hex = value.toString(16)
  return `0x${'0'.repeat(64 - hex.length)}${hex}`
}

export const saltToHex = (salt: string | number) =>
  ethers.utils.id(salt.toString())

export const encodeParam = (dataType: any, data: any) => {
  const abiCoder = ethers.utils.defaultAbiCoder
  return abiCoder.encode([dataType], [data])
}

export const encodeParams = (dataTypes: any[], data: any[]) => {
  const abiCoder = ethers.utils.defaultAbiCoder
  return abiCoder.encode(dataTypes, data)
}

export const isContract = async (address: string, provider: Provider) => {
  const code = await provider.getCode(address)
  return code.slice(2).length > 0
}

export const parseEvents = (
  receipt: TransactionReceipt,
  contractInterface: Interface,
  eventName: string,
) =>
  receipt.logs
    .map((log) => {
      try {
        console.log("ParsLog: ", contractInterface.parseLog(log))
        return contractInterface.parseLog(log)
      } catch (e) {
        // ignore unknown log messages (events logged in the constructor)
        return null
      }
    })
    .filter((log): log is ethers.utils.LogDescription => !!log)
    .filter((log) => log.name === eventName)