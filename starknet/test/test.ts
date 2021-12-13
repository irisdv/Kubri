import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";

describe("Starknet bridge", function () {
    // this.timeout(300_000); // 5 min - recommended if used with Alpha testnet
    this.timeout(60_000); // 30 seconds - recommended if used with starknet-devnet

    const L1_ERC721_ADDRESS="0xb5AAc9C30121496b89425f92D1b45336E4704F8e"
    const L1_GATEWAY_ADDRESS="0xdEd902a56c111FD3443F9058507dfb578b32bbd4"

    let L2_ERC721_ADDRESS: string;
    let bridged721Factory: StarknetContractFactory;
    let contractBridged721: StarknetContract;

    let L2_GATEWAY_ADDRESS: string;
    let gatewayFactory: StarknetContractFactory;
    let contractGateway: StarknetContract;

    let ACCOUNT_ADDRESS: string;
    let accountFactory: StarknetContractFactory;
    let contractAccount: StarknetContract;

    // let L2_ERC1155_ADDRESS: string;
    // let bridged1155Factory: StarknetContractFactory;
    // let contractBridged1155: StarknetContract;

    // assumes cairo contracts have been compiled
    before(async function() {
      bridged721Factory = await starknet.getContractFactory("bridged721");
      gatewayFactory = await starknet.getContractFactory("gateway");
      accountFactory = await starknet.getContractFactory("account");
    });

    it("Deploy Account.cairo", async function () {
      
      console.log("Started account.cairo contract deployment");
      contractAccount = await accountFactory.deploy({_public_key: BigInt("1903647282632399027225629500434100617446916994367413898913170243228889244137")});
      ACCOUNT_ADDRESS = contractAccount.address;
      console.log("Account contract deployed at", ACCOUNT_ADDRESS);

      // ACCOUNT_ADDRESS = "0x07570b45f89403a03feacdab5a6d7d79c43b7501baa8e36b909f14e6148f18c7"
      // console.log("Account contract deployed at", ACCOUNT_ADDRESS);
      // contractAccount = accountFactory.getContractAt(ACCOUNT_ADDRESS);

      // const { res } = await contractGateway.call("get_l1_gateway");
      // console.log('l1_gateway in gateway.cairo is initialized to:', res);
      // expect(res).to.deep.equal(BigInt(L1_GATEWAY_ADDRESS));

    });

    it("Should work if right arguments given in gateway.cairo constructor ", async function () {
      
      console.log("Started gateway.cairo contract deployment");
      contractGateway = await gatewayFactory.deploy({_l1_gateway: BigInt(L1_GATEWAY_ADDRESS)});
      L2_GATEWAY_ADDRESS = contractGateway.address;
      console.log("Gateway deployed at", L2_GATEWAY_ADDRESS);

      // L2_GATEWAY_ADDRESS = "0x0494a828e5770f97ae4d01911f7b0473a0aa85b204dd2440c3c773aeac40bd2c"
      // console.log("Gateway deployed at", L2_GATEWAY_ADDRESS);
      // contractGateway = gatewayFactory.getContractAt(L2_GATEWAY_ADDRESS);

      const { res } = await contractGateway.call("get_l1_gateway");
      console.log('l1_gateway in gateway.cairo is initialized to:', res);
      expect(res).to.deep.equal(BigInt(L1_GATEWAY_ADDRESS));

    });

    it("Should work if right arguments given in bridged721.cairo constructor ", async function () {
      
      console.log("Started bridged721.cairo contract deployment");
      contractBridged721 = await bridged721Factory.deploy({_l1_address : BigInt(L1_ERC721_ADDRESS), _gateway_address : BigInt(L2_GATEWAY_ADDRESS)});
      L2_ERC721_ADDRESS = contractBridged721.address;
      console.log("Bridged ERC721 deployed at", L2_ERC721_ADDRESS);

      // L2_ERC721_ADDRESS = "0x0068e63179dedd59fd897b9c3093881d3a8c92d6aca452cf4f3a2cf266466c81"
      // console.log("Bridged ERC721 deployed at", L2_ERC721_ADDRESS);
      // contractBridged721 = bridged721Factory.getContractAt(L2_ERC721_ADDRESS);

      console.log('L1_ERC721_ADDRESS is initialized to:', L1_ERC721_ADDRESS)

      const { address: hasL1Address } = await contractBridged721.call("get_l1_address");
      console.log('l1 ERC721 address in bridged721.cairo', hasL1Address);
      expect(hasL1Address).to.deep.equal(BigInt(L1_ERC721_ADDRESS));

    });

    it("Mint an NFT through ERC721.cairo contract", async function () {
      // mint an NFT through initialize function for ACCOUNT_ADDRESS 

      // Add name, symbol and tokenURI in args of initialize_nft function
      await contractBridged721.invoke("initialize_nft", { to: BigInt(ACCOUNT_ADDRESS), token_id: 1 })

      // check that balance of ACCOUNT_ADDRESS is the right one
      const { res: balance } = await contractBridged721.call("balance_of", {owner: BigInt(ACCOUNT_ADDRESS)});
      console.log('balance of user Account is', balance);
      expect(balance).to.deep.equal(1n);

      // check that owner of this NFT is ACCOUNT_ADDRESS
      const { res: owner } = await contractBridged721.call("owner_of", {token_id: 1});
      console.log('Owner of token_id 1 is', owner);
      expect(balance).to.deep.equal(BigInt(ACCOUNT_ADDRESS));

    });

    // it("Bridge this NFT to L1", async function () {
    // //   const { result } = await contractGateway.call("assert_owner_caller", {
    // //       ACCOUNT_ADDRESS,
    // //       _l1_token_address: BigInt(L1_ERC721_ADDRESS), 
    // //       _l2_token_address : BigInt(L2_ERC721_ADDRESS), 
    // //       _token_id : 1, 
    // //       _l1_owner : BigInt(L1_GATEWAY_ADDRESS) 
    // //   });
    // //   console.log('here is the result', result);

    //   await contractGateway.invoke("bridge_nativel2_to_mainnet", {
    //     ACCOUNT_ADDRESS,
    //     _l1_token_address: BigInt(L1_ERC721_ADDRESS), 
    //     _l2_token_address : BigInt(L2_ERC721_ADDRESS), 
    //     _token_id : 1, 
    //     _l1_owner : BigInt(L1_GATEWAY_ADDRESS) 
    // });

      // const { res: balance } = await contractBridged721.call("balance_of", {owner: BigInt(ACCOUNT_ADDRESS)});
      // console.log('balance of user ACCOUNT_ADDRESS after bridging is', balance);
      // expect(balance).to.deep.equal(0n);

    // });

  });