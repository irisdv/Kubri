# Kubri (Egyptian for Bridge) is an ERC-1155 bridge for Starknet.
based on (https://github.com/mortimr/qasr):
create2 based on  (https://github.com/miguelmota/solidity-create2-example)

You can try our Live -> https://kubribridge.vercel.app/

The repository consists of 3 folders : 
1. Starknet folder : all cairo contracts + tests and deployment scripts (using pytest and starknet-hardhat-plugin)
2. Ethereum folder : all solidity contracts + tests and deployment scripts (using hardhat)
3. Front folder : react app to interact with folders


Kubri : L2 -> L1 flow:

- On L2 we create a gateway (you will find it in starknet/contracts/gateway1155.cairo).
- On L1 we create a gateway (you will find it in ethereum/contracts/Gateway1155.sol).
- On L2 we create a mirror NFT contract of the NFT we wish to bridge. We mint a certain amount of token and send a message to the L1 gateway through the function bridge_to_mainnet.
- ON L1 gateway we can consume the message send from L2 through the function bridgeFromStarknet.
- Then you can call mintNFTFromStarknet that deploye the contract BridgeERC1155.sol (this should be done once by the first use who want to mint his NFT on L1) and allows you to mint the NFT bridge from L2 on L1.

Soon you will be able to bridge back your NFT to L2.