// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const L1_STARKNET_CORE = '0x5e6229F2D4d977d20A50219E521dE6Dd694d45cc';

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const FakeErc721 = await ethers.getContractFactory("FakeErc721");
  const fakeErc721 = await FakeErc721.deploy();
  await fakeErc721.deployed();
  console.log("FakeErc721:", fakeErc721.address);

  const Gateway = await ethers.getContractFactory("Gateway");
  const gateway = await Gateway.deploy(L1_STARKNET_CORE);
  await gateway.deployed();
  console.log("Gateway:", gateway.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
