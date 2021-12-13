# Starknet bridge

run npm install 

Testing:

For pytest: 
- run > pytest contracts_tests/test_bridged721.py 

For starknet-hardhat plugin: (see https://github.com/Shard-Labs/starknet-hardhat-plugin)
- In hardhat.config.ts you can select on which network to test your contracts (devnet or Alpha testnet)

For devnet : you need to have starknet-devnet running > https://github.com/Shard-Labs/starknet-devnet

For Alpha testnet : 
- You need to have Docker installed and running
- Compiling : > npx hardhat starknet-compile
- Running tests : > npx hardhat test 

