import { expect } from "chai";
import { ethers } from "hardhat";

describe("FakeErc721 contract", function() {
  // let FakeErc721, fakeErc721, owner, addr1, addr2;
  let address721 : string;
  let addressgateway : string;
  let fakeErc721 : any;
  let gateway : any;

  const L1_STARKNET_CORE = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';
  const L2_ERC721_ADDRESS="0x0184b283baedf52cc72d46621d92b465087a208fa4ebff2178f5c8b2fb7765f4";
  const L2_GATEWAY_ADDRESS="0x06fee411e29ff2ac941a40aa6b627b5e28ef12fd7df8d0b069db6a67fbe89583";

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const FakeErc721 = await ethers.getContractFactory('FakeErc721');
    fakeErc721 = await FakeErc721.deploy();
    address721 = fakeErc721.address;

    expect(await fakeErc721.balanceOf(deployer.address)).to.equal(0);
  });

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    const Gateway = await ethers.getContractFactory('Gateway');
    gateway = await Gateway.deploy(L1_STARKNET_CORE);
    addressgateway = gateway.address;

    await gateway.setEndpointGateway(L2_GATEWAY_ADDRESS)
  });

  describe('Test Withdraw and Mint function in gateway.sol', () => {

    it('Testing assetId', async function () {
      const [deployer, addr1] = await ethers.getSigners();

      await gateway.withdrawAndMint(L2_ERC721_ADDRESS, '0x02d422e173118642669ac52f152bbcf506bb12bf3e22134b3413064c65840f43', '0x29a86e4921e372d0d9ae92d54b8011c4419308d1f82b751583fcc4ddb166ec00');


      // tester d'abord les différentes fonctions pour extract : 
          // -- L1Tokencontract address de AssetType  
          // -- extract tokenId du mintingBlob 
          // -- get quantum from AssetType

      // await fakeErc721.mint(deployer.address, 1);
      // expect(await fakeErc721.balanceOf(deployer.address)).to.equal(1);
      // expect(await fakeErc721.ownerOf(0)).to.equal(deployer.address);

      // deployer address = 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      // Addr1 == 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      // gateway contract address = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

      // operator is the gateway contract so we need the gateway contract as operator before calling gateway and transfering NFT
      // await fakeErc721.setApprovalForAll(addressgateway, true);
      // expect(await fakeErc721.isApprovedForAll(deployer.address, addressgateway)).to.equal(true);

      // await gateway.bridgeToStarknet(address721, L2_ERC721_ADDRESS, 0, deployer.address);
      // expect(await fakeErc721.balanceOf(deployer.address)).to.equal(0);
      // expect(await fakeErc721.ownerOf(0)).to.equal(deployer.address);

    });



        // await fakeErc721.mint(addr1.address, 1);
      // expect(await fakeErc721.balanceOf(addr1.address)).to.equal(1);

  });
    
  // describe('Send NFT minted to deployer addr to Gateway', () => {

    // total supply
    // regarder les approvals 

    // puis commment à voir les fonctions de gateway pour envoyer un message
  // });


});
