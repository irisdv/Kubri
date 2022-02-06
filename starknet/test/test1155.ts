import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";

describe("Starknet bridge", function () {
  this.timeout(600_000); // 5 min - recommended if used with Alpha testnet
  // this.timeout(60_000); // 30 seconds - recommended if used with starknet-devnet

  const L1_ERC721_ADDRESS = "0xb5AAc9C30121496b89425f92D1b45336E4704F8e"
  const L1_ERC1155_ADDRESS = "0xb5AAc9C30121496b89425f92D1b45336E4704F8e"
  const L1_GATEWAY_ADDRESS = "0xdEd902a56c111FD3443F9058507dfb578b32bbd4"

  const ACCOUNT_ADDRESS ='0x3eaab06777fdcd8e8eb803c621da328c6419580b195dff2efe1235bf63f67af'

  let L2_GATEWAY_ADDRESS: string;
  let gatewayFactory: StarknetContractFactory;
  let contractGateway: StarknetContract;

  let L2_ERC1155_ADDRESS: string;
  let bridged1155Factory: StarknetContractFactory;
  let contractBridged1155: StarknetContract;

  // assumes cairo contracts have been compiled
  before(async function () {
    bridged1155Factory = await starknet.getContractFactory("bridged1155");
    // console.log('bridged1155Factory', bridged1155Factory);
    gatewayFactory = await starknet.getContractFactory("gateway1155");
    console.log('ok pour before');
  });

  // it("Deploy Account.cairo", async function () {

  //   console.log("Started account.cairo contract deployment");
  //   contractAccount = await accountFactory.deploy({ _public_key: BigInt("1903647282632399027225629500434100617446916994367413898913170243228889244137") });
  //   ACCOUNT_ADDRESS = contractAccount.address;
  //   console.log("Account contract deployed at", ACCOUNT_ADDRESS);

    // ACCOUNT_ADDRESS = "0x07570b45f89403a03feacdab5a6d7d79c43b7501baa8e36b909f14e6148f18c7"
    // console.log("Account contract deployed at", ACCOUNT_ADDRESS);
    // contractAccount = accountFactory.getContractAt(ACCOUNT_ADDRESS);

    // const { res } = await contractGateway.call("get_l1_gateway");
    // console.log('l1_gateway in gateway.cairo is initialized to:', res);
    // expect(res).to.deep.equal(BigInt(L1_GATEWAY_ADDRESS));

  // });

  it("Should work if right arguments given in gateway.cairo constructor ", async function () {

    // console.log("Started gateway.cairo contract deployment");
    // contractGateway = await gatewayFactory.deploy({ _l1_gateway: BigInt(L1_GATEWAY_ADDRESS) });
    // L2_GATEWAY_ADDRESS = contractGateway.address;
    // console.log("Gateway deployed at", L2_GATEWAY_ADDRESS);

    L2_GATEWAY_ADDRESS = "0x0698e42648b167eed620e603c95b97625a28d5240595b57b68b5d8ba6ee78371"
    console.log("Gateway deployed at", L2_GATEWAY_ADDRESS);
    contractGateway = gatewayFactory.getContractAt(L2_GATEWAY_ADDRESS);

    // const { res } = await contractGateway.call("get_l1_gateway");
    // console.log('l1_gateway in gateway.cairo is initialized to:', res);
    // expect(res).to.deep.equal(BigInt(L1_GATEWAY_ADDRESS));

  });

  it("Should work if right arguments given in bridged1155.cairo constructor ", async function () {

    // console.log("Started bridged1155.cairo contract deployment");
    // contractBridged1155 = await bridged1155Factory.deploy({ _gateway_address: BigInt(L2_GATEWAY_ADDRESS), address_l1: BigInt(L1_ERC1155_ADDRESS) });
    // L2_ERC1155_ADDRESS = contractBridged1155.address;
    // console.log("Bridged ERC1155 deployed at", L2_ERC1155_ADDRESS);

    L2_ERC1155_ADDRESS = "0x0411624387f3e37487f5299fb7f3a691a50293d17f8b3a475c3d68a3b2dbbdf8"
    console.log("Bridged ERC1155 deployed at", L2_ERC1155_ADDRESS);
    contractBridged1155 = bridged1155Factory.getContractAt(L2_ERC1155_ADDRESS);

    console.log('L1_ERC1155_ADDRESS is initialized to:', L1_ERC1155_ADDRESS);

    // const { address: hasL1Address } = await contractBridged1155.call("get_l1_address");
    // console.log('l1 ERC1155 address in bridged1155.cairo', hasL1Address);
    // expect(hasL1Address).to.deep.equal(BigInt(L1_ERC1155_ADDRESS));

  });

  it("Initialize URI for Bridged1155 ", async function () {

    console.log("Started initializing uri for bridged1155.cairo");
    // await contractBridged1155.invoke("_set_uri", { tokens_id: 1, uri : [starknet.stringToBigInt("bafkreierzdc5kkrbxmkooj2wt2jx4p"), starknet.stringToBigInt("ebvne5nko4qzowpurj5hr7l4kv7u")] });

    // const { res: currentURI } = await contractBridged1155.call("uri", { token_id: 1 });
    // console.log('current URI is : ', currentURI);
    // expect(currentURI).to.deep.equal({ a: starknet.stringToBigInt("bafkreierzdc5kkrbxmkooj2wt2jx4p"), b: starknet.stringToBigInt("ebvne5nko4qzowpurj5hr7l4kv7u")});

    await contractBridged1155.invoke("_set_uri", { tokens_id: 2, uri : [starknet.stringToBigInt("bafkreierzdc5kkrbxmkooj2wt2jx4p"), starknet.stringToBigInt("ebvne5nko4qzowpurj5hr7l4kv7u")] });
    const { res: currentURI2 } = await contractBridged1155.call("uri", { token_id: 2 });
    console.log('current URI is : ', currentURI2);
    expect(currentURI2).to.deep.equal({ a: starknet.stringToBigInt("bafkreierzdc5kkrbxmkooj2wt2jx4p"), b: starknet.stringToBigInt("ebvne5nko4qzowpurj5hr7l4kv7u")});


  });

  // it("Mint an NFT through ERC721.cairo contract", async function () {
  //   // mint an NFT through initialize function for ACCOUNT_ADDRESS 

  //   // Add name, symbol and tokenURI in args of initialize_nft function
  //   await contractBridged1155.invoke("mint_nft_batch_with_uri", { sender: BigInt('0x3eaab06777fdcd8e8eb803c621da328c6419580b195dff2efe1235bf63f67af'), tokens_id: [1,2], amounts: [10,20], 
  //     uri: [starknet.stringToBigInt("bafybeifvckoqkr7wmk55ttuxg2rytf"), starknet.stringToBigInt("ojrfihiqoj5h5wjt5jtkqwnkxbie")] })
  //   // tokens_id_len : felt, tokens_id : felt*, amounts_len : felt, amounts : felt*, uri_len : felt, uri : felt*):

  //   // check that balance of ACCOUNT_ADDRESS is the right one
  //   const { res: balance } = await contractBridged1155.call("balance_of", { owner: BigInt(ACCOUNT_ADDRESS), token_id: 1 });
  //   console.log('balance of user Account is', balance);
  //   expect(balance).to.deep.equal(10n);

  //   // check that owner of this NFT is ACCOUNT_ADDRESS
  //   const { res } = await contractBridged1155.call("uri", { token_id: 1 });
  //   console.log('uri of token_id 1 is', res);
  //   // expect(balance).to.deep.equal(BigInt(ACCOUNT_ADDRESS));

  //   const { res : uri2 } = await contractBridged1155.call("uri", { token_id: 2 });
  //   console.log('uri of token_id 1 is', uri2);

  //   // tester qu'on a bien le bon uri : func : uri renvoie un Tokenuri 

  // });

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