import React, { useState, useEffect } from "react";
import { ethers } from 'ethers'

import { Button } from 'antd';

import GATEWAYL1 from "../../libSolidity/abi/Gateway.json";
import FAKEERC721 from "../../libSolidity/abi/FakeErc721.json";


// Gateway L1
const ADDRESS_GATEWAY =
  "0xdEd902a56c111FD3443F9058507dfb578b32bbd4";

const ADDRESS_ERC721 =
  "0xb5AAc9C30121496b89425f92D1b45336E4704F8e";


// le contrat gatewayL1 doit être déployer avec L1 Starknet Core address qui est le endpoint gateway
// const L1_STARKNET_CORE = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';

export function WithdrawAndMint() {
  // const { account } = useStarknet();
  // console.log('contract', contract);
  // console.log('account', account);

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  // console.log('provider', provider);
  const signer = provider.getSigner()
  // console.log('signer', signer)
  const contractGateway = new ethers.Contract(ADDRESS_GATEWAY, GATEWAYL1.abi, signer)

  const contractFakeErc721 = new ethers.Contract(ADDRESS_ERC721, FAKEERC721.abi, provider)

  const [l1TokenAddress, setL1TokenAddress] = React.useState("0xb5AAc9C30121496b89425f92D1b45336E4704F8e")
  const [l2TokenAddress, setL2TokenAddress] = React.useState("0x0184b283baedf52cc72d46621d92b465087a208fa4ebff2178f5c8b2fb7765f4")
  const [l2GatewayAddress, setL2GatewayAddress] = React.useState("0x06fee411e29ff2ac941a40aa6b627b5e28ef12fd7df8d0b069db6a67fbe89583")
  const [tokenId, setTokenId] = React.useState("0x1");
  // const [l1Owner, setL1Owner] = React.useState("0x5A1Aafc64d39F71401314Fe2AFB534e16a99FD56");  

  // tx hash : "0x4d704f071b24660a2643e46807633c021f94e189d3ac1fa74d63c561cd8fcf8"
  // const {
  //   invoke: bridge_to_mainnet,
  //   hash,
  //   submitting
  // } = useStarknetInvoke(contract, "bridge_to_mainnet");
  // const transactionStatus = useTransaction(hash);



  const bridgeNFT = async () => {

    // let tx = await contractGateway.setEndpointGateway(l2GatewayAddress);
    // const rcpt = await tx.wait();
    // if (rcpt) {
    //   console.log('receipt', rcpt)
    //   console.log('End point gateway set')
    // } else {
    //   console.log('receipt', rcpt)
    //   console.log('End point gateway NOT set')
    // }
    console.log(contractGateway);
    let transaction = await contractGateway.bridgeFromStarknet(l1TokenAddress, l2TokenAddress, tokenId, { gasLimit: 250000 })
    const receipt = await transaction.wait();
    if (receipt) {
      console.log('receipt', receipt)
      console.log('-------NFT has been bridged to L1------')
    } else {
      console.log('receipt', receipt)
      console.log('-------it did not work :(----------')
    }
  };

  // if (!account) return null;

  return (
    <div>

      <p>Bridge NFT to L1</p>
      <Button onClick={() => bridgeNFT()} type="primary">Bridge NFT from Starknet</Button>


      {/* <div className="row">
        <input onChange={updateAmount} value={amount} type="text" />
        <button
          onClick={() => incrementCounter && incrementCounter({ amount })}
          disabled={!incrementCounter || submitting}
        >
          Increment
        </button>
      </div> */}

    </div>
  );
}
