// import { expect } from "chai";
// import { ethers } from "hardhat";

// describe("FakeErc1155 contract", function () {
//     // let FakeErc1155, fakeErc1155, owner, addr1, addr2;
//     let address1155: string;
//     let addressgateway: string;
//     let fakeErc1155: any;
//     let gateway: any;

//     const L1_STARKNET_CORE = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';
//     const L2_ERC1155_ADDRESS = "0x050e8e69006f32adeb52848587663dcd6cd44fa4ac8a3e2f0a150b0bd5e075ba";
//     const L2_GATEWAY_ADDRESS = "0x033939bd641c65b72295683c8819d0ffbcbecefbd59b6b9d807ef6c7148e6c55";

//     beforeEach(async () => {
//         const [deployer] = await ethers.getSigners();
//         const FakeErc1155 = await ethers.getContractFactory('FakeErc1155');
//         fakeErc1155 = await FakeErc1155.deploy();
//         address1155 = fakeErc1155.address;
//         // console.log(await fakeErc1155.balanceOf(deployer.address))
//         // expect(await fakeErc1155.balanceOf(deployer.address)).to.equal(0);
//     });

//     beforeEach(async () => {
//         const [deployer] = await ethers.getSigners();
//         const Gateway = await ethers.getContractFactory('Gateway1155');
//         gateway = await Gateway.deploy(L1_STARKNET_CORE);
//         addressgateway = gateway.address;
//         console.log(addressgateway);
//         await gateway.setEndpointGateway(L2_GATEWAY_ADDRESS)
//     });

//     describe('Test bridgeFromStarknet function in gateway1155.sol', () => {

//         it('Testing assetId', async function () {
//             const [deployer, addr1] = await ethers.getSigners();
//             await gateway.bridgeFromStarknet(address1155, L2_ERC1155_ADDRESS, [1, 2], [50, 100]);

//             // tester d'abord les différentes fonctions pour extract : 
//             // -- L1Tokencontract address de AssetType  
//             // -- extract tokenId du mintingBlob 
//             // -- get quantum from AssetType

//             // await fakeErc721.mint(deployer.address, 1);
//             // expect(await fakeErc721.balanceOf(deployer.address)).to.equal(1);
//             // expect(await fakeErc721.ownerOf(0)).to.equal(deployer.address);

//             // deployer address = 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
//             // Addr1 == 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
//             // gateway contract address = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

//             // operator is the gateway contract so we need the gateway contract as operator before calling gateway and transfering NFT
//             // await fakeErc721.setApprovalForAll(addressgateway, true);
//             // expect(await fakeErc721.isApprovedForAll(deployer.address, addressgateway)).to.equal(true);

//             // await gateway.bridgeToStarknet(address721, L2_ERC721_ADDRESS, 0, deployer.address);
//             // expect(await fakeErc721.balanceOf(deployer.address)).to.equal(0);
//             // expect(await fakeErc721.ownerOf(0)).to.equal(deployer.address);

//         });



//         // await fakeErc721.mint(addr1.address, 1);
//         // expect(await fakeErc721.balanceOf(addr1.address)).to.equal(1);

//     });

//     // describe('Send NFT minted to deployer addr to Gateway', () => {

//     // total supply
//     // regarder les approvals 

//     // puis commment à voir les fonctions de gateway pour envoyer un message
//     // });


// });
