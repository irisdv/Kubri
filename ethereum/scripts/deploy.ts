// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";


const L1_STARKNET_CORE = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';

async function main() {

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  // const FakeErc1155 = await ethers.getContractFactory("FakeErc1155");
  // const fakeErc1155 = await FakeErc1155.deploy();
  // await fakeErc1155.deployed();
  // console.log("FakeErc1155:", fakeErc1155.address);

  const Gateway = await ethers.getContractFactory("Gateway1155");
  const gateway = await Gateway.deploy(L1_STARKNET_CORE);
  await gateway.deployed();
  console.log("Gateway1155:", gateway.address);
  const bytecode = await gateway.getBytecode();
  const AddressTMP = await gateway.getAddress(bytecode, 0x123456788);
  console.log("ComputeAddress =", AddressTMP);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});