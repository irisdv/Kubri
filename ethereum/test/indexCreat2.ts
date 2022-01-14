import { ethers } from "hardhat"
import { Signer } from 'ethers'
import { assert } from 'chai'
import { expect } from "chai";

const L1_STARKNET_CORE = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';

import {
    deployContract,
    deployFactory,
    getCreate2Address,
    isDeployed,
} from '../src/index'

describe('Happy Path', function () {
    let signer: Signer
    let accountBytecode: string

    before(async () => {
        signer = (await ethers.getSigners())[0]
        accountBytecode = (await ethers.getContractFactory('Gateway1155')).bytecode
    })

    it('should deploy factory', async function () {
        await (
            await signer.sendTransaction({
                to: '0xf4b14dC5c2fD6cb78F97dBCaf800F2d053931Bde',
                value: ethers.utils.parseEther('1'),
            })
        ).wait()
        console.log("Provider ethers: ", ethers.provider)
        const factoryAddress = await deployFactory(ethers.provider)
        console.log('Factory:', factoryAddress)
    })

    xit('should deploy with string salt', async function () {
        const salt = 'hello'

        const computedAddr = getCreate2Address({
            salt,
            contractBytecode: accountBytecode,
            constructorTypes: ['address'],
            constructorArgs: ['0xde29d060D45901Fb19ED6C6e959EB22d8626708e'],
        })

        console.log('Create2Address', computedAddr)
        assert(
            !(await isDeployed(computedAddr, ethers.provider)),
            'contract already deployed at this address',
        )
        // console.log("Signer: ", signer);

        const result = await deployContract({
            salt,
            contractBytecode: accountBytecode,
            constructorTypes: ['address'],
            constructorArgs: ['0xde29d060D45901Fb19ED6C6e959EB22d8626708e'],
            signer,
        })

        console.log('ContractAddress', result.address)
        assert(
            await isDeployed(computedAddr, ethers.provider),
            'contract not deployed at this address',
        )
    })

    it('should deploy with number salt', async function () {
        const salt = 1234

        const computedAddr = getCreate2Address({
            salt,
            contractBytecode: accountBytecode,
            constructorTypes: ['address'],
            constructorArgs: ['0xde29d060D45901Fb19ED6C6e959EB22d8626708e'],
        })

        console.log('Create2Address', computedAddr)
        assert(
            !(await isDeployed(computedAddr, ethers.provider)),
            'contract already deployed at this address',
        )

        const result = await deployContract({
            salt,
            contractBytecode: accountBytecode,
            constructorTypes: ['address'],
            constructorArgs: ['0xde29d060D45901Fb19ED6C6e959EB22d8626708e'],
            signer,
        })

        console.log('ContractAddress', result.address)
        assert(
            await isDeployed(computedAddr, ethers.provider),
            'contract not deployed at this address',
        )
    })
})